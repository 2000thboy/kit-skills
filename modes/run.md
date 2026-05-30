# /kit-run Mode — kit-skills v2.0

Execution layer: coding, testing, running.

---

## Command Surface

```
/kit-run                       → View current execution status
/kit-run start                 → Begin execution per SPEC task list
/kit-run test                  → Run tests
/kit-run smoke                 → Smoke test
```

## Responsibilities

- Read `.plan/SPEC.md` and `.plan/CHECKLIST.md`
- Enforce pre-code 5-step gate before any implementation
- Enforce file-write 4-item self-check before every file write
- Follow frontend-first flow for UI projects
- Verify implementation closure 5-item before claiming completion
- Integrate Codex via CLI contract, not skill format
- Use Claude Code Agent tool for parallel execution (no OMC dependency)

---

## Pre-Code 5-Step Gate

Before writing any code:

1. **技术栈预研** — Search official docs for APIs, SDKs, frameworks. Do not guess signatures or behavior.
2. **读取项目配置** — Read `tsconfig.json`, `super-dev.yaml`, `.env`, `package.json`, or equivalent. Understand existing constraints.
3. **声明 UI 工具链** — Lock icon library (Lucide / Heroicons / Tabler) and design token system. Record in `docs/ui-ux/design-system.md` or `.kit/config.json`.
4. **确认 API 契约和设计 token** — Verify backend API shape, response schema, and design token availability before frontend implementation.
5. **建立页面结构 + 验证构建零错误** — Scaffold page/routing structure and run a build to confirm zero errors before filling in details.

If any step fails, stop and report the blocker. Do not proceed to implementation with unresolved gate failures.

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

## Implementation Closure 5-Item

Before claiming any task complete, verify:

1. **build 无错误** — Run the project's build command. Zero errors.
2. **lint 无 error** — Run the project's lint command. Zero errors (warnings acceptable if documented).
3. **无控制台红色错误** — Open the running application in browser/devtools. No red console errors.
4. **新增代码接入真实调用链** — The new code is actually called by existing code, not orphaned. Verify via static analysis or runtime trace.
5. **新增日志/告警验证真实路径触发** — Add a temporary log or verify that the new code path is exercised. Remove temporary logs before final commit.

If any item fails, the task is not complete. Fix and re-verify.

---

## Codex Integration Contract

Codex participates via CLI, not as a skill host:

```powershell
# Read .plan/SPEC.md first, then implement the task
codex exec --cd <project-dir> "Read .plan/SPEC.md and .plan/CHECKLIST.md, then implement the next unchecked task. Follow the pre-code 5-step gate and file-write 4-item self-check."
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

扩展检查清单（8项）：

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
3. 运行检查清单（8项逐项确认）
4. ──────────────────────────────
5. 才启动子代理（Agent tool + isolation:"worktree" 或指定 cwd）
```

**隔离规则**：
- 子代理只读 `project/`，只写 `project-eval/`
- 子代理不得在沙盒外创建或修改文件
- 子代理的 stdout/stderr 应定向到 `logs/` 以便监控
