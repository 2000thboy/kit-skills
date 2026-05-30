# CHECKLIST — kit-v2-smoke-deep

> Owner: test
> Level: 4
> Profile: generic-project
> Updated: 2026-05-30

## 状态快照

| 字段 | 值 |
|---|---|
| Stage | planning |
| Progress | 0% |
| Due date | 待确认 |
| Final due date | 待确认 |
| Blockers | 负责人尚未确认正式排期 |

## 当前任务

| 状态 | 任务 | 负责人 | 截止日 | 验收 | 证据/命令 |
|---|---|---|---|---|---|
| [ ] | 任务列表前置规划 | test | 待确认 | 开发前已完整列出全部任务；每个任务包含目标、预期成果、完成标准、状态和验证/证据要求；开发过程严格按任务顺序推进，若调整顺序必须先更新 Checklist 并记录原因。 | 本表完整 |
| [ ] | 明确 PRD 当前目标 | test | 待确认 | `PRD.md` 更新，目标用户、痛点、范围、非目标明确 | `.plan/PRD.md` |
| [ ] | 开发对象分类 | test | 待确认 | 已确认用户要开发的是 skill、stable workflow、CLI harness、前后端产品、OMC 编排、OpenCLI 自动化、SDK 集成、纯 MD 框架或设计原型；已说明默认方案、替代方案、可反悔点和不可反悔点。 | `.plan/PRD.md` / `.plan/SPEC.md` |
| [ ] | 调用状态提醒 | test | 待确认 | 项目已建档后，每次调用 KIT 先输出当前状态、终点、方向变化、下一步和需要用户决定的阻塞项；固定问题引用 `knowledge/question-bank.json` 的 `SB*` ID。 | `.plan/SPEC.md` |
| [ ] | 明确 SPEC 实现约束 | test | 待确认 | `SPEC.md` 更新，架构决策、handoff、质量门禁明确 | `.plan/SPEC.md` |
| [ ] | 入口/章程一致性检查 | test | 待确认 | 根目录 `README.md`、`CLAUDE.md`、`.workflow/README.md`、`.test/README.md`、`.plan/PRD.md`、`.plan/SPEC.md` 目标一致；不存在 `.plan/README.md` 和根目录 `TESTING.md`；老的 `.workflows/` 或 `docs/workflows/` 已迁移、桥接或标记为历史。 | `.plan/SPEC.md` |
| [ ] | 归档前交互确认 | test | 待确认 | 归档、清理、打包或移动流程文件前，若 PRD/SPEC/CHECKLIST/.kit/.workflow/.test/live files 不一致，或会影响入口、恢复路径、用户测试包、live action 证据、硬编码设置、secret 材料，必须先用 `AR*` 问题让用户确认；全部对齐且无相关 P0/P1 时不做仪式化提问。 | `.plan/SPEC.md` |
| [ ] | 版本合同检查 | test | 待确认 | `.kit/version.json`、`CLAUDE.md`、包版本、git tag/release、`.workflow/README.md`、`.test/config.json` 版本一致；不一致先修版本，不安排用户测试。 | `.kit/version.json` |
| [ ] | 宿主/项目业务 Skill 盘点 | test | 待确认 | 建档/归档开始时已优先检查 `deep-research`；后续可能需要的 research、QA、browser、delivery、multi-agent、SDK、生图等 routed capability 已记录安装状态、推荐工具、安装目标、审批和证据；缺失的 deep-research 已列为可选安装第一推荐。 | `.plan/SPEC.md` |
| [ ] | 模型/Agent 风险账本 | test | 待确认 | 涉及模型、Agent、SDK、prompt、工具调用或自动化 workflow 时，已记录 provider/model_id/pinned alias、budget/cost/quota/rpm/tpm、上下文截断、工具权限、eval/fixture 隔离、并发 agent 冲突、可复现命令/exit code/artifact hash、tracing 敏感数据、prompt 漂移、内容安全和日志保留策略；不涉及时明确写“不适用”。 | `.plan/SPEC.md` |
| [ ] | 硬编码假设检查 | test | 待确认 | 已检查本机绝对路径、浏览器 profile、账号/平台/workspace ID、localhost/固定端口、temp/download/output path、floating model alias、placeholder；需要用户确认的硬编码已列入 SPEC。 | `spec-loop-kit validate --cwd .` |
| [ ] | 确认浏览器/登录态技术路线 | test | 待确认 | 涉及浏览器、平台页面、登录态、cookie 或账号 session 时，已在 SPEC 记录项目标准工具、OpenCLI/Playwright 边界、账号材料策略和证据路径；不涉及时明确写“不适用”。 | `.plan/SPEC.md` |
| [ ] | 确认生图点和生成方法 | test | 待确认 | 涉及生图时，已列出生图点、用途、资产类型、推荐工具/提供方、尺寸数量、存储路径和审批状态；不涉及时明确写“不适用”。 | `.plan/PRD.md` / `.plan/SPEC.md` |
| [ ] | 明确检查命令和证据路径 | test | 待确认 | validate/audit、测试、证据路径明确 | `spec-loop-kit validate --cwd .` |
| [ ] | 明确用户测试包 | test | 待确认 | `.test/README.md` 和 `.test/config.json` 写明前端/skill/CLI/workflow 的启动、打包、驱动、隔离目录、报告和证据路径。 | `.test/README.md` |
| [ ] | 归类 loose output 目录 | test | 待确认 | 不存在根目录 `output/` 或 `outputs/` 作为当前产物入口；已有内容已按来源归入 `.test/ai/`、`.test/user/` 或 `.plan/archive/`。 | `spec-loop-kit validate --cwd .` |
| [ ] | Stop gate 确认 | test | 待确认 | 用户、平台、人工验收或发布确认未通过时，不声称完成；AI 自检和真实用户测试证据分开记录。 | `.test/ai/evidence/` 或 `.test/user/evidence/` |

## 下一步

- 补齐正式负责人和排期。
- 开始开发前确认 `PRD.md`、`SPEC.md`、`CHECKLIST.md` 一致。
- 运行 `spec-loop-kit validate --cwd .`，有 P0 时先修流程，不要硬开工。

## 验收记录

| 日期 | 命令或证据 | 结果 | 备注 |
|---|---|---|---|
| 2026-05-30 | 待补充 | 待补充 | 待补充 |
