# Spec Loop Kit

Spec Loop Kit 是一套轻量项目治理模板，用来把 AI 开发中的“当前事实源、负责人、排期、验收证据、历史过程材料”分清楚。

它分两层：

- **SDK/模板包**：给新项目或已有项目初始化 `.plan/`、`.kit/`、`.workflow/`、`.test/`、宿主入口和根目录 `README.md`。
- **Codex skill**：让 Agent 在 vibe 开发和持续迭代中按同一套规则读取、更新、归档。

## 快速使用

在目标项目根目录运行：

```powershell
node .\bin\spec-loop-kit.mjs init --cwd <target-project> --owner <owner> --level 1 --host auto
node .\bin\spec-loop-kit.mjs init --cwd <target-project> --owner <owner> --level 1 --host claude
```

只读检查当前项目：

```powershell
node .\bin\spec-loop-kit.mjs validate --cwd <target-project> --profile auto --host auto
node .\bin\spec-loop-kit.mjs audit --cwd <target-project> --json --host auto
```

默认会创建：

```text
.plan/
  PRD.md
  SPEC.md
  CHECKLIST.md
  runs/
  archive/
README.md
AGENTS.md 或 CLAUDE.md
docs/
  architecture/
  ui-ux/
.test/
  README.md
  config.json
  ai/
    sandboxes/
    reports/
    evidence/
    packages/
    fixtures/
  user/
    README.md
    packages/
    guides/
    acceptance/
    feedback/
    evidence/
.kit/
  config.json
  version.json
.workflow/
  README.md
  status.md
  codex.md
  workbuddy.md
  trae-solo.md
  scripts/
```

`.workflow/` 是唯一 KIT-managed workflow 目录，用来存当前可恢复入口、host preset、流程说明、脚本和历史 workflow 合同。不要新建 `docs/workflows/`；老项目已有时，归档时迁移或桥接到 `.workflow/`。
`README.md` 只放根目录；`.plan/README.md` 不再创建。测试材料统一进项目根目录 `.test/`，不放源码目录，也不散在根目录。AI 自检进 `.test/ai/`，真实用户测试进 `.test/user/`。AI 模拟用户仍然是 AI 测试。根目录 `output/` / `outputs/` 不是有效测试包，SuperDev 或老脚本留下的 `output/` 只能当迁移输入，发现后必须归类到 `.test/ai/`、`.test/user/` 或 `.plan/archive/`。

已有文件默认不会覆盖。需要覆盖模板时显式加 `--force`。

`validate` 不修改项目文件。存在 P0 时返回非零退出码；只有 P1/P2 时会报告风险但允许继续。`audit --json` 输出给 Codex、Claude Code、OpenCode、WorkBuddy 等工具读取。

`validate` 面向被 KIT 初始化的项目，不是 `kit-skills` 包本身的自检命令。包自检用 `npm run check`、`quick_validate.py`、`npm pack --dry-run`。

fresh init 后如果只剩 `P1 prd-placeholders`，这是正常建档前状态。意思是产品事实还没写，不是 helper 挂了。

## 核心规则

- Agent 默认只把 `.plan/PRD.md`、`.plan/SPEC.md`、`.plan/CHECKLIST.md` 当作当前事实源。
- 根目录 `README.md` 是用户入口，`.test/README.md` 是测试包总入口，`.test/user/README.md` 是真实用户测试入口。
- Claude 宿主必须以 `CLAUDE.md` 为主入口；Codex/通用宿主用 `AGENTS.md`。
- `.plan/archive/**` 只能作为历史参考，不能覆盖当前判断。
- `.kit/config.json` 是负责人、排期、阶段、阻塞和进度的共享快照；`.kit/version.json` 是版本合同。
- `.test/ai/**` 存 AI 自检沙盒、报告、截图、日志、fixtures 和打包证明。
- `.test/user/**` 存真实用户测试包、安装说明、验收表、反馈和用户返回证据。
- AI 模拟用户、浏览器自动化、CLI 驱动、模型生成反馈都归 `.test/ai/**`。
- 根目录 `output/` / `outputs/` 必须迁移到 `.test/ai/`、`.test/user/` 或 `.plan/archive/`；不能继续当主产物入口。
- 涉及 OpenAI SDK、Claude SDK、Agents SDK、prompt、模型评审、工具调用、多 Agent、长文本分片或自动化 workflow 时，`.plan/SPEC.md` 必须有 `Model / Agent Risk Ledger`。
- `Model / Agent Risk Ledger` 至少记录 provider/model_id/pinned alias、budget/cost/quota/rpm/tpm/rate limit、max_context/token/chunk/truncation、prompt 漂移、工具权限、eval/fixture 隔离、并发 agent 冲突、可复现命令/exit code/artifact hash、tracing 敏感数据、内容安全/隐私/版权、日志和证据保留策略。
- 归档时必须检查 hardcoded assumptions：本机路径、浏览器 profile、账号/平台/workspace ID、localhost/固定端口、temp/download/output path、floating model alias、placeholder、secret-like literal。
- `docs/ui-ux/**` 存稳定 UI/UX 事实，测试截图证据按来源进入 `.test/ai/evidence/**` 或 `.test/user/evidence/**`。
- `.plan/CHECKLIST.md` 必须包含 `任务列表前置规划`，否则开发准备状态不可信。
- `.plan/SPEC.md` 必须记录 routed capability / handoff：谁规划、谁执行、谁审查、证据在哪里、失败如何回退。
- 如果计划和代码冲突，以 live repo、测试结果、运行证据为准。

## Profile 审计

`validate` 支持 `auto`、`generic-project`、`frontend-ui`、`long-content-publishing`、`archive-cleanup`、`skill-package`。

- `generic-project`：检查 PRD/SPEC/CHECKLIST、`.kit/`、任务前置规划、stop gate。
- `frontend-ui`：额外检查 UI/UX 文档、浏览器/截图证据和验证工具。
- `long-content-publishing`：额外检查长流程内容 workflow 的确认门、dry-run/live 隔离、状态恢复、质量阻断、外发/写入/发布证据。
- `archive-cleanup`：额外检查 root Markdown、流程目录和归档风险。
- `archive-cleanup`：额外检查硬编码假设，提醒哪些值要改成配置、哪些要保留为项目契约、哪些要归档或移除。
- `skill-package`：用于 `kit-skills` 这类可发布 skill 包自检，检查 SKILL/README/bin/templates/knowledge、`.kit/`、`.test/`、MIT license、package metadata 和 dry-run 脚本。

## 项目级别

| Level | 适用场景 | 要求 |
|---|---|---|
| 0 | 小修小补 | 不强制建 `.plan`，直接改代码、跑检查、总结 |
| 1 | 普通功能开发 | 使用根三件套和 `.kit/config.json` |
| 2 | 中型多阶段迭代 | 根三件套保持当前事实，阶段材料进 `archive/` |
| 3 | 强验收项目 | 允许专用门禁文件，但必须在 `SPEC.md` 引用 |
| 4 | OpenSpec 级别 | 只有多团队、多版本、多提案并行时使用 |

## 和产品经理技能包的关系

本包吸收了产品规格、开发计划、反馈闭环的结构思想，但不照搬 Claude 专属目录。`Product-Spec.md` 对应到 `.plan/PRD.md`，`DEV-PLAN.md` 对应到 `.plan/CHECKLIST.md` 的阶段任务，设计和发布证据进入 `docs/`。
