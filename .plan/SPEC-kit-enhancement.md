# SPEC: Kit-Skills 用户确认 + PM 审计增强

## 目标
增强 kit-skills 的 `/kit` 模式，强制每个环节（PRD/SPEC/CHECKLIST）都必须经过用户确认，并引入毒舌 PM 审计机制。

## 背景
当前 kit-skills 的 `/kit` 模式在生成 PRD/SPEC/CHECKLIST 后直接进入下一阶段，缺乏强制用户确认环节。用户要求：
1. 头脑风暴增加对话轮次
2. 每个文档必须经用户确认
3. 毒舌 PM 视角审计计划
4. 不清楚的地方直接反馈给用户

## 修改范围

### 文件 1: `modes/kit.md` — 核心修改

#### 1.1 Brainstorm 阶段增强（Scale-Aware）
- **当前**: 1轮头脑风暴后直接输出
- **目标**: Scale-aware 强制对话轮次
  - `quick` (<1天): **1轮** 头脑风暴，输出后直接建档（不强制多轮）
  - `standard` (2-5天): **1-2轮**，第1轮输出分析，用户反馈后第2轮细化
  - `deep` (1+周): **≥2轮**，每轮必须 `AskUserQuestion` 获取反馈
  - 每轮记录到 `.kit/brainstorm-log.md`
  - **用户可随时说"跳过"提前结束头脑风暴**

#### 1.2 用户确认门（User Confirmation Gate）
在每个文档生成后插入确认门：

**Scale-Aware 确认门简化规则：**

| Scale | 确认门 | PM审计 | 说明 |
|-------|--------|--------|------|
| `quick` | 1个（PLAN.md 整体确认） | 合并到1份快速审计 | 不拆分PRD/SPEC/CHECKLIST |
| `standard` | 3个（PRD→SPEC→CHECKLIST各1） | 每阶段独立审计 | 标准流程 |
| `deep` | 3个 + 架构评审确认 | 每阶段独立审计 + 架构专项 | 最严格 |

```
生成 PRD → [PM Audit] → AskUserQuestion(确认/修改/重生成) → 通过后生成 SPEC
生成 SPEC → [PM Audit] → AskUserQuestion(确认/修改/重生成) → 通过后生成 CHECKLIST
生成 CHECKLIST → [PM Audit] → AskUserQuestion(确认/修改/重生成) → 通过后进入 kitrun
```

确认门规则：
- 用户说"确认" / "就这样" → 通过（必须有明确确认词）
- 用户说"修改" → 记录修改点到 `.kit/feedback.md`，重新生成当前文档
- 用户说"重生成" → 回到当前阶段起点重新生成（不丢失已确认阶段）
- 用户3次未确认 → 暂停并输出风险警告，询问"是否跳过当前阶段继续"或"终止本次 KIT 流程"
- 用户可随时说"跳过"跳过当前确认门（记录到 `.kit/audit-log.md`）

**确认标记格式**：每个文档底部添加确认标记
```markdown
---
✅ 用户确认: [用户名] | 时间: YYYY-MM-DD HH:MM | 版本: hash
```

#### 1.3 PM 审计环节（新增）
在 PRD/SPEC/CHECKLIST 之间插入 PM 审计：

```
生成 PRD → PM Audit → 用户确认 → 生成 SPEC → PM Audit → 用户确认 → 生成 CHECKLIST → PM Audit → 用户确认 → kitrun
```

PM 审计输出 `.kit/pm-audit-prd.md` / `.kit/pm-audit-spec.md` / `.kit/pm-audit-checklist.md`：

**PM 审计建设性约束（必须遵守）：**
- 每条批评必须附带**具体修复建议**（不只是指出问题，还要说"怎么改"）
- 禁止人身攻击，批评对象是**计划/文档**而非用户本人
- 对初学者项目降低语气强度：使用"建议"替代"必须"，"考虑"替代"明显错误"
- 初学者判定：MEMORY.md 中 `user_role = 初学者` 或 scale = quick
- 每条 🔴 阻断项必须附带：问题描述 + 为什么阻断 + 修复建议 + 修复后如何验证

**PM 审计检查清单：**
- [ ] 目标是否模糊？（用户是谁？解决什么痛点？）
- [ ] 范围是否蔓延？（当前阶段是否包含不属于此阶段的内容？）
- [ ] 验收标准是否可观测？（"好用"→"加载时间<2秒"）
- [ ] 技术风险是否记录？（依赖项、无返回点、已知风险）
- [ ] 是否有 video-reader 等媒体处理？（检查安全风险）
- [ ] 硬编码假设是否被标记？（路径、端口、模型别名等）
- [ ] 是否有未回答的关键问题？（阻塞决策的问题）

**输出格式：**
```markdown
# PM Audit: [stage]

## 🔴 阻断项（必须修复）
| # | 问题 | 修复建议 | 验证方式 |

## 🟠 警告项（强烈建议修复）
| # | 问题 | 修复建议 | 验证方式 |

## 🟡 建议项（可选优化）
| # | 问题 | 修复建议 | 验证方式 |

## 总体评价
[一句话总结，对初学者用鼓励语气]
```

#### 1.4 三件套审查契约
在 Output Contract 中增加：
- PRD 未经用户书面确认 → 不得生成 SPEC
- SPEC 未经用户书面确认 → 不得生成 CHECKLIST
- CHECKLIST 未经用户书面确认 → 不得进入 kitrun
- 违反以上规则视为流程违规，记录在 `.kit/violations.md`

#### 1.6 Video-Reader 安全集成
在 PM 审计清单和 skill-hedge 域检查中增加视频处理专项：

**媒体处理技能风险检查（新增到 hedge Domain Hedge）：**

| ID | 检查项 | 失败模式 | 严重度 |
|----|--------|---------|--------|
| M1 | 路径遍历防护 | 用户输入路径未做 sanitization 直接用于文件操作 | 🔴 |
| M2 | 命令注入防护 | subprocess.run 拼接用户输入路径 | 🔴 |
| M3 | SSRF 防护 | 视频 URL 下载未做白名单/黑名单 | 🔴 |
| M4 | Cookie 隔离 | 提取浏览器 cookies 未使用专用 profile | 🟠 |
| M5 | 资源限制 | 无视频大小/时长/内存限制 | 🟠 |
| M6 | 输出目录保护 | `--output-dir` 直接覆盖不确认 | 🟡 |
| M7 | 敏感内容检测 | 视频处理无内容安全过滤 | 🟠 |
| M8 | 版权/隐私标记 | 未标记可能涉及的版权或隐私风险 | 🟡 |

**在 kit-check L2 检查中增加：**
- 扫描所有 skills 中 subprocess/system/eval/exec 调用
- 扫描所有 skills 中 URL/路径拼接操作
- 扫描所有 skills 中 cookie/token 提取操作
- 产出 `.test/ai/reports/media-skill-risk-scan.md`

**在 kitrun Pre-Code 5-Step Gate 中增加：**
- 步骤 2（读取项目配置）中检查是否有 `.video-reader-risk-assessment.md`
- 如有媒体处理技能，必须完成风险评估后才能进入编码

### 文件 2: `modes/run.md` — 调用契约更新
- 更新 Codex 集成契约：Codex 也必须遵循用户确认门
- 在 Pre-Code 5-Step Gate 中增加：检查 `.kit/pm-audit-*.md` 是否通过

### 文件 3: `quality/pre-code.md` — 质量门禁
- 新增 "User Confirmation Gate" 检查项
- 检查 PRD/SPEC/CHECKLIST 是否有用户确认标记

#### 1.5 归档变更确认（Scope Drift 增强）
在 `Continuation And Scope Drift Gate` 中增强：
- 归档前若检测到计划目标变更（direction_change / new_project_candidate）
- 必须 `AskUserQuestion` 确认变更内容
- 输出变更对比报告 `.kit/scope-drift-report.md`
- 用户未确认前不得执行归档操作
- 变更确认记录写入 `.kit/decisions.md`

## 验收标准
- [ ] Brainstorm 强制 ≥2 轮对话
- [ ] PRD/SPEC/CHECKLIST 每个都有用户确认记录
- [ ] PM 审计输出 .md 文件
- [ ] 有 🔴 项时流程被阻断
- [ ] 三件套审查契约写入 Output Contract
- [ ] kitrun 前检查 PM 审计通过状态
- [ ] 归档变更必须经用户确认

## 版本
- 从 `0.3.0` 升级到 `0.4.0`
- 更新 `.kit/version.json`、`package.json`、`AGENTS.md`、`CLAUDE.md` 中的版本引用

## 风险
- 增加对话轮次可能降低效率（quick 项目需要简化）
- PM 审计过于毒舌可能影响用户体验
- 缓解：scale-aware 调整（quick 项目可简化确认流程）

## 执行检查清单
- [ ] 更新 `modes/kit.md`（brainstorm + 确认门 + PM审计 + 归档变更确认）
- [ ] 更新 `modes/run.md`（Codex 契约 + kitrun 前检查）
- [ ] 更新 `quality/pre-code.md`（用户确认门检查项）
- [ ] 更新 `bin/spec-loop-kit.mjs`（PM审计状态检查）
- [ ] 更新 `knowledge/question-bank.json`（UC* + PM* 问题系列）
- [ ] 更新模板 `templates/plan/*.md`（确认门和PM审计占位符）
- [ ] 更新版本号到 0.4.0
- [ ] 提交并 push
