# Chakravyuh AI

AI-powered network-based fraud detection for banks.

Chakravyuh AI models bank accounts as graph nodes and transactions/shared-IP relationships as graph edges. It identifies suspicious fraud networks, computes explainable risk scores, and provides an interactive investigation dashboard with AI-generated intelligence reports.

## Features

- FastAPI backend with JWT authentication
- SQLite bank signup/login with bcrypt password hashing
- Multi-bank CSV isolation
- NetworkX graph engine for transaction and shared-IP relationships
- Explainable account risk scoring
- Gemini-powered AI fraud intelligence report with deterministic fallback
- Next.js App Router frontend
- Tailwind CSS premium fintech UI
- Sticky parallax landing page
- Interactive force-directed fraud investigation graph

## Project Structure

```txt
backend/
  main.py
  ai_report.py
  data_loader.py
  graph_builder.py
  risk_engine.py
  schemas.py
  data/sample_transactions.csv
frontend/
  app/
  components/
  lib/
scripts/
  dev.ps1
```

## Setup

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

Then add your Gemini API key:

```txt
GEMINI_API_KEY=your_gemini_api_key_here
```

## Run

From the project root on Windows PowerShell:

```powershell
npm run dev
```

Frontend:

```txt
http://localhost:3000
```

Backend:

```txt
http://127.0.0.1:8000
```

Demo login:

```txt
Bank ID: DEMO
Password: demo123
```

## CSV Format

CSV uploads must include:

```txt
from_account,to_account,amount,timestamp,ip_address,is_known_fraud
```
