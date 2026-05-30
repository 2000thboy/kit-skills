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

Required output:

- development object classification: skill, workflow, CLI harness, frontend/backend app, OMC orchestration, SDK integration, design prototype, or unknown
- product hypothesis: target user, core pain, proposed workflow, expected outcome
- option set: 2-3 viable product directions, each with cost, risk, and differentiation
- PM critique: the weakest assumption, likely failure mode, and what would prove the idea is worth building
- architecture implication: what technical shape each option implies, explained in product terms
- no-return points: decisions that become expensive to reverse after 建档
- benchmark references: comparable product, workflow, or pattern when useful
- next action: `建档`, more brainstorm, reject/defer, or split into a separate project

Brainstorm must end with a decision recommendation. If the idea is not ready for 建档, say what is missing instead of producing a fake PRD.

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
2. Read `.plan/PRD.md`, `.plan/SPEC.md`, `.plan/CHECKLIST.md`
3. If `.kit/interrupted/` exists, list interrupted sessions and ask user whether to resume
4. If `.kit/decisions.md` exists, read the last 10 entries for recent context
5. Present a status brief before any action

**Session End (强制)**:
1. Update `.kit/config.json`: stage, progress, completed_tasks, next_tasks, blockers, snapshot_hash, last_updated
2. If session was interrupted mid-task: Write `.kit/interrupted/YYYY-MM-DD-<topic>.md`
3. If key decisions were made: Append to `.kit/decisions.md` with timestamp and decision summary
4. If blockers were encountered: Update `.kit/blockers.json`

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
- what the user must decide next, if anything
- what Codex/agents can continue without user technical input
- remaining inputs needed from the user

For 归档, report:

- active fact source
- files kept active
- files archived or proposed for archive
- KIT/schedule/evidence gaps
- verification result
- beginner-readable current status and next safe action
- user decisions versus Codex-owned technical work
- remaining risks
