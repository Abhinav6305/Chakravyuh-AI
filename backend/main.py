from datetime import datetime, timedelta, timezone
from pathlib import Path
import re
import sqlite3
from typing import Dict, List

import bcrypt
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt

try:
    from .ai_report import generate_ai_report
    from .data_loader import load_transactions, get_ip_to_accounts
    from .graph_builder import build_transaction_graph, get_fraud_nodes
    from .risk_engine import compute_risk_scores, get_account_risk, get_all_nodes, get_all_edges
    from .schemas import (
        AccountDetail,
        AIReport,
        AuthResponse,
        DashboardSummary,
        Edge,
        LoginRequest,
        Node,
        SignupRequest,
    )
except ImportError:
    from ai_report import generate_ai_report
    from data_loader import load_transactions, get_ip_to_accounts
    from graph_builder import build_transaction_graph, get_fraud_nodes
    from risk_engine import compute_risk_scores, get_account_risk, get_all_nodes, get_all_edges
    from schemas import (
        AccountDetail,
        AIReport,
        AuthResponse,
        DashboardSummary,
        Edge,
        LoginRequest,
        Node,
        SignupRequest,
    )

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = BASE_DIR / "chakravyuh.db"
JWT_SECRET = "change-this-for-production-demo-secret"
JWT_ALGORITHM = "HS256"
TOKEN_MINUTES = 60 * 12

app = FastAPI(title="Chakravyuh AI Fraud Detection API")
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graphs: Dict[str, Dict] = {}


@app.on_event("startup")
async def startup_event():
    DATA_DIR.mkdir(exist_ok=True)
    init_db()
    ensure_demo_bank()
    warm_existing_bank_graphs()


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS banks (
                bank_id TEXT PRIMARY KEY,
                bank_name TEXT NOT NULL,
                branch TEXT NOT NULL,
                password_hash BLOB NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def ensure_demo_bank():
    demo_file = DATA_DIR / "DEMO_transactions.csv"
    if not demo_file.exists():
        sample_file = DATA_DIR / "sample_transactions.csv"
        if sample_file.exists():
            demo_file.write_bytes(sample_file.read_bytes())

    if get_bank("DEMO"):
        return
    create_bank("DEMO", "Demo Bank", "Main Branch", "demo123")


def warm_existing_bank_graphs():
    for csv_file in DATA_DIR.glob("*_transactions.csv"):
        bank_id = csv_file.name.removesuffix("_transactions.csv")
        try:
            load_bank_graph(bank_id)
        except Exception:
            continue


def normalize_bank_id(bank_id: str) -> str:
    value = re.sub(r"[^A-Za-z0-9_-]", "", bank_id.strip().upper())
    if not value:
        raise HTTPException(status_code=400, detail="Bank ID is required")
    return value


def bank_csv_path(bank_id: str) -> Path:
    return DATA_DIR / f"{normalize_bank_id(bank_id)}_transactions.csv"


def hash_password(password: str) -> bytes:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def verify_password(password: str, password_hash: bytes) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash)


def get_bank(bank_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM banks WHERE bank_id = ?",
            (normalize_bank_id(bank_id),),
        ).fetchone()
        return dict(row) if row else None


def create_bank(bank_id: str, bank_name: str, branch: str, password: str):
    bank_id = normalize_bank_id(bank_id)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO banks (bank_id, bank_name, branch, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                bank_id,
                bank_name.strip(),
                branch.strip(),
                hash_password(password),
                datetime.now(timezone.utc).isoformat(),
            ),
        )


def create_token(bank_id: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_MINUTES)
    return jwt.encode({"sub": bank_id, "exp": expires}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def current_bank(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        bank_id = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    bank = get_bank(bank_id)
    if not bank:
        raise HTTPException(status_code=401, detail="Bank account no longer exists")
    return bank


def load_bank_graph(bank_id: str):
    csv_path = bank_csv_path(bank_id)
    if not csv_path.exists():
        graphs[normalize_bank_id(bank_id)] = {"df": None, "G": None, "fraud_nodes": [], "risk_info": {}}
        return graphs[normalize_bank_id(bank_id)]

    df = load_transactions(str(csv_path))
    ip_accounts = get_ip_to_accounts(df)
    graph = build_transaction_graph(df, ip_accounts)
    fraud_nodes = get_fraud_nodes(df)
    risk_info = compute_risk_scores(graph, fraud_nodes)
    graphs[normalize_bank_id(bank_id)] = {
        "df": df,
        "G": graph,
        "fraud_nodes": fraud_nodes,
        "risk_info": risk_info,
    }
    return graphs[normalize_bank_id(bank_id)]


def get_graph_state(bank_id: str):
    bank_id = normalize_bank_id(bank_id)
    if bank_id not in graphs:
        return load_bank_graph(bank_id)
    return graphs[bank_id]


def auth_payload(bank) -> AuthResponse:
    return AuthResponse(
        access_token=create_token(bank["bank_id"]),
        bank_id=bank["bank_id"],
        bank_name=bank["bank_name"],
        branch=bank["branch"],
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Chakravyuh AI"}


@app.post("/signup", response_model=AuthResponse)
async def signup(payload: SignupRequest):
    bank_id = normalize_bank_id(payload.bank_id)
    if get_bank(bank_id):
        raise HTTPException(status_code=409, detail="Bank ID already exists. Please log in.")
    if not payload.bank_name.strip() or not payload.branch.strip() or len(payload.password) < 4:
        raise HTTPException(status_code=400, detail="Bank name, branch, and a 4+ character password are required")
    create_bank(bank_id, payload.bank_name, payload.branch, payload.password)
    load_bank_graph(bank_id)
    return auth_payload(get_bank(bank_id))


@app.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    bank = get_bank(payload.bank_id)
    if not bank or not verify_password(payload.password, bank["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid bank ID or password")
    return auth_payload(bank)


@app.post("/upload", response_model=DashboardSummary)
async def upload_transactions(file: UploadFile = File(...), bank=Depends(current_bank)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file")

    csv_path = bank_csv_path(bank["bank_id"])
    contents = await file.read()
    csv_path.write_bytes(contents)

    try:
        load_bank_graph(bank["bank_id"])
    except Exception as exc:
        csv_path.unlink(missing_ok=True)
        load_bank_graph(bank["bank_id"])
        raise HTTPException(status_code=400, detail=str(exc))

    return build_summary(bank)


@app.get("/dashboard/summary", response_model=DashboardSummary)
async def dashboard_summary(bank=Depends(current_bank)):
    return build_summary(bank)


def build_summary(bank) -> DashboardSummary:
    state = get_graph_state(bank["bank_id"])
    nodes = get_all_nodes(state["risk_info"])
    return DashboardSummary(
        bank_id=bank["bank_id"],
        bank_name=bank["bank_name"],
        total_accounts=len(nodes),
        high_risk_count=sum(1 for node in nodes if node["risk_level"] == "High"),
        medium_risk_count=sum(1 for node in nodes if node["risk_level"] == "Medium"),
        low_risk_count=sum(1 for node in nodes if node["risk_level"] == "Low"),
        total_edges=state["G"].number_of_edges() if state["G"] is not None else 0,
        system_status="Active" if nodes else "Pending",
    )


@app.get("/graph/nodes", response_model=List[Node])
async def get_nodes(bank=Depends(current_bank)):
    state = get_graph_state(bank["bank_id"])
    return get_all_nodes(state["risk_info"])


@app.get("/graph/edges", response_model=List[Edge])
async def get_edges(bank=Depends(current_bank)):
    state = get_graph_state(bank["bank_id"])
    return get_all_edges(state["G"]) if state["G"] is not None else []


@app.get("/account/{account_id}", response_model=AccountDetail)
async def get_account(account_id: str, bank=Depends(current_bank)):
    state = get_graph_state(bank["bank_id"])
    return get_account_risk(account_id, state["risk_info"])


@app.get("/ai/report", response_model=AIReport)
async def ai_report(bank=Depends(current_bank)):
    state = get_graph_state(bank["bank_id"])
    summary = build_summary(bank).model_dump()
    nodes = get_all_nodes(state["risk_info"])
    edges = get_all_edges(state["G"]) if state["G"] is not None else []
    return generate_ai_report(bank, summary, nodes, edges)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
