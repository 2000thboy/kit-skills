# kit-v2-smoke-deep-v2 测试指引

> 模板类型: `fullstack` — Web/CLI/复杂应用
> 适用框架: Jest/Vitest / pytest / Playwright / Cypress 等

## 快速开始

### 1. 安装依赖

```bash
# 前端
cd frontend/
npm install

# 后端
cd backend/
npm install
# 或
pip install -r requirements.txt
```

### 2. 运行前后端测试

```bash
# 前端单元测试
cd frontend/
npm test
# 或
npx vitest run

# 后端单元测试
cd backend/
npm test
# 或
pytest tests/ -v
```

### 3. 运行 E2E 测试

```bash
# Playwright
cd e2e/
npx playwright test

# Cypress
cd e2e/
npx cypress run
```

## 前后端联调

### 联调步骤

1. **启动后端服务**:
   ```bash
   cd backend/
   npm run dev
   # 确认 API 在 http://localhost:8000 运行
   ```

2. **启动前端服务**:
   ```bash
   cd frontend/
   npm run dev
   # 确认前端在 http://localhost:3000 运行
   ```

3. **验证 API 连通**:
   ```bash
   curl http://localhost:8000/api/health
   # 期望返回: {"status":"ok"}
   ```

4. **验证前端调用**:
   打开浏览器访问 `http://localhost:3000`，确认页面正常加载且数据正确显示。

### 联调检查清单

- [ ] 后端服务已启动且无报错
- [ ] 前端服务已启动且无报错
- [ ] API 健康检查通过
- [ ] 前端页面可正常加载
- [ ] 前端可正确调用后端 API
- [ ] CORS 配置正确（跨域无报错）

## E2E 截图对比

### Playwright 截图测试

```bash
# 运行测试并生成截图
cd e2e/
npx playwright test --update-snapshots

# 对比截图（CI 模式）
npx playwright test
```

截图将保存到 `e2e/tests/__snapshots__/`，差异图保存到 `e2e/test-results/`。

### 截图对比标准

- 像素差异阈值: 0.2%（或项目约定值）
- 忽略动态内容: 时间戳、随机 ID、动画元素
- 截图命名规范: `<页面名>-<视口尺寸>.png`

## 容器健康检查

### Docker 健康检查

```bash
# 启动全部服务
cd docker/
docker-compose up -d

# 检查容器状态
docker-compose ps

# 检查健康状态
docker-compose exec backend curl -f http://localhost:8000/health || echo "Backend unhealthy"
docker-compose exec frontend curl -f http://localhost:3000 || echo "Frontend unhealthy"

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 健康检查端点

后端应提供 `/health` 端点，返回:

```json
{
  "status": "ok",
  "timestamp": "2026-05-30T12:00:00Z",
  "version": "1.0.0",
  "dependencies": {
    "database": "connected",
    "cache": "connected"
  }
}
```

## 测试结构

```
frontend/tests/
  unit/           # 组件单元测试
  integration/    # 页面/路由集成测试

backend/tests/
  unit/           # 服务/工具函数单元测试
  integration/    # API 集成测试
  e2e/            # 端到端测试（可选）

e2e/
  tests/          # Playwright/Cypress 测试用例
  fixtures/       # 测试数据
  snapshots/      # 截图基准
  evidence/       # 测试证据（截图、视频）
```

## AI 自测流程

1. **安装依赖**: 前后端分别安装
2. **运行前端单元测试**: `cd frontend && npm test`
3. **运行后端单元测试**: `cd backend && npm test`
4. **启动前后端服务**: 分别运行 dev 服务器
5. **验证 API 连通**: `curl http://localhost:8000/health`
6. **运行 E2E 测试**: `cd e2e && npx playwright test`
7. **检查截图对比**: 确认无意外差异
8. **容器健康检查**: `docker-compose ps` 确认全部 healthy
9. **记录证据**: 将截图、测试报告保存到 `e2e/evidence/`
10. **生成报告**: 在 `.test/ai/reports/` 中写入测试结论

## 验收标准

- [ ] 前端单元测试全部通过
- [ ] 后端单元测试全部通过
- [ ] 前后端联调通过（API 连通、数据正确）
- [ ] E2E 测试全部通过
- [ ] 截图对比无意外差异
- [ ] 容器健康检查全部通过
- [ ] 无 lint/type/build 错误
- [ ] 测试报告已归档

## 常用命令速查

| 任务 | 前端 | 后端 | E2E |
|------|------|------|-----|
| 安装依赖 | `npm install` | `npm install` / `pip install` | `npm install` |
| 运行测试 | `npm test` | `npm test` / `pytest` | `npx playwright test` |
| 运行 dev | `npm run dev` | `npm run dev` | - |
| 构建 | `npm run build` | `npm run build` | - |
| Lint | `npm run lint` | `npm run lint` / `ruff check .` | - |
| 类型检查 | `npx tsc --noEmit` | `npx tsc --noEmit` / `mypy` | - |

## 故障排查

- **端口冲突**: 检查是否有其他服务占用 3000/8000 端口，修改 `.env` 中的端口配置
- **CORS 错误**: 确认后端 CORS 配置包含前端域名 `http://localhost:3000`
- **E2E 超时**: 确认前后端服务已完全启动，增加 `page.goto()` 的 timeout
- **截图差异**: 检查是否因动态内容（时间戳、随机 ID）导致，在测试代码中 mock 这些内容
- **Docker 构建失败**: 检查 Dockerfile 中的基础镜像版本，确认网络连通
