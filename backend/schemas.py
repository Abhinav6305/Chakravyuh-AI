from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict

class Node(BaseModel):
    id: str
    risk_score: float
    risk_level: str
    explanation: List[str] = []
    distance_to_fraud: Optional[int] = None
    fraud_neighbors: int = 0
    centrality: float = 0

class Edge(BaseModel):
    source: str
    target: str
    type: str
    amount: Optional[float] = None
    timestamp: Optional[str] = None
    ip: Optional[str] = None

class AccountDetail(BaseModel):
    id: str
    risk_score: float
    risk_level: str
    explanation: List[str]
    distance_to_fraud: Optional[int] = None
    fraud_neighbors: int = 0
    centrality: float = 0

class SignupRequest(BaseModel):
    bank_id: str
    bank_name: str
    branch: str
    password: str

class LoginRequest(BaseModel):
    bank_id: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    bank_id: str
    bank_name: str
    branch: str

class DashboardSummary(BaseModel):
    bank_id: str
    bank_name: str
    total_accounts: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    total_edges: int
    system_status: str

class AIReport(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    provider: str
    generated_at: str
    executive_summary: str
    key_findings: List[str]
    priority_accounts: List[Dict]
    recommended_actions: List[str]
    risk_distribution: Dict[str, int]
    model_report: Optional[str] = None
