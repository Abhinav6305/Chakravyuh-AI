import pandas as pd
from typing import List, Dict

REQUIRED_COLUMNS = {
    'from_account',
    'to_account',
    'amount',
    'timestamp',
    'ip_address',
    'is_known_fraud',
}

def load_transactions(csv_path: str) -> pd.DataFrame:
    """
    Load transaction data from CSV file.

    Args:
        csv_path (str): Path to the CSV file.

    Returns:
        pd.DataFrame: Loaded and cleaned transaction data.
    """
    df = pd.read_csv(csv_path)
    missing_columns = REQUIRED_COLUMNS - set(df.columns)
    if missing_columns:
        missing = ', '.join(sorted(missing_columns))
        raise ValueError(f"CSV is missing required column(s): {missing}")

    # Ensure data types
    df['from_account'] = df['from_account'].astype(str)
    df['to_account'] = df['to_account'].astype(str)
    df['ip_address'] = df['ip_address'].astype(str)
    df['amount'] = df['amount'].astype(float)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['is_known_fraud'] = df['is_known_fraud'].apply(parse_bool)
    return df

def parse_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value == 1
    return str(value).strip().lower() in {'true', '1', 'yes', 'y', 'fraud'}

def get_unique_accounts(df: pd.DataFrame) -> List[str]:
    """
    Get list of unique account IDs from transactions.

    Args:
        df (pd.DataFrame): Transaction data.

    Returns:
        List[str]: Unique account IDs.
    """
    accounts = set(df['from_account']).union(set(df['to_account']))
    return sorted(list(accounts))

def get_ip_to_accounts(df: pd.DataFrame) -> Dict[str, List[str]]:
    """
    Map IP addresses to list of accounts that used them.

    Args:
        df (pd.DataFrame): Transaction data.

    Returns:
        Dict[str, List[str]]: IP to accounts mapping.
    """
    ip_accounts = {}
    for _, row in df.iterrows():
        ip = row['ip_address']
        account = row['from_account']
        if ip not in ip_accounts:
            ip_accounts[ip] = []
        if account not in ip_accounts[ip]:
            ip_accounts[ip].append(account)
    return ip_accounts
