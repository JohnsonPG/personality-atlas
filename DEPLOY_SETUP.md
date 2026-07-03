# GitHub Actions + Vercel 自动部署配置指南

## ✅ 已完成

1. 创建了 `.github/workflows/deploy.yml` GitHub Actions 配置文件
2. 创建了 `.gitignore` 文件
3. 项目代码已提交到本地 Git 仓库

## 📋 你需要完成的步骤

### 步骤 1：在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 填写仓库名：`personality-atlas`
3. 选择 Public 或 Private（建议 Private）
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

### 步骤 2：推送代码到 GitHub

在终端执行：

```bash
cd /Users/pengjiansheng/Desktop/RGTJ
git remote add origin https://github.com/JohnsonPG/personality-atlas.git
git push -u origin main
```

### 步骤 3：获取 Vercel Token

1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 填写 Token 名称（如 `github-actions`）
4. 选择 Scope（建议 Full Access）
5. 复制生成的 Token（**只显示一次**）

### 步骤 4：在 GitHub 仓库配置 Secrets

1. 访问你的 GitHub 仓库
2. 进入 `Settings` → `Secrets and variables` → `Actions`
3. 点击 "New repository secret"
4. 添加以下 3 个 Secrets：

| Name | Value |
|------|-------|
| `VERCEL_TOKEN` | 步骤 3 获取的 Token |
| `VERCEL_ORG_ID` | `team_JLnR9OERbuqb2vqARXQYzQw7` |
| `VERCEL_PROJECT_ID` | `prj_fpP4sTYIBFQa7wCdqyaCJ8UMSGMo` |

### 步骤 5：测试自动部署

推送代码后会自动触发部署：

```bash
cd /Users/pengjiansheng/Desktop/RGTJ
git push
```

或者在 GitHub 仓库的 Actions 页面手动触发。

## 🔍 查看部署状态

- **GitHub Actions**：https://github.com/JohnsonPG/personality-atlas/actions
- **Vercel Dashboard**：https://vercel.com/pgs-projects-09a73c68/personality-atlas

## 🌐 部署成功后的访问地址

- https://personality-atlas-nu.vercel.app

## 📝 工作流说明

`.github/workflows/deploy.yml` 配置：

- **触发条件**：
  - 推送到 `main` 分支
  - 手动触发（workflow_dispatch）
- **执行步骤**：
  1. 检出代码
  2. 安装 Node.js 20
  3. 安装 Vercel CLI
  4. 拉取 Vercel 环境信息
  5. 构建项目
  6. 部署到 Vercel 生产环境
