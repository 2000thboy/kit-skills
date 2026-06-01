# Codex 工作流预设

## 启动

阅读：

1. `.plan/PRD.md`
2. `.plan/SPEC.md`
3. `.plan/CHECKLIST.md`
4. `.kit/config.json`
5. `.workflow/status.md`

## 规则

- 若用户请求与 `.plan/` 冲突，编辑前须先报告偏差。
- 涉及 3 个以上文件变更时，先规划再实施。
- 工作流或规划变更后，运行 `spec-loop-kit validate --cwd .`。
- 将 AI 测试证据记录至 `.test/ai/evidence/` 或 `.test/ai/reports/`。
