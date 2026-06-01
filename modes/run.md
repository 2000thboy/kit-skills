# /kit-run Mode — kit-skills v2.0

Execution layer: implement, self-test, fix failures, and complete basic acceptance.

---

## Command Surface

```
/kit-run                       → View current execution status
/kit-run start                 → Begin execution per SPEC task list
/kit-run test                  → Run project/framework tests and basic acceptance during implementation
/kit-run smoke                 → Smoke test
/kit-run fix <scope>           → Fix issues returned by /kit-check or failed basic acceptance
```

`/kit-run test` is not the same as `/kit-test`. `/kit-run test` runs developer checks and basic acceptance for the current implementation task. `/kit-test` is the acceptance layer for version boundary confirmation, temporary acceptance packages, user-facing acceptance tests, and test reports before `/kit-pack`.

## Responsibilities

- Read `.plan/SPEC.md` and `.plan/CHECKLIST.md`
- Enforce pre-code gate before any implementation
- Enforce file-write 4-item self-check before every file write
- Follow frontend-first flow for UI projects
- Complete basic acceptance before handing work to `/kit-check`
- Fix failed basic acceptance once before returning to the user
- Integrate Codex via CLI contract, not skill format
- Use Claude Code Agent tool for parallel execution (no OMC dependency)

---

## Pre-Code Gate

Before writing any code:

0. **读取 Requirement-to-Run Handoff** — Confirm the previous KIT phase ended with a handoff containing plan summary, requirement review, execution plan, and next command. If the handoff is missing, stop and return to `/kit` to produce it; do not infer the plan from scattered chat history.

1. **技术栈预研** — Search official docs for APIs, SDKs, frameworks. Do not guess signatures or behavior.
2. **读取项目配置** — Read `tsconfig.json`, `super-dev.yaml`, `.env`, `package.json`, or equivalent. Understand existing constraints.
3. **声明 UI 工具链** — Lock icon library (Lucide / Heroicons / Tabler) and design token system. Record in `docs/ui-ux/design-system.md` or `.kit/config.json`.
4. **确认 API 契约和设计 token** — Verify backend API shape, response schema, and design token availability before frontend implementation.
5. **建立页面结构 + 验证构建零错误** — Scaffold page/routing structure and run a build to confirm zero errors before filling in details.
6. **检查模型选择记录** — Read `.kit/model-choice.md`:
   - 确认当前环节使用的模型是否最优
   - 如果编码环节指定了 Codex → 优先调用 Codex
   - 如果编码环节指定了 Claude → 使用 Claude Agent
   - 如果生图环节指定了 DALL-E → 调用生图 API
   - 如果模型未指定 → 默认使用 Claude Sonnet（平衡性）
   - 如果模型信息超过 30 天 → 重新评估
7. **检查 PM 审计状态** — Read `.kit/pm-audit-*.md`:
   - 如果存在 🔴 阻断项 → 停止，报告 blocker，不得进入编码
   - 如果只有 🟠/🟡 → 记录风险，可继续但需在实现中关注
   - 如果无 PM 审计文件（quick 项目可能跳过）→ 记录 "PM audit skipped" 到 `.kit/audit-log.md`
8. **检查用户确认状态** — Read `.plan/PRD.md`、`.plan/SPEC.md`、`.plan/CHECKLIST.md` 底部确认标记：
   - 未经用户确认的文档 → 停止，返回 `/kit` 模式要求确认
   - 确认标记格式：`✅ 用户确认 | 时间: ... | 版本: ...`

If any step fails, stop and report the blocker. Do not proceed to implementation with unresolved gate failures.

When `/kit-run` starts successfully, restate:
- the first implementation task
- why it is first
- files likely touched
- verification command
- what command should follow after this task (`/kit-check diff`, `/kit-run test`, `/kit-test`, or `/kit-pack`)

---

## File-Write 4-Item Self-Check

Before saving any file, confirm:

- [ ] **"use client" 是否需要？** — Only add when client-side interactivity (hooks, browser APIs) is actually used. Do not default to "use client".
- [ ] **图标来自声明的图标库？** — Icons must come from the locked library (Lucide / Heroicons / Tabler). **Never use emoji as icons.**
- [ ] **颜色来自设计 token？** — Colors must reference design tokens (e.g., `bg-primary`, `text-muted`). **Never hardcode hex values** except in the design system definition itself.
- [ ] **import 路径正确？API 路径与架构一致？** — Verify import paths resolve. Verify API routes match the architecture defined in SPEC.

If any checkbox fails, fix before saving.

---

## Frontend-First Flow

For projects with UI/UX requirements:

1. **先实现前端 + UI** — Build the frontend based on `docs/ui-ux/` design documents. Use placeholder data where necessary, but structure must be real.
2. **截图检查（preview 确认门）** — Take screenshots of the implemented UI. Verify against design docs.
3. **用户确认 UI** — Present screenshots to the user. Wait for explicit confirmation before proceeding to backend.
4. **再实现后端 + 联调** — Implement backend APIs and wire them to the frontend. Replace placeholder data with real API calls.

Do not implement backend first and "trust" that the UI will work. UI is the user-facing contract; it must be verified first.

---

## Basic Acceptance Loop

`/kit-run` should solve the assigned problem end to end at the implementation level. It does not stop after editing files.

Run this loop:

```text
implement → build/type/lint → project tests → smoke run → requirement path check → fix failures → rerun failed checks
```

### Basic Acceptance Checklist

Before handing off to `/kit-check`, verify:

1. **实现完成** — The selected CHECKLIST/PLAN item is implemented in the real code path.
2. **build/type/lint 通过** — Run the project's build, typecheck, lint, or closest equivalent. Zero blocking errors.
3. **项目测试通过** — Run relevant unit/integration/e2e tests that already exist for the touched area.
4. **smoke run 通过** — Start the app, CLI, workflow, or skill entry and confirm the main path does not crash.
5. **核心需求路径验证** — Compare the result with PRD/SPEC/CHECKLIST acceptance criteria; no orphaned code or mock-only path.
6. **失败回修** — If any basic acceptance item fails, fix the failure and rerun the failed check once before returning to the user.
7. **证据记录** — Record commands, exit codes, screenshots/log paths when relevant, and remaining uncovered risks.

If basic acceptance fails after one fix pass, stop with a blocker and next command:

```text
/kit-run fix <scope>
```

If basic acceptance passes, the next command is usually:

```text
/kit-check diff
```

---

## Run Closure

Every `/kit-run` session ends with:

```markdown
## Run Closure

### 实现结果
- <what changed>

### 基础验收
| Check | Command/Evidence | Result |
|---|---|---|
| build/type/lint | <command> | <pass/fail/not-run + reason> |
| tests | <command> | <pass/fail/not-run + reason> |
| smoke | <command/evidence> | <pass/fail/not-run + reason> |
| requirement path | <evidence> | <pass/fail> |

### 回修情况
- <failures fixed and rerun result>

### 未覆盖风险
- <risks that /kit-check must review>

### 下一条命令
`/kit-check diff`
```

Do not claim the work is ready for user acceptance until `/kit-check` has made a go/no-go judgment.

---

## Implementation Closure 5-Item

Before claiming any task complete, verify:

1. **build 无错误** — Run the project's build command. Zero errors.
2. **lint 无 error** — Run the project's lint command. Zero errors (warnings acceptable if documented).
3. **无控制台红色错误** — Open the running application in browser/devtools. No red console errors.
4. **新增代码接入真实调用链** — The new code is actually called by existing code, not orphaned. Verify via static analysis or runtime trace.
5. **新增日志/告警验证真实路径触发** — Add a temporary log or verify that the new code path is exercised. Remove temporary logs before final commit.

### Hedge Adversarial Check (Item 6)

After the 5 items pass, run a targeted hedge attack before claiming completion:

```
Implementation Closure 5-Item ✅
    │
    ▼
┌─────────────────────────────┐
│  Hedge Quick Check          │
│  `/hedge --quick`           │
│  Target: changed files only │
└─────────────────────────────┘
    │
    ├─ Pass (score ≥ 75) → Task complete
    └─ Fail (score < 75)  → Return to fix loop
```

**Hedge trigger conditions in /kit-run:**
- Always run `--quick` mode on changed files before task completion
- Run `--security` mode when code touches: auth, file upload, DB, external API calls
- Run `--deep` mode before `/kit archive` (final gate)
- If hedge finds Critical/High issues → block completion, return to fix
- **Guard**: If `/hedge` skill is not installed, perform a manual self-check using the Vibe Coding 18-item checklist (`modes/check.md`), record "hedge skipped: skill not found" in `.kit/audit-log.md`, and do not claim final ready/complete until the user explicitly accepts the missing adversarial-check risk.

**Integration with Codex:**
Before invoking Codex, verify the CLI is available:
```powershell
# Guard: verify Codex CLI is installed
try { codex --version } catch {
  Write-Warning "Codex CLI not found. Install with: npm install -g @openai/codex"
  # Fallback: use Claude Agent tool for implementation instead
}
```
After Codex completes implementation, run:
```powershell
codex exec --cd <project-dir> "Run hedge quick check on changed files. If score < 75, fix issues and re-verify."
```

If any item fails (including hedge), the task is not complete. Fix and re-verify.

---

## Codex Integration Contract

Codex participates via CLI, not as a skill host:

```powershell
# Read .plan/SPEC.md first, then implement the task
codex exec --cd <project-dir> "Read .plan/SPEC.md and .plan/CHECKLIST.md, then implement the next unchecked task. Follow the pre-code gate and file-write 4-item self-check."
```

Rules:

- Codex receives context through files (`.plan/SPEC.md`, `.plan/CHECKLIST.md`), not through skill format.
- Codex does not read `SKILL.md` or `modes/*.md`. The calling agent (Claude Code) translates KIT rules into Codex prompts.
- Codex output is treated as implementation code, not as planning or review.
- After Codex completes, run `/kit-check diff` to verify quality before accepting.

---

## Parallel Execution

Use Claude Code's native Agent tool for parallel task execution:

```
Agent tool with isolation:"worktree" or explicit cwd
```

Rules:

- Do not depend on OMC `team`, `ultrawork`, or `ralph` for parallel execution.
- Each parallel agent receives a copy of `.plan/SPEC.md` and the relevant CHECKLIST tasks.
- Agents work in `project-eval/` sandbox, never in the main project directly.
- Merge results back to main project only after `/kit-check` passes.
- Maximum recommended parallel agents: 3 for standard projects, 5 for deep projects.

---

## Sub-Agent Launch Checklist

硬性顺序：沙盒就绪 → TEST.md 就位 → 才启动子代理

扩展检查清单（9项）：

- [ ] 沙盒目录存在且为空（或已清理）
- [ ] TEST.md 存在于沙盒根目录
- [ ] README.md 存在于沙盒根目录
- [ ] 主项目 git 状态干净（无未提交更改）
- [ ] VARIABLES.md 已记录且用户已确认（实验场景）
- [ ] 磁盘空间充足（实验场景：预估每组大小 × 组数）
- [ ] 依赖环境已就绪（Node/Python/CUDA 等）
- [ ] 心跳监控已配置（长任务场景）
- [ ] 子代理的 cwd 指向沙盒（非主项目）

**执行顺序**：

```
1. 创建沙盒目录（git clone 或 cp -r）
2. 将模板 README.md + TEST.md 复制到沙盒根目录
3. 运行检查清单（9项逐项确认）
4. ──────────────────────────────
5. 才启动子代理（Agent tool + isolation:"worktree" 或指定 cwd）
```

**隔离规则**：
- 子代理只读 `project/`，只写 `project-eval/`
- 子代理不得在沙盒外创建或修改文件
- 子代理的 stdout/stderr 应定向到 `logs/` 以便监控
