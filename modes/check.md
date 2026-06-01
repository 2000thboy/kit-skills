# /kit-check Mode — kit-skills v2.0

Deep review layer: Hedge, edge cases, semantic risk, and go/no-go judgment after `/kit-run`.

---

## Command Surface

```
/kit-check                     → View quality status
/kit-check full                → Full deep review (entire project + Hedge)
/kit-check diff                → Deep review of changed files after /kit-run
/kit-check research "<topic>"  → Deep research (dual-engine)
/kit-check plan                → Re-plan based on check results
```

## Positioning

`/kit-check` is not the normal test runner. Normal build/test/smoke/basic acceptance belongs to `/kit-run`.

`/kit-check` starts after `/kit-run` has produced a `Run Closure`. It judges whether the implementation is safe to move forward.

Before running `/kit-check diff`, `/kit-check full`, or any Hedge/deep edge pass, present a check plan and get user confirmation. This is mandatory because `/kit-check` may broaden scope beyond ordinary tests.

```markdown
## /kit-check Plan Confirmation

### 检查目标
- <changed files / project area / release candidate>

### 检查范围
- Hedge mode: <quick|deep|security>
- Edge cases: <input/path/state/concurrency/security/product semantics>
- Evidence to inspect: <Run Closure, logs, screenshots, test reports>

### 不检查
- <explicit exclusions>

### 可能影响
- <time cost, files read, possible fix recommendations>

### 用户确认
请回复 "确认" 才开始 `/kit-check`。
```

If the user does not confirm, stop with Phase Closure and next command `/kit-status` or `/kit-run` as appropriate.

Core responsibilities:

- Run Hedge quick/deep/security adversarial checks.
- Test edge cases that ordinary tests miss: empty input, oversized input, concurrency, path boundaries, permissions, cancellation, stale state, and state pollution.
- Check semantic risks: wrong requirement interpretation, command-boundary confusion, fake completion, mock residue, missing persistence, and tests that prove the wrong behavior.
- Run Commercial Delivery Gate when the output will be handed to a real user or customer.
- Run Four-Role 95 Review for major handoff: Top PM, Top Code Engineer, Top Frontend Engineer, Backend Framework Engineer.
- Check knowledge-base / agent self-supervision when RAG, tools, prompts, evals, or autonomous workflows are in scope.
- Apply China Mainland Delivery Notes when the product depends on mainland deployment, payment, login, SMS, maps, ICP, or customer handoff.
- Produce a go/fix/block judgment.
- Route failures back to `/kit-run fix <scope>` with a prioritized fix list.

## Quality Flywheel

The core quality loop:

```
/kit-run Run Closure → Hedge/edge review → quality report → go/fix/block → /kit-run fix or /kit-test
```

### Hedge 对抗性测试集成

After L1/L2/L3 checks complete, automatically invoke `/hedge` for adversarial testing:

```
L1/L2/L3 Complete
    │
    ▼
┌─────────────────┐
│  Hedge Attack   │  Spawn 3 parallel sub-agents:
│   (Parallel)    │  1. Structure Agent — Skill structure validation
│                 │  2. Vibe Agent — Simulate vibe coder misuse
│                 │  3. Boundary Agent — Edge cases & consistency
└─────────────────┘
    │
    ▼
Merge hedge findings into quality report
```

**Hedge Integration Rules:**
- **Quick mode** (`/hedge --quick`): Structure only, run on every `/kit-check diff`
- **Full mode** (`/hedge --deep`): All 7 agents, run on `/kit-check full` or before archive
- **Security mode** (`/hedge --security`): Security + Vibe agents, run when codebase has API/auth/file ops
- **Auto-trigger**: When L2 finds `mock`, `fake`, `placeholder`, or security-related keywords → auto-run hedge security scan
- **Triage condition**: If L1 has >10 P0 findings, do not run full hedge immediately. Run a quick Structure/Boundary hedge on the P0 cluster, fix or report the blocking issues first, then run the normal hedge pass before claiming ready.
- **Missing hedge guard**: If `/hedge` is unavailable, run the Vibe Coding 18-item checklist manually and mark the report as `adversarial_check: incomplete`. The result cannot be reported as ready unless the user explicitly accepts that risk.

**Hedge Output Merge:**
- Hedge findings merge into L1/L2/L3 report with prefix `[HEDGE-{agent}]`
- Severity mapping: Critical→P0, High→P1, Medium→P2
- Cross-reference: If both L2 and Hedge flag same issue → upgrade severity by one level

**[条件确认] 规则**：

- **L1 + L2 全部通过** → Present summary to user and ask for explicit confirmation before archive. Do not auto-skip unless user has previously granted auto-archive permission in `.kit/config.json` (`auto_archive: true`).
- **Only P1/P2 found** → Auto-fix low-risk issues, summarize report to user (non-blocking)
- **P0 or high-risk fix found** → Pause, wait for user confirmation before fixing

Do not block the user for cosmetic issues. Do not silently fix critical issues without confirmation.

---

## Edge Case Review

Run edge checks based on the changed surface:

- Input: empty, null, oversized, unicode/control characters, malformed JSON/Markdown.
- Filesystem: Windows paths, spaces, traversal attempts, missing files, read-only files.
- State: repeated runs, interrupted runs, stale `.kit/` state, dirty worktree, lock files.
- Concurrency: two runs/checks in parallel, overlapping agent outputs, shared temp directories.
- Product semantics: requirement implemented in the wrong workflow, acceptance criteria skipped, test asserts mock behavior.
- Security: secrets, destructive commands, external writes, auth/session assumptions.

These checks are why `/kit-check` runs after `/kit-run`; they are not a replacement for basic acceptance.

---

## Go / Fix / Block Judgment

Every `/kit-check` ends with one of:

| Judgment | Meaning | Next Command |
|---|---|---|
| `go` | No P0/P1 and Hedge/edge checks passed or risks accepted | `/kit-test` or `/kit-pack` |
| `fix` | Issues found but implementation can continue locally | `/kit-run fix <scope>` |
| `block` | User/product/security decision required | Ask one concrete question, then route back |

Report format:

```markdown
## Check Judgment

结论: <go|fix|block>

### Hedge / Edge Findings
| Severity | Area | Issue | Evidence | Fix |
|---|---|---|---|---|

### 回流计划
1. <fix order>

### 四重评审
| Reviewer | Score | Verdict | Main Reason |
|---|---:|---|---|
| Top PM |  |  |  |
| Top Code Engineer |  |  |  |
| Top Frontend Engineer |  |  |  |
| Backend Framework Engineer |  |  |  |

Pass requires every score >= 95.

### 下一条命令
`/kit-run fix <scope>` or `/kit-test`
```

Do not end with vague advice. Always provide the next KIT command.

---

## Divergent Inspection

When the user reports a specific issue, expand the inspection scope:

- User says "按钮位置不对" → Check all buttons, form alignment, mobile layout, z-index stacking
- Discover mock data → Check all API calls, loading states, error handling, empty states
- Find one type error → Check all related types, interfaces, and call sites
- One test fails → Check test isolation, fixture state, and related tests

The rule: **one symptom, many causes**. Do not fix the single reported instance and stop.

---

## Vibe Coding 专项检测清单（18项）

### UI 层（6项）

- [ ] 元素遮挡/重叠（z-index、overflow、position）
- [ ] 响应式断点异常（mobile / tablet / desktop）
- [ ] 文本截断/溢出
- [ ] 无意义的 loading / mock 占位
- [ ] 空状态未处理
- [ ] 错误状态未处理

### 数据层（4项）

- [ ] API 响应是 mock 还是真实？
- [ ] 所有 CRUD 操作有真实后端吗？
- [ ] 表单提交后数据真的保存了吗？
- [ ] 刷新页面数据还在吗？

### 功能层（4项）

- [ ] 所有按钮都有实际行为？
- [ ] 所有路由都有实际页面？
- [ ] 所有表单都有验证？
- [ ] 所有链接都能跳转？

### 代码层（4项）

- [ ] 无未使用的 import / 变量 / 函数
- [ ] 无硬编码的 hex 颜色（设计 token 检查）
- [ ] 无 emoji 作为图标（图标库检查）
- [ ] 无 "use client" 滥用

---

## L1 / L2 / L3 分级检查

### L1: AI Agent 静态分析（自动）

AI agent reads files and checks for obvious issues:

- Unused imports, variables, functions
- Type errors (TypeScript / Python type hints)
- Missing return statements
- Obvious logic errors (dead code, unreachable branches)
- Import path resolution failures
- Hardcoded values that should be config

**Output**: Markdown report with file:line references and severity (P0/P1/P2).

### L2: AI Agent 构建时检查（自动）

AI agent runs build/lint commands and interprets output:

- `npm run build` / `tsc --noEmit` / `pyright` / `dart analyze`
- Console red errors in browser devtools
- API contract inconsistencies (frontend expects vs backend returns)
- Mock data残留 (search for `mock`, `fake`, `dummy`, `placeholder` in API calls)
- Missing environment variables

**Output**: Command output + interpreted findings + severity.

### L3: 浏览器检查（半自动）

AI agent generates a Playwright test script + manual checklist:

1. Generate `tests/e2e/kit-check-l3.spec.ts` with checks for:
   - All routes load without 404
   - All forms submit and show success/error states
   - All buttons trigger actions
   - Responsive layout at 320px, 768px, 1440px
   - No console errors after user interactions
2. Present checklist to user
3. User confirms → run Playwright
4. User declines → record as "manual verification pending"

**Output**: Test script + run result + manual checklist.

---

## Adaptive Exit

The quality flywheel does not run forever. Exit when:

1. **连续 2 轮无新问题** → Convergence exit. Quality has stabilized.
2. **问题严重性降级** → P0 → P1 → P2. Each round finds less severe issues. Exit after P2-only round.
3. **用户说"够了"** → Immediate exit. User has explicitly accepted current quality.
4. **最大轮次达到** → Default 3 rounds, hard maximum 10 rounds. If `.kit/config.json` is missing or `kit_check_max_rounds` is undefined, hard-default to 3. Never exceed 10 rounds regardless of configuration.

Exit procedure:

1. Write final quality report to `.test/ai/reports/kit-check-YYYY-MM-DD.md`
2. Update `.kit/quality-patterns.md` with any new bug patterns discovered
3. Update `.plan/CHECKLIST.md` if new acceptance criteria were identified
4. Present summary to user: issues found, issues fixed, issues deferred, next recommended action

---

## Research 双引擎

### 引擎 1: 本地知识（Local Knowledge）

- Read `knowledge/` directory for framework context
- Read `.kit/` for project-specific patterns and decisions
- Read `.plan/SPEC.md` and `.plan/CHECKLIST.md` for current constraints
- Read `docs/ui-ux/` for design system rules

### 引擎 2: 联网研究（Web Research）

- `WebSearch` for competitor analysis, best practices, known issues
- `WebFetch` for official documentation, API references, changelog
- Focus: verify assumptions from engine 1, discover new patterns

**产物归档**:

- Research notes → `.test/ai/reports/research-YYYY-MM-DD-<topic>.md`
- Key findings → append to `.kit/decisions.md` if they affect project direction
- Competitor insights → `docs/architecture/competitor-analysis.md` (if new)

---

## Regression Archive

New bug patterns discovered during `/kit-check` must be recorded:

**Write to `.kit/quality-patterns.md`**:

```markdown
## YYYY-MM-DD

### Pattern: <short name>
- **Symptom**: <what the user saw>
- **Root cause**: <why it happened>
- **Detection**: <how to catch it next time>
- **Prevention**: <how to prevent it in future code>
- **First seen**: <file or feature>
```

Also update `.plan/CHECKLIST.md`:

- Add new acceptance criteria if the bug reveals a gap
- Add new verification command if a new check type was invented
- Update task status if the bug was found during an existing task

---

## Profile Audit Signals

Use profile-specific P0/P1/P2 signals instead of one giant checklist. P0 blocks "ready" claims. P1 is material risk. P2 is cleanup or clarity debt.

### `generic-project`

- P0: missing `.plan/PRD.md`, `.plan/SPEC.md`, or `.plan/CHECKLIST.md`
- P0: missing `任务列表前置规划` in the active Checklist
- P0: no clear stop gate for user/platform/manual acceptance
- P1: missing `.kit/` when the project is meant to be KIT-managed
- P1: product goal, target user, or observable acceptance is vague
- P1: **project scale not recorded** (`quick`/`standard`/`deep`) or scale mismatch with actual structure depth
- P1: **quick-scale project with excessive ceremony** (full PRD/SPEC/CHECKLIST when a single PLAN.md would suffice)
- P1: **deep-scale project missing mandatory gates** (Architecture Review, Risk Ledger, or phased delivery checkpoints)
- P1: routed research/QA/execution/browser workflow implied but owner/evidence/fallback not recorded
- P2: owner, due date, final due date, or next tasks are empty

### `frontend-ui`

- P0: UI work claimed complete without browser/screenshot evidence
- P0: visual verification required but no evidence path is recorded
- P1: project-standard browser/evidence tool not documented
- P1: UI/UX source docs mixed into evidence without SPEC summary
- P2: UI/UX docs not classified into `docs/ui-ux/` or appropriate evidence directories

### `long-content-publishing`

- P0: real external write/submission/publish gate missing or bypassable when live delivery exists
- P0: dry-run/live isolation missing
- P0: account material, cookie, token, book id, or private platform config committed or planned for commit
- P0: state recovery file/audit log missing for resumable workflow
- P0: quality blocker missing for platform/content risks
- P0: delivery/run evidence path missing
- P1: node graph, artifact root, human gates, executor ownership, chunk policy, review matrix, schedule/frequency, or format/encoding gate missing
- P1: quota/deferred behavior not documented
- P2: delivery adapters, downstream handoff, or post-run data fetch evidence not documented

### `archive-cleanup`

- P0: active facts or source code proposed for archive without reference check
- P1: root-level Markdown archive candidates not classified
- P1: process/tooling directories not inspected during cleanup
- P1: active process state archived without current-state check
- P1: hardcoded local paths, browser profiles, account/platform IDs, or secret-like literals left unclassified
- P2: stale process artifacts left unclassified

---

## Heartbeat Monitoring

Enable heartbeat monitoring automatically when a background bash task runs longer than the task-type threshold.

### Task-Type Preset Thresholds

| Task Type | Check Interval | Timeout | Typical Use |
|-----------|---------------|---------|-------------|
| `default` | 30 seconds | 120 seconds | General commands, file operations |
| `build` | 60 seconds | 600 seconds | Compilation, bundling, long builds |
| `training` | 300 seconds | 1800 seconds | Model training, data processing |
| `download` | 60 seconds | 300 seconds | Network downloads, package installs |

### Retry Mechanism

When a task exceeds timeout or its PID disappears:

```
[Abnormal] Timeout or PID lost
    ├─ 1st: SIGTERM → wait 5s → SIGKILL if still alive → restart (retry=1)
    ├─ 2nd: SIGTERM → wait 5s → SIGKILL if still alive → restart (retry=2)
    ├─ 3rd: SIGTERM → wait 5s → SIGKILL if still alive → mark failed
```

### 3-Failure Handling

After 3 retries, the task is marked as failed:

- Write to `.kit/blockers.json`:
  ```json
  {
    "type": "heartbeat_timeout",
    "command": "<the command that failed>",
    "retries": 3,
    "timestamp": "2026-05-30T12:00:00Z",
    "task_type": "training"
  }
  ```
- Notify user: "任务卡死，已重试3次，请检查权限/资源/网络"
- Suggest manual diagnostic commands
- If the failure occurred inside `/kit-loop`, keep the detailed blocker in `.cron/logs/YYYY-MM-DD/` and add only a pointer entry to `.kit/blockers.json` with `source: "kit-loop"` and `log_path`. Do not duplicate the full loop state into `.kit/blockers.json`.

### Implementation

**Primary**: Use Claude Code `Monitor` tool natively when available. Pass the task type to select the correct preset thresholds.

**Fallback**: Use `.workflow/scripts/heartbeat-watchdog.ps1` (Windows) or `.workflow/scripts/heartbeat-watchdog.sh` (Unix), invoked with:
```powershell
heartbeat-watchdog.ps1 --pid <PID> --task-type <default|build|training|download> [--custom-interval <sec>] [--custom-timeout <sec>]
```
