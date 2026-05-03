from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import pandas as pd

from database import init_db, get_db, engine, Base, Bank
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_bank
)
from schemas import (
    SignupRequest,
    LoginRequest,
    AuthResponse,
    Node,
    Edge,
    AccountDetail,
    DashboardSummary
)
from data_loader import load_transactions, get_ip_to_accounts
from graph_builder import build_transaction_graph, get_fraud_nodes
from risk_engine import compute_risk_scores, get_account_risk, get_all_nodes, get_all_edges

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chakravyuh AI Fraud Detection API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for in-memory graph cache per bank
banks_graphs = {}

def process_bank_data(bank_id: str):
    """Load data and compute risk scores for a specific bank."""
    data_path = f"data/{bank_id}_transactions.csv"
    if not os.path.exists(data_path):
        return None
    
    try:
        # Load data
        df = load_transactions(data_path)
        # Build graph
        ip_accounts = get_ip_to_accounts(df)
        G = build_transaction_graph(df, ip_accounts)
        # Get fraud nodes
        fraud_nodes = get_fraud_nodes(df)
        # Compute risk scores
        risk_info = compute_risk_scores(G, fraud_nodes)
        
        banks_graphs[bank_id] = {
            "G": G,
            "risk_info": risk_info,
            "df": df
        }
        return banks_graphs[bank_id]
    except Exception as e:
        print(f"Error processing data for {bank_id}: {e}")
        return None

@app.on_event("startup")
async def startup_event():
    os.makedirs("data", exist_ok=True)
    # Check if sample exists, copy it for a demo bank if needed
    if not os.path.exists("data/DEMO_transactions.csv") and os.path.exists("data/sample_transactions.csv"):
        shutil.copy("data/sample_transactions.csv", "data/DEMO_transactions.csv")
    process_bank_data("DEMO")

# Auth Endpoints
@app.post("/signup", response_model=AuthResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    db_bank = db.query(Bank).filter(Bank.bank_id == request.bank_id).first()
    if db_bank:
        raise HTTPException(status_code=400, detail="Bank ID already registered")
    
    hashed_password = get_password_hash(request.password)
    new_bank = Bank(
        bank_id=request.bank_id,
        bank_name=request.bank_name,
        branch=request.branch,
        hashed_password=hashed_password
    )
    db.add(new_bank)
    db.commit()
    db.refresh(new_bank)
    
    access_token = create_access_token(data={"sub": new_bank.bank_id})
    return AuthResponse(
        access_token=access_token,
        bank_id=new_bank.bank_id,
        bank_name=new_bank.bank_name,
        branch=new_bank.branch
    )

@app.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    bank = db.query(Bank).filter(Bank.bank_id == request.bank_id).first()
    if not bank or not verify_password(request.password, bank.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": bank.bank_id})
    return AuthResponse(
        access_token=access_token,
        bank_id=bank.bank_id,
        bank_name=bank.bank_name,
        branch=bank.branch
    )

# Data Endpoints
@app.post("/upload")
async def upload_file(file: UploadFile = File(...), current_bank: Bank = Depends(get_current_bank)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    os.makedirs("data", exist_ok=True)
    file_path = f"data/{current_bank.bank_id}_transactions.csv"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Re-process graph data
    result = process_bank_data(current_bank.bank_id)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to process CSV file.")
        
    return {"message": "Data uploaded and graph updated successfully."}

# Analytics Endpoints
@app.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(current_bank: Bank = Depends(get_current_bank)):
    graph_data = banks_graphs.get(current_bank.bank_id)
    if not graph_data:
        return DashboardSummary(
            bank_id=current_bank.bank_id,
            bank_name=current_bank.bank_name,
            total_accounts=0,
            high_risk_count=0,
            medium_risk_count=0,
            low_risk_count=0,
            total_edges=0,
            system_status="Pending Data Upload"
        )
    
    risk_info = graph_data["risk_info"]
    G = graph_data["G"]
    
    high = sum(1 for info in risk_info.values() if info["risk_level"] == "High")
    medium = sum(1 for info in risk_info.values() if info["risk_level"] == "Medium")
    low = sum(1 for info in risk_info.values() if info["risk_level"] == "Low")
    
    return DashboardSummary(
        bank_id=current_bank.bank_id,
        bank_name=current_bank.bank_name,
        total_accounts=len(risk_info),
        high_risk_count=high,
        medium_risk_count=medium,
        low_risk_count=low,
        total_edges=G.number_of_edges(),
        system_status="Active"
    )

@app.get("/graph/nodes", response_model=List[Node])
async def get_nodes(current_bank: Bank = Depends(get_current_bank)):
    graph_data = banks_graphs.get(current_bank.bank_id)
    if not graph_data:
        return []
    return get_all_nodes(graph_data["risk_info"])

@app.get("/graph/edges", response_model=List[Edge])
async def get_edges(current_bank: Bank = Depends(get_current_bank)):
    graph_data = banks_graphs.get(current_bank.bank_id)
    if not graph_data:
        return []
    return get_all_edges(graph_data["G"])

@app.get("/account/{account_id}", response_model=AccountDetail)
async def get_account(account_id: str, current_bank: Bank = Depends(get_current_bank)):
    graph_data = banks_graphs.get(current_bank.bank_id)
    if not graph_data:
        raise HTTPException(status_code=404, detail="No data available")
    
    info = get_account_risk(account_id, graph_data["risk_info"])
    if not info:
        raise HTTPException(status_code=404, detail="Account not found")
        
    return AccountDetail(id=account_id, **info)
