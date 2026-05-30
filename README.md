# KIT Skills

> Project version: `0.3.0`

KIT Skills 是一个产品语言驱动开发的 skill 包。

用户用自然语言讲产品目标，AI 负责追问、建档、拆任务、记录技术路线、跑验证。用户不需要手填 PRD/SPEC/CHECKLIST。

## 四命令心智模型

KIT v2.0 提供四个命令，覆盖产品到开发的完整闭环：

```
/kit       → 产品层（建档 / 归档 / 脑暴 / 沙盒）
/kit-run   → 执行层（编码 / 测试 / 运行）
/kit-check → 质量层（检查 / 研究 / 规划）
/kit-loop  → 自动巡航（自我迭代 / 时间盒）
```

飞轮：

```
/kit init → /kit brainstorm → /kit-run start → /kit-check diff → [用户确认] → 修复 → 回归 → /kit archive
```

## 核心用途

- brainstorm：先聊清产品方向。
- 建档：生成根目录 `README.md`、宿主入口、`.plan/PRD.md`、`.plan/SPEC.md`、`.plan/CHECKLIST.md`、`.kit/`、`.workflow/`、`.test/`。
- 归档：整理历史计划、证据、旧流程文件。
- 漂移检查：新需求和旧目标冲突时先提醒。
- 验收证据：记录谁执行、怎么验、证据在哪、哪里必须停。
- 规模感知：自动推断 quick/standard/deep，用户可覆盖。
- 沙盒模板：3 套核心模板（default/data-ml/fullstack），每套含 README.md + TEST.md。
- 多轮多组实验：V1/V2/V3 × group-a/b/c，最多 3 轮，批量确认。
- 心跳监控：按任务类型预设阈值，自动重试 3 次。
- 质量飞轮：内置编码门禁 + 发散检查 + 回归验证。
- Vibe Coding 反模式检测：emoji 图标、硬编码颜色、mock 残留、z-index 战争等 21 项。

KIT 不亲自做 deep research、QA、浏览器自动化、发布平台操作、多 Agent 执行、SDK 业务调用。它负责发现这些能力是否需要，检查宿主/项目里有没有对应 skill，再把路由和证据写进 SPEC/CHECKLIST。

## 目录结构

```text
kit-skills/
  SKILL.md
  README.md
  AGENTS.md
  CLAUDE.md
  LICENSE
  package.json
  .kit/
  .test/
  agents/openai.yaml
  bin/spec-loop-kit.mjs
  templates/
  knowledge/
  modes/
    kit.md
    run.md
    check.md
    loop.md
  quality/
    pre-code.md
    post-code.md
    ui.md
    data.md
    api.md
```

## 安装

把整个 `kit-skills` 文件夹复制到你的 Agent skill 目录。

常见位置：

```text
~/.codex/skills/kit-skills/
~/.claude/skills/kit-skills/
~/.agents/skills/kit-skills/
```

要复制整个目录。`bin/`、`templates/`、`knowledge/` 都要保留。

## 推荐用法

在 Codex、Claude Code、OpenCode、Cursor、Windsurf 或其他 AI IDE/CLI 中打开你的项目，把 KIT 路径交给 AI。

示例：

```text
请使用 KIT 参考包：
C:\tools\kit-skills

目标项目：
D:\projects\my-app

先不要写代码。
请按 kit-skills 做 brainstorm/建档：
1. 读取 SKILL.md、README.md、templates/、knowledge/。
2. 追问我关键产品问题。
3. 生成或更新 .plan/PRD.md、.plan/SPEC.md、.plan/CHECKLIST.md、.kit/。
4. 涉及浏览器、登录态、生图、外发、写入、提交、发布时，先写清技术路线和确认门。
5. 先确认我要开发的是 skill、workflow、CLI harness、前后端产品、OMC 编排、OpenCLI 自动化、SDK 集成、纯 MD 框架还是设计原型。
6. 运行 validate，报告 P0/P1/P2。
```

## 先 brainstorm

想法还不清楚时，用这个：

```text
使用 kit-skills 的 brainstorm 模式。
我的想法是：<你的想法>

先不要建档，不要写代码。
请判断目标用户、核心痛点、第一条可用 workflow、风险点、技术路线差异，以及是否值得建档。
先问清我要开发的对象，不要默认做 WebUI。必要时只追问 1-2 次。
```

## 需求识别

KIT 建档前必须先分类用户到底要开发什么：

| 类型 | 默认建议 |
|---|---|
| `skill` | 先做可复用 skill 包 |
| `stable-workflow` | 先做 `.workflow/` + runner contract |
| `cli-harness` | 考虑 CLI-Anything 式 CLI、JSON 输出、真实后端、测试 |
| `frontend-backend-app` | 可推荐 OpenSpec 或 Super Dev |
| `omc-orchestration` | 路由到 OMC/team/state/handoff |
| `opencli-automation` | 用 OpenCLI/project browser route |
| `sdk-integration` | 记录 OpenAI/Claude SDK 业务调用边界 |
| `pure-md-framework` | 走轻量 `.plan/PRD/SPEC/CHECKLIST` |
| `design-prototype` | 先做 skill 或稳定 workflow，流程稳定后再考虑 CLI/WebUI |

如果是前后端技术栈选型：

- OpenSpec：适合 spec-driven 需求变更管理。
- Super Dev：适合 AI 交付治理、UI runtime gate、proof pack、release readiness。

如果不是前后端产品，别硬推 OpenSpec/Super Dev。skill、workflow、CLI harness、OpenCLI 自动化、SDK 集成，各有自己的正确形态。把错框架塞给用户，后面改起来像拆承重墙。

## 建档

方向清楚后：

```text
用 KIT 建档这个项目。
目标项目路径：D:\projects\my-app
KIT 参考包：C:\tools\kit-skills

你来创建或更新 .plan/、.kit/、docs/。
需要我决定的产品问题再问我。
技术栈、验证命令、文件结构由你按项目现状判断。
```

建档后通常会出现：

```text
.plan/
  PRD.md
  SPEC.md
  CHECKLIST.md
  archive/
  runs/
.kit/
  config.json
  version.json
docs/
  architecture/
  ui-ux/
.workflow/
  README.md
  status.md
  codex.md
  workbuddy.md
  trae-solo.md
  scripts/
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
README.md
AGENTS.md 或 CLAUDE.md
```

如果项目需要 host preset 或可恢复流程，直接用 `.workflow/`：

```text
这个项目需要 .workflow 入口。
请用 KIT 创建 workflow 预设：Codex、WorkBuddy、Trae Solo。
同时检查 README.md、当前宿主入口、.workflow/README.md、.test/README.md、.plan/PRD.md、.plan/SPEC.md 是否目标一致。
```

AI 可以调用：

```powershell
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-app --host auto
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-claude-app --host claude
```

会生成：

```text
.workflow/
  README.md
  status.md
  codex.md
  workbuddy.md
  trae-solo.md
  scripts/
```

规则：

- `.workflow/`：统一管理当前可恢复入口、host preset、流程说明、脚本和历史 workflow 合同。
- `docs/`：只放架构、UI/UX 等稳定说明，不再放测试包和 workflow。
- `README.md`：只放根目录，作为用户和仓库首页入口。不要新建 `.plan/README.md`。
- `.test/`：放测试包。它在项目根目录，不进源码目录。
- `.test/ai/`：AI 自检、dry-run、打包证明、自动化日志。
- `.test/user/`：给真实用户的测试包、安装说明、验收表、反馈表和用户返回证据。
- AI 模拟用户仍然算 `.test/ai/`，不算 `.test/user/`。
- 不允许新建根目录 `output/` 或 `outputs/` 当测试包；SuperDev 或老脚本留下的 `output/` 只能当迁移输入，归档时归类进 `.test/ai/`、`.test/user/` 或 `.plan/archive/`。
- 大日志、大模型输出、命令流水不要塞进聊天上下文；原始证据进 `.test/ai/evidence/`，报告只写摘要和路径。
- 归档时会检查硬编码假设：本机路径、浏览器 profile、账号/平台 ID、固定端口、temp/download/output path、floating model alias、placeholder、secret-like literal。
- `AGENTS.md` / `CLAUDE.md`：按宿主生成；Claude 宿主使用 `CLAUDE.md` 主入口。
- `.kit/version.json`：记录版本合同，和宿主入口、包版本、git tag/release 同步。
- 老项目已有 `docs/workflows/` 或 `.workflows/` 时，归档时检查目标冲突，并迁移或桥接到 `.workflow/`。

宿主规则：

- `--host claude`：生成 `CLAUDE.md`，Claude 只读它作为主入口。
- 其他宿主：生成 `AGENTS.md`。
- `--host auto`：按当前环境和已有文件判断。
- 不要让 Claude 依赖 `AGENTS.md` 当主入口，脑子会掉地上。

## 继续开发

```text
使用 kit-skills 继续这个项目。
先读取 .plan/PRD.md、.plan/SPEC.md、.plan/CHECKLIST.md 和 .kit/。
如果我的新需求和已建档目标冲突，先指出漂移。
涉及 3 个以上文件改动，先给计划。
完成后运行 validate，并报告证据。
```

已建档项目每次调用 KIT，AI 都要先报一个短状态：

```text
当前状态: ...
终点: ...
方向变化: none / minor / scope_expansion / direction_change / new_project_candidate
下一步: ...
需要你决定: ...
```

没有阻塞决策就写“不需要”。别为了显得礼貌把用户拽进每个细枝末节，用户不是配置文件填写员。

固定追问放在 `knowledge/question-bank.json`。AI 需要追问时引用 `SB*`、`AR*`、`OC*`、`FR*`、`BI*`、`HA*` 这些问题 ID，再问一句短问题。

## 归档前确认

归档、清理、打包、移动流程文件前，AI 先判断要不要问。

不用问的情况：

- `validate` 没有相关 P0/P1。
- PRD、SPEC、CHECKLIST、`.kit/`、`.workflow/`、`.test/`、README、宿主入口和代码事实一致。
- 候选文件明确是历史、AI 自测、真实用户测试材料或生成噪音。
- 不会影响当前入口、恢复路径、用户测试包、live action 证据、secret 材料或硬编码环境设置。

必须问的情况：

- 新需求和当前 PRD/SPEC 冲突。
- 根目录或流程目录里的 Markdown 可能还是当前事实。
- `.workflow/`、`.test/`、README、AGENTS/CLAUDE、`.plan` 目标不一致。
- AI 模拟用户材料和真实用户测试材料混了。
- 文件里有本机路径、端口、账号 ID、模型 alias、浏览器 profile、secret-like literal。

这时用 `question-bank` 的 `AR*` 问题。少问，问准。别把归档做成审讯室。

## Capability Skill Inventory

建档和归档前，让 AI 先盘点宿主和项目本地能力。

```text
开始建档/归档前，先做 Capability Skill Inventory。

请检查：
- deep-research 是否已安装；它用于文件检索 + 结合文件的联网搜索，缺失时放到可选安装推荐第一位；
- 宿主已安装哪些相关 skill/plugin/tool；
- 项目本地是否已有 skills/、.agents/skills/、.claude/skills/、.codex/skills/、.workflow/、历史 `.workflows/` / `docs/workflows/` 或 runner；
- 本项目可能需要哪些 routed capability；
- 哪些可用，哪些缺失；
- 缺失但建议安装的，给出推荐 skill/tool、安装目标、风险和是否需要我确认；
- 我确认后，再下载或复制到项目路径，并把证据写进 .plan/SPEC.md 和 .plan/CHECKLIST.md。
```

推荐记录到 `.plan/SPEC.md` 的 `Capability Skill Inventory` 表。

常见安装目标：

```text
skills/<skill-name>/
.agents/skills/<skill-name>/
.claude/skills/<skill-name>/
.codex/skills/<skill-name>/
.workflow/
```

有账号绑定、cookie、token、大文件、许可证风险的内容，必须先确认。

## 入口一致性

建档和归档时，AI 要检查：

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.workflow/README.md`
- `.plan/PRD.md`
- `.plan/SPEC.md`

重点看目标、范围、workflow、stop gate 是否冲突。检查 active host entry：Claude 是 `CLAUDE.md`，其他宿主是 `AGENTS.md`。另一个入口存在时只能作为 bridge/legacy，不能当第二个主入口。

## 特殊技术路线

浏览器/登录态：

- 需要登录态、cookie、账号 session、绑定浏览器配置时，优先项目标准工具或 OpenCLI。
- Playwright 主要用于 E2E、项目已有测试、跨浏览器回归。
- 账号材料不得入库。

生图：

- 先列出生图点：页面、场景、封面、角色、背景、缩略图、视觉证明。
- 再记录工具/提供方、尺寸数量、存储路径、审批状态。

## Profile

`validate` 支持：

| Profile | 场景 |
|---|---|
| `auto` | 自动判断 |
| `generic-project` | 普通项目 |
| `frontend-ui` | 前端、UI、视觉验证 |
| `long-content-publishing` | 日报、报告、批量生成、自动提交、可选发布等长流程内容 workflow |
| `archive-cleanup` | 项目归档、清理、整理 |
| `skill-package` | `kit-skills` 这类可发布 skill 包自检 |

示例：

```powershell
node C:\tools\kit-skills\bin\spec-loop-kit.mjs validate --cwd D:\projects\daily-report-workflow --profile long-content-publishing
```

## Helper 命令

这些命令主要给 AI 或高级用户用：

```powershell
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-app --owner your-name --level 1 --host auto
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-claude-app --owner your-name --level 1 --host claude
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-ml-app --owner your-name --level 2 --template data-ml
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-experiment --owner your-name --level 3 --experiment
node C:\tools\kit-skills\bin\spec-loop-kit.mjs validate --cwd D:\projects\my-app --profile auto --host auto
node C:\tools\kit-skills\bin\spec-loop-kit.mjs audit --cwd D:\projects\my-app --json --host auto
```

结果说明：

- `P0`：必须先修。
- `P1`：可继续，但要接受风险。
- `P2`：建议优化。

普通 `validate` 是给被 KIT 初始化的项目用的。`kit-skills` 包目录自检用 `skill-package` profile：

```powershell
npm run check
npm run check:contract
npm run check:self-audit
npm run check:pack
```

新建项目刚 init 后出现 `P1 prd-placeholders` 是正常的：说明还没把用户目标填进 PRD。它不是工具坏了，是你还没开始建档。别把空表当成绩单。

## 模型 / Agent 开发风险

只要项目涉及 OpenAI SDK、Claude SDK、Agents SDK、prompt、模型评审、工具调用、多 Agent、长文本分片或自动化 workflow，就要在 `.plan/SPEC.md` 写 `Model / Agent Risk Ledger`。

至少记录：

- provider / model_id / pinned alias：避免模型升级后行为漂移，项目还装作没变。
- budget / cost / quota / rpm / tpm / rate limit：别等账单或平台限额把流程打断。
- max_context / token / chunk / truncation：3 万字、几十个文件、长日志都不能靠“模型自己理解”。
- prompt / 角色漂移：人设、审查方式、system prompt 变了要归档。
- 工具权限和 live action：外部写入、账号操作、发布提交必须有确认门。
- eval / fixture 隔离：评测数据、AI 模拟用户、golden case 放 `.test/ai/fixtures/` 或 `.test/ai/reports/`。
- concurrent agents：多代理并行必须记录 `run_id`、owner、touched paths、state file、merge rule、conflict gate。
- reproducibility：关键验证要记录 command、exit code、输入 fixture、依赖 lockfile、seed、artifact hash。
- trace_sensitive_data：tracing、tool 参数、模型输入输出涉及敏感数据时要关闭、脱敏或隔离。
- 内容安全、隐私、版权：生成内容、用户数据、公开素材要有边界。
- 证据保留：原始日志进证据目录，报告写摘要。把长日志糊进上下文，是给下一轮 AI 挖坑。

这套规则对齐 OMC 的状态/证据思路，也贴近 CLI-Anything 的 harness 思路：工具要产生真实、可检查、可复放的产物，而不是在聊天里表演“我已完成”。

## 硬编码假设检查

归档和打包时，`validate` 会提醒常见 AI 硬编码：

- `C:\Users\...`、`/Users/...`、`/home/...`、`/root/...`
- browser profile、`user-data-dir`、`profile-directory`
- `user_id`、`workspace_id`、`book_id`、`channel_id` 这类平台/账号 ID literal
- API key、token、cookie、sessionid literal
- `localhost:3000` 这类固定端口
- temp/download/output path
- `model: latest/auto/default`
- `your-name`、`yourusername`、`replace-me`

处理方式不要装聪明：

- 是产品/平台契约：写进 `.plan/SPEC.md`。
- 是本机配置：移到 env/config/local ignored 文件。
- 是示例：只留在 README 或 `.test/user` 指南里，并标成 example。
- 是历史噪音：进 `.plan/archive/` 或 `.test/ai/`。
- 是 secret 或账号材料：移除。

## knowledge

`knowledge/` 是解释材料：

- `openai-sdk.md`
- `omc-framework.md`
- `openspec-framework.md`
- `superdev-framework.md`
- `cli-anything-framework.md`
- `pure-md-framework.md`
- `opencli-framework.md`
- `product-prototype-knowledge.md`
- `question-bank.json`
- `index.json`

项目真实状态看 `.plan/`、`.kit/` 和验证证据。

## 规模感知

KIT 根据需求描述自动推断项目规模，分为 `quick`（1 天内）、`standard`（2-5 天）、`deep`（1 周以上）三级。`quick` 合并 PRD/SPEC/CHECKLIST 为单份 PLAN.md；`standard` 走标准三件套；`deep` 强制 Architecture Review 和 Risk Ledger。用户可通过 `--level` 参数覆盖推断结果。

## 沙盒模板

`init` 支持 `--template` 参数选择 3 套核心模板：`default`（通用代码项目）、`data-ml`（数据分析/ML）、`fullstack`（Web/CLI 复杂应用）。每套模板自带 README.md + TEST.md，子代理在干净会话中启动前，TEST.md 必须先就位。

## 实验框架

用户声明"需要做对照实验"时，KIT 创建多轮多组实验结构：V1/V2/V3 × group-a/b/c，最多 3 轮。每组独立目录，通过 `cp -r` 主项目源码创建，批量确认所有变量配置后才启动子代理。实验结果汇总为 REPORT-vN.md，用户审阅后决定继续、采用某组或归档。

## 心跳监控

后台 bash 长任务自动启用心跳监控，按任务类型预设阈值：`default`（120 秒）、`build`（600 秒）、`training`（1800 秒）、`download`（300 秒）。超时或 PID 消失时自动重试最多 3 次，3 次失败后写入 `.kit/blockers.json` 并通知用户。

## 自检

```powershell
python -X utf8 <codex-home>\skills\.system\skill-creator\scripts\quick_validate.py <path-to-kit-skills>
node <path-to-kit-skills>\bin\spec-loop-kit.mjs validate --cwd <scratch-project> --profile auto
node <path-to-kit-skills>\bin\spec-loop-kit.mjs audit --cwd <path-to-kit-skills> --profile skill-package --json
node --check <path-to-kit-skills>\bin\spec-loop-kit.mjs
node <path-to-kit-skills>\scripts\contract-tests.mjs
npm pack --dry-run
```

## License

`MIT License`。见 `LICENSE`。
