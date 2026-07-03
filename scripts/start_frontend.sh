#!/bin/bash
set -e

cd "$(dirname "$0")/.."
cd frontend

if [ ! -d "node_modules" ]; then
  echo "🔧 Installing frontend dependencies..."
  npm install --registry https://registry.npmmirror.com
fi

echo "🚀 Starting frontend on http://localhost:10086"
npm run dev:h5
