# AI Model Selection Guide for KIT Projects

> **⚠️ 知识时效性**: 本文件信息可能随模型更新而过时。每条记录标注 `last_verified` 日期，超过 30 天请用 WebSearch 验证最新信息。
> **Last Updated**: 2026-05-31

---

## 模型对比矩阵（2026-05）

| 模型 | 供应商 | 代码 | 生图 | 长文本 | 推理 | 成本($/1M tokens) | 最佳场景 |
|------|--------|------|------|--------|------|-------------------|---------|
| **Codex** | OpenAI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | $3 input / $15 output | 编码执行、CLI工具、脚本生成 |
| **Claude 4 Opus** | Anthropic | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $15 input / $75 output | 架构设计、需求分析、长文档 |
| **Claude 4 Sonnet** | Anthropic | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $3 input / $15 output | 标准编码、代码审查、中端任务 |
| **Claude 4 Haiku** | Anthropic | ⭐⭐⭐ | ❌ | ⭐⭐⭐ | ⭐⭐⭐ | $0.25 input / $1.25 output | 快速响应、简单任务、边缘场景 |
| **GPT-5** | OpenAI | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $5 input / $20 output | 通用任务、多模态理解 |
| **DALL-E 4** | OpenAI | ❌ | ⭐⭐⭐⭐⭐ | ❌ | ❌ | $0.04/image | 高质量生图、海报、封面 |
| **Seedream** | 字节跳动 | ❌ | ⭐⭐⭐⭐ | ❌ | ❌ | ¥0.1/image | 中文场景、快速生图 |
| **Midjourney v7** | Midjourney | ❌ | ⭐⭐⭐⭐⭐ | ❌ | ❌ | $10/month | 艺术风格、概念设计 |

---

## 负面提示词（Negative Prompts）

> 明确告诉用户**不要**用什么模型做什么：

### ❌ 不要用 Claude 做生图
- **原因**: Claude 没有生图能力，强行用代码调用 API 效率低
- **替代**: 直接用 DALL-E / Seedream / Midjourney

### ❌ 不要用 GPT-4 做长上下文代码审查（>100K tokens）
- **原因**: 容易遗漏中间文件的关键问题，注意力衰减明显
- **替代**: Claude Opus（200K+ 上下文，注意力更均匀）

### ❌ 不要用 Codex 做需求分析和架构设计
- **原因**: Codex 擅长执行而非规划，容易产生"看似正确但不符合需求"的代码
- **替代**: Claude Opus / Sonnet 做规划，Codex 做执行

### ❌ 不要用 Haiku 做复杂调试
- **原因**: 上下文窗口小（32K），推理能力弱，容易给出表面修复
- **替代**: Sonnet / Opus 做调试，Haiku 只做简单 lint

### ❌ 不要用单一模型做全栈项目
- **原因**: 每个模型有擅长领域，单一模型会导致某些环节质量差
- **替代**: 组合使用 — Claude 规划 + Codex 编码 + 专用模型生图

---

## Vibe Coding 表现评估

| 模型 | Vibe Coding 评分 | 表现特点 |
|------|-----------------|---------|
| **Codex** | ⭐⭐⭐⭐⭐ | 最佳 vibe coding 模型，代码生成流畅，能理解模糊需求，自动补全上下文 |
| **Claude Sonnet** | ⭐⭐⭐⭐ | 代码规范性好，但需要更明确的指令，对模糊需求容易过度工程化 |
| **GPT-5** | ⭐⭐⭐⭐ | 通用性强，但代码风格不如 Codex 统一 |
| **Claude Opus** | ⭐⭐⭐ | 过于谨慎，经常要求确认，vibe coding 节奏慢 |
| **Haiku** | ⭐⭐ | 代码简单但容易出错，不适合复杂 vibe coding |

**Vibe Coding 定义**: 用户用自然语言描述需求，模型直接生成可运行代码，中间不经过详细设计文档。

---

## 成本最优策略

### 预算 < $10/月
- 规划: Haiku（免费额度）
- 编码: Codex（低额 API）
- 生图: Seedream（国内便宜）

### 预算 $50-100/月
- 规划: Sonnet
- 编码: Codex
- 审查: Sonnet
- 生图: DALL-E / Seedream

### 预算 $200+/月
- 规划: Opus
- 编码: Codex + Sonnet（并行）
- 审查: Opus
- 生图: Midjourney + DALL-E
- 调试: Sonnet

---

## 模型选择决策树

```
项目类型?
├── 纯代码/CLI工具
│   └── 推荐: Codex (主) + Claude Sonnet (审查)
├── 全栈 Web 应用
│   └── 推荐: Claude Opus (架构) + Codex (前端/后端) + Sonnet (联调)
├── 设计/原型
│   └── 推荐: Claude (需求) + Midjourney/DALL-E (视觉) + Codex (前端)
├── 数据分析/ML
│   └── 推荐: Claude Opus (分析) + Codex (pipeline) + GPT-5 (多模态)
├── 文档/内容生成
│   └── 推荐: Claude Opus (长文本) + Sonnet (校对)
└── 不确定
    └── 默认: Sonnet (平衡) → 根据反馈调整
```

---

## 询问用户的模型问题（UC* 系列）

```
UC-MODEL1: 你当前可用的 AI 模型有哪些？（Claude / Codex / GPT / 其他）
UC-MODEL2: 你的月度预算或 token 配额大约多少？
UC-MODEL3: 项目中最关键的环节是什么？（代码质量 / 生图效果 / 长文本分析 / 速度）
UC-MODEL4: 你是否接受多模型组合方案？（规划用一个模型，执行用另一个）
```

---

## 验证方法

当用户要求验证模型信息时：
1. 检查本文件 `last_verified` 日期
2. 如果超过 30 天，触发 WebSearch:
   - "Claude 4 pricing 2026"
   - "Codex vs Claude code generation comparison 2026"
   - "best AI image generation model 2026 cost"
3. 更新本文件并标注新日期

---

*本文件是 kit-skills v0.4.0+ 的模型选择参考。PM 在头脑风暴时必须引用此文件。*
