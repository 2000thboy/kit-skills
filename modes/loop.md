# /kit-loop Mode — kit-skills v2.0

Autonomous cruise / self-iterating development mode.

---

## Command Surface

```
/kit-loop <duration>            → Start autonomous development
/kit-loop stop                 → Terminate current loop
/kit-loop status               → View current loop status
```

Duration format: `1day`, `2days`, `4hours`, `1week`

---

## Full-Trust Mode Rules (8条)

Based on SKILL.md Full-Trust Mode, extended for `/kit-loop`:

1. **User-initiated only**: Do not propose full-trust mode unprompted. Wait for the user to mention it.
2. **Bounded scope**: Define exactly what the AI may do (files, commands, commits) and what it must not.
3. **Time box**: Set a clear deadline (e.g., "run until 2026-06-01 18:00").
4. **Checkpoints**: At defined intervals (default every 4 hours), pause and report progress.
5. **Escalation on block**: If a blocker occurs, stop and contact the user immediately.
6. **Evidence trail**: All actions logged to `.cron/logs/`.
7. **Rollback plan**: Define how to revert if results are unacceptable.
8. **Termination**: User can terminate at any time; AI must checkpoint before stopping.

---

## 强制用户确认门（启动前必须显式确认）

Before starting `/kit-loop`, present to the user:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/kit-loop 启动确认
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

范围边界（可修改的文件/目录）:
  • 默认: src/, docs/ui-ux/
  • 禁止: .plan/（除非用户明确允许）, .kit/（只追加 blockers.json）, 配置敏感文件

检查点频率: 每 4 小时
最大轮次: 默认 3（可配置）
回滚策略: 每个检查点前创建 git tag kit-loop-checkpoint-<n>

用户可回复:
  • "确认" → 启动
  • "修改范围" → 调整范围后重新确认
  • "取消" → 不启动
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**用户必须回复 "确认" 后才启动。** 不接受 "ok", "好的", "行" 等模糊确认。必须是明确的中文 "确认" 或英文 "confirm"。

---

## 检查点报告（默认每 4 小时）

At each checkpoint, generate and present:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
检查点 #<n> 报告 — <timestamp>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

当前进度摘要:
  • 已完成: <N> 个任务
  • 进行中: <M> 个任务
  • 阻塞: <K> 个任务

已完成的任务列表:
  1. [✓] <task name> — <evidence path>
  2. [✓] <task name> — <evidence path>

发现的问题和修复状态:
  • <issue> — <status: fixed/pending/wontfix>

下一步计划:
  1. <next task>
  2. <next task>

用户可回复:
  • "继续" → 进入下一轮
  • "停止" → 终止 loop，写最终报告
  • "回滚到检查点 N" → git reset --hard kit-loop-checkpoint-<N>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 范围边界

### 默认可修改

- `src/` — 项目源代码
- `docs/ui-ux/` — UI/UX 文档
- `tests/` — 测试代码（新增/修改）
- `.test/ai/` — AI 自检证据和报告

### 默认禁止修改

- `.plan/` — 项目计划文档（除非用户明确允许）
- `.kit/` — 只追加 `blockers.json`，不修改其他文件
- 配置敏感文件: `.env`, `secrets.json`, `*.key`, `*.pem`
- 宿主入口: `CLAUDE.md`, `AGENTS.md`（除非 loop 任务就是更新它们）

### 沙盒执行

所有修改在沙盒 `project-eval/` 中进行:

```
project/          ← 主项目（只读）
project-eval/     ← AI 工作区（读写）
  src/
  tests/
  .test/ai/
  logs/
```

AI **never** modifies `project/` directly. Changes are promoted to `project/` only after:

1. `/kit-check` L1 + L2 passes
2. User approves checkpoint report
3. User explicitly requests promotion

---

## 质量飞轮集成

Each checkpoint automatically triggers L1 + L2 quality checks:

```
检查点到达
    ↓
自动运行 L1 静态分析
    ↓
自动运行 L2 构建/ lint
    ↓
发现问题？
    ├─ 低风险 → 自动修复 → 重新检查 → 通过 → 写报告
    └─ 高风险 → 暂停 loop → 写报告 → 等用户确认
```

Rules:

- Do not skip quality checks to "save time".
- Auto-fix only when the fix is unambiguous and low-risk (e.g., unused import removal, formatting).
- High-risk fixes (architecture changes, API changes, data model changes) require user confirmation.
- If quality checks fail 3 times in a row, treat as a blocker and stop the loop.

---

## 证据轨迹

All operations are logged:

### 操作日志

```text
.cron/logs/YYYY-MM-DD/kit-loop-<start-time>.log
```

Content:

```
[YYYY-MM-DD HH:MM:SS] START /kit-loop duration=<duration> scope=<scope>
[YYYY-MM-DD HH:MM:SS] CHECKPOINT <n>
[YYYY-MM-DD HH:MM:SS] TASK_START <task-name>
[YYYY-MM-DD HH:MM:SS] TASK_COMPLETE <task-name> evidence=<path>
[YYYY-MM-DD HH:MM:SS] ISSUE_FOUND <severity> <description>
[YYYY-MM-DD HH:MM:SS] FIX_APPLIED <file> <description>
[YYYY-MM-DD HH:MM:SS] BLOCKER <description>
[YYYY-MM-DD HH:MM:SS] STOP <reason>
```

### 检查点报告

```text
.cron/logs/YYYY-MM-DD/checkpoint-<n>.md
```

Content: Structured markdown with progress, issues, fixes, next plan, user options.

---

## 回滚计划

### 检查点标签

Before each checkpoint, create a git tag:

```powershell
git tag -a kit-loop-checkpoint-<n> -m "kit-loop checkpoint <n> at <timestamp>"
```

### 回滚命令

User can request rollback at any checkpoint:

```powershell
git reset --hard kit-loop-checkpoint-<n>
```

### 回滚后处理

1. Restore `project-eval/` to checkpoint state
2. Re-run `/kit-check` to verify restored state
3. Present restored state summary to user
4. Ask: "从检查点 <n> 继续，还是完全停止？"

---

## 终止机制

### 用户终止

User sends "stop" or "够了" → **立即终止**:

1. Finish the current file operation (do not leave partial writes)
2. Run a final L1 check
3. Write final report to `.cron/logs/YYYY-MM-DD/kit-loop-<start-time>-final.md`
4. Present summary: completed tasks, issues found, issues fixed, remaining work
5. Ask: "是否需要回滚到上一个检查点？"

### 自动终止

Loop auto-terminates when:

- Duration expires
- All CHECKLIST tasks are complete
- 3 consecutive blockers occur
- User does not respond to checkpoint report within 24 hours (configurable)

### 终止后报告

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/kit-loop 最终报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

运行时间: <duration>
检查点: <n> 个
完成任务: <N> 个
发现问题: <M> 个（已修复 <K> 个）

证据路径:
  • 操作日志: .cron/logs/YYYY-MM-DD/kit-loop-<start-time>.log
  • 检查点报告: .cron/logs/YYYY-MM-DD/checkpoint-*.md
  • 质量报告: .test/ai/reports/kit-check-*.md

回滚选项:
  • 回滚到检查点 <n>: git reset --hard kit-loop-checkpoint-<n>
  • 保持当前状态: 无需操作
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 阻塞处理

### 什么是 Blocker

A blocker is any condition that prevents the loop from making progress:

- Build fails and cannot be fixed after 3 attempts
- User does not respond to a required confirmation within timeout
- External dependency is unavailable (API down, package registry unreachable)
- Disk space exhausted
- Git conflict that cannot be auto-resolved
- Quality check fails 3 times in a row

### Blocker 处理流程

```
发现 blocker
    ↓
立即停止 loop（不再执行新任务）
    ↓
写 blocker 报告到 .cron/logs/YYYY-MM-DD/blocker-<timestamp>.md
    ↓
通知用户（高优先级，不可忽略）
    ↓
等待用户响应
    ├─ 用户解决 → 继续 loop
    ├─ 用户回滚 → 执行回滚
    └─ 用户停止 → 终止 loop
```

### 不写 .kit/blockers.json

**Important**: `/kit-loop` does **not** write to `.kit/blockers.json`. That file is reserved for heartbeat monitoring (`modes/check.md`).

Loop blockers are recorded in:
- `.cron/logs/YYYY-MM-DD/blocker-<timestamp>.md` (detailed report)
- `.cron/logs/YYYY-MM-DD/kit-loop-<start-time>.log` (log entry)

---

## 与 /kit-check 的协作

`/kit-loop` and `/kit-check` are separate commands but share the quality infrastructure:

- `/kit-loop` **triggers** L1 + L2 checks at each checkpoint
- `/kit-check` **performs** the actual checks and generates reports
- `/kit-loop` **reads** `/kit-check` reports and decides: auto-fix, ask user, or stop

This separation ensures:
- Quality logic is not duplicated
- `/kit-check` can be run independently at any time
- `/kit-loop` focuses on orchestration, not inspection
