# {{project_name}} 沙盒使用说明

> 模板类型: `fullstack` — Web/CLI/复杂应用
> 创建日期: {{date}}
> 项目规模: {{scale}}

## 沙盒用途

本沙盒用于隔离前后端开发、联调测试与主项目，确保 UI 改动、API 变更不影响生产环境。

## 目录结构

```
{{project_name}}/
  frontend/         # 前端代码（React/Vue/Angular/等）
    src/
    public/
    tests/
  backend/          # 后端代码（API/服务/数据库）
    src/
    tests/
  e2e/              # 端到端测试（Playwright/Cypress/等）
    tests/
    fixtures/
  docker/           # Docker 配置
    Dockerfile.frontend
    Dockerfile.backend
    docker-compose.yml
  docs/             # 文档
  logs/             # 执行日志
  README.md         # 本文件
  TEST.md           # 测试指引
```

## 创建与销毁

### 创建沙盒

```bash
# 从主项目克隆（推荐）
git clone <主项目地址> {{project_name}}-eval/

# 或使用 cp -r（无 git 时）
cp -r {{project_name}}/ {{project_name}}-eval/
```

### 销毁沙盒

```bash
# 沙盒可随时销毁重建
rm -rf {{project_name}}-eval/
```

## 隔离规则

1. **AI 只写沙盒**: AI 代理只能在 `{{project_name}}-eval/` 中修改文件，不得直接修改主项目 `{{project_name}}/`。
2. **前后端分离**: 前端改动不直接影响后端，后端 API 变更需同步更新前端 mock。
3. **容器隔离**: 使用 Docker 运行服务，确保端口、环境变量与主项目不冲突。
4. **单向流动**:
   ```
   主项目 → git clone → 沙盒（开发/联调）
   前后端联调通过 → 人工审核 → 合并回主项目
   ```
5. **E2E 证据**: 端到端测试的截图、视频存放于 `e2e/evidence/`，不污染主项目。

## 服务启动

### 本地开发模式

```bash
# 启动后端
cd backend/
npm run dev
# 或
python manage.py runserver
# 或
cargo run

# 启动前端（新终端）
cd frontend/
npm run dev
```

### Docker 模式

```bash
cd docker/
docker-compose up --build
```

### 端口约定

| 服务 | 开发端口 | 说明 |
|------|---------|------|
| 前端 | 3000 | React/Vite 默认 |
| 后端 API | 8000 / 8080 | 根据框架调整 |
| 数据库 | 5432 / 3306 | PostgreSQL / MySQL |

## 合并回主项目

```bash
# 方式1: git push
cd {{project_name}}-eval/
git push origin <分支名>

# 方式2: 手动复制关键改动
# - frontend/src/ 中的组件/页面改动
# - backend/src/ 中的 API/服务改动
# - e2e/tests/ 中的测试用例
# - docker/ 中的配置更新
```

## 注意事项

- 前后端联调时，确认 API Base URL 配置正确（通常是 `http://localhost:8000/api`）。
- E2E 测试需要前后端同时运行，确保服务就绪后再执行测试。
- Docker 构建缓存可能导致旧代码残留，必要时使用 `docker-compose build --no-cache`。
- 环境变量（`.env`）不应提交到 Git，使用 `.env.example` 作为模板。
