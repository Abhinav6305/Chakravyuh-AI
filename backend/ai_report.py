from datetime import datetime, timezone
import json
import os
from pathlib import Path
import urllib.error
import urllib.request


BASE_DIR = Path(__file__).resolve().parent


def load_env_value(key: str):
    value = os.getenv(key)
    if value:
        return value

    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return None

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, raw_value = line.split("=", 1)
        if name.strip() == key:
            return raw_value.strip().strip('"').strip("'")
    return None


def build_graph_snapshot(bank, summary, nodes, edges):
    sorted_nodes = sorted(nodes, key=lambda node: node["risk_score"], reverse=True)
    high_nodes = [node for node in sorted_nodes if node["risk_level"] == "High"]
    medium_nodes = [node for node in sorted_nodes if node["risk_level"] == "Medium"]
    ip_edges = [edge for edge in edges if edge.get("type") == "ip_shared"]
    transaction_edges = [edge for edge in edges if edge.get("type") == "transaction"]

    return {
        "bank": {
            "bank_id": bank["bank_id"],
            "bank_name": bank["bank_name"],
            "branch": bank["branch"],
        },
        "summary": summary,
        "risk_distribution": {
            "high": len(high_nodes),
            "medium": len(medium_nodes),
            "low": summary["low_risk_count"],
        },
        "relationship_counts": {
            "total_edges": len(edges),
            "transaction_edges": len(transaction_edges),
            "shared_ip_edges": len(ip_edges),
        },
        "priority_accounts": sorted_nodes[:8],
        "shared_ip_samples": ip_edges[:8],
    }


def fallback_report(snapshot):
    summary = snapshot["summary"]
    priorities = snapshot["priority_accounts"][:5]
    high_count = snapshot["risk_distribution"]["high"]
    medium_count = snapshot["risk_distribution"]["medium"]
    shared_ip_count = snapshot["relationship_counts"]["shared_ip_edges"]

    findings = [
        f"{summary['total_accounts']} accounts were analyzed across {summary['total_edges']} graph relationships.",
        f"{high_count} high-risk and {medium_count} medium-risk accounts require investigator review.",
        f"{shared_ip_count} shared-IP relationship(s) were detected, which can indicate hidden account coordination.",
    ]

    if priorities:
        findings.append(
            f"Top priority account is {priorities[0]['id']} with risk score {priorities[0]['risk_score']}."
        )

    return {
        "provider": "deterministic-fallback",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "executive_summary": (
            "Chakravyuh AI analyzed the bank transaction graph and prioritized accounts by proximity to known fraud, "
            "fraud-neighbor exposure, and graph centrality. The report highlights the accounts and relationships that "
            "should be investigated first."
        ),
        "key_findings": findings,
        "priority_accounts": priorities,
        "recommended_actions": [
            "Freeze or step-up authenticate the highest-risk accounts until investigation is complete.",
            "Review direct transaction paths around confirmed fraud nodes.",
            "Audit shared-IP clusters for mule-account behavior.",
            "Escalate high-centrality accounts because they can spread fraud exposure quickly.",
        ],
        "risk_distribution": snapshot["risk_distribution"],
        "model_report": None,
    }


def generate_ai_report(bank, summary, nodes, edges):
    snapshot = build_graph_snapshot(bank, summary, nodes, edges)
    report = fallback_report(snapshot)
    api_key = load_env_value("GEMINI_API_KEY")
    if not api_key:
        return report

    prompt = f"""
You are Chakravyuh AI, an expert banking fraud investigation analyst.
Analyze this graph-based fraud detection snapshot and write a concise executive AI report.

Return JSON only with these fields:
executive_summary: string
key_findings: array of 4 strings
recommended_actions: array of 4 strings
model_report: string with a readable investigation report in 4 short paragraphs

Graph snapshot:
{json.dumps(snapshot, default=str)}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.25,
            "maxOutputTokens": 3000,
            "responseMimeType": "application/json",
        },
    }

    try:
        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=25) as response:
            data = json.loads(response.read().decode("utf-8"))
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        model_json = json.loads(text)
        report.update(
            {
                "provider": "gemini-2.5-flash",
                "executive_summary": model_json.get("executive_summary", report["executive_summary"]),
                "key_findings": model_json.get("key_findings", report["key_findings"]),
                "recommended_actions": model_json.get("recommended_actions", report["recommended_actions"]),
                "model_report": model_json.get("model_report"),
            }
        )
    except (KeyError, json.JSONDecodeError, urllib.error.URLError, TimeoutError):
        return report

    return report
