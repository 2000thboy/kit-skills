# SPEC: Kit-Skills 模型评估与选择机制

## 目标
在 kit-skills 的头脑风暴、需求澄清和归档环节中，加入模型评估与选择机制，帮助用户根据项目特性选择最优 AI 模型。

## 修改范围

### 1. modes/kit.md — 头脑风暴阶段增强
- 新增 "模型选择评估" 环节
- 负面提示词（Negative Prompts）：明确告诉用户什么模型不适合做什么
- 模型对比矩阵：codex vs claude vs gpt vs 其他
- 询问用户可用模型预算/配额
- vibe coding 表现评估

### 2. knowledge/model-selection.md — 新增模型知识库
- 各模型成本对比（$/1M tokens）
- 生图/代码/长文本/多模态能力矩阵
- 最优场景推荐
- 更新频率说明（知识会过时，需标注最后更新时间）

### 3. modes/run.md — 执行阶段模型路由
- 根据选择的模型调整执行策略
- Codex 优先 vs Claude 优先的决策逻辑
- 模型切换的 fallback 机制

### 4. templates/plan/SPEC.md — 模板更新
- 新增 "模型选择" 章节
- 模型假设和约束记录

## 核心设计

### 负面提示词（Negative Prompts）
在头脑风暴时，PM 不仅推荐最佳模型，还要明确警告：
- "不要用 Claude 做生图，效果不好且成本高"
- "不要用 GPT-4 做长上下文代码审查，容易遗漏"
- "不要用 Codex 做需求分析，它擅长执行而非规划"

### 模型选择 AskUserQuestion
```
基于你的项目特性，推荐模型组合：
- 规划/分析：Claude (长上下文、推理强)
- 编码执行：Codex (代码生成效果好、成本低)
- 生图：DALL-E / Midjourney / Seedream
- 你的可用模型有哪些？
- 你的预算/配额限制？
```

### 知识库更新机制
- 每条知识标注 `last_verified: YYYY-MM-DD`
- 超过 30 天的知识标记为 `⚠️ may be outdated`
- 自动触发 WebSearch 验证最新信息
