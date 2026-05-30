# /kit-check Mode — kit-skills v2.0

Quality layer: inspection, research, planning.

---

## Command Surface

```
/kit-check                     → View quality status
/kit-check full                → Full quality check (entire project)
/kit-check diff                → Incremental check (changed files only)
/kit-check research "<topic>"  → Deep research (dual-engine)
/kit-check plan                → Re-plan based on check results
```

## Quality Flywheel

The core quality loop:

```
检查 → 产出报告 → [条件确认] → 修复 → 自动回归 → 沉淀
```

**[条件确认] 规则**：

- **L1 + L2 全部通过** → Auto-skip confirmation, proceed directly to archive (沉淀)
- **Only P1/P2 found** → Auto-fix low-risk issues, summarize report to user (non-blocking)
- **P0 or high-risk fix found** → Pause, wait for user confirmation before fixing

Do not block the user for cosmetic issues. Do not silently fix critical issues without confirmation.

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
4. **最大轮次达到** → Default 3 rounds, configurable via `.kit/config.json` → `kit_check_max_rounds`.

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

### Implementation

**Primary**: Use Claude Code `Monitor` tool natively when available. Pass the task type to select the correct preset thresholds.

**Fallback**: Use `.workflow/scripts/heartbeat-watchdog.ps1` (Windows) or `.workflow/scripts/heartbeat-watchdog.sh` (Unix), invoked with:
```powershell
heartbeat-watchdog.ps1 --pid <PID> --task-type <default|build|training|download> [--custom-interval <sec>] [--custom-timeout <sec>]
```
