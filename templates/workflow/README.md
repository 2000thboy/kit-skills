# 工作流入口 — {{project_name}}

> 负责人：{{owner}}
> 配置：{{profile}}
> 项目版本：{{project_version}}
> 更新日期：{{date}}

## 用途

面向 AI IDE、CLI 代理和本地运行器的稳定工作流入口。

## 阅读顺序

1. `.plan/PRD.md`
2. `.plan/SPEC.md`
3. `.plan/CHECKLIST.md`
4. `.kit/config.json`
5. `.kit/version.json`
6. `.test/README.md`
7. `.test/config.json`
8. `.workflow/status.md`

## 预设配置

- `codex.md`：Codex 工作流。
- `workbuddy.md`：WorkBuddy 进度读取工作流。
- `trae-solo.md`：Trae Solo 工作流。

## 规则

本目录说明如何恢复和运行工作流。除非决策已升级写入 PRD/SPEC/CHECKLIST，否则不得覆盖 `.plan/` 的内容。

AI 运行的工作流证明存放至 `.test/ai/`。真实用户测试包及用户反馈证据存放至 `.test/user/`。若由 AI 模拟用户，仍视为 AI 证明。

请勿使用根目录 `output/` 或 `outputs/` 作为工作流状态。归档清理时，将旧输出材料分类至 `.test/ai/`、`.test/user/` 或 `.plan/archive/`。
