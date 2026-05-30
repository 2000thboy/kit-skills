# OMC / OWM-Style Framework

## 命名说明

本包把用户口中的 `OWM` 默认按 `OMC` 一类的 orchestration framework 理解：多 agent、多模式、多工具、多阶段执行。如果你的团队另有一个正式叫 OWM 的框架，以项目 PRD/SPEC 中的定义为准。

## 一句话

OMC 类框架解决的是“谁来干活、怎么分工、怎么并行、怎么留痕”。它强在编排，不强在替你定义产品事实。

## KIT 应该借鉴什么

- mode routing：先判断 brainstorm、建档、归档、执行、验证。
- state awareness：重启后先读当前事实，不靠记忆硬猜。
- role ownership：规划、执行、审查、验证分清楚。
- approval gates：该停的时候停，不把平台/人工确认伪装成完成。
- artifact capture：每次重要执行要有证据路径。

## KIT 不应该复制什么

- 不把所有 agent 列表塞进 SKILL.md。
- 不把 research、QA、browser、publisher 都变成 KIT Core。
- 不强制所有项目都使用同一种团队运行时。
- 不用复杂编排掩盖需求没想清楚。

## 和 KIT 的关系

| 问题 | OMC 类框架 | KIT |
|---|---|---|
| 多 agent 并行 | 强 | 只记录是否需要 |
| 任务执行 | 强 | 定义任务契约 |
| 当前产品事实 | 弱或依赖项目 | 强 |
| 需求漂移拦截 | 取决于规则 | 强 |
| 验收证据归档 | 可做 | 强制记录 |

## 推荐默认

先用 KIT 把产品目标、边界、任务、证据和 stop gate 写清楚。需要多 agent 深查、并行实现或强 QA 时，再路由给 OMC 类能力。顺序反了，就是让一群执行器围着一个没定义清楚的问题转圈。
