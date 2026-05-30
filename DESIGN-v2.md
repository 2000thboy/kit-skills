# Kit-Skills v2.0 一体化设计方案

## 设计目标

一个 Skill，三个命令，不路由到外面。

吸收 super-dev 精华，解决 vibe coding 反复问题，内置质量飞轮。

---

## 核心设计：三命令架构

```
/kit <subcommand>     → 产品层（建档/归档/脑暴/沙盒）
/kit-run <mode>       → 执行层（编码/测试/运行）
/kit-check <subcommand> → 质量层（检查/研究/规划）
```

---

## 对 Codex 上次审核的回应

### CRITICAL #1: Codex `/goal` 不存在
**回应**: 删除所有 `/goal` 引用。Codex 集成改用 `codex exec "<prompt>"` 或文件契约传递。

### CRITICAL #2: Claude Code vs Codex Skill 格式不兼容
**回应**: 明确主宿主为 Claude Code。Skill 按 Claude Code 格式编写。Codex 通过 CLI 调用参与，非 skill 宿主。

### CRITICAL #3: 与现有 kit-skills/super-dev 重叠
**回应**: 这不是"新建一个重叠的 skill"，而是**升级 kit-skills 到 v2.0**。原有功能保留，新增执行层和质量层。

### MAJOR #4: 发散检查在 CLI 不可行
**回应**: 分级检查策略：
- L1 静态分析（自动）
- L2 构建时检查（自动）
- L3 浏览器检查（生成清单 → 用户确认 → 运行 Playwright）

### MAJOR #5: gates/ 和 checks/ 分离
**回应**: 合并为 `quality/` 目录，按阶段组织。

### MAJOR #6: 3轮递归限制缺乏依据
**回应**: 改为自适应退出：连续2轮无新问题 / 严重性降级 / 用户确认 / 最大3轮。

### MAJOR #7: 缺少人工审核节点
**回应**: 飞轮中插入人工确认门：检查 → 报告 → [用户确认] → 修复 → 回归。

### MAJOR #8: 与 ultraqa 重叠
**回应**: 不路由到 ultraqa。质量循环内置在 `/kit-check` 中。

---

## 文件结构（一体化，不散）

```
kit-skills/
├── SKILL.md                    # 主入口：三命令路由 + 状态机（300行内）
├── README.md                   # 人类 onboarding
│
├── modes/                      # 三模式详细定义
│   ├── kit.md                  # /kit 命令完整行为
│   ├── run.md                  # /kit-run 命令完整行为
│   └── check.md                # /kit-check 命令完整行为
│
├── quality/                    # 质量门禁（合并 gates + checks）
│   ├── pre-code.md             # 编码前 5 步门禁（继承 super-dev）
│   ├── post-code.md            # 编码后冒烟
│   ├── ui.md                   # UI 质量（遮挡/响应式/mock/emoji）
│   ├── data.md                 # 数据质量
│   └── api.md                  # API 一致性
│
├── templates/
│   ├── quality-report.md       # 质量报告模板
│   ├── loop-state.md           # 飞轮状态跟踪
│   └── session-brief.md        # 会话连续性
│
└── knowledge/
    ├── anti-patterns.md        # vibe coding 反模式库
    ├── super-dev-absorbed.md   # 吸收的 super-dev 精华清单
    └── recipes.md              # 常见场景 loop 配方
```

---

## /kit 命令（产品层）

```
/kit init <project-name>       → 初始化项目结构
/kit archive                   → 归档历史计划/证据
/kit brainstorm "<idea>"       → 产品脑暴模式
/kit sandbox <template>        → 创建沙盒环境
```

职责：
- 生成 .plan/PRD.md, SPEC.md, CHECKLIST.md
- 生成 .kit/config.json, version.json
- 生成 docs/architecture/, docs/ui-ux/
- 归档历史到 .plan/archive/
- 沙盒隔离（3套模板：default/data-ml/fullstack）

---

## /kit-run 命令（执行层）

```
/kit-run                       → 查看当前执行状态
/kit-run start                 → 开始执行（按 SPEC 任务列表）
/kit-run test                  → 运行测试
/kit-run smoke                 → 冒烟测试
```

职责：
- 读取 .plan/SPEC.md 和 .plan/CHECKLIST.md
- **编码前 5 步门禁**（继承 super-dev）：
  1. 技术栈预研（查官方文档，不猜 API）
  2. 读取项目配置（tsconfig/super-dev.yaml/.env）
  3. 声明 UI 工具链（Lucide/Heroicons/Tabler 锁定）
  4. 确认 API 契约和设计 token
  5. 建立页面结构 + 验证构建零错误
- **写文件前 4 项自检**（继承 super-dev）：
  - [ ] "use client" 是否需要？
  - [ ] 图标来自声明的图标库？（不是 emoji）
  - [ ] 颜色来自设计 token？（不是硬编码 hex）
  - [ ] import 路径正确？API 路径与架构一致？
- **前端优先**（继承 super-dev）：
  1. 先实现前端 + UI（基于 docs/ui-ux/）
  2. 截图检查（preview 确认门）
  3. 用户确认 UI
  4. 再实现后端 + 联调
- **实现闭环**（继承 super-dev）：
  1. build 无错误
  2. lint 无 error
  3. 无控制台红色错误
  4. 新增代码接入真实调用链
  5. 新增日志/告警验证真实路径触发
- 并行执行：Claude Code Agent 工具（不依赖 OMC）
- Codex 调用：`codex exec "<prompt>"`（不依赖 /goal）

---

## /kit-check 命令（质量层）

```
/kit-check                     → 查看质量状态
/kit-check full                → 完整质量检查（全项目）
/kit-check diff                → 增量检查（仅变更部分）
/kit-check research "<topic>"  → 深度研究（双引擎）
/kit-check plan                → 基于检查结果重新规划
```

职责：
- **质量飞轮**（核心创新）：
  ```
  检查 → 产出报告 → [用户确认] → 修复 → [用户确认] → 回归检查 → 沉淀
  ```
- **发散检查**（核心创新）：
  - 用户说"按钮位置不对" → 检查所有按钮、表单对齐、移动端、z-index
  - 发现 mock 数据 → 检查所有 API 调用、加载状态、错误处理、空状态
- **Vibe Coding 专项检测清单**：
  ```
  UI 层：
  □ 元素遮挡/重叠（z-index、overflow、position）
  □ 响应式断点异常（mobile/tablet/desktop）
  □ 文本截断/溢出
  □ 无意义的 loading/mock 占位
  □ 空状态未处理
  □ 错误状态未处理

  数据层：
  □ API 响应是 mock 还是真实？
  □ 所有 CRUD 操作有真实后端吗？
  □ 表单提交后数据真的保存了吗？
  □ 刷新页面数据还在吗？

  功能层：
  □ 所有按钮都有实际行为？
  □ 所有路由都有实际页面？
  □ 所有表单都有验证？
  □ 所有链接都能跳转？
  ```
- **分级检查**：
  - L1 静态分析（自动）：unused imports / 类型错误 / build 失败
  - L2 构建时检查（自动）：console 红错 / API 契约不一致 / mock 数据残留
  - L3 浏览器检查（半自动）：生成清单 → 用户确认 → 运行 Playwright
- **自适应退出**：
  - 连续 2 轮无新问题 → 收敛退出
  - 问题严重性降级（P0→P1→P2）→ 渐进退出
  - 用户说"够了" → 立即退出
  - 最大轮次：默认 3，可配置
- **Research 双引擎**（继承 super-dev）：
  - 引擎 1（本地知识）：读取 knowledge/ 和 .kit/
  - 引擎 2（联网研究）：WebSearch/WebFetch 竞品和官方文档
  - 产物放入 .test/ai/reports/
- **回归归档**：
  - 将新发现的 bug 模式写入 .kit/quality-patterns.md
  - 更新 .plan/CHECKLIST.md 验收标准

---

## 吸收的 Super-Dev 精华清单

| super-dev 精华 | 吸收位置 | 方式 |
|---------------|---------|------|
| 编码前 5 步门禁 | quality/pre-code.md | 完整继承 |
| 写文件前 4 项自检 | modes/run.md | 完整继承 |
| 实现闭环 5 项检查 | quality/post-code.md | 完整继承 |
| UI emoji 禁令 | SKILL.md hooks | 完整继承（PreToolUse hook） |
| AI 模板化禁令 | SKILL.md | 完整继承 |
| 前端优先 + preview 确认 | modes/run.md | 完整继承 |
| research 双引擎 | modes/check.md | 完整继承 |
| SESSION_BRIEF 机制 | templates/session-brief.md | 改编为 kit 风格 |
| 错误恢复 3 阶段策略 | modes/check.md | 完整继承 |
| 图标库锁定（Lucide/Heroicons/Tabler） | modes/run.md | 完整继承 |
| 设计 token 强制 | modes/run.md | 完整继承 |

丢弃的 super-dev 设计：
- 11 位专家角色（过度分解）
- 独立 output/ 目录（与 kit-skills 结构冲突）
- .super-dev/ 目录（与 kit-skills 结构冲突）
- Python CLI 工具（Windows 不兼容）
- tmux 依赖（Windows 不兼容）
- 线性 9 阶段流水线（无递归）

---

## 与现有 Kit-Skills 的关系

这不是新建 skill，而是 **kit-skills v2.0 升级**。

保留：
- 产品语言驱动开发理念
- .plan/ .kit/ docs/ 目录结构
- P0/P1/P2 审计信号
- 硬编码假设检查
- 沙盒隔离
- 多轮实验 V1/V2/V3
- 心跳监控

新增：
- /kit-run 执行层（编码门禁 + 前端优先 + 并行）
- /kit-check 质量层（飞轮 + 发散 + 递归）
- quality/ 目录（5 个门禁文件）
- .kit/quality-patterns.md（质量知识沉淀）

---

## 用户心智模型

```
你想做新项目？
  → /kit init my-project
  → /kit brainstorm "我的想法"
  → /kit sandbox fullstack

你想写代码？
  → /kit-run start        （按 SPEC 执行，自动过门禁）
  → /kit-run test         （运行测试）
  → /kit-run smoke        （冒烟测试）

你想检查质量？
  → /kit-check full       （完整检查）
  → /kit-check diff       （增量检查）
  → /kit-check research "某个技术问题"
  → /kit-check plan       （基于检查结果重新规划）
```

---

## 关键技术决策

### 1. 为什么一个 Skill 三命令，而不是三个 Skill？
- 状态共享：.plan/ .kit/ 目录是共享事实源
- 低延迟：内部 mode 切换比 skill 间路由快 10 倍
- 低心智负担：3 个命令 vs 3 个 skill 名

### 2. 为什么不路由到外面？
- OMC team Windows 兼容问题（tmux pane ID 失败）
- ultraqa 与内置循环重叠
- 减少外部依赖 = 减少故障点

### 3. Codex 如何参与？
- 不依赖 /goal（不存在）
- 使用 `codex exec "<prompt>"` 或交互式会话
- 通过文件契约传递上下文（.plan/SPEC.md）

### 4. SKILL.md 长度控制？
- SKILL.md：300 行以内，只做路由和状态机
- 详细行为：modes/ 目录下的独立文件
- 门禁细节：quality/ 目录下的独立文件

---

## 飞轮状态机

```
                    ┌──────────────┐
         ┌─────────│   /kit init  │
         │         │  初始化项目   │
         │         └──────┬───────┘
         │                │
         │         ┌──────▼───────┐
         │         │ /kit brain-  │
         │         │   storm      │
         │         └──────┬───────┘
         │                │
         │         ┌──────▼───────┐
         │    ┌────│   /kit-run   │◄────────────────┐
         │    │    │   start      │                 │
         │    │    └──────┬───────┘                 │
         │    │           │                         │
         │    │    ┌──────▼───────┐    发现问题     │
         │    │    │ /kit-check   │─────────────────┘
         │    │    │   full/diff  │
         │    │    └──────┬───────┘
         │    │           │
         │    │    ┌──────▼───────┐
         │    └───►│ [用户确认]   │
         │         └──────┬───────┘
         │                │ 确认修复
         │         ┌──────▼───────┐
         │         │ /kit-check   │
         │         │   回归检查   │
         │         └──────┬───────┘
         │                │ 通过
         │         ┌──────▼───────┐
         └────────►│ /kit archive │
                   │  归档沉淀    │
                   └──────────────┘
```

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| SKILL.md 过长 | 控制在 300 行，详细行为放 modes/ |
| 一个 skill 做太多 | 三命令边界清晰：kit(产品) / run(执行) / check(质量) |
| 与 Codex 集成问题 | 使用 codex exec，不依赖 skill 格式 |
| Windows 兼容 | 纯 skill 文件，不依赖外部 CLI |
| 发散检查过度 | 自适应退出 + 用户确认门 |
| 递归无限循环 | 最大 3 轮 + 收敛检测 |

---

## 实现阶段

Phase 1: 骨架 + run 模式
- 重写 SKILL.md（三命令路由）
- 实现 modes/run.md（编码门禁 + 前端优先）
- 实现 quality/pre-code.md + post-code.md

Phase 2: check 模式
- 实现 modes/check.md（飞轮 + 发散 + 递归）
- 实现 quality/ui.md + data.md + api.md
- 实现 templates/quality-report.md

Phase 3: 打磨
- 实际项目测试
- 根据反馈调整检测清单
- 优化命令响应速度
