# SPEC — kit-v2-smoke-quick-v2

> Owner: test
> Level: 0
> Profile: generic-project
> Updated: 2026-05-30

## 当前事实源

- `.plan/PRD.md`
- `.plan/SPEC.md`
- `.plan/CHECKLIST.md`
- `.kit/config.json`
- `.kit/version.json`
- `README.md`
- `CLAUDE.md`
- `.test/README.md`
- `.test/config.json`
- `.workflow/README.md`

如果这些文件与代码、测试、运行证据冲突，以 live repo、测试结果和证据为准，并回写本文件。

## Invocation Status Brief

每次调用 KIT 时，先读当前事实源并输出这个短状态。别让下一轮 AI 现场装考古专家。

| Field | Value |
|---|---|
| 当前状态 | planning / 待确认 |
| 终点 | 待确认；写清 Definition of Done 和 Stop Gate |
| 方向变化 | none / minor / scope_expansion / direction_change / new_project_candidate |
| 下一步 | 待确认 |
| 需要用户决定 | 仅记录真实产品/业务阻塞项；没有就写“不需要” |

使用 `knowledge/question-bank.json` 的 `SB*` 问题 ID 管理固定追问，不要在上下文里反复复制长问题。

## Entry / Charter Consistency

| File | Role | Consistency status | Action |
|---|---|---|---|
| `README.md` | project entry | 待确认 | 必须指向 `.plan/` 当前事实源 |
| `CLAUDE.md` | Claude Code primary instruction file | 待确认 | 当前宿主主入口；必须指向 `.plan/`、`.kit/`、`.workflow/`、`.test/` |
| `.test/README.md` | user-test package entry | 待确认 | 记录隔离测试环境、测试命令、打包/启动/驱动方式和证据路径 |
| `.workflow/README.md` | workflow entry | 待确认 | 当前可恢复入口、host preset、流程说明和历史 workflow 合同统一放这里 |
| legacy `.workflows/` / `docs/workflows/` | legacy workflow material, if present | 待确认 | 不作为新入口；归档时迁移或桥接到 `.workflow/` |
| `.plan/PRD.md` | product charter | 当前事实源 | 与 SPEC/CHECKLIST 保持一致 |
| `.plan/SPEC.md` | technical charter | 当前事实源 | 与 PRD/CHECKLIST 保持一致 |

Active workflow entry: `.workflow/README.md`

## Archive Interaction Gate

归档、清理、打包或移动流程文件前，先判断是否需要问用户。不是所有移动都要开会，但会改变项目事实的移动必须问。

不需要提问的条件：

- `validate` 没有相关 P0/P1。
- PRD、SPEC、CHECKLIST、`.kit/`、`.workflow/`、`.test/`、README、`CLAUDE.md` 和 live files 目标一致。
- 候选文件明确是历史、AI 自测证据、真实用户测试材料或生成噪音。
- 不会丢失当前入口、恢复路径、用户测试包、live action 证据、secret 材料或硬编码环境设置。

需要提问时，使用 `knowledge/question-bank.json` 的 `AR*` 问题 ID：

| Trigger | Question ID | Decision to record |
|---|---|---|
| 新需求冲突当前 PRD/SPEC | `AR3` | 更新当前项目，或新建项目 |
| 文件可能是当前事实 | `AR1` | keep / archive / docs / evidence / test_user / test_ai |
| 可能影响入口或恢复路径 | `AR2` | 可移动 / 先桥接 / 禁止移动 |
| AI 自测和真实用户测试混在一起 | `AR4` | `.test/ai/` 或 `.test/user/` |

## Version Contract

| Field | Value |
|---|---|
| Project version | `0.1.0` |
| Version source | `.kit/version.json` |
| Sync targets | `README.md`, `CLAUDE.md`, `.test/config.json`, package/release metadata, git tag/release, `.workflow/README.md` |

版本不一致时，先修版本合同，再安排用户测试。

## 架构概览

说明主要模块、数据流、外部依赖和运行方式。

## 产品架构决策

| 决策 | 推荐方案 | 产品效果 | 风险 | 可逆性 | 证据 |
|---|---|---|---|---|---|
| 待补充 | 待补充 | 待补充 | 待补充 | 待补充 | 待补充 |

## Framework Routing Decision

先确认开发对象，再选框架。不要把用户一句“做个工具”自动翻译成 WebUI，AI 这么干不是智能，是偷懒。

| Object | Default recommendation | When to choose | When not to choose |
|---|---|---|---|
| `skill` | 先做 skill package | 用户要复用 AI 行为、规则、审查、建档、写作或分析能力 | 不需要独立命令或界面时不要做 CLI/WebUI |
| `stable-workflow` | 先做 `.workflow/` + runner contract | 用户要每天/每周/多步骤稳定执行 | 不要一开始就做大 WebUI |
| `cli-harness` | CLI-Anything style CLI | 已有软件/代码库，需要 Agent 用命令和 JSON 操作真实后端 | 用户还没产品对象时别上 |
| `frontend-backend-app` | OpenSpec 或 Super Dev | 有前端/后端/全栈产品、长期需求变更、UI/发布门禁 | 只是 skill/workflow 时太重 |
| `omc-orchestration` | OMC/team/state/handoff | 多 Agent 并行、状态恢复、角色分工 | 不要塞进 KIT Core |
| `opencli-automation` | OpenCLI/project browser route | 登录态浏览器、平台提交、外部写入 | 不要替代产品规格 |
| `sdk-integration` | OpenAI/Claude SDK route | 业务逻辑直接调用模型/API | 不要把 SDK 当产品本身 |
| `design-prototype` | skill 或 stable workflow first | 设计流程要复用、需要稳定产出 | 工作流没稳定前别急着做 CLI/WebUI |

For frontend/backend stack selection, record whether OpenSpec or Super Dev is recommended:

| Framework | Recommendation | Reason | Reversible? | No-return point |
|---|---|---|---|---|
| OpenSpec | 待确认 | spec-driven 变更管理 | 早期可迁移 | capability/spec delta 成为事实源后迁移成本上升 |
| Super Dev | 待确认 | AI 交付治理、UI gate、proof pack、release readiness | 早期可迁移 | 阶段门禁和交付包成为主流程后迁移成本上升 |

## Handoff / Routed Capability

| 能力 | 负责方 | 工具或 skill | 审批状态 | 证据路径 | 回退规则 |
|---|---|---|---|---|---|
| 规划/建档 | Codex | kit-skills | 待确认 | `.plan/` | 先更新 PRD/SPEC/CHECKLIST |
| 执行 | 待补充 | 待补充 | 待确认 | 待补充 | 待补充 |
| 审查/验证 | 待补充 | 待补充 | 待确认 | `.test/ai/reports/` | 有 P0 时停止 |

## Model / Agent Risk Ledger

模型、Agent、SDK、prompt、工具调用或自动化 workflow 一旦进入项目，就必须把风险写清楚。别等账单炸了、上下文截断了、模型版本换了，再装作这是“AI 的小脾气”。

| 字段 | 当前策略 | 证据/位置 |
|---|---|---|
| Provider / model_id / pinned alias | 待确认；记录固定模型、可替换模型和升级触发条件 | `.plan/SPEC.md` |
| Budget / cost / quota / rpm / tpm / rate limit | 待确认；记录预算、频率、失败/DEFERRED 行为 | `.plan/SPEC.md` |
| Max context / token / chunk / truncation | 待确认；长文本和多文件必须有 chunk + synthesis 策略 | `.plan/SPEC.md` / `.test/ai/reports/` |
| Prompt drift / persona / system prompt | 待确认；人设、system prompt、审查方式变更要归档 | `.plan/archive/` |
| Tool permission / allowlist / denylist / live action | 待确认；危险操作、外部写入、账号操作必须有确认门 | `.plan/CHECKLIST.md` |
| Eval / fixture / golden / benchmark isolation | 待确认；评测数据和模拟用户结果进入 `.test/ai/fixtures/` 或 `.test/ai/reports/` | `.test/ai/` |
| Concurrent agents / run_id / owner / touched paths / conflict gate | 待确认；并发执行必须记录 owner、run_id、写入范围和冲突处理 | `.workflow/status.md` / `.plan/CHECKLIST.md` |
| Reproducibility / command / exit code / lockfile / seed / artifact hash | 待确认；关键验证必须能复跑，有输入和产物哈希 | `.test/ai/reports/` |
| Trace sensitive data / logging / retention | 待确认；tracing、tool 参数、模型输入输出涉及敏感数据时要关闭、脱敏或隔离 | `.test/ai/evidence/` |
| Copyright / privacy / content safety | 待确认；涉及用户数据、公开内容、版权素材时记录边界 | `.plan/SPEC.md` |
| Evidence budget / context pollution | 待确认；大日志只保留摘要和路径，原始文件进 `.test/ai/evidence/` | `.test/ai/evidence/` |

## Hardcoded Assumption Review

AI 很爱写死本机信息。归档时必须检查，不然项目一换电脑、账号、端口、模型或目录就报废。

| 类型 | 当前状态 | 处理规则 |
|---|---|---|
| 本机绝对路径 | 待确认 | `C:\Users\...`、`/Users/...`、`/home/...`、`/root/...` 必须改成配置、相对路径或 example-only |
| 浏览器 profile / 登录态路径 | 待确认 | 不入库；只记录 host-local 设置和账号材料策略 |
| 账号 / 平台 / workspace / book / channel ID | 待确认 | 确认是否环境相关；环境相关则进 config/env，不写死 |
| localhost / 固定端口 | 待确认 | 是项目契约就写进 SPEC；只是本机示例就别污染代码 |
| temp / download / output path | 待确认 | 使用 `.test/ai/sandboxes/` 或可配置路径 |
| model alias / latest / auto / default | 待确认 | 固定模型或记录 alias 升级和重验规则 |
| placeholder | 待确认 | `your-name`、`yourusername`、`replace-me` 不能留在当前事实或代码里 |

## Capability Skill Inventory

建档和归档开始时，先检查当前宿主和项目本地是否已有后续可能需要的业务 skill、workflow 或 runner。`deep-research` 是固定优先检查项，用于文件检索 + 结合文件的联网搜索；缺失时放到可选安装推荐第一位。KIT 不直接承担这些能力，但必须记录推荐、安装状态和证据。

| Capability | Need | Host status | Project status | Recommended skill/tool | Install target | Approval | Evidence |
|---|---|---|---|---|---|---|---|
| Deep research / file-informed web research | 优先检查 | 待确认 | 待确认 | `deep-research` | `skills/deep-research/` 或 host-only | 待确认 | 待补充 |
| QA / verification loop | 待确认 | 待确认 | 待确认 | 待确认 | `skills/` 或项目测试脚本 | 待确认 | 待补充 |
| Browser / logged-in evidence | 待确认 | 待确认 | 待确认 | 项目标准优先；无标准时 OpenCLI | `skills/`、`.agents/skills/` 或 host-only | 待确认 | 待补充 |
| External delivery / publishing | 待确认 | 待确认 | 待确认 | 领域 publisher skill 或项目 runner | `skills/` 或 `.workflow/` | 待确认 | 待补充 |
| Multi-agent execution | 待确认 | 待确认 | 待确认 | team / ultrawork / OMC / host subagents | host-only 或项目说明 | 待确认 | 待补充 |
| OpenAI / Claude SDK implementation | 待确认 | 待确认 | 待确认 | SDK docs/implementation skill | `skills/` 或 host-only | 待确认 | 待补充 |
| Image generation | 待确认 | 待确认 | 待确认 | 项目指定或用户确认的生图 skill/provider | `skills/` 或 host-only | 待确认 | 待补充 |

## 接口与数据

| 名称 | 类型 | 位置 | 说明 |
|---|---|---|---|
| 待补充 | 待补充 | 待补充 | 待补充 |

## UI/交互约束

记录当前 UI 布局、响应式、视觉验收或截图验证要求。没有 UI 时写“不适用”。

## 浏览器 / 登录态 / 视觉验证技术路线

| 字段 | 内容 |
|---|---|
| 是否涉及浏览器或平台页面 | 待确认 |
| 是否需要登录态、cookie、账号 session 或绑定浏览器配置 | 待确认 |
| 首选工具 | 项目标准优先；没有项目标准且涉及登录态时优先 OpenCLI |
| Playwright 使用范围 | 仅用于 E2E、项目已有测试、跨浏览器回归，或项目明确标准化的场景 |
| 账号材料策略 | cookie、token、账号材料不得入库 |
| 证据路径 | `.test/ai/evidence/`；真实用户证据进 `.test/user/evidence/` |
| 回退规则 | 工具不可用时先更新 SPEC/CHECKLIST，不得静默换工具 |

## 生图 / 视觉资产生成技术路线

| 生图点 | 产品用途 | 资产类型 | 推荐工具/提供方 | 尺寸/数量 | 存储路径 | 审批状态 |
|---|---|---|---|---|---|---|
| 待确认 | 待补充 | 待补充 | 待确认 | 待补充 | `.test/ai/evidence/` 或项目资产目录 | 待确认 |

如果项目不涉及生图，写“不适用”。如果涉及但工具未定，先列出生图点并让用户确认工具或接受默认推荐。

## 质量门禁

| 类型 | 命令或证据 | 通过标准 |
|---|---|---|
| 类型检查 | 待补充 | 无错误 |
| 测试 | 待补充 | 关键路径通过 |
| 视觉验证 | 待补充 | 无遮挡、错位、滚动边界问题 |

## Stop Gate

不得声称完成，直到以下 gate 全部通过：

- 自动检查或测试通过，或明确记录未运行原因。
- 人工/平台/发布确认已完成，或明确停在 `CONFIRM_REQUIRED` / `DEFERRED` / `BLOCKED`。
- AI 证据已写入 `.test/ai/evidence/` 或 `.test/ai/reports/`；真实用户测试证据已写入 `.test/user/evidence/` 或 `.test/user/feedback/`。

## 专用门禁

Level 3 项目的专用门禁文件必须在这里列出，例如 `VISUAL-GATE.md`、`completion_guard`、`.test/ai/evidence/**`。
