import math
import networkx as nx
from typing import Dict, List

def compute_risk_scores(G: nx.Graph, fraud_nodes: List[str]) -> Dict[str, Dict]:
    """
    Compute risk scores for all accounts based on graph metrics.

    Args:
        G (nx.Graph): Transaction graph.
        fraud_nodes (List[str]): List of known fraud account IDs.

    Returns:
        Dict[str, Dict]: Risk information for each account.
    """
    accounts = list(G.nodes())
    risk_info = {}

    # Compute centrality
    centrality = nx.degree_centrality(G)

    for account in accounts:
        # Distance to nearest fraud node
        if account in fraud_nodes:
            distance = 0
        else:
            distances = [nx.shortest_path_length(G, account, fraud) for fraud in fraud_nodes if nx.has_path(G, account, fraud)]
            distance = min(distances) if distances else float('inf')

        # Number of fraud neighbors
        fraud_neighbors = sum(1 for neighbor in G.neighbors(account) if neighbor in fraud_nodes)

        # Normalize scores (simple min-max normalization)
        proximity_score = 1 / (1 + distance) if distance != float('inf') else 0
        fraud_neighbor_score = min(fraud_neighbors / 5, 1)  # Cap at 5 neighbors
        centrality_score = centrality.get(account, 0)

        # Risk score formula
        risk_score = 0.5 * proximity_score + 0.3 * fraud_neighbor_score + 0.2 * centrality_score
        is_known_fraud = account in fraud_nodes
        if is_known_fraud:
            risk_score = max(risk_score, 0.85)

        # Risk level
        if risk_score >= 0.7:
            risk_level = 'High'
        elif risk_score >= 0.4:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'

        # Explanations
        explanations = []
        if is_known_fraud:
            explanations.append("Confirmed known fraud account from bank transaction data")
        elif distance <= 1:
            explanations.append("Directly connected to known fraud accounts")
        elif distance <= 3:
            explanations.append("Close proximity to fraudulent activity")

        if fraud_neighbors > 0:
            explanations.append(f"Connected to {fraud_neighbors} known fraud account(s)")

        shared_ip_with_fraud = any(
            G.get_edge_data(account, neighbor, {}).get('type') == 'ip_shared' and neighbor in fraud_nodes
            for neighbor in G.neighbors(account)
        )
        if shared_ip_with_fraud:
            explanations.append("Used a shared IP with a flagged account")

        if centrality_score > 0.08:
            explanations.append("High transaction frequency detected")

        if not explanations:
            explanations.append("No significant risk factors detected")

        risk_info[account] = {
            'id': account,
            'risk_score': round(risk_score, 3),
            'risk_level': risk_level,
            'explanation': explanations,
            'distance_to_fraud': distance if distance != float('inf') else None,
            'fraud_neighbors': fraud_neighbors,
            'centrality': round(centrality_score, 3),
            'is_known_fraud': is_known_fraud
        }

    return risk_info

def get_account_risk(account_id: str, risk_info: Dict[str, Dict]) -> Dict:
    """
    Get risk information for a specific account.

    Args:
        account_id (str): Account ID.
        risk_info (Dict[str, Dict]): All risk information.

    Returns:
        Dict: Risk information for the account.
    """
    return risk_info.get(account_id, {
        'id': account_id,
        'risk_score': 0,
        'risk_level': 'Low',
        'explanation': ['Account was not found in the active bank graph'],
        'distance_to_fraud': None,
        'fraud_neighbors': 0,
        'centrality': 0
    })

def get_all_nodes(risk_info: Dict[str, Dict]) -> List[Dict]:
    """
    Get all nodes with risk information for API response.

    Args:
        risk_info (Dict[str, Dict]): All risk information.

    Returns:
        List[Dict]: List of nodes with risk info.
    """
    return [
        {
            'id': account,
            'risk_score': info['risk_score'],
            'risk_level': info['risk_level'],
            'explanation': info['explanation'],
            'distance_to_fraud': info['distance_to_fraud'],
            'fraud_neighbors': info['fraud_neighbors'],
            'centrality': info['centrality']
        }
        for account, info in risk_info.items()
    ]

def get_all_edges(G: nx.Graph) -> List[Dict]:
    """
    Get all edges for API response.

    Args:
        G (nx.Graph): Transaction graph.

    Returns:
        List[Dict]: List of edges.
    """
    edges = []
    for u, v, data in G.edges(data=True):
        edge_info = {
            'source': u,
            'target': v,
            'type': data.get('type', 'transaction'),
            'amount': data.get('amount'),
            'timestamp': format_timestamp(data.get('timestamp')),
            'ip': data.get('ip')
        }
        edges.append(edge_info)
    return edges

def format_timestamp(value):
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if hasattr(value, 'isoformat'):
        return value.isoformat()
    return str(value)
