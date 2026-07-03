#!/bin/bash
set -e

cd "$(dirname "$0")/.."
cd backend

if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
  echo "🔧 Creating Python virtual env..."
  python3 -m venv venv
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
else
  if [ -d "venv" ]; then source venv/bin/activate; else source .venv/bin/activate; fi
fi

echo "🚀 Starting backend on http://localhost:8000"
python -c "from app.database import init_db; init_db()" && echo "✅ DB initialized"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
