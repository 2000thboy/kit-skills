# /kit Mode — kit-skills v2.0

Product layer: brainstorm, init (建档), archive (归档), sandbox.

---

## Invocation Status Brief Gate

If a project already has `.plan/PRD.md`, `.plan/SPEC.md`, `.plan/CHECKLIST.md`, or `.kit/`, every KIT invocation starts with a short status brief before advice, edits, or archive movement.

Read current facts from `.plan/`, `.kit/`, `README.md`, the active host entry, `.workflow/README.md`, and `.test/README.md` when present.

Required brief:

```text
当前状态: <stage/progress/blockers>
终点: <definition of done / stop gate>
方向变化: none | minor | scope_expansion | direction_change | new_project_candidate
下一步: <next safe action>
需要你决定: <only if a real product/business choice is blocking>
```

If no KIT files exist, say the project has not been 建档 yet and switch to brainstorm or 建档. Keep the brief compact.

Use `knowledge/question-bank.json` IDs instead of pasting repeated questions:

- `SB*`: status brief
- `AR*`: archive gate
- `OC*`: object classification
- `FR*`: framework route
- `BI*`: browser/image/live action
- `HA*`: hardcoded assumptions

---

## 启动场景识别与用户门禁（Invocation Scenario & User Gate）

每次调用 KIT 必须先判断启动场景，**用户始终是门禁，不可跳过**。

### 两种启动场景

| 场景 | 触发词 | 处理流程 |
|------|--------|---------|
| **从头开始** | "用 kit-skills 帮我开发 xxx" / "新建项目" / "建档" | Brainstorm → 分类 → 生成三件套 → **用户确认** → kitrun |
| **中间介入** | "继续按 kit-skills 流程开发" / "继续" / "接着做" | **检查当前状态** → 如有漂移 → **Brainstorm 到用户足够清楚** → **PLAN 确认** → 才能继续 |

### 规则优先级（Rule Priority）

当用户明确使用 KIT 流程时（如说"按 kit-skills 开发"、"/kit"、"继续 kit"），**KIT 流程规则优先于通用对话规则**：

- **通用 Trust 规则**：用户说"就这样"时不再追问细节 —— **适用于日常对话**
- **KIT 流程规则**：中间介入必须先头脑风暴到清楚 —— **适用于 KIT 上下文**

**判断标准**：用户是否明确调用了 KIT 命令或提及 kit-skills。如果是，执行 KIT 规则；如果不是，执行通用 Trust 规则。

### 确认与阻断项的复合条件（M-1）

**"确认"和"🔴 已修复"是两个独立条件，必须同时满足**：

| 条件 A | 条件 B | 结果 |
|--------|--------|------|
| 用户已确认 | 🔴 已修复 | ✅ 通过 |
| 用户已确认 | 🔴 仍存在 | ❌ 不通过，必须先修复 🔴 |
| 用户未确认 | 🔴 已修复 | ❌ 不通过，必须经用户确认 |
| 用户未确认 | 🔴 仍存在 | ❌ 不通过，两者都必须满足 |

AI 不得因用户说"确认"就忽略 🔴 阻断项。

### 中间介入强制流程

当用户说"继续"或"按 kit-skills 开发"但项目已有 `.plan/` 时：

1. **读取当前事实**：`.plan/PRD.md`, `.plan/SPEC.md`, `.plan/CHECKLIST.md`, `.kit/`
2. **判断是否需要 brainstorm**：
   - 如果用户目标与当前 PLAN 一致 → 报状态简报，询问是否直接继续
   - 如果用户目标**不清晰**、与当前 PLAN **有差异**、或用户**换了方向** → **必须先 brainstorm 到用户足够清楚**
3. **PLAN 确认**：任何变更或继续前，必须经用户书面确认
4. **禁止行为**：AI 不得因用户说"快点"、"直接做"就跳过头脑风暴和确认门

### 用户门禁规则

- **用户是最终门禁**。所有关键决策必须经过用户确认，AI 不得擅自决定。
- **不接受模糊确认**。仅以下文本视为有效确认：
  - 中文: **"确认"**
  - 英文: **"confirm"**
  - 其他任何文本（包括但不限于 "ok"、"好的"、"行"、"随便"、"sure"、"go ahead"、"yeah"、"没问题"、"可以"）**均视为未确认**。
  - 唯一例外: 用户在 AskUserQuestion 的多选界面中选择了明确选项，视为对该选项的确认。
- **3 次未确认处理**：连续 3 次未获明确确认 → 暂停流程，AskUserQuestion 让用户选择跳过/终止/继续。

---

## 0. Brainstorm: Product Discovery Before 建档

Use this mode when the user wants to explore, shape, compare, or pressure-test an idea before creating project files, or says:

- brainstorm
- 头脑风暴
- 产品构思
- 这个方向怎么样
- 帮我想产品形态
- 先聊方案
- 先别写代码

Brainstorm output must stay product-development oriented. Do not drift into generic creativity chat.

### 头脑风暴偏好确认（首次使用）

进入 brainstorm 前，先确认用户偏好的沟通方式（记录到 `.kit/config.json` 的 `brainstorm_mode`）：

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 头脑风暴偏好确认
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请选择你偏好的沟通方式：

[ ] "逐个确认"（推荐初学者）
    → 我一次问一个问题，你回答后再继续
    → 不容易遗漏，但回合数多

[ ] "一口气输出"（适合有经验用户）
    → 我先输出完整分析，你再统一反馈
    → 速度快，但需要你能快速消化信息

选择后我会记住你的偏好，后续自动使用。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**两种模式的流程差异：**

| 环节 | 逐个确认模式 | 一口气输出模式 |
|---|---|---|
| 问题方式 | 一次一个问题，等回答 | 一轮输出所有分析 |
| 方案对比 | 每提出一个方案等反馈 | 2-3个方案一起出 |
| 设计确认 | 每部分确认后再继续 | 完整设计输出后统一确认 |
| 适用用户 | 需求还不清楚、初学者 | 已有思路、想快速验证 |

---

### 分解门：项目太大先拆分

在深入需求前，先判断项目规模：

**如果用户描述包含多个独立子系统**（如"做一个平台，含聊天、文件存储、计费、数据分析"）：
- **必须立即 flag**："这个项目包含多个独立子系统，建议先拆分"
- 输出拆分建议：独立模块、依赖关系、构建顺序
- 让用户选择："先整体规划再拆分"或"先做一个模块"
- **禁止**：不拆分就直接细化所有模块的需求

**拆分输出格式：**
```text
⚠️ 检测到项目包含多个独立子系统：

【建议拆分】
| 模块 | 独立程度 | 依赖 | 建议顺序 |
|------|---------|------|---------|
| A | 高 | 无 | 1 |
| B | 中 | 依赖 A | 2 |
| C | 低 | 依赖 A,B | 3 |

【选项】
- "先整体规划" → 输出高层架构，不细化每个模块
- "先做模块 X" → 只对模块 X 做详细 brainstorm
- "全部一起做" → 标记风险：范围大、周期长、易失控
```

---

### Required output

- development object classification: skill, workflow, CLI harness, frontend/backend app, OMC orchestration, SDK integration, design prototype, or unknown
- product hypothesis: target user, core pain, proposed workflow, expected outcome
- option set: 2-3 viable product directions, each with cost, risk, and differentiation
- PM critique: the weakest assumption, likely failure mode, and what would prove the idea is worth building
- architecture implication: what technical shape each option implies, explained in product terms
- no-return points: decisions that become expensive to reverse after 建档
- benchmark references: comparable product, workflow, or pattern when useful
- **feature audit (膨胀功能识别)**: 列出用户提到但可能不必要的功能，标记待用户确认
- next action: `建档`, more brainstorm, reject/defer, or split into a separate project

### 模型选择评估（Model Selection Assessment）

在头脑风暴阶段，**必须**评估并推荐 AI 模型组合。这是 PM 的核心职责之一。

**读取 `knowledge/model-selection.md`** 获取最新模型对比信息。

**模型选择 AskUserQuestion:**
```
## 🧠 模型选择评估

基于你的项目特性，以下是推荐方案：

| 环节 | 推荐模型 | 原因 |
|------|---------|------|
| 规划/分析 | {model} | {reason} |
| 编码执行 | {model} | {reason} |
| 生图/UI | {model} | {reason} |

### ⚠️ 负面提示（不要这样做）
- ❌ 不要用 {wrong_model} 做 {task} — {why}
- ❌ 不要只用单一模型做全栈 — 每个模型有擅长领域

### 🤔 需要你确认（请选择，不用自己填）

**Q1. 你当前可用的 AI 模型？**（多选）
- [ ] Claude（Claude Code / Claude API）
- [ ] Codex（OpenAI Codex CLI）
- [ ] GPT（ChatGPT / GPT API）
- [ ] 其他：________
- [ ] 不确定 / 还没用过

**Q2. 月度预算或额度？**（单选）
- [ ] 免费 / 试用额度
- [ ] ¥50-100 / $10-20
- [ ] ¥200-500 / $30-80
- [ ] ¥1000+ / $150+
- [ ] 公司报销 / 不限

**Q3. 项目最关键的环节？**（单选）
- [ ] 代码质量（bug少、可维护）
- [ ] 生图/视觉效果
- [ ] 长文档/分析能力
- [ ] 开发速度快（快速出demo）
- [ ] 成本低（省钱优先）

**Q4. 是否接受多模型组合？**（单选）
- [ ] 接受（规划用A，编码用B）
- [ ] 只想用一个模型（简单优先）
- [ ] 不确定，听你的建议
```

**负面提示词（Negative Prompts）必须在以下场景使用：**
- 用户想用 Claude 做生图 → "Claude 没有生图能力，强行用代码调 API 效率低"
- 用户想用 GPT-4 做长上下文代码审查 → "GPT-4 容易遗漏中间文件问题，用 Claude Opus"
- 用户想用 Codex 做需求分析 → "Codex 擅长执行而非规划，先用 Claude 分析"
- 用户想用 Haiku 做复杂调试 → "Haiku 推理弱，复杂调试用 Sonnet/Opus"
- 用户坚持单一模型 → "每个模型有擅长领域，组合使用效果更好"

**模型选择记录:**
- 将用户确认的模型组合写入 `.kit/model-choice.md`
- 格式：
  ```markdown
  ## Model Selection: YYYY-MM-DD
  - 规划: {model} | 原因: {reason}
  - 编码: {model} | 原因: {reason}
  - 审查: {model} | 原因: {reason}
  - 用户预算: {budget}
  - 用户确认: {confirmed}
  ```

### 模型知识时效性检查

- 读取 `knowledge/model-selection.md` 时检查 `last_verified` 日期
- 如果超过 30 天，标记 `⚠️ 模型信息可能过时`
- 触发 WebSearch 验证最新定价和能力变化
- 特别是：Codex 价格变化、Claude 新版本发布、生图模型更新

Brainstorm must end with a decision recommendation. If the idea is not ready for 建档, say what is missing instead of producing a fake PRD.

**Scale-Aware Brainstorm Rounds (强制对话轮次):**

| Scale | 轮次 | 每轮要求 | 可提前结束 |
|-------|------|---------|-----------|
| `quick` (<1天) | **1轮** | 输出分析+选项+推荐 | 用户说"跳过" |
| `standard` (2-5天) | **1-2轮** | 第1轮初步分析 → AskUserQuestion → 第2轮细化 | 用户说"跳过" |
| `deep` (1+周) | **≥2轮** | 每轮必须 AskUserQuestion 获取反馈，记录到 `.kit/brainstorm-log.md` | 用户说"跳过" |

**每轮 AskUserQuestion 格式:**
```
这是第{N}轮头脑风暴分析。请确认：
- 我的理解是否正确？
- 有什么遗漏或错误？
- 是否需要调整方向？
```

Do not create `.plan/`, `.kit/`, `.workflow/`, or implementation files in brainstorm mode unless the user explicitly approves 建档.

---

## Requirement Object Classification Gate

Before brainstorm output, 建档, or framework recommendation, classify what the user is trying to develop. Do not default every vague request to a frontend app.

Classify into one primary object:

- `skill`: reusable AI skill/instruction package.
- `stable-workflow`: repeatable `.workflow/` or runner process.
- `cli-harness`: CLI-Anything style agent-native CLI for an existing codebase/software.
- `frontend-backend-app`: frontend, backend, or full-stack product.
- `omc-orchestration`: multi-agent/stateful execution framework.
- `opencli-automation`: logged-in browser/platform automation.
- `sdk-integration`: OpenAI/Claude SDK business implementation.
- `pure-md-framework`: lightweight PRD/SPEC/CHECKLIST text framework.
- `design-prototype`: design, UI/UX, or prototype work.
- `unknown`: not enough information.

Ask at most 1-2 sharp questions when classification is unclear. The questions should decide product object and delivery shape, not make the user pick frameworks they do not understand.

Required classification output:

- what the user is probably building
- **estimated scale: `quick` / `standard` / `deep`** — inferred from scope description, user hints, and complexity signals; user may override
- why that classification fits
- recommended default path (adjusted by scale)
- alternatives and how the result would differ
- what can still be reversed later
- what becomes expensive or no-return after implementation starts
- whether to 建档 now, brainstorm more, or split into a separate project

**Scale-aware flow adjustments:**

- `quick` (<1 day): merge PRD+SPEC+CHECKLIST into a single `PLAN.md`; skip `.workflow/` presets, Capability Inventory, and sandbox isolation unless explicitly requested; 1 round of brainstorm at most
- `standard` (2-5 days): full `.plan/` trio; `.kit/` and `.workflow/` as normal; eval sandbox optional; 1-2 rounds of brainstorm
- `deep` (1+ weeks): full `.plan/` trio plus Architecture Review gate; mandatory `.kit/`, `.workflow/`, and Risk Ledger when model/agent scope exists; eval+uat sandboxes; 2+ rounds of brainstorm; phased delivery checkpoints

Framework routing defaults:

- If it is `frontend-backend-app`, recommend OpenSpec when spec-driven change management matters; recommend Super Dev when delivery governance, UI runtime gates, proof packs, or release readiness matter.
- If it is `skill`, build a skill package first. Do not jump to CLI or WebUI.
- If it is `stable-workflow`, build a stable `.workflow/` and runner contract first.
- If it is `cli-harness`, consider CLI-Anything style command surface, JSON output, real backend integration, tests, and package install path.
- If it is `design-prototype`, prefer a skill or stable workflow first when the design process should be repeatable; only move to CLI/WebUI after the workflow is proven.
- If it is `omc-orchestration`, route to OMC/team/state/handoff capability instead of stuffing orchestration into KIT Core.

If the user says "确定" after seeing the tradeoff, proceed. Do not keep negotiating because the user made a decision. If the user changes object type later, trigger the Continuation And Scope Drift Gate.

---

## 1. 建档: New Project Or Starter Setup

Use this track when the target is a new repo, empty project, reusable starter, SDK/framework setup, or the user says:

- 创建项目
- 新项目框架
- 建档
- 项目启动
- spec 驱动开发
- 拉下来就能开发使用

Expected output structure:

```text
.plan/
  README.md
  PRD.md
  SPEC.md
  CHECKLIST.md
  runs/
  archive/
.workflow/
  README.md
  codex.md
  workbuddy.md
  trae-solo.md
  status.md
  *.md
  scripts/
    *.py
docs/
  architecture/
  ui-ux/
  evidence/
  test-reports/
.kit/
  config.json            # Project status snapshot
  version.json           # Version contract
  decisions.md           # Key decisions log (optional)
  blockers.json          # Active blockers (optional)
  interrupted/           # Interrupted session snapshots (auto-created)
tests/                   # Standard test directory (on-demand)
  unit/
  integration/
  acceptance/
evals/                   # AI full-program self-test (on-demand)
  config.yaml
  run/
  reports/
  evidence/
.cron/                   # Project execution automation (on-demand)
  README.md
  jobs/
  schedules/
  logs/
```

**AI Sandbox**: Not inside the project tree. Created as a sibling directory when isolation is required:
```
../<project-name>-ai/      # AI workspace (isolated from human workspace)
```

## 建档流程：用户确认门 + PM 审计

### 三件套生成流程（带确认门）

```
Brainstorm 完成 → 分类确认(scale) → 生成 PRD → PM Audit → Spec Self-Review → YAGNI 门 → 用户确认 → 生成 SPEC → PM Audit → Spec Self-Review → YAGNI 门 → 用户确认 → 生成 CHECKLIST → PM Audit → Spec Self-Review → YAGNI 门 → 用户确认 → kitrun
```

**Scale-Aware 确认门:**

| Scale | PRD确认 | SPEC确认 | CHECKLIST确认 | PM审计 |
|-------|---------|----------|---------------|--------|
| `quick` | ❌ 合并到 PLAN.md 整体确认 | ❌ 同上 | ❌ 同上 | 1份快速审计 |
| `standard` | ✅ 独立确认 | ✅ 独立确认 | ✅ 独立确认 | 每阶段独立 |
| `deep` | ✅ 独立确认 | ✅ 独立确认 | ✅ 独立确认 | 每阶段独立 + 架构专项 |

### PM 审计环节

每份文档生成后，自动执行 PM 审计，输出 `.kit/pm-audit-{stage}.md`：

**PM 审计检查清单:**
- [ ] 目标是否模糊？（用户是谁？解决什么痛点？）
- [ ] 范围是否蔓延？
- [ ] 验收标准是否可观测？
- [ ] 技术风险是否记录？
- [ ] 是否有 media-processing 技能？（检查 M1-M8 安全风险）
- [ ] 硬编码假设是否被标记？
- [ ] 是否有未回答的关键问题？

**PM 审计建设性约束:**
- 每条批评必须附带具体修复建议
- 禁止人身攻击，批评对象是计划/文档而非用户
- 初学者项目（MEMORY.md user_role=初学者 或 scale=quick）降低语气强度
- 每条 🔴 阻断项必须附带：问题描述 + 为什么阻断 + 修复建议 + 验证方式

**PM 审计输出格式:**
```markdown
# PM Audit: [stage]

## 🔴 阻断项（必须修复）
| # | 问题 | 修复建议 | 验证方式 |

## 🟠 警告项（强烈建议修复）
| # | 问题 | 修复建议 | 验证方式 |

## 🟡 建议项（可选优化）
| # | 问题 | 修复建议 | 验证方式 |
```

### Spec Self-Review（自查门）

PM Audit 修复后、用户确认前，AI 必须对文档做一次快速自查：

**自查 4 项：**
1. **占位符扫描**：文档中是否有 "TBD"、"TODO"、"待补充"、"稍后确定"？
2. **内部一致性**：PRD 的目标用户是否和 SPEC 的技术方案匹配？CHECKLIST 的任务是否覆盖 PRD 的验收标准？
3. **范围检查**：这份文档是否聚焦？有没有把不该在这个阶段决定的内容塞进来？
4. **歧义检查**：任何需求是否可能被两种不同方式理解？如果是，必须明确选一种并写出来。

**自查动作**：发现问题 → 立即修复 → 无需重新审计，直接修复后进入用户确认

---

### 膨胀功能识别（YAGNI 门，需用户确认）

**在 PM Audit 之后，识别用户提到但可能不必要的功能：**

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔪 膨胀功能识别（YAGNI）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以下功能在当前阶段可能过度设计：

| # | 功能 | 用户原话 | 为什么可能不需要 | 建议 |
|---|------|---------|----------------|------|
| 1 | XX功能 | "最好能..." | 核心 workflow 不依赖 | 放到 V2 |
| 2 | YY配置 | "可以支持..." | 增加复杂度，首版用默认值即可 | 删除 |

请确认：
- "同意删减" → 按建议调整文档
- "保留全部" → 标记风险：范围膨胀
- "部分保留" → 指出哪些保留
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**规则：**
- AI 列出建议，但**不自动删除**，等用户确认
- 用户同意删减后，更新 PRD/SPEC/CHECKLIST 并记录到 `.kit/decisions.md`
- 用户选择"保留全部"时，标记范围膨胀风险到 `.kit/audit-log.md`

---

### 用户确认门规则

**确认门 AskUserQuestion（改进版）：**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 {PRD/SPEC/CHECKLIST} 确认
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PM Audit: 🔴{N} 🟠{N} 🟡{N}
Spec Self-Review: ✅ 通过
膨胀功能识别: {已处理 / 无需处理}

文档已写入：.plan/{文件名}.md

请先阅读文档内容，再选择：
- 选项 1: "确认" → 通过，继续下一阶段
- 选项 2: "修改" → 告诉我改哪里，记录到 .kit/feedback.md
- 选项 3: "重生成" → 回到当前阶段起点重新生成

（文档摘要如下...）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**关键改进**：
- 不只是问"确认吗"，而是**让用户先看文件内容**
- 提供文档摘要，但鼓励用户打开文件 review
- 只有用户说"确认"才算通过

**确认标记:** 每个文档底部添加
```markdown
---
✅ 用户确认 | 时间: YYYY-MM-DD HH:MM | 版本: {git-short-hash}
```

**3次未确认处理:**
- 第1次未确认 → 重新呈现文档摘要，询问是否需要解释
- 第2次未确认 → 输出风险警告，询问是否缺少信息
- 第3次未确认 → 暂停流程，AskUserQuestion:
  ```
  已连续3次未确认。请选择：
  - "跳过" → 跳过当前阶段，进入下一阶段（记录到 .kit/audit-log.md）
  - "终止" → 终止本次 KIT 流程，保存当前进度到 .kit/interrupted/
  - "继续" → 重新呈现文档
  ```

**流程违规记录:** 违反确认门规则（未经确认进入下一阶段）记录到 `.kit/audit-log.md`：
```markdown
## YYYY-MM-DD HH:MM 流程违规
- 阶段: {PRD/SPEC/CHECKLIST}
- 违规: 未经用户确认进入下一阶段
- 原因: {AI自主决定/用户说"快点"/其他}
- 风险: {描述风险}
```

Before completion, verify generated structure and run a smoke init or syntax check for any scripts touched.

For coding beginners, generated project docs must include enough guidance that a future agent can continue without asking the user to explain the tech stack:

- chosen platform and stack, with one-sentence rationale
- target user and first usable workflow
- non-goals for the first release
- acceptance criteria in observable language
- verification commands and where evidence should be stored
- `.plan/CHECKLIST.md` with `任务列表前置规划` and an ordered task table
- `.kit/` as the project status entry directory, using the existing project format when present
- root `README.md` as the only user-facing README; do not create `.plan/README.md`
- `tests/` as the standard test directory **(on-demand)** — create when the project has unit/integration tests; frameworks auto-discover it
- `evals/` as the AI full-program self-test directory **(on-demand)** — create when the project requires AI smoke tests, regression tests, or benchmark validation
- `docs/evidence/` as the final evidence archive **(on-demand)** — create when the project produces screenshots, logs, or test reports
- `USER.md` as user preference memory **(on-demand)** — create when the user expresses recurring preferences
- `SOUL.md` as project core principles **(on-demand)** — create when the project has non-negotiable constraints
- `.kit/version.json` as the version contract; keep it aligned with the active host entry, package/release metadata, and git tags when present
- a documented workflow entry when the project needs Codex, Claude Code, WorkBuddy, Trae Solo, or scripts to read a stable workflow path; use `.workflow/` as the single KIT-managed workflow directory
- `.cron/` only when the project plan requires automated, scheduled, or unattended execution; do not create by default
- AI sandbox isolation configured when AI and human workspaces must not interfere; document sandbox location and handoff rules in `.kit/config.json`
- treat legacy `.workflows/` and `docs/workflows/` as migration inputs; do not create new workflow material there

---

## 2. 归档: Existing Project Cleanup Or Packaging

Use this track when the target is an existing repo with scattered plans, old process docs, mixed evidence, missing KIT fields, stale schedules, or the user says:

- 整理项目
- 归档项目
- 项目打包
- 规范目录
- 清理 .plan
- 当前项目开发进度优化
- fullcheck / 状态审计 with KIT context

Default archive layout:

```text
.plan/archive/YYYY-MM/<slug>/
.test/ai/evidence/YYYY-MM-DD-<slug>/       # when .test/ exists
.test/ai/reports/YYYY-MM-DD-<slug>.md      # when .test/ exists
```

Archive process/history files, not active facts or source code. Keep project-specific gates active when `SPEC.md` references them.

For coding beginners, cleanup output must not only list files. It must explain the current project state in plain Chinese:

- what is the current source of truth
- what is old/history/noise
- what can be safely continued next
- what must be decided by the user before implementation continues

---

### 归档分类路径规则（Archive Path Classification）

归档前必须按文件性质选择正确的归档目的地，防止主 plan 被实验候选污染：

**1. 主计划归档（`.plan/archive/`）**
- 曾作为项目主契约的 PRD、SPEC、CHECKLIST（用户已确认版本）
- 已完成的里程碑计划、阶段总结
- 原则：只有过期的"主契约"才进 `.plan/archive/`

**2. 沙盒实验归档（`.test/ai/sandboxes/<sandbox-name>/_archive/`）**
- 沙盒实验产生的计划候选文件（如 `SUSX-RENPY-V0.2.0-CHECKLIST.md`）
- 未成为主契约的 draft SPEC、experimental PRD
- AI 模拟测试的临时计划、对比方案
- 原则：这些不是主 plan 的长期契约，应归到沙盒内部 archive

**3. 证据链保留（不归档）**
- `.test/ai/reports/`、`.test/ai/evidence/`、`.test/user/evidence/`
- 用户验收截图、测试日志、运行证据
- 原则：证据链随版本保留，不移动

**4. 主文档更新规则**
- 沙盒候选归档后，主 `.plan/PROJECT-CHECKLIST.md` 或 `.plan/CHECKLIST.md` 只写索引和结论
- 示例：
  ```markdown
  ## 已归档候选
  - SUSX-RENPY-V0.2.0-CHECKLIST.md → `.test/ai/sandboxes/susx_rebuild_20260524/_archive/v020-v021-plan-candidates/`
  - 状态：已归沙盒，不再作为主 plan
  ```

---

### Runtime Index 同步检查（Runtime Index Sync Gate）

归档前必须检查 `.kit/` 中的版本索引与实际计划版本是否一致：

**检查项：**
- `.kit/version.json` 的 `project_version` 与当前完成版本一致
- `.kit/config.json` 的 `current_stage`、`completed_tasks` 反映实际状态
- `.kit/case-runtime-index.json`（如有）的版本标记与当前沙盒版本一致
- `.kit/model-choice.md` 的模型选择记录与当前使用模型一致

**不一致处理：**
- 轻微不一致（如缺少字段）→ 自动补全并记录到 `.kit/audit-log.md`
- 严重不一致（runtime index 停在旧版本）→ 暂停归档，先更新 index，标记 `⚠️ 版本漂移已修复`
- 多轮沙盒实验时，`.kit/case-runtime-index.json` 必须显式指向当前活跃沙盒版本

**示例：**
```text
⚠️ 检测到 .kit/case-runtime-index.json 仍指向 v0.2.0，但当前已完成 v0.2.2。
正在更新 index → v0.2.2，并记录到 .kit/audit-log.md。
```

---

### 新沙盒隔离规则（New Sandbox Isolation）

开启新一轮沙盒测试时：

**必须做的：**
1. 保留旧沙盒成品和证据链（不删除、不覆盖）
2. 新沙盒命名明确：`renpy-v0.3.0-eval`、`godot-v0.3.0-ab-eval`
3. 新沙盒只建立测试隔离入口（README.md、TEST.md、config.json）
4. 更新 `.kit/case-runtime-index.json` 指向新沙盒版本
5. 在 `.plan/CHECKLIST.md` 记录新旧沙盒边界

**禁止做的：**
- 不要在新沙盒创建"可玩成品"启动器（避免误导用户认为已可交付）
- 不要把旧沙盒的半成品复制到新沙盒当起点
- 不要同时把多个沙盒的 plan 文件留在主 `.plan/` 目录

**沙盒目录结构：**
```text
.test/ai/sandboxes/
  susx_rebuild_20260524/           # 沙盒根
    _archive/
      v020-v021-plan-candidates/   # 旧候选归档
    renpy-v0.3.0-eval/             # 新沙盒入口
      README.md
      TEST.md
      config.json
    godot-v0.3.0-ab-eval/          # 另一组新沙盒
      README.md
      TEST.md
      config.json
```

---

## 3. 打包: Pack For Sharing Or Testing

Use this track when the user says:

- 打包
- pack
- 封装
- 生成分享包
- 生成测试包

### Pack Process（带用户确认门）

**Step 1: 用户确认门**

Before packing, present to the user:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/kit-pack 打包确认
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

打包范围:
  • 核心代码: src/, bin/, modes/ 等
  • 文档: README.md, SKILL.md, AGENTS.md/CLAUDE.md
  • 证据: .test/ai/evidence/, .test/ai/reports/
  • 版本: .kit/version.json

排除项（自动清理）:
  • 临时文件: logs/, .omc/, .pilotdeck-runtime/
  • 敏感信息: .env, secrets, API keys
  • 开发依赖: node_modules/, __pycache__/, .venv/

用户可回复:
  • "确认" → 执行打包
  • "修改范围" → 调整后重新确认
  • "取消" → 不打包
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 2: 清理临时文件**

```bash
# 清理开发临时文件
rm -rf logs/ .omc/ .pilotdeck-runtime/ .pytest_cache/
rm -rf node_modules/ __pycache__/ .venv/
rm -f .env secrets.json *.key *.pem
```

**Step 3: 验证核心文件存在**

```bash
ls README.md .kit/version.json
# skill 类型: ls SKILL.md
# workflow 类型: ls .workflow/README.md
```

**Step 4: 生成打包输出**

```text
{project-name}-pack-YYYYMMDD/
  src/                    # 核心源代码
  bin/                    # 可执行脚本（如有）
  modes/                  # 模式定义（如有）
  templates/              # 模板（如有）
  quality/                # 质量门禁（如有）
  knowledge/              # 知识材料（如有）
  README.md               # 项目说明
  SKILL.md / AGENTS.md / CLAUDE.md  # 宿主入口
  .kit/version.json       # 版本合同
  .test/ai/evidence/      # 测试证据（可选）
  .test/ai/reports/       # 测试报告（可选）
  pack-manifest.json      # 打包清单
```

**pack-manifest.json**:
```json
{
  "project": "{project-name}",
  "version": "x.y.z",
  "pack_date": "YYYY-MM-DD",
  "pack_type": "share | test",
  "included": ["src/", "README.md", "..."],
  "excluded": ["logs/", "node_modules/", "..."],
  "verified_by": "AI | user",
  "notes": ""
}
```

### Pack Gate Rules

- **必须经用户确认后才能打包。** 用户说"打包"不等于确认，必须得到"确认"。
- **敏感信息必须排除。** `.env`、API key、账号材料不得进入打包输出。
- **临时文件必须清理。** 开发日志、缓存、依赖目录不得进入打包输出。
- **核心文件必须存在。** README.md 和版本文件缺失时暂停打包，先补充。

---

## 4. 验收: Acceptance Test Before Handoff

Use this track when the user says:

- test
- 验收
- 版本已完成
- 可以测试了
- 准备交付

**前提条件**（必须满足，否则拒绝执行）：
- `.plan/CHECKLIST.md` 中的核心任务已完成
- 用户明确说"版本已完成"或"边界清晰"
- 无已知阻塞项（`.kit/blockers.json` 为空或已解决）

### Test Process（带用户确认门）

**Step 1: 验收前提检查**

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/kit-test 验收确认
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

验收前提检查:
  • 版本边界是否清晰？
  • 核心功能是否已完成？
  • 是否有已知阻塞项？

验收内容:
  • 打包核心代码 + README
  • 按 .plan/CHECKLIST.md 验收标准运行测试
  • 生成验收测试报告

用户可回复:
  • "确认" → 执行验收
  • "还有未完成项" → 返回 /kit-run 继续开发
  • "取消" → 不验收
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 2: 打包核心代码 + README**

同 `/kit-pack` 的清理和验证步骤，但输出到临时目录 `{project-name}-test-YYYYMMDD/`。

**Step 3: 运行验收测试**

根据项目类型运行对应的验收测试：

- **skill 类型**: 验证 SKILL.md 格式、宿主兼容性、关键命令路由
- **workflow 类型**: 验证 workflow 脚本可执行性、dry-run 通过
- **app 类型**: 验证构建通过、核心功能 E2E 测试、截图对比
- **CLI 类型**: 验证 CLI 帮助输出、核心命令执行、JSON 输出格式

**Step 4: 生成验收报告**

```text
.test/ai/reports/acceptance-YYYYMMDD.md
```

报告内容：
```markdown
# Acceptance Report: YYYY-MM-DD

## 验收前提
- [x] 版本边界清晰
- [x] 核心功能已完成
- [x] 无阻塞项

## 测试范围
| 测试项 | 状态 | 证据 |
|--------|------|------|
| ... | pass/fail | 路径 |

## 结论
- 状态: passed / failed / partial
- 可交付: yes / no
- 备注: ...
```

### Test Gate Rules

- **必须经用户确认后才能验收。** 用户说"test"不等于确认，必须得到"确认"。
- **版本未完成时拒绝验收。** 如 `.plan/CHECKLIST.md` 有未完成核心任务，返回 `/kit-run`。
- **验收失败时停止交付。** 报告失败项，返回修复流程。
- **验收通过后生成报告。** 报告写入 `.test/ai/reports/`，作为交付证据。

---

## Gates

### Archive Interaction Gate

Before 归档, cleanup, packaging, or moving process files, ask the user only when there is an unresolved decision. Do not ask for ceremonial approval when the data and Markdown facts already agree.

No question is needed only when all are true:

- `validate` has no P0/P1 relevant to the movement.
- `.plan/PRD.md`, `.plan/SPEC.md`, `.plan/CHECKLIST.md`, `.kit/`, `.workflow/`, `tests/` (when present), `evals/` (when present), active host entry, and live files agree on current goal and endpoint.
- candidates are clearly historical, AI proof, user-test material, or generated noise.
- no current entrypoint, recovery state, user package, live-action evidence, secret material, or hardcoded environment setting will be lost.

Ask before moving or archiving when any of these appear:

- direction drift: new request conflicts with current PRD/SPEC
- root/process Markdown could be active facts rather than history
- `.workflow/`, `.test/`, `AGENTS.md`, `CLAUDE.md`, README, or `.plan` disagree
- AI self-check material and real user testing material are mixed
- hardcoded paths, ports, model aliases, account IDs, browser profiles, or secret-like literals need classification
- live external write/submit/publish evidence or recovery state may be affected

When asking, use one or two question-bank IDs and explain the consequence:

```text
AR3: 这个新需求是在改当前项目，还是该重开项目？
影响: 选"改当前项目"会更新 PRD/SPEC；选"重开"会把当前项目保持干净，不把两个产品揉成一坨。
```

### Archive Scope Change Confirmation Gate (归档变更确认)

归档前若检测到计划目标变更，**必须**经用户确认：

**变更检测条件:**
- 当前请求与 `.plan/PRD.md` 的目标用户不一致
- 当前请求与 `.plan/SPEC.md` 的核心功能有冲突
- 当前请求改变了验收标准或停止门
- 用户说"改方向"、"换个思路"、"不要这个了"

**变更确认流程:**
```
检测到变更 → 输出变更对比报告 → AskUserQuestion 确认 → 用户确认后才归档
```

**变更对比报告 `.kit/scope-drift-report.md`:**
```markdown
# Scope Drift Report: YYYY-MM-DD

## 原目标 (来自 PRD)
- 目标用户: {original}
- 核心功能: {original}
- 验收标准: {original}

## 新请求
- 目标用户: {new}
- 核心功能: {new}
- 验收标准: {new}

## 差异分析
| 维度 | 原目标 | 新请求 | 影响 |

## 建议
- 选项1: 更新当前项目（归档旧 PLAN，重写新 PLAN）
- 选项2: 重开一个新项目

## 用户决策
- 选择: {待用户确认}
- 时间: {待用户确认}
```

**用户未确认前不得执行归档。** 变更确认记录写入 `.kit/decisions.md`。

### Continuation And Scope Drift Gate

Use this gate whenever the user resumes, restarts, says "继续", reruns 建档, changes the product goal, or asks whether to keep using the current project.

Before continuing:

1. Read current facts: `.plan/PRD.md`, `.plan/SPEC.md`, `.plan/CHECKLIST.md`, `.kit/`, `.workflow/README.md` when present, root instructions, and relevant project docs.
2. Compare the new request against current goal, target user, scope, non-goals, acceptance criteria, architecture decisions, irreversible gates, and known risks.
3. Classify the change:
   - `minor_adjustment`: same product, same architecture, small scope change
   - `scope_expansion`: same product, larger scope; update PRD/SPEC/CHECKLIST before implementation
   - `direction_change`: product goal, target user, core workflow, or architecture meaningfully changed
   - `new_project_candidate`: the new goal would make the current project facts misleading
4. For `direction_change` or `new_project_candidate`, **do not automatically archive or rewrite**. Follow this sequence:
   a. **启动 brainstorm 模式**：将当前请求作为新方向进行头脑风暴，不创建或修改 `.plan/` 文件
   b. **进行 research（如需）**：如果新方向涉及未知领域，用 WebSearch/WebFetch 做快速研究
   c. **生成对比报告**：清晰列出 `旧目标` vs `新目标` 的差异，包括影响范围、成本、风险
   d. **向用户呈现并询问**：
      - "这是方向变更，不是小改。"
      - "选项 1：更新当前项目章程（归档旧 PLAN，重写新 PLAN）"
      - "选项 2：重开一个新项目（保持当前项目干净）"
      - "请确认选择，或补充信息。"
   e. **用户确认"要改"后**，才执行：归档旧 PLAN → 重写新 PLAN → 更新 `.kit/`
   Do not silently blend incompatible goals.
5. If a no-return gate has already passed, explain the cost of changing it before offering options.

No-return or expensive-return gates include:

- chosen application framework or runtime
- database/storage format and migration path
- auth/account model and permission boundaries
- content pipeline or agent-review topology
- publishing platform and evidence workflow
- public API or data schema used by downstream tools
- schedule/automation trigger ownership

### Hardcoded Assumption Gate

Run this gate during 归档, archive-cleanup validation, and any packaging/handoff work.

Check for:

- local absolute paths: `C:\Users\...`, `/Users/...`, `/home/...`, `/root/...`
- browser profile, `user-data-dir`, `profile-directory`, Chrome profile, login-state paths
- account, tenant, workspace, project, book, channel, chat, file, folder, or platform IDs assigned as literals
- secret-like literals: API keys, tokens, cookies, session IDs
- localhost or fixed ports that are not documented as a project contract
- temp, download, or output paths that should live under `.test/ai/sandboxes/` or config
- floating model aliases: `latest`, `auto`, `default`, unpinned `sonnet`/`opus`/`haiku`
- placeholders in active files: `your-name`, `yourusername`, `replace-me`, `changeme`

Classify each finding:

- `intentional_contract`: keep, but record in `.plan/SPEC.md`
- `config_required`: move to env/config/local ignored file
- `example_only`: keep only in README/test guide as a clear example
- `archive_noise`: move to `.plan/archive/` or `.test/ai/`
- `must_remove`: secrets, account material, or misleading machine-local state

Do not silently "fix" hardcoded values that may represent product or platform contracts. Report them and ask only when the value affects launch, accounts, security, cost, or portability.

### Entry / Charter Consistency Gate

Run this gate during 建档 and 归档:

- root `README.md` exists and points to `.plan/`
- inspect the active host entry first: Claude uses `CLAUDE.md`; other hosts use `AGENTS.md`
- if the inactive host entry also exists, it must be a bridge or legacy note pointing to the active entry and `.plan` fact source, not a second main charter
- `.workflow/README.md`, when present, explains workflow operation and does not override PRD/SPEC/CHECKLIST
- `.plan/PRD.md` and `.plan/SPEC.md` agree on target user, current goal, workflow shape, non-goals, and stop gates
- if a conflict exists, mark the stale file and update it before implementation

### Capability Skill Inventory Gate

Run this gate at the start of 建档 and 归档. Inspect whether the host/project already has the routed business skills that the project is likely to need.

Inspect, when available:

- current host skill roots: Codex, Claude Code, shared agents, OpenCode, OMC, or other configured skill/plugin directories
- project-local skills: `skills/**/SKILL.md`, `.agents/skills/**/SKILL.md`, `.claude/skills/**/SKILL.md`, `.codex/skills/**/SKILL.md`
- project-local workflows/runners: `.workflow/`, legacy `.workflows/`, legacy `docs/workflows/`, `workflow-runner.*`, `scripts/**`
- package/tool manifests: `package.json`, `pyproject.toml`, `Makefile`, root instructions

For each implied routed capability, record: capability, need, host status, project status, recommended skill/tool, install target, approval, evidence.

If a needed business skill is missing and has a known source, recommend installing it into the project path so future agents can resume without relying on one developer's host. Do not download or vendor a skill silently when it may bring secrets, account bindings, large binaries, license risk, or host-specific config. Ask for approval and record the decision in SPEC/CHECKLIST.

---

## Stable Project Paths

### `.kit/` Project Status Entry

`.kit/` is the project status entry directory. Do not assume a fixed file format such as JSON unless the project already has one.

When inspecting or creating `.kit/`, make sure the project can answer:

- current goal
- current stage
- completed work
- next tasks
- blockers
- owner or responsible agent
- schedule or deadline when known
- how Codex, Claude Code, or WorkBuddy should read the status

### AI Sandbox Isolation

AI work must be physically isolated from the human workspace to prevent contamination.

**Why git clone, not git worktree**: Git worktree shares the `.git/` object store with the main repository — AI's git operations directly affect the main repo. True isolation requires `git clone` (separate `.git/`, separate history, no accidental push).

**Sandbox location**: A completely separate directory at the **same level as the project** (sibling directory), created via `git clone`, not inside the project tree.

```text
# Project workspace (human) — the single source of truth
D:\dev-projects\gal-dev-v0.01\
  src/
  tests/
  evals/
  docs/
  .plan/
  .kit/

# AI self-test sandbox — created via git clone
D:\dev-projects\gal-dev-v0.01-eval\
  src/              # git clone from gal-dev-v0.01
  tests/
  evals/            # AI writes self-test config, reports, evidence here
  logs/             # AI execution logs

# User acceptance sandbox — created via git clone --branch <tag>
D:\dev-projects\gal-dev-v0.01-uat\
  src/              # git clone --branch v1.0.0 from gal-dev-v0.01
  tests/
    acceptance/     # User runs acceptance tests here
  docs/
    evidence/       # User puts their test evidence here
  README.md         # User guide for testing
```

**Two sandboxes, two purposes**:

| Sandbox | Created By | Destroyed After | Contains |
|---------|-----------|-----------------|----------|
| `project-eval/` | AI (or script) | Each self-test cycle | AI's working copy, evals/, temporary evidence |
| `project-uat/` | Human (or script) | After acceptance | Stable tagged version, user tests, user evidence |

**Isolation rules**:
1. AI **never** modifies files in `project/` directly. AI only works in `project-eval/`.
2. User **never** tests in `project/` directly. User only tests in `project-uat/`.
3. Changes flow in one direction:
   ```
   project-eval/ (AI develops and self-tests)
       ↓  AI self-test passes
   User reviews sandbox output
       ↓  User approves
   AI promotes changes to project/ (via git push from eval, or manual copy)
       ↓  Tagged as stable version
   project-uat/ (User clones stable tag and tests)
       ↓  User acceptance passes
   User evidence merged into project/docs/evidence/
   ```
4. `project-eval/` can be destroyed and recreated at any time (`rm -rf` + re-clone).
5. `project-uat/` is created from a stable git tag, ensuring the user tests exactly what was approved.

**Mandatory reminder after AI self-test**:
When AI self-test passes, AI **must** remind the user:
> "Self-test complete. Report in `evals/reports/`. Evidence in `evals/evidence/`.
> Please create a new sandbox for acceptance testing:
> `git clone --branch v{version} {project} {project}-uat/`
> Run `tests/acceptance/` and add evidence to `docs/evidence/`.

### Session Boundary Protocol

**Session Start (强制)**:
1. Read `.kit/config.json` for current status
2. **状态过期检查**: 如果 `.kit/config.json` 的 `last_updated` 超过 30 天，标记 `⚠️ 项目状态可能过期`，建议用户重新确认当前目标和范围
3. Read `.plan/PRD.md`, `.plan/SPEC.md`, `.plan/CHECKLIST.md`
4. If `.kit/interrupted/` exists, list interrupted sessions and ask user whether to resume
5. If `.kit/decisions.md` exists, read the last 10 entries for recent context
6. Present a status brief before any action

**Session End (强制)**:
1. Update `.kit/config.json`: stage, progress, completed_tasks, next_tasks, blockers, snapshot_hash, last_updated
2. If session was interrupted mid-task: Write `.kit/interrupted/YYYY-MM-DD-<topic>.md`
3. If key decisions were made: Append to `.kit/decisions.md` with timestamp and decision summary
4. If blockers were encountered: Update `.kit/blockers.json` (for non-loop sessions) or append to `.cron/logs/YYYY-MM-DD/blocker-<timestamp>.md` (for `/kit-loop` sessions, per `modes/loop.md`)

**Session Interruption Recovery**:
- Mid-session topic changes are recorded as interruptions, not lost
- Next session starts by offering to resume interrupted work
- User can choose: resume interrupted / start new topic / ignore

### `tests/` Standard Test Directory (按需创建)

`tests/` is the **industry-standard test directory** (visible, plural). It is recognized by pytest, Jest, Cargo, Go test, and virtually all testing frameworks.

**When to create `tests/`**:
- Any project that has unit tests, integration tests, or end-to-end tests
- Frameworks auto-discover `tests/` without extra configuration

**Default structure**:

```text
tests/                           # Created on-demand
  unit/                          # Unit tests
  integration/                   # Integration tests
  acceptance/                    # User acceptance tests (human-executed)
```

**Rules**:
- Put traditional test code here — frameworks will discover it automatically
- Do not put AI-generated evidence here — evidence goes to `evals/evidence/` or `docs/evidence/`
- Do not use `.test/` — it is hidden, framework-unfriendly, and breaks CI/CD

### `evals/` AI Self-Test Directory (按需创建)

`evals/` is the **AI full-program self-test directory**. It is **not** for unit tests or small checks — it is for complete, end-to-end validation that the entire program works as specified.

**When to create `evals/`**:
- When AI needs to run complete program self-tests (smoke, regression, benchmark)
- When AI-generated test evidence needs a dedicated location

**What goes in `evals/`**:
- Self-test configuration (`config.yaml`)
- Self-test execution scripts (`run/`)
- Self-test reports (`reports/`)
- Self-test process evidence (`evidence/YYYY-MM-DD/`) — screenshots, logs, recordings

**What does NOT go in `evals/`**:
- Unit test code → `tests/unit/`
- Integration test code → `tests/integration/`
- Framework-standard tests → `tests/`

### `USER.md` User Preference Memory (按需创建)

`USER.md` is the **user preference memory file**. It captures decisions, preferences, and patterns that the user has expressed multiple times.

**When to create `USER.md`**:
- When the user expresses a preference 2+ times (e.g., "always use Lucide icons", "never use emoji")
- When the user makes a decision that should persist across sessions

**Structure**:

```markdown
# User Preferences

## Confirmed (mentioned 2+ times)
- Icon library: Lucide (user confirmed 3 times, never emoji)
- Color system: Tailwind design tokens (user rejected hardcoded hex)
- Test strategy: AI self-test first, then user sandbox verification

## Pending (mentioned once, needs confirmation)
- Deployment target: Vercel? (user mentioned once)

## Rejected options (user explicitly said no)
- Purple gradient AI templates — rejected
- Emoji as icons — rejected
```

**Rules**:
- AI **reads** `USER.md` at the start of every session and injects preferences into context
- AI **writes** to `USER.md` only when the user explicitly confirms a preference, or when the same preference has been mentioned 2+ times
- AI **never** guesses user preferences — only record what the user explicitly stated
- `USER.md` is part of the project, committed to git, shared across all AI tools

### `SOUL.md` Project Soul / Core Principles (按需创建)

`SOUL.md` is the **project's immutable core principles**. It defines what the project is, what it will never be, and its non-negotiable constraints. It is the "constitution" of the project.

**When to create `SOUL.md`**:
- When the project has core principles that must never be violated
- When the project has non-goals that are as important as goals
- When multiple agents work on the project and need alignment on "what this project is about"

**Rules**:
- `SOUL.md` changes require user approval — AI cannot modify it unilaterally
- If a user request conflicts with `SOUL.md`, AI must flag the conflict and ask for direction
- `SOUL.md` is loaded at the start of every session alongside `AGENTS.md`

### Model / Agent Risk Ledger

When a project uses OpenAI SDK, Claude SDK, Agents SDK, model judging, prompt workflows, tool calls, multi-agent execution, long-context review, or automated workflow runners, record a `Model / Agent Risk Ledger` in `.plan/SPEC.md`.

Minimum fields:

- provider / model_id / pinned alias
- budget / cost / quota / rpm / tpm / rate limit
- max_context / token / chunk / truncation policy
- prompt drift / persona / system prompt change policy
- tool permission / allowlist / denylist / live action stop gate
- eval / fixture / golden / benchmark isolation
- concurrent agents / run_id / owner / touched paths / conflict gate
- reproducibility / command / exit code / lockfile / seed / artifact hash
- trace_sensitive_data / logging / retention policy
- copyright / privacy / content safety policy
- evidence budget / context pollution rule

Treat missing cost/quota, context/chunking, tool permissions, or eval isolation as material risk, not "later cleanup".

---

## Output Contract

For `brainstorm`, report:

- product hypothesis
- 2-3 viable directions with recommended default
- sharp PM critique and key invalidation risk
- architecture implications in product language
- no-return decisions and what should not be decided yet
- benchmark/comparable products or workflow patterns when useful
- whether the next step is 建档, more exploration, defer, or split into a new project

For 建档, report:

- created or updated structure
- recommended stack/platform path and plain-language rationale
- owner, level, schedule/status assumptions
- helper command or manual edits used
- verification result
- **brainstorm 轮次 + 用户反馈摘要**
- **PM 审计结果（🔴/🟠/🟡 统计）**
- **用户确认记录（PRD/SPEC/CHECKLIST 各阶段的确认状态）**
- what the user must decide next, if anything
- what Codex/agents can continue without user technical input
- remaining inputs needed from the user

**三件套审查契约（强制）:**
- PRD 未经用户书面确认 → 不得生成 SPEC（记录违规到 `.kit/audit-log.md`）
- SPEC 未经用户书面确认 → 不得生成 CHECKLIST（记录违规到 `.kit/audit-log.md`）
- CHECKLIST 未经用户书面确认 → 不得进入 kitrun（记录违规到 `.kit/audit-log.md`）
- 违反以上规则视为流程违规，需在报告中明确标注

**例外条款（quick 项目）:**
- `quick` scale 项目允许将 PRD+SPEC+CHECKLIST 合并为单个 `PLAN.md`
- 此时"三件套确认"转换为"PLAN.md 整体确认"——用户确认 PLAN.md 一次即视为三件套全部确认
- 合并后的 PLAN.md 底部仍需添加确认标记
- 若用户后续要求拆分为独立 PRD/SPEC/CHECKLIST，则恢复标准三件套确认流程

For 归档, report:

- active fact source
- files kept active
- files archived or proposed for archive
- **scope drift 检测状态（是否有计划目标变更）**
- **变更确认状态（用户是否确认）**
- KIT/schedule/evidence gaps
- verification result
- beginner-readable current status and next safe action
- user decisions versus Codex-owned technical work
- remaining risks
