#!/bin/bash

set -e

echo "=== 人格图鉴部署脚本 ==="
echo ""

if [[ $1 == "docker" ]]; then
    echo "[1/3] 构建 Docker 镜像..."
    docker build -t personality-atlas .
    
    echo ""
    echo "[2/3] 启动容器..."
    docker run -d -p 8000:8000 --name personality-atlas personality-atlas
    
    echo ""
    echo "[3/3] 部署完成！"
    echo "访问地址: http://localhost:8000"
    
elif [[ $1 == "local" ]]; then
    echo "[1/2] 构建前端..."
    cd frontend && npm install && npm run build:h5 && cd ..
    
    echo ""
    echo "[2/2] 启动后端服务..."
    mkdir -p backend/static
    cp -r frontend/dist/* backend/static/
    
    cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000
    
else
    echo "使用方法:"
    echo "  ./deploy.sh docker    # 使用 Docker 部署"
    echo "  ./deploy.sh local     # 本地启动"
    echo ""
    echo "手动部署指南:"
    echo "1. 将 backend/ 目录部署到任意 Python 服务器"
    echo "2. 将 frontend/dist/ 复制到 backend/static/"
    echo "3. 安装依赖: pip install -r requirements.txt"
    echo "4. 启动: uvicorn app.main:app --host 0.0.0.0 --port 8000"
    echo ""
    echo "推荐平台:"
    echo "  - Vercel: https://vercel.com/"
    echo "  - Render: https://render.com/"
    echo "  - 阿里云函数计算: https://fc.console.aliyun.com/"
    echo "  - 腾讯云 Serverless: https://console.cloud.tencent.com/scf"
fi