import networkx as nx
from typing import Dict, List
import pandas as pd

def build_transaction_graph(df: pd.DataFrame, ip_accounts: Dict[str, List[str]]) -> nx.Graph:
    """
    Build a NetworkX graph from transaction data and IP sharing.

    Args:
        df (pd.DataFrame): Transaction data.
        ip_accounts (Dict[str, List[str]]): IP to accounts mapping.

    Returns:
        nx.Graph: Built graph with nodes and edges.
    """
    G = nx.Graph()

    # Add transaction edges
    for _, row in df.iterrows():
        from_acc = row['from_account']
        to_acc = row['to_account']
        amount = row['amount']
        timestamp = row['timestamp']
        G.add_edge(from_acc, to_acc, type='transaction', amount=amount, timestamp=timestamp)

    # Add IP sharing edges
    for ip, accounts in ip_accounts.items():
        if len(accounts) > 1:
            for i in range(len(accounts)):
                for j in range(i+1, len(accounts)):
                    acc1 = accounts[i]
                    acc2 = accounts[j]
                    if not G.has_edge(acc1, acc2):
                        G.add_edge(acc1, acc2, type='ip_shared', ip=ip)

    return G

def get_fraud_nodes(df: pd.DataFrame) -> List[str]:
    """
    Get list of known fraud accounts.

    Args:
        df (pd.DataFrame): Transaction data.

    Returns:
        List[str]: Known fraud account IDs.
    """
    fraud_accounts = set()
    for _, row in df.iterrows():
        if row['is_known_fraud']:
            fraud_accounts.add(row['from_account'])
            fraud_accounts.add(row['to_account'])
    return list(fraud_accounts)
