# Pure Markdown Framework

## 一句话

纯 Markdown 框架就是用 `.md` 文件管理 PRD、SPEC、CHECKLIST、决策、验收和归档。它便宜、透明、容易被任何 agent 读取。

它的问题也很明确：没有验证器时，Markdown 很快会变成“写得很像流程，实际没人执行”的展板。

## 适合什么

- 小团队或个人项目。
- 早期产品构思和快速迭代。
- 需要跨 Codex、Claude Code、OpenCode、WorkBuddy 读取同一套事实。
- 需要把历史过程和当前事实分开。

## 不适合什么

- 高频调度和强状态恢复。
- 严格审批流和复杂权限。
- 大规模并发任务系统。
- 需要数据库级审计、事件溯源或平台级工作流的团队。

## KIT 的做法

KIT 保留 Markdown 的低门槛，但补三件事：

- 固定当前事实源：`.plan/PRD.md`、`.plan/SPEC.md`、`.plan/CHECKLIST.md`。
- 固定状态入口：`.kit/`。
- 提供只读验证器：`spec-loop-kit validate` 和 `audit --json`。

## 判断标准

如果项目靠人类和 agent 轮流推进，纯 Markdown 加 validator 通常够用。如果项目已经需要自动重试、队列、权限审批、跨服务追踪，别硬撑 Markdown，应该引入真正的 workflow runtime。
