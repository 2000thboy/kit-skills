# kit-skills v2.0

# 质量报告模板

供 `/kit-check` 产出报告时使用。
AI 按此模板填充检查结果，生成 Markdown 报告。

---

## 报告头

```markdown
# 质量检查报告

| 字段 | 值 |
|------|-----|
| 项目名 | {{project_name}} |
| 检查时间 | {{timestamp}} |
| 检查范围 | {{scope}} （full / diff / <module>） |
| 执行者 | {{agent_name}} |
| 检查轮次 | {{loop_round}} / {{max_rounds}} |
| 关联提交 | {{git_commit}} |
```

---

## 执行摘要

```markdown
## 执行摘要

| 类别 | 数量 |
|------|------|
| 通过 | {{pass_count}} |
| 失败 | {{fail_count}} |
| 警告 | {{warn_count}} |
| 需用户确认 | {{confirm_count}} |

**总体结论**: {{pass / conditional_pass / fail}}

**关键发现**:
- {{finding_1}}
- {{finding_2}}
- {{finding_3}}
```

---

## L1 检查结果（静态分析）

```markdown
## L1: 静态分析

### 代码质量
- [ ] {{result}} 无未使用 import（eslint: `no-unused-vars`）
- [ ] {{result}} 无 TypeScript 编译 error（`tsc --noEmit`）
- [ ] {{result}} 无类型不匹配（strict mode）
- [ ] {{result}} 无 console.log 残留（生产代码）

### 规范合规
- [ ] {{result}} 图标来源合规（无 emoji，来自声明库）
- [ ] {{result}} 颜色来源合规（无硬编码 hex，使用 design token）
- [ ] {{result}} 命名规范一致（组件 PascalCase，hook camelCase）
- [ ] {{result}} 文件组织符合项目约定

**证据路径**: `.test/ai/evidence/{{date}}-l1/`
```

---

## L2 检查结果（构建时检查）

```markdown
## L2: 构建时检查

### 构建验证
- [ ] {{result}} `npm run build` exit 0
- [ ] {{result}} `npm run lint` error count 0
- [ ] {{result}} `npm run type-check` 通过
- [ ] {{result}} 包体积无异常增长（< {{threshold}}%）

### API 契约
- [ ] {{result}} API 路径与文档一致
- [ ] {{result}} 请求/响应格式符合契约
- [ ] {{result}} 无 mock 数据残留
- [ ] {{result}} 错误码处理完整

### 控制台
- [ ] {{result}} 浏览器控制台无红色 error
- [ ] {{result}} 无未捕获 Promise rejection
- [ ] {{result}} 无 404 资源加载

**证据路径**: `.test/ai/evidence/{{date}}-l2/`
```

---

## L3 检查清单（浏览器检查，待用户确认）

```markdown
## L3: 浏览器检查（需用户确认或 Playwright 验证）

### UI 层
- [ ] 元素无遮挡/重叠（z-index、overflow、position）
- [ ] 响应式三断点正常（mobile / tablet / desktop）
- [ ] 文本无截断/溢出（长文本、多语言）
- [ ] 无 mock/loading 占位残留
- [ ] 空状态已处理（列表空、搜索无结果、断网）
- [ ] 错误状态已处理（表单验证、API 错误、权限不足）
- [ ] 图标来自声明库，无 emoji
- [ ] 颜色来自 design token，无硬编码 hex
- [ ] 滚动正常，无边界问题
- [ ] 触摸目标 >= 44px（mobile）

### 数据层
- [ ] API 响应真实（非 mock）
- [ ] CRUD 操作完整（Create/Read/Update/Delete）
- [ ] 表单提交后数据持久化（刷新验证）
- [ ] 加载状态真实反映 API
- [ ] 错误信息具体有用（非 "Something went wrong"）
- [ ] 分页/无限滚动正确

### 功能层
- [ ] 所有按钮有实际行为
- [ ] 所有路由有实际页面
- [ ] 所有表单有验证
- [ ] 所有链接可跳转

**验证方式**: {{user_manual_check / playwright_auto / hybrid}}
**证据路径**: `.test/ai/evidence/{{date}}-l3/`
```

---

## 发散检查发现

```markdown
## 发散检查（Divergent Inspection）

**触发原因**: {{trigger_issue}}

**扩展检查区域**:
1. {{area_1}}: {{finding}}
2. {{area_2}}: {{finding}}
3. {{area_3}}: {{finding}}

**新增发现**:
- {{new_finding_1}} （严重度: {{P0/P1/P2}}）
- {{new_finding_2}} （严重度: {{P0/P1/P2}}）
```

---

## 修复建议（按优先级排序）

```markdown
## 修复建议

### P0 — 必须立即修复
1. **[{{issue_title}}]**
   - 位置: `{{file_path}}:{{line}}`
   - 问题: {{description}}
   - 修复: {{suggestion}}
   - owner: {{agent}}

2. **[{{issue_title}}]**
   - ...

### P1 — 应在本轮修复
1. **[{{issue_title}}]**
   - ...

### P2 — 可延后处理
1. **[{{issue_title}}]**
   - ...
```

---

## 用户确认项

```markdown
## 用户确认项

以下问题需要用户决定：

1. **{{question_title}}**
   - 背景: {{context}}
   - 选项 A: {{option_a}}
   - 选项 B: {{option_b}}
   - 建议: {{recommendation}}

2. **{{question_title}}**
   - ...
```

---

## 沉淀记录

```markdown
## 沉淀记录

以下发现建议写入 `.kit/quality-patterns.md`：

```markdown
## {{date}} — {{pattern_name}}

**场景**: {{scenario}}
**表现**: {{symptom}}
**根因**: {{root_cause}}
**修复**: {{fix}}
**预防**: {{prevention}}
```

**已写入**: {{yes / no — 待用户确认后写入}}
```

---

## 报告尾部

```markdown
---

**报告生成时间**: {{timestamp}}
**下次检查建议**: {{next_check_recommendation}}
**关联文件**:
- `.plan/CHECKLIST.md`
- `.kit/config.json`
- `.kit/quality-patterns.md`
- `.test/ai/evidence/{{date}}/`
```

---

## 使用说明

1. AI 执行 `/kit-check` 后，按此模板填充内容
2. `{{variable}}` 为占位符，执行时替换为实际值
3. `{{result}}` 使用 `[PASS]` / `[FAIL]` / `[WARN]` / `[N/A]` 标记
4. 报告保存到 `.test/ai/reports/YYYY-MM-DD-HH-mm-ss-quality-report.md`
5. 关键证据（截图、日志）保存到 `.test/ai/evidence/YYYY-MM-DD/`
