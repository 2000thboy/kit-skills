# {{project_name}} 测试指引

> 模板类型: `default` — 纯代码/通用项目
> 适用框架: pytest / jest / vitest / go test / cargo test 等

## 快速开始

### 1. 安装依赖

```bash
# Python
pip install -r requirements.txt
# 或
pip install -r requirements-dev.txt

# Node.js
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 运行测试

```bash
# Python (pytest)
pytest tests/ -v

# Node.js (jest)
npx jest --coverage

# Node.js (vitest)
npx vitest run

# Go
go test ./...

# Rust
cargo test
```

### 3. 检查覆盖率

```bash
# Python
pytest tests/ --cov=src --cov-report=html --cov-report=term

# Node.js (jest)
npx jest --coverage --coverageReporters=text --coverageReporters=html

# Node.js (vitest)
npx vitest run --coverage
```

覆盖率报告将生成在 `htmlcov/` 或 `coverage/` 目录。

## 测试结构

```
tests/
  unit/           # 单元测试 — 单个函数/模块
  integration/    # 集成测试 — 多个模块协作
  acceptance/     # 验收测试 — 端到端用户场景
```

## AI 自测流程

1. **编写/修改代码** 于 `src/`
2. **运行单元测试**: `pytest tests/unit/ -v`
3. **运行集成测试**: `pytest tests/integration/ -v`
4. **检查覆盖率**: 确保新增代码被覆盖
5. **记录证据**: 将测试输出、覆盖率报告保存到 `evals/evidence/`
6. **生成报告**: 在 `evals/reports/` 中写入本次自测结论

## 验收标准

- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] 代码覆盖率 >= 80%（或项目约定值）
- [ ] 无 lint/type 错误
- [ ] 测试报告已归档到 `evals/reports/`

## 常用命令速查

| 任务 | Python | Node.js |
|------|--------|---------|
| 运行全部测试 | `pytest` | `npm test` |
| 运行单个文件 | `pytest tests/test_foo.py` | `npx jest foo.test.js` |
| 检查覆盖率 | `pytest --cov` | `npx jest --coverage` |
| 静态检查 | `ruff check .`, `mypy src/` | `npx eslint .`, `npx tsc --noEmit` |

## 故障排查

- **测试发现失败**: 检查测试文件是否以 `test_` 开头（Python）或 `.test.` 结尾（Node.js）
- **覆盖率过低**: 优先覆盖核心逻辑路径，边缘 case 可后续补充
- **依赖缺失**: 确认 `requirements.txt` / `package.json` 已完整提交
