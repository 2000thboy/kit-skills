# kit-skills v2.0

# 自动巡航状态跟踪模板

供 `/kit-loop` 自动巡航模式使用。
记录巡航全程状态，支持中断恢复和审计追溯。

---

## 巡航元信息

```markdown
## 巡航元信息

| 字段 | 值 |
|------|-----|
| 巡航ID | {{loop_id}} （格式: `loop-YYYYMMDD-HHMMSS-{{random}}`） |
| 启动时间 | {{start_timestamp}} |
| 持续时间 | {{duration}} （自动计算: 当前时间 - 启动时间） |
| 当前检查点 | {{current_checkpoint}} |
| 巡航范围 | {{scope}} （full / diff / <module>） |
| 最大轮次 | {{max_rounds}} （默认 3） |
| 当前轮次 | {{current_round}} |
| 执行者 | {{agent_name}} |
| 用户确认模式 | {{auto / manual / hybrid}} |
```

---

## 已完成的任务列表

```markdown
## 已完成的任务

| 序号 | 任务 | 完成时间 | 证据路径 | 结果 |
|------|------|----------|----------|------|
| 1 | {{task_name}} | {{timestamp}} | `{{evidence_path}}` | {{pass/fail/skip}} |
| 2 | {{task_name}} | {{timestamp}} | `{{evidence_path}}` | {{pass/fail/skip}} |
| 3 | ... | ... | ... | ... |
```

### 任务详情（每项展开）

```markdown
### Task {{n}}: {{task_name}}

**目标**: {{objective}}
**执行步骤**:
1. {{step_1}}
2. {{step_2}}
**发现**:
- {{finding_1}}
- {{finding_2}}
**修复**（如适用）:
- {{fix_description}}
- {{commit_hash}} （如已提交）
**证据**: `{{evidence_path}}`
**结果**: {{pass / fail / fixed / skip}}
```

---

## 当前活跃任务

```markdown
## 当前活跃任务

**任务**: {{current_task_name}}
**开始时间**: {{start_time}}
**已耗时**: {{elapsed_time}}
**进度**: {{progress}}% （如可量化）
**状态**: {{in_progress / waiting_user / blocked / paused}}
**阻塞原因**（如 blocked）: {{blocker_description}}
**下一步**: {{next_action}}
```

---

## 发现的问题和修复状态

```markdown
## 问题跟踪

| ID | 问题描述 | 严重度 | 发现轮次 | 修复状态 | 修复提交 | 验证结果 |
|----|----------|--------|----------|----------|----------|----------|
| Q1 | {{description}} | P0 | 1 | {{pending/fixed/verified/wontfix}} | {{commit}} | {{pass/fail}} |
| Q2 | {{description}} | P1 | 1 | {{pending/fixed/verified/wontfix}} | {{commit}} | {{pass/fail}} |
| Q3 | {{description}} | P2 | 2 | {{pending/fixed/verified/wontfix}} | {{commit}} | {{pass/fail}} |
```

### 问题详情

```markdown
### Q{{n}}: {{title}}

**描述**: {{description}}
**位置**: `{{file_path}}:{{line}}`
**严重度**: {{P0/P1/P2}}
**发现方式**: {{static_analysis / build_error / runtime_error / user_report / divergent_inspection}}
**根因**: {{root_cause}}
**修复方案**: {{fix_plan}}
**修复状态**: {{pending / in_progress / fixed / verified / wontfix}}
**修复证据**: `{{evidence_path}}`
**回归检查**: {{pending / pass / fail}}
```

---

## 用户确认历史

```markdown
## 用户确认历史

| 序号 | 确认时间 | 确认事项 | 用户决策 | 后续动作 |
|------|----------|----------|----------|----------|
| 1 | {{timestamp}} | {{topic}} | {{approve / reject / modify / defer}} | {{action}} |
| 2 | {{timestamp}} | {{topic}} | {{approve / reject / modify / defer}} | {{action}} |
```

---

## 下次检查点计划

```markdown
## 下次检查点计划

**计划时间**: {{next_checkpoint_time}}
**检查内容**:
- [ ] {{check_item_1}}
- [ ] {{check_item_2}}
- [ ] {{check_item_3}}

**前提条件**:
- {{prerequisite_1}}
- {{prerequisite_2}}

**预计耗时**: {{estimated_duration}}
**需要用户在场**: {{yes / no}}
```

---

## 终止条件状态

```markdown
## 终止条件状态

| 终止条件 | 状态 | 说明 |
|----------|------|------|
| 连续 2 轮无新问题 | {{triggered / not_triggered}} | {{details}} |
| 问题严重性降级（P0→P1→P2） | {{triggered / not_triggered}} | {{details}} |
| 用户说 "够了" / "停止" | {{triggered / not_triggered}} | {{details}} |
| 达到最大轮次 | {{triggered / not_triggered}} | {{current}}/{{max}} |
| 发现致命错误无法自动修复 | {{triggered / not_triggered}} | {{details}} |
| 用户未响应超时（30 分钟） | {{triggered / not_triggered}} | {{details}} |

**终止决策**: {{continue / pause / terminate}}
**终止原因**（如终止）: {{reason}}
**最终报告路径**: `{{report_path}}`
```

---

## 状态文件格式（JSON，供程序读取）

```json
{
  "loop_id": "loop-20260531-120000-a1b2c3",
  "start_timestamp": "2026-05-31T12:00:00Z",
  "last_updated": "2026-05-31T12:30:00Z",
  "duration_seconds": 1800,
  "current_checkpoint": "L2-build-check",
  "current_round": 1,
  "max_rounds": 3,
  "scope": "full",
  "agent_name": "kit-check-agent",
  "user_confirm_mode": "manual",
  "tasks_completed": [
    {
      "id": "T1",
      "name": "L1-static-analysis",
      "completed_at": "2026-05-31T12:05:00Z",
      "evidence_path": ".test/ai/evidence/2026-05-31-l1/",
      "result": "pass"
    }
  ],
  "current_task": {
    "id": "T2",
    "name": "L2-build-check",
    "started_at": "2026-05-31T12:05:30Z",
    "status": "in_progress",
    "progress_percent": 60
  },
  "issues": [
    {
      "id": "Q1",
      "description": "发现硬编码 hex 颜色 #1890ff",
      "severity": "P1",
      "round_found": 1,
      "fix_status": "pending",
      "file_path": "src/components/Button.tsx",
      "line": 15
    }
  ],
  "user_confirmations": [],
  "next_checkpoint": {
    "planned_time": "2026-05-31T12:35:00Z",
    "items": ["L3-browser-check"],
    "prerequisites": ["L2 通过"]
  },
  "termination": {
    "decision": "continue",
    "conditions": {
      "no_new_issues_2_rounds": false,
      "severity_downgraded": false,
      "user_stop": false,
      "max_rounds_reached": false,
      "fatal_error": false,
      "user_timeout": false
    }
  }
}
```

---

## 使用说明

1. 巡航启动时创建此文件，保存到 `.omc/state/loops/{{loop_id}}.md`
2. 同时维护 JSON 版本供程序读取：`.omc/state/loops/{{loop_id}}.json`
3. 每完成一个任务或发现问题时更新
4. 用户确认后追加到 "用户确认历史"
5. 巡航终止后归档到 `.omc/state/loops/archive/`
