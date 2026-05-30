# kit-skills v2.0

# 会话连续性模板（Session Brief）

继承 super-dev SESSION_BRIEF 机制，改编为 kit 风格。
每个会话开始和结束时使用，确保上下文不丢失。

---

## 会话开始状态

```markdown
## 会话开始状态

### 项目快照
| 字段 | 值 |
|------|-----|
| 项目名 | {{project_name}} |
| 当前阶段 | {{stage}} |
| 进度 | {{progress}}% |
| 已完成任务 | {{completed_tasks}} / {{total_tasks}} |
| 当前目标 | {{current_goal}} |
| 优先级 | {{priority}} |
| 阻塞项 | {{blockers}} |

### .kit/config.json 读取结果
```json
{{config_json_snapshot}}
```

### 上次会话中断点（如适用）
- **中断文件**: `.kit/interrupted/{{interrupted_file}}`
- **中断时间**: {{interrupted_time}}
- **当时正在**: {{interrupted_task}}
- **已做决定**: {{interrupted_decisions}}
- **下一步**: {{interrupted_next_step}}
```

---

## 本次会话目标

```markdown
## 本次会话目标

**主目标**: {{primary_objective}}

**子任务**:
1. {{subtask_1}}
2. {{subtask_2}}
3. {{subtask_3}}

**成功标准**:
- {{success_criterion_1}}
- {{success_criterion_2}}

**预计耗时**: {{estimated_duration}}
**需要用户决策**: {{yes / no — 如 yes，列出决策点}}
```

---

## 已完成的决策

```markdown
## 已完成的决策

| 时间 | 决策 | 决策依据 | 影响 | 记录位置 |
|------|------|----------|------|----------|
| {{time}} | {{decision}} | {{rationale}} | {{impact}} | `.kit/decisions.md#L{{line}}` |
| {{time}} | {{decision}} | {{rationale}} | {{impact}} | `.kit/decisions.md#L{{line}}` |
```

---

## 待解决的问题

```markdown
## 待解决的问题

| 优先级 | 问题 | 阻塞程度 | 计划解决时间 | 负责人 |
|--------|------|----------|--------------|--------|
| P0 | {{issue}} | {{blocking / non-blocking}} | {{target_date}} | {{owner}} |
| P1 | {{issue}} | {{blocking / non-blocking}} | {{target_date}} | {{owner}} |
| P2 | {{issue}} | {{blocking / non-blocking}} | {{target_date}} | {{owner}} |
```

---

## 下次会话建议

```markdown
## 下次会话建议

**建议启动时间**: {{next_session_recommendation}}

**建议优先处理**:
1. {{priority_task_1}}
2. {{priority_task_2}}

**需要准备**:
- {{prerequisite_1}}
- {{prerequisite_2}}

**风险提醒**:
- {{risk_1}}
- {{risk_2}}

**上下文恢复路径**:
1. 读取 `.kit/config.json`
2. 读取 `.plan/CHECKLIST.md` 当前任务
3. 读取 `.kit/decisions.md` 最近 10 条
4. 读取本文件（session-brief）
```

---

## 相关文件引用

```markdown
## 相关文件引用

### 事实源（Source of Truth）
- `.plan/PRD.md` — 产品需求
- `.plan/SPEC.md` — 技术规格
- `.plan/CHECKLIST.md` — 任务清单
- `.kit/config.json` — 项目状态
- `.kit/decisions.md` — 决策记录
- `.kit/version.json` — 版本合同

### 当前会话文件
- `.kit/interrupted/{{session_file}}` — 中断快照（如适用）
- `.test/ai/evidence/{{date}}/` — 本次证据
- `.test/ai/reports/{{date}}-report.md` — 本次报告

### 质量门禁参考
- `quality/pre-code.md` — 编码前 5 步
- `quality/post-code.md` — 编码后 5 项
- `quality/ui.md` — UI 检查清单
- `quality/data.md` — 数据检查清单
- `quality/api.md` — API 检查清单
```

---

## 会话结束更新清单

会话结束时，AI 必须完成以下更新：

- [ ] 更新 `.kit/config.json`:
  - `stage` — 当前阶段
  - `progress` — 进度百分比
  - `completed_tasks` — 已完成任务数
  - `next_tasks` — 下一步任务列表
  - `blockers` — 当前阻塞项
  - `last_updated` — 更新时间戳

- [ ] 若会话中断:
  - 创建 `.kit/interrupted/YYYY-MM-DD-<topic>.md`
  - 包含：正在做什么、已决定什么、下一步是什么

- [ ] 若有关键决策:
  - 追加到 `.kit/decisions.md`
  - 格式: `YYYY-MM-DD HH:MM — {decision} — {rationale}`

- [ ] 更新本文件（session-brief）:
  - 填充 "已完成的决策"
  - 填充 "待解决的问题"
  - 填充 "下次会话建议"

---

## 快速恢复命令

```markdown
## 快速恢复

用户说 "继续" 或 "恢复" 时，AI 执行：

1. 读取 `.kit/config.json` → 获取当前状态
2. 读取 `.kit/interrupted/` → 检查是否有中断会话
3. 读取 `.plan/CHECKLIST.md` → 确认当前任务
4. 读取 `.kit/decisions.md` → 恢复最近上下文
5. 呈现状态简报:
   ```
   当前状态: <stage> <progress>%
   终点: <definition_of_done>
   方向变化: none | minor | scope_expansion | direction_change
   下一步: <next_safe_action>
   ```
6. 询问用户: "继续上次任务，还是开始新任务？"
```

---

## 使用说明

1. **会话开始**: AI 读取 `.kit/config.json` 和相关文件，填充 "会话开始状态"
2. **会话进行中**: AI 实时更新 "已完成的决策" 和 "待解决的问题"
3. **会话结束**: AI 完成 "会话结束更新清单"，保存本文件到 `.kit/session-brief.md`
4. **跨会话恢复**: 下次会话开始时读取 `.kit/session-brief.md` 快速恢复上下文
5. **归档**: 项目归档时，session-brief 历史保存到 `.plan/archive/YYYY-MM/session-briefs/`
