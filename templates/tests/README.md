# {{project_name}} — 测试

本目录包含框架可识别的标准测试（pytest、Jest、Cargo 等）。

## 目录结构

```
tests/
  unit/           # 单元测试
  integration/    # 集成测试
  acceptance/     # 用户验收测试（人工执行）
```

## 规则

- 传统测试代码放在此处 — 框架会自动发现
- 不要在此处存放 AI 生成的证据 — 证据应放入 `evals/evidence/` 或 `docs/evidence/`
- 不要使用 `.test/` — 该目录为隐藏目录，会导致框架无法发现测试
