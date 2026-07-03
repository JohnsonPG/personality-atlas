.PHONY: install-backend install-frontend backend frontend test-backend test-all help

help:
	@echo "人格图鉴 · MVP 启动命令"
	@echo ""
	@echo "  make install-backend  安装后端 Python 依赖"
	@echo "  make install-frontend 安装前端 npm 依赖"
	@echo "  make backend          启动后端 (端口 8000)"
	@echo "  make frontend         启动前端 (端口 10086)"
	@echo "  make test-backend     后端 pytest 测试 + 覆盖率"
	@echo ""

install-backend:
	cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

backend:
	@bash scripts/start_backend.sh

frontend:
	@bash scripts/start_frontend.sh

test-backend:
	cd backend && (source .venv/bin/activate 2>/dev/null || true) && python -m pytest tests/ -v --cov=app --cov-report term-missing
