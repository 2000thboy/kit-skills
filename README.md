# KIT Skills

> Project version: `0.4.1`

KIT Skills 是一个产品语言驱动开发的 skill 包。

用户用自然语言讲产品目标，AI 负责追问、建档、拆任务、记录技术路线、跑验证。用户不需要手填 PRD/SPEC/CHECKLIST。

## 八命令心智模型

KIT v2.0 提供八个命令，覆盖产品到开发的完整闭环：

```
/kit        → 产品层（建档 / 归档 / 脑暴 / 沙盒）— 智能识别场景
/kit-new    → 新建层（全新项目 / 从零建档 / 输入需求）— 跳过状态检查，直接开始
/kit-status → 状态层（检查规范 / 方向漂移 / 归档确认）— 只读审计，不编码
/kit-run    → 执行层（实现 / 自测 / 修复 / 基础验收）— 一口气做到可审查候选
/kit-check  → 深度审查层（Hedge / 极端场景 / 语义风险 / go-no-go）
/kit-loop   → 自动巡航（自我迭代 / 时间盒）
/kit-pack   → 交付打包层（清理 / 封装 / 生成 V1 可分享交付包）
/kit-test   → 验收层（边界确认 / 临时验收包 / 验收测试 / 测试报告）
```

飞轮：

```
/kit-new → /kit brainstorm → /kit-run start → /kit-check diff → [用户确认] → 修复 → 回归 → /kit-test → /kit-pack → /kit archive
         ↑______________________________________________________________________________________________↓
         └────────────────────────────────── /kit-status 检查方向 ───────────────────────────────────────┘
```

每个阶段启动必须给出 `Phase Start`，结束必须给出 `Phase Closure`。启动时说清目标、输入、本阶段会做什么、需要用户确认什么；结束时说清本阶段完成了什么、AI 的评价、剩余风险、建议下一步、下一条命令。KIT 不能只说“已完成”，也不能让用户自己猜下一步。

如果你在 Codex 里使用 KIT 做长阶段任务，建议使用 Codex Goal 模式，把阶段目标、预算和停止条件固定住，避免中途漂移。

运行顺序必须清楚：先 `/kit-run` 完成实现、自测和基础验收，形成可审查候选；再 `/kit-check` 做 Hedge 对冲、极端场景和质量裁决。`/kit-check` 不是普通测试命令，它判断能不能继续进入 `/kit-test` 或 `/kit-pack`。

需求确认完成后必须给出 `Requirement-to-Run Handoff`，再进入 `/kit-run`：

1. 计划总览：产品目标、目标用户、本轮范围、明确不做、验收标准。
2. 全需求审查：已确认需求、仍需用户决定的问题、PM 风险、技术路线。
3. 执行计划：任务顺序、第一项任务、负责人/工具、验证命令。
4. 命令衔接：明确下一条命令，通常是 `/kit-run start`；如果不能运行，必须说明应回到 `/kit-check`、`/kit-status` 还是继续 brainstorm。

交付前最重要的是 `Delivery Contents Gate`：在 `/kit-test`、`/kit-pack`、归档或交接前，必须确认“交付内容物”。至少列出包含什么、不包含什么、证据在哪里、怎么运行/打开、已知风险是什么。用户未确认内容物时，不得声称可交付。

面向中国大陆客户或中文用户的交付包必须通过 `Chinese Delivery Docs Gate`：`README.md`、`HANDOFF.md`、`.plan/PRD.md`、`.plan/SPEC.md`、`.plan/CHECKLIST.md`、`docs/ui-ux/ACCEPTANCE.md`、验收报告和四角色报告必须中文优先。命令、路径、API 字段和必要英文术语可以保留英文，但不能让客户交付物变成英文模板。

商业项目还必须通过商业交付门：`quality/commercial-delivery.md`、`quality/four-role-review.md`、`quality/current-verdict-2026-06-01.md`、`knowledge/ui-commercial-2026.md` 和按需使用的 `knowledge/china-mainland-delivery.md`。重大交付要经过 Top PM、Top Code Engineer、Top Frontend Engineer、Backend Framework Engineer 四重评审，每项都必须 ≥95 分才算通过。

知识库、RAG、智能体或自动化 workflow 必须记录自我督导策略：检索/eval 质量、来源新鲜度、工具调用 schema 校验、循环限制、成本/延迟预算、trace 脱敏、回归案例和失败回滚。

## 核心用途

- brainstorm：先聊清产品方向。
- 建档：生成根目录 `README.md`、宿主入口、`.plan/PRD.md`、`.plan/SPEC.md`、`.plan/CHECKLIST.md`、`.kit/`、`.workflow/`、`.test/`。
- 归档：整理历史计划、证据、旧流程文件。
- 打包 (`/kit-pack`)：在验收通过后封装 V1 可分享交付包，清理临时文件，保留核心代码、README、必要证据和版本信息。
- 验收 (`/kit-test`)：确认版本边界清晰，生成临时验收包，运行验收测试并生成报告。
- 漂移检查：新需求和旧目标冲突时先提醒。
- 验收证据：记录谁执行、怎么验、证据在哪、哪里必须停。
- 规模感知：自动推断 quick/standard/deep，用户可覆盖。
- 沙盒模板：3 套核心模板（default/data-ml/fullstack），每套含 README.md + TEST.md。
- 多轮多组实验：V1/V2/V3 × group-a/b/c，最多 3 轮，批量确认。
- 心跳监控：按任务类型预设阈值，自动重试 3 次。
- 质量飞轮：内置编码门禁 + 发散检查 + 回归验证。
- Vibe Coding 反模式检测：emoji 图标、硬编码颜色、mock 残留、z-index 战争等 21 项。

KIT 不亲自做 deep research、QA、浏览器自动化、发布平台操作、多 Agent 执行、SDK 业务调用。它负责发现这些能力是否需要，检查宿主/项目里有没有对应 skill，再把路由和证据写进 SPEC/CHECKLIST。

## 目录结构

```text
kit-skills/
  SKILL.md
  README.md
  AGENTS.md
  CLAUDE.md
  LICENSE
  package.json
  .kit/
  .test/
  agents/openai.yaml
  bin/spec-loop-kit.mjs
  templates/
  knowledge/
  modes/
    kit.md
    kit-new.md
    kit-status.md
    run.md
    check.md
    loop.md
  quality/
    pre-code.md
    post-code.md
    ui.md
    data.md
    api.md
```

## 安装

把整个 `kit-skills` 文件夹复制到你的 Agent skill 目录。

常见位置：

```text
~/.codex/skills/kit-skills/
~/.claude/skills/kit-skills/
~/.agents/skills/kit-skills/
```

要复制整个目录。`bin/`、`templates/`、`knowledge/` 都要保留。

## 推荐用法

在 Codex、Claude Code、OpenCode、Cursor、Windsurf 或其他 AI IDE/CLI 中打开你的项目，把 KIT 路径交给 AI。

示例：

```text
请使用 KIT 参考包：
C:\tools\kit-skills

目标项目：
D:\projects\my-app

先不要写代码。
请按 kit-skills 做 brainstorm/建档：
1. 读取 SKILL.md、README.md、templates/、knowledge/。
2. 追问我关键产品问题。
3. 生成或更新 .plan/PRD.md、.plan/SPEC.md、.plan/CHECKLIST.md、.kit/。
4. 涉及浏览器、登录态、生图、外发、写入、提交、发布时，先写清技术路线和确认门。
5. 先确认我要开发的是 skill、workflow、CLI harness、前后端产品、OMC 编排、OpenCLI 自动化、SDK 集成、纯 MD 框架还是设计原型。
6. 运行 validate，报告 P0/P1/P2。
```

## 先 brainstorm

想法还不清楚时，用这个：

```text
使用 kit-skills 的 brainstorm 模式。
我的想法是：<你的想法>

先不要建档，不要写代码。
请判断目标用户、核心痛点、第一条可用 workflow、风险点、技术路线差异，以及是否值得建档。
先问清我要开发的对象，不要默认做 WebUI。必要时只追问 1-2 次。
```

## 需求识别

KIT 建档前必须先分类用户到底要开发什么。以下 9 种类型覆盖了 AI 能力封装、流程编排、工具开发、产品构建的完整谱系。

### 快速对照表

| 类型 | 一句话定位 | 对标产品 | 推荐模板 |
|---|---|---|---|
| `skill` | 封装一个 AI 可调用的具体功能 | Claude Skills | `skill` |
| `stable-workflow` | 定义可重复执行的步骤流程 | GitHub Actions | `stable-workflow` |
| `cli-harness` | 命令行工具，可被脚本/CI 调用 | Vercel CLI | `default` |
| `frontend-backend-app` | 完整的用户产品（界面 + 后端） | Linear, Supabase | `fullstack` |
| `omc-orchestration` | 多 AI Agent 协作管理系统 | AutoGen, Dify | `default` |
| `opencli-automation` | 浏览器/系统自动化操作 | Playwright | `default` |
| `sdk-integration` | 第三方服务封装层 | Stripe SDK | `default` |
| `pure-md-framework` | 纯 Markdown 内容框架 | Docusaurus | `default` |
| `design-prototype` | UI/视觉原型生成工具 | Figma, v0.dev | `default` |

### 详细说明与案例

#### `skill` — AI 能力单元

**是什么**：把一个具体功能封装成 AI 可调用的最小单元。输入确定，输出确定，可被反复调用，也可被多个 workflow 复用。

**能做什么**：代码审查、图片处理、数据分析、文本翻译、格式转换、生成摘要、自动补全、安全扫描、依赖检查、文档生成……几乎所有"让 AI 干一件事"的场景都适合做成 skill。

**具体案例**：
- **代码审查 Skill**：读取 Git PR 的差异文件，按预设规则检查代码风格、潜在 bug、安全漏洞，输出带行号的问题列表和修复建议
- **会议纪要 Skill**：传入会议录音或文字记录，自动提取议题、决策结论、待办事项，输出结构化的会议纪要 Markdown
- **多语言翻译 Skill**：输入中文产品文档，输出英文/日文/法文版本，保持标题层级和代码块格式不变
- **JSON 修复 Skill**：收到格式错误的 JSON（如缺少引号、多余逗号），自动修正并返回合法 JSON，同时标注改了哪些地方

**什么时候选它**：如果你想说"我想让 AI 帮我做 XX 事"，而且这件事边界清楚、可以独立运行，就选 skill。

**能力边界 / 做不了什么**：
- **离开 Agent 无法独立运行**。Skill 本身不会自己启动，必须被 AI Agent、workflow 或人主动调用。它不会"定时运行"也不会"监听事件"。
- **不能处理需要多步骤协调的复杂任务**。Skill 只做一件事，如果任务需要"先查 A 再调 B 最后写 C"，那是 workflow 的领域。
- **不能持久化记忆**。两次调用之间默认不共享上下文，除非你自己对接了外部存储（数据库、文件等）。
- **不能主动发起行动**。Skill 是"被调用才干活"，不会主动提醒你、不会定时发通知。

---

#### `stable-workflow` — 确定性流程

**是什么**：定义一套有明确输入、步骤顺序、输出格式和失败处理的可重复执行流程。和临时聊天不同，workflow 有"运行合同"，同样输入永远得到同样输出。

**能做什么**：CI/CD 流水线、数据 ETL、定时报告生成、发布流程、审批流程、批量文件处理、自动化测试套件……

**具体案例**：
- **每日数据报告 Workflow**：每天凌晨 3 点自动执行 → 连接数据库拉取昨日订单 → 计算关键指标（GMV、转化率、退款率）→ 生成带图表的 Markdown 报告 → 推送到企业微信/钉钉群
- **代码发布 Workflow**：开发者打 tag 后触发 → 跑单元测试 → 构建产物 → 推送到 CDN → 更新数据库 migration → 发送发布成功通知 → 失败时自动回滚并告警
- **内容审核 Workflow**：用户上传文章 → 先过敏感词过滤 → 再调 AI 做语义合规检查 → 人工复核队列（高风险）或直接通过（低风险）→ 记录审核日志

**什么时候选它**：如果你有一个"每次都要按固定步骤做"的事，而且希望它自动跑、可回滚、有日志，就选 workflow。

**能力边界 / 做不了什么**：
- **不能处理非确定性任务**。如果每次执行的路径都不一样（如"看情况决定下一步"），workflow 的固定步骤会束缚你。这种情况下需要 Agent 编排或人工介入。
- **不具备自适应能力**。步骤是写死的，遇到未预期的异常（如第三方 API 突然改了返回格式）通常会中断，而不是自动找替代方案。
- **不能替代人工决策**。涉及安全、合规、财务审批、法律风险的关键判断，workflow 只能把决策点暴露出来（"需要人工确认"），不能自己做主。
- **维护成本随复杂度上升**。步骤越多、分支越多，workflow 的调试和理解成本越高。超过 20 个步骤的 workflow 往往需要考虑拆分成子 workflow 或改用编排系统。

---

#### `cli-harness` — 命令行工具

**是什么**：提供一个结构化的命令行入口，接受参数、输出 JSON，可以被脚本、CI/CD、或其他工具链调用。核心特征是"机器可读"，不是给人手敲交互的。

**能做什么**：项目脚手架、代码生成器、批量数据处理、环境检查工具、部署脚本、测试运行器……

**具体案例**：
- **项目初始化 CLI**：`mycli init --template react --name my-app` → 生成完整项目目录、安装依赖、创建 Git 仓库、输出 `{"status":"ok","path":"./my-app"}`
- **批量图片处理 CLI**：`mycli convert --input ./photos --output ./webp --format webp --quality 85` → 遍历目录转格式、压缩、输出处理报告 JSON
- **环境检查 CLI**：`mycli doctor` → 检查 Node 版本、数据库连接、环境变量是否齐全 → 输出 JSON 诊断报告，缺失项标红

**什么时候选它**：如果你需要一个"被其他工具调用"的程序，而不是一个给人用的界面，就选 CLI harness。

**能力边界 / 做不了什么**：
- **没有图形界面，不适合非技术人员直接使用**。普通人看到黑窗口和 JSON 输出会懵，CLI 是给开发者和脚本用的。
- **不能处理需要实时交互的任务**。CLI 是"输入命令 → 等待结果 → 结束"的模式，不适合聊天、直播、协同编辑等需要持续双向通信的场景。
- **通常只在本地或服务器运行**。CLI 默认不提供网络服务，如果需要被远程调用，需要自己额外封装成 HTTP API 或服务。
- **错误展示不友好**。报错时输出的是堆栈跟踪和退出码，不是用户能看懂的中文提示。给人用的工具需要再包一层 UI。

---

#### `frontend-backend-app` — 完整应用产品

**是什么**：有真实用户界面（网页/APP）和后端服务的完整产品。需要处理用户认证、数据存储、API 设计、权限管理等工程问题。

**能做什么**：SaaS 工具、管理平台、电商网站、社交应用、数据可视化平台、内容管理系统……

**具体案例**：
- **项目管理工具**：用户注册/登录 → 创建项目 → 添加任务卡片 → 拖拽排序 → 分配成员 → 看板视图/甘特图/列表视图切换 → 实时协作
- **电商后台**：商品上架（含图片上传、SKU 管理）→ 订单处理 → 库存扣减 → 物流跟踪 → 数据报表 → 退款管理
- **在线问卷系统**：拖拽创建问卷 → 多种题型（单选/多选/评分/填空）→ 发布链接 → 收集回答 → 实时统计图表 → 数据导出 Excel

**什么时候选它**：如果你要做一个"给人用的产品"，有界面、有账号、有数据持久化，就选这个。

**能力边界 / 做不了什么**：
- **开发成本高、周期长，不适合快速验证想法**。从 0 到上线通常需要数周甚至数月，如果只是想"试试这个点子行不行"，先做 skill/workflow 原型更划算。
- **需要持续维护**。服务器、数据库、安全补丁、依赖升级、bug 修复……上线只是开始，不是结束。没有维护资源的产品会快速腐烂。
- **不能替代简单脚本或自动化工具**。如果任务只是"每天抓个数据发邮件"，做成完整应用是杀鸡用牛刀，用 workflow 或 CLI 更轻量。
- **上线后回滚和变更成本高**。有真实用户后，任何改动都要考虑兼容性、数据迁移、灰度发布，不能像个人脚本那样"改了直接跑"。

---

#### `omc-orchestration` — 多 Agent 编排

**是什么**：当一件事太复杂，一个 AI Agent 做不完，需要多个 Agent 分工协作时，就需要编排系统来管理它们之间的状态、交接和冲突。

**能做什么**：复杂研究任务分解、多角色协作写作、跨工具链自动化、分布式代码审查、智能客服升级……

**具体案例**：
- **研究报告生成**：研究员 Agent 搜集资料 → 分析师 Agent 提取关键数据 → 撰稿 Agent 写初稿 → 审校 Agent 检查事实和格式 → 最终合并输出完整报告
- **智能客服升级**：一线客服 Agent 处理常见问题 → 识别到复杂投诉时，自动创建工单并转给专家 Agent → 专家 Agent 调取用户历史订单和通话记录 → 生成解决方案 → 必要时转人工并附带完整上下文
- **多语言内容本地化**：英文编辑 Agent 写原文 → 翻译 Agent 译成 5 种语言 → 文化适配 Agent 检查各地习俗禁忌 → 排版 Agent 统一格式 → QA Agent 最终校验

**什么时候选它**：如果你需要多个 AI"一起干活"，而且它们之间要交接任务、共享状态，就选编排系统。

**能力边界 / 做不了什么**：
- **不能替代清晰的业务逻辑定义**。如果任务本身没想清楚（"先干嘛后干嘛、出错了怎么办"），编排只会让混乱更混乱。编排器是"执行器"不是"设计师"。
- **引入额外的系统复杂度和故障点**。多一个 Agent 就多一个可能出错的地方，Agent 之间的通信延迟、状态不一致、消息丢失都需要处理。
- **调试困难**。一个任务失败了，要排查是哪个 Agent 出的问题、哪次交接丢了信息，链路追踪成本高。日志和状态可视化是必须的配套。
- **不是越多 Agent 越好**。2-3 个 Agent 协作通常最有效。拆成 10 个 Agent 做一件简单的事，只会增加协调开销，不会提升质量。

---

#### `opencli-automation` — 浏览器/系统自动化

**是什么**：用代码控制浏览器或操作系统，模拟人的点击、输入、浏览行为，完成重复性操作。

**能做什么**：网页数据抓取、自动填表提交、定时签到打卡、跨系统数据同步、UI 回归测试、批量下载文件……

**具体案例**：
- **价格监控爬虫**：每小时访问 5 个电商网站的同一商品页面 → 提取价格和库存 → 发现降价或补货时发送通知
- **自动填报系统**：每月 1 号登录财务系统 → 自动填写报销单 → 上传发票扫描件 → 提交审批 → 截图保存提交凭证
- **社交媒体定时发布**：登录微博/推特 → 按预设时间表发布内容 → 抓取互动数据（点赞/评论数）→ 生成周报
- **UI 回归测试**：自动打开应用 → 点击每个菜单 → 截图对比基准版本 → 发现像素差异时标记并报告

**什么时候选它**：如果你需要"让程序代替人操作网页/软件"，就选自动化。

**能力边界 / 做不了什么**：
- **不能处理需要人工判断的复杂决策**。验证码（CAPTCHA）、滑动验证、"判断这张图是否包含敏感内容"等需要人类认知的任务，自动化工具搞不定。
- **页面结构变化会导致脚本失效**。网站改版、CSS 类名变了、按钮位置移动了，脚本就会找不到元素而报错。维护成本和被操作网站的更新频率成正比。
- **法律和合规风险**。很多网站的用户协议明确禁止自动化访问（爬虫协议 robots.txt、服务条款）。爬取个人信息、版权内容、商业数据可能涉及法律问题。
- **不能处理需要物理操作的任务**。只能控制软件层面的点击和输入，不能帮你按电梯、拧螺丝、拿快递。

---

#### `sdk-integration` — 第三方服务封装

**是什么**：把外部服务（支付、AI 模型、地图、短信等）的 SDK 调用，封装成项目内部统一的业务接口。隔离外部变化，让业务代码不直接依赖第三方。

**能做什么**：支付接入、AI 模型调用、地图服务、短信/邮件发送、文件存储、身份认证、消息推送……

**具体案例**：
- **支付封装层**：统一封装微信支付、支付宝、Stripe 的接口 → 业务层只调用 `pay({amount, currency, method})` → 底层自动路由到对应渠道 → 统一回调处理和退款接口
- **AI 模型路由**：封装 OpenAI、Claude、文心一言的 SDK → 业务层只调用 `generateText({prompt, model})` → 自动处理 token 限制、重试、降级到备用模型
- **地图服务封装**：统一封装高德、百度、Google Maps → 提供 `geocode(address)`、`route(from, to)`、`searchNearby(keyword)` 等统一接口 → 切换服务商时业务代码不用改

**什么时候选它**：如果你需要接入外部服务，而且希望"换一个供应商不影响业务代码"，就选 SDK 集成。

**能力边界 / 做不了什么**：
- **不能解决第三方服务本身的质量问题**。如果 Stripe 宕机了、OpenAI API 响应慢了，你的封装层无能为力，只能优雅地报错和降级。
- **不能绕过第三方服务的限制**。配额（quota）、地域限制、许可协议、价格策略——封装层只能适配，不能突破。被封号了照样被封号。
- **引入额外的抽象层**。多一层封装意味着多一层理解和调试的复杂度。出问题时要排查"是我的封装 bug 还是第三方的问题"。
- **版本升级时需要同步更新**。第三方 SDK 升级了（如 OpenAI 弃用了某个 API），封装层也要跟着改。封装不是"一劳永逸"，是"把变化集中在一点"。

---

#### `pure-md-framework` — 纯 Markdown 框架

**是什么**：完全基于 Markdown 文件组织和渲染内容，没有复杂的数据库或运行时。内容即文件，版本控制友好，部署简单。

**能做什么**：技术文档站、知识库、博客、产品手册、项目计划书、API 文档、教程站点……

**具体案例**：
- **技术文档站**：所有文档写成 Markdown → 按目录组织 → 自动渲染成带搜索、导航的静态网站 → 每次 Git 提交自动更新
- **团队知识库**：写 Markdown 记录技术方案、踩坑记录、会议结论 → 通过标签和目录检索 → 新人入职阅读路径
- **产品用户手册**：每个功能一页 Markdown → 含截图、步骤说明、FAQ → 编译成在线帮助中心 → 支持版本切换（v1.0/v2.0 文档并行）

**什么时候选它**：如果你的内容主要是文字、图片、代码块，不需要用户登录或动态数据，就选纯 Markdown 框架。

**能力边界 / 做不了什么**：
- **不能处理动态数据和用户交互**。没有数据库，不能实现"用户登录后看自己的数据"、"提交表单"、"实时评论"等功能。纯展示，不交互。
- **没有用户系统和权限管理**。所有人看到的内容都一样，不能实现"付费会员看高级内容"、"管理员可编辑"等权限区分。
- **搜索和分类功能有限**。依赖静态站生成器的内置搜索（通常是预构建索引），不能做到像百度/Google 那样的实时模糊搜索和智能推荐。
- **不适合频繁更新或个性化展示**。每次内容变更都要重新构建和部署，不能"实时更新"。也不能根据用户偏好展示不同内容。

---

#### `design-prototype` — 设计原型

**是什么**：生成可交互的 UI/视觉方案，用来验证产品概念、展示给用户、或作为开发参考。通常先有稳定的功能流程（skill/workflow），再为其设计界面。

**能做什么**：产品原型、交互演示、UI 组件库、设计系统、视觉规范、交互动效……

**具体案例**：
- **移动端 App 原型**：设计 20 个页面 → 设置页面间跳转逻辑 → 模拟点击交互 → 生成可扫码体验的原型链接 → 给用户演示收集反馈
- **后台管理系统原型**：设计数据表格页、表单页、详情页 → 定义筛选/排序/分页交互 → 模拟增删改查流程 → 开发团队按此实现
- **设计系统组件库**：定义按钮/输入框/卡片/弹窗的样式规范 → 提供不同状态（正常/悬停/禁用/错误）→ 输出设计 token（颜色/字体/间距）→ 前端按 token 实现组件

**什么时候选它**：如果你需要"看得见、点得动"的方案来验证想法或指导开发，就选设计原型。

**能力边界 / 做不了什么**：
- **不能替代真实开发，原型没有真实数据和业务逻辑**。点击按钮后的响应是预设的（"跳转到下一页"），不是真的调了 API 查了数据库。工程师需要按原型重新实现全部逻辑。
- **不能直接使用**。原型工具生成的代码通常不能用于生产环境（性能差、代码冗余、不兼容），它只是"参考图"不是"成品代码"。
- **高保真原型可能给用户"已经做完了"的错觉**。客户看到精美的可点击原型，以为产品快上线了，实际上开发可能还没开始。需要管理预期。
- **复杂交互时工具自身有局限性**。动效、手势、音视频、3D 交互等高级效果，原型工具要么不支持，要么模拟效果和生产环境差异很大。

---

### 选型决策

如果是前后端技术栈选型：

- OpenSpec：适合 spec-driven 需求变更管理。
- Super Dev：适合 AI 交付治理、UI runtime gate、proof pack、release readiness。

如果不是前后端产品，别硬推 OpenSpec/Super Dev。skill、workflow、CLI harness、OpenCLI 自动化、SDK 集成，各有自己的正确形态。把错框架塞给用户，后面改起来像拆承重墙。

## 建档

方向清楚后：

```text
用 KIT 建档这个项目。
目标项目路径：D:\projects\my-app
KIT 参考包：C:\tools\kit-skills

你来创建或更新 .plan/、.kit/、docs/。
需要我决定的产品问题再问我。
技术栈、验证命令、文件结构由你按项目现状判断。
```

建档后通常会出现：

```text
.plan/
  PRD.md
  SPEC.md
  CHECKLIST.md
  archive/
  runs/
.kit/
  config.json
  version.json
docs/
  architecture/
  ui-ux/
.workflow/
  README.md
  status.md
  codex.md
  workbuddy.md
  trae-solo.md
  scripts/
.test/
  README.md
  config.json
  ai/
    sandboxes/
    reports/
    evidence/
    packages/
    fixtures/
  user/
    README.md
    packages/
    guides/
    acceptance/
    feedback/
    evidence/
README.md
AGENTS.md 或 CLAUDE.md
```

如果项目需要 host preset 或可恢复流程，直接用 `.workflow/`：

```text
这个项目需要 .workflow 入口。
请用 KIT 创建 workflow 预设：Codex、WorkBuddy、Trae Solo。
同时检查 README.md、当前宿主入口、.workflow/README.md、.test/README.md、.plan/PRD.md、.plan/SPEC.md 是否目标一致。
```

AI 可以调用：

```powershell
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-app --host auto
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-claude-app --host claude
```

会生成：

```text
.workflow/
  README.md
  status.md
  codex.md
  workbuddy.md
  trae-solo.md
  scripts/
```

规则：

- `.workflow/`：统一管理当前可恢复入口、host preset、流程说明、脚本和历史 workflow 合同。
- `docs/`：只放架构、UI/UX 等稳定说明，不再放测试包和 workflow。
- `README.md`：只放根目录，作为用户和仓库首页入口。不要新建 `.plan/README.md`。
- `README.md` 必须是 **用户指南**，不是阶段报告、验收报告或交接报告。它应该说明项目是什么、适合谁、怎么安装/运行、怎么使用、怎么测试、目录结构、常见问题和生产化前注意事项。`Phase Start`、`Phase Closure`、`Requirement-to-Run Handoff`、详细验收结论和四角色评分应放在 `.plan/`、`HANDOFF.md`、`.test/ai/reports/` 或 `.workflow/`，不要塞进 README。
- `.test/`：放测试包、验收包、交付证据和用户反馈。它在项目根目录，不进源码目录，也不放框架自动发现的测试代码。
- `.test/ai/`：AI 自检、dry-run、打包证明、自动化日志。
- `.test/user/`：给真实用户的测试包、安装说明、验收表、反馈表和用户返回证据。
- `tests/`：框架自动发现的单元、集成、端到端测试代码。
- `evals/`：AI 全程序自测配置、运行脚本、报告和过程证据。
- AI 模拟用户仍然算 `.test/ai/`，不算 `.test/user/`。
- 不允许新建根目录 `output/` 或 `outputs/` 当测试包；SuperDev 或老脚本留下的 `output/` 只能当迁移输入，归档时归类进 `.test/ai/`、`.test/user/` 或 `.plan/archive/`。
- 大日志、大模型输出、命令流水不要塞进聊天上下文；原始证据进 `.test/ai/evidence/`，报告只写摘要和路径。
- 归档时会检查硬编码假设：本机路径、浏览器 profile、账号/平台 ID、固定端口、temp/download/output path、floating model alias、placeholder、secret-like literal。
- `AGENTS.md` / `CLAUDE.md`：按宿主生成；Claude 宿主使用 `CLAUDE.md` 主入口。
- `.kit/version.json`：记录版本合同，和宿主入口、包版本、git tag/release 同步。
- 老项目已有 `docs/workflows/` 或 `.workflows/` 时，归档时检查目标冲突，并迁移或桥接到 `.workflow/`。

宿主规则：

- `--host claude`：生成 `CLAUDE.md`，Claude 只读它作为主入口。
- 其他宿主：生成 `AGENTS.md`。
- `--host auto`：按当前环境和已有文件判断。
- 不要让 Claude 依赖 `AGENTS.md` 当主入口，脑子会掉地上。

---

## `/kit-new` — 全新项目建档

**触发词**："我想做一个 xxxxx"、"新建项目"、"从零开始"、"帮我开发 xxxxx"

**定位**：`/kit-new` 是 **全新项目的快速入口**。当用户有明确的新想法时，跳过状态检查，直接进入建档流程。

**强制流程**：
1. **Brainstorm（不可跳过）**：确认目标用户、核心痛点、预期输出
2. **分类确认**：确定开发类型（skill/workflow/app 等）和规模
3. **生成三件套**：PRD → PM Audit → 用户确认 → SPEC → PM Audit → 用户确认 → CHECKLIST → PM Audit → 用户确认
4. **用户最终确认**：明确说"确认"后，输出 Requirement-to-Run Handoff
5. **命令衔接**：无阻塞时明确给出 `/kit-run start`

**与 `/kit` 的区别**：

| | `/kit-new` | `/kit` |
|---|---|---|
| 状态检查 | **跳过**，不读取 `.plan/` | **必须**，先报状态简报 |
| 适用阶段 | 项目**起点** | 项目**任意点** |
| 头脑风暴 | 直接进入 | 根据状态判断是否需要 |

**禁止行为**：未头脑风暴直接生成 PRD；用户说"直接做"就跳过确认门；用 "ok" 代替"确认"。

---

## `/kit-status` — 项目状态检查

**触发词**："当前项目"、"检查状态"、"方向有没有变化"、"归档"、"fullcheck"

**定位**：`/kit-status` 是 **项目健康检查器**。只读取状态、输出报告，**绝不写代码**。

**强制流程**：
1. **读取项目状态**：`.plan/`、`.kit/`、`.workflow/`、README.md（缺失时标注）
2. **输出状态简报**：项目阶段、完成进度、阻塞项
3. **方向漂移检测**：对比用户当前请求与 PRD，判断一致性
4. **归档检查**（用户说"归档"时）：检查历史文件、Runtime Index、硬编码假设

**状态简报模板**：

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/kit-status 项目状态报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

项目: {project-name}
版本: {version}
当前阶段: {stage}

【进度】已完成: {N}/{M} 项 ({X}%)
【方向一致性】漂移: 无 / 轻微 / 中度 / 严重
【阻塞项】🔴 {N}  🟠 {N}  🟡 {N}
【下一步】...
【需要你决定】...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**漂移处理**：
- **无漂移**："方向一致，可按计划继续"
- **轻微漂移**：标注建议，不阻塞
- **中度漂移**：建议更新 SPEC/CHECKLIST
- **严重漂移**：**必须经用户确认**，走归档变更确认流程

**禁止行为**：绝不写代码；绝不修改 `.plan/`、`.kit/`；检测到漂移时必须问用户，不能替用户决定。

---

## 继续开发

### `/kit-run` 启动前的强制检查清单

**`/kit-run` 不是默认入口**。执行 `/kit-run` 前，AI 必须完成以下检查，**任何一项不通过就必须先问用户，禁止直接开始编码**。

| 检查项 | 通过标准 | 不通过时的动作 |
|---|---|---|
| **1. 建档状态** | 已存在 `.plan/PRD.md`、`.plan/SPEC.md`、`.plan/CHECKLIST.md` 且内容非空 | **停止**。告知用户”项目尚未建档，需要先走 /kit init 或 /kit brainstorm 流程” |
| **2. 状态读取** | 已读取 `.plan/`、`.kit/`、`.workflow/`、README.md，能报出状态简报 | **停止**。告知用户”无法读取项目状态，请确认路径或重新建档” |
| **3. 目标一致性** | 用户本次需求与 `.plan/PRD.md` 目标一致，无漂移 | **停止**。指出漂移点，问用户”继续原目标 / 调整目标 / 开新项目？” |
| **4. 需求清晰度** | 用户当前需求足够具体，AI 能说出”要改哪些文件、预期结果是什么” | **停止**。触发头脑风暴，追问到需求清晰 |
| **5. 用户确认** | 用户明确说”确认”或”可以开始做” | **停止**。重复计划和预期改动，等用户确认 |
| **6. 交接报告** | 已输出 Requirement-to-Run Handoff，包含计划总览、全需求审查、执行计划、下一命令 | **停止**。回到 `/kit` 补交接报告 |

**禁止行为**：
- 未读取 `.plan/` 直接开始写代码
- 用户说”快点做”、”直接改”就跳过确认门
- 用 “ok”、”好的”、”行” 代替用户确认
- 在需求模糊时猜测用户意图并实施

### `/kit-run` 的基础验收职责

`/kit-run` 不是只写代码。它要一口气完成：

1. 实现已确认的当前任务。
2. 运行项目基础检查：build/type/lint 或项目等价命令。
3. 运行项目测试：unit/integration/e2e 中当前项目已有且相关的部分。
4. 执行 smoke run：确认应用、CLI、workflow 或 skill 的关键入口能启动。
5. 验证核心需求路径：对照 CHECKLIST/PLAN，确认本轮需求真的接入真实调用链。
6. 遇到基础验收失败时，自动回修并再跑一次，不把第一次失败直接甩给用户。
7. 输出 `Run Closure`，说明是否可以进入 `/kit-check diff`。

`/kit-run` 结束后通常下一步是 `/kit-check diff`；如果基础验收未过，下一步仍是 `/kit-run fix <scope>`。

### `/kit-check` 的深度审查职责

`/kit-check` 接在 `/kit-run` 后面。它不重复普通测试，而是做深度判断：

- 启动前必须输出 `/kit-check Plan Confirmation`，列出检查目标、范围、Hedge 模式、极端场景、证据来源和不检查项，并等用户确认。
- Hedge quick/deep/security 对冲检查。
- 极端场景：空输入、超长输入、并发、路径、权限、状态污染、取消中断。
- 语义风险：需求是否被误解、命令边界是否混淆、是否出现假完成。
- 质量裁决：go / fix / block，并给出回流命令。
- 如果发现 P0/P1，输出 `/kit-run fix <scope>`；如果通过，输出 `/kit-test` 或 `/kit-pack`。

---

### 两种启动场景

**场景 1：从头开始**
```text
用 kit-skills 帮我开发 xxxxx
```
→ **强制流程**：
1. **先头脑风暴**（`/kit brainstorm`）：追问用户核心痛点、目标用户、第一条 workflow、风险点
2. **分类建档**（`/kit init`）：确定开发类型（skill/workflow/app 等）
3. **生成三件套**（PRD/SPEC/CHECKLIST）
4. **用户确认**：用户明确说”确认”后，输出 Requirement-to-Run Handoff
5. **开发执行**（`/kit-run start`）

**头脑风暴不可跳过**。即使用户说”我很清楚，直接做”，AI 也必须至少确认：目标用户是谁、核心痛点是什么、预期输出是什么。这三个问题答不上来就是不清楚。

**场景 2：中间介入（已有项目）**
```text
继续按 kit-skills 的流程开发
```
→ **强制流程**：
1. AI **先读取** `.plan/`、`.kit/`、`.workflow/`、README.md，报状态简报
2. **检查目标一致性**：用户本次需求与已建档目标是否有差异
3. **如用户目标不清晰或与当前 PLAN 有差异 → 必须先头脑风暴到用户足够清楚**
4. **PLAN 确认后才能继续开发**
5. **用户明确确认后**，输出 Requirement-to-Run Handoff，再进入 `/kit-run start`

AI 不得因”快点”、”直接做”跳过头脑风暴和确认门。

---

### 用户门禁（不可跳过）

- **用户始终是门禁**。关键决策必须经用户确认，AI 不得擅自决定。
- **不接受模糊确认**。”ok”、”好的”、”行”、”可以” 不等于确认。必须明确”确认”。
- **涉及 3 个以上文件改动，先给计划**，等用户确认后再执行。
- **完成后运行 validate**，并报告证据。
- **不懂就问**。AI 对需求有疑问时，必须追问用户，不能猜测后实施。

```text
使用 kit-skills 继续这个项目。
先读取 .plan/PRD.md、.plan/SPEC.md、.plan/CHECKLIST.md 和 .kit/。
如果我的新需求和已建档目标冲突，先指出漂移。
涉及 3 个以上文件改动，先给计划。
完成后运行 validate，并报告证据。
```

已建档项目每次调用 KIT，AI 都要先报一个短状态：

```text
当前状态: ...
终点: ...
方向变化: none / minor / scope_expansion / direction_change / new_project_candidate
下一步: ...
需要你决定: ...
```

没有阻塞决策就写”不需要”。别为了显得礼貌把用户拽进每个细枝末节，用户不是配置文件填写员。

固定追问放在 `knowledge/question-bank.json`。AI 需要追问时引用 `SB*`、`AR*`、`OC*`、`FR*`、`BI*`、`HA*` 这些问题 ID，再问一句短问题。

## 打包与验收

### `/kit-pack` — V1 交付打包

当用户说"打包"、"pack"、"封装"、"交付 V1"时使用。目的是在 `/kit-test` 验收通过后，生成一个明确可交付、可分享、可安装或可复用的 V1 交付包。

**强制确认门**：

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/kit-pack V1 交付打包确认
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

打包范围:
  • 核心代码: src/, bin/, modes/ 等
  • 文档: README.md, SKILL.md, AGENTS.md/CLAUDE.md
  • 必要证据: 验收报告、关键截图/日志索引、版本信息
  • 版本: .kit/version.json

交付内容物确认:
  • 包含什么
  • 不包含什么
  • 证据和报告
  • 使用/运行方式
  • 已知风险

排除项:
  • 临时文件: logs/, .omc/, .pilotdeck-runtime/
  • 历史测试包: .test/ai/packages/
  • 临时验收包: {project-name}-test-YYYYMMDD/
  • 敏感信息: .env, secrets, API keys
  • 开发依赖: node_modules/, __pycache__/, .venv/

用户可回复:
  • "确认" → 执行打包
  • "修改范围" → 调整后重新确认
  • "取消" → 不打包
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**输出**：`{project-name}-v1-YYYYMMDD/` 目录或 `{project-name}-v1-YYYYMMDD.zip`

### `/kit-test` — 验收测试

当用户说"test"、"验收"、"版本已完成"时使用。前提是版本已开发完毕、边界清晰。

**强制确认门**：

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/kit-test 验收确认
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

验收前提检查:
  • 版本边界是否清晰？
  • 核心功能是否已完成？
  • 是否有已知阻塞项？

验收内容:
  • 生成临时验收包（核心代码 + README + 验收说明）
  • 运行验收测试（按 .plan/CHECKLIST.md 验收标准）
  • 生成测试报告

用户可回复:
  • "确认" → 执行验收
  • "还有未完成项" → 返回 /kit-run 继续开发
  • "取消" → 不验收
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**输出**：临时目录 `{project-name}-test-YYYYMMDD/` + `.test/ai/reports/acceptance-YYYYMMDD.md` + 验收证据。验收失败时不得进入 `/kit-pack`。

## 归档前确认

归档、清理、打包、移动流程文件前，AI 先判断要不要问。

不用问的情况：

- `validate` 没有相关 P0/P1。
- PRD、SPEC、CHECKLIST、`.kit/`、`.workflow/`、`.test/`、README、宿主入口和代码事实一致。
- 候选文件明确是历史、AI 自测、真实用户测试材料或生成噪音。
- 不会影响当前入口、恢复路径、用户测试包、live action 证据、secret 材料或硬编码环境设置。

必须问的情况：

- 新需求和当前 PRD/SPEC 冲突。
- 根目录或流程目录里的 Markdown 可能还是当前事实。
- `.workflow/`、`.test/`、README、AGENTS/CLAUDE、`.plan` 目标不一致。
- AI 模拟用户材料和真实用户测试材料混了。
- 文件里有本机路径、端口、账号 ID、模型 alias、浏览器 profile、secret-like literal。

这时用 `question-bank` 的 `AR*` 问题。少问，问准。别把归档做成审讯室。

## Capability Skill Inventory

建档和归档前，让 AI 先盘点宿主和项目本地能力。

```text
开始建档/归档前，先做 Capability Skill Inventory。

请检查：
- deep-research 是否已安装；它用于文件检索 + 结合文件的联网搜索，缺失时放到可选安装推荐第一位；
- 宿主已安装哪些相关 skill/plugin/tool；
- 项目本地是否已有 skills/、.agents/skills/、.claude/skills/、.codex/skills/、.workflow/、历史 `.workflows/` / `docs/workflows/` 或 runner；
- 本项目可能需要哪些 routed capability；
- 哪些可用，哪些缺失；
- 缺失但建议安装的，给出推荐 skill/tool、安装目标、风险和是否需要我确认；
- 我确认后，再下载或复制到项目路径，并把证据写进 .plan/SPEC.md 和 .plan/CHECKLIST.md。
```

推荐记录到 `.plan/SPEC.md` 的 `Capability Skill Inventory` 表。

常见安装目标：

```text
skills/<skill-name>/
.agents/skills/<skill-name>/
.claude/skills/<skill-name>/
.codex/skills/<skill-name>/
.workflow/
```

有账号绑定、cookie、token、大文件、许可证风险的内容，必须先确认。

## 入口一致性

建档和归档时，AI 要检查：

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.workflow/README.md`
- `.plan/PRD.md`
- `.plan/SPEC.md`

重点看目标、范围、workflow、stop gate 是否冲突。检查 active host entry：Claude 是 `CLAUDE.md`，其他宿主是 `AGENTS.md`。另一个入口存在时只能作为 bridge/legacy，不能当第二个主入口。

## 特殊技术路线

浏览器/登录态：

- 需要登录态、cookie、账号 session、绑定浏览器配置时，优先项目标准工具或 OpenCLI。
- Playwright 主要用于 E2E、项目已有测试、跨浏览器回归。
- 账号材料不得入库。

生图：

- 先列出生图点：页面、场景、封面、角色、背景、缩略图、视觉证明。
- 再记录工具/提供方、尺寸数量、存储路径、审批状态。

## Profile

`validate` 支持：

| Profile | 场景 |
|---|---|
| `auto` | 自动判断 |
| `generic-project` | 普通项目 |
| `frontend-ui` | 前端、UI、视觉验证 |
| `long-content-publishing` | 日报、报告、批量生成、自动提交、可选发布等长流程内容 workflow |
| `archive-cleanup` | 项目归档、清理、整理 |
| `skill-package` | `kit-skills` 这类可发布 skill 包自检 |

示例：

```powershell
node C:\tools\kit-skills\bin\spec-loop-kit.mjs validate --cwd D:\projects\daily-report-workflow --profile long-content-publishing
```

## Helper 命令

这些命令主要给 AI 或高级用户用：

```powershell
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-app --owner your-name --level 1 --host auto
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-claude-app --owner your-name --level 1 --host claude
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-ml-app --owner your-name --level 2 --template data-ml
node C:\tools\kit-skills\bin\spec-loop-kit.mjs init --cwd D:\projects\my-experiment --owner your-name --level 3 --experiment
node C:\tools\kit-skills\bin\spec-loop-kit.mjs validate --cwd D:\projects\my-app --profile auto --host auto
node C:\tools\kit-skills\bin\spec-loop-kit.mjs audit --cwd D:\projects\my-app --json --host auto
```

结果说明：

- `P0`：必须先修。
- `P1`：可继续，但要接受风险。
- `P2`：建议优化。

普通 `validate` 是给被 KIT 初始化的项目用的。`kit-skills` 包目录自检用 `skill-package` profile：

```powershell
npm run check
npm run check:contract
npm run check:self-audit
npm run check:pack
```

新建项目刚 init 后出现 `P1 prd-placeholders` 是正常的：说明还没把用户目标填进 PRD。它不是工具坏了，是你还没开始建档。别把空表当成绩单。

## 模型 / Agent 开发风险

只要项目涉及 OpenAI SDK、Claude SDK、Agents SDK、prompt、模型评审、工具调用、多 Agent、长文本分片或自动化 workflow，就要在 `.plan/SPEC.md` 写 `Model / Agent Risk Ledger`。

至少记录：

- provider / model_id / pinned alias：避免模型升级后行为漂移，项目还装作没变。
- budget / cost / quota / rpm / tpm / rate limit：别等账单或平台限额把流程打断。
- max_context / token / chunk / truncation：3 万字、几十个文件、长日志都不能靠“模型自己理解”。
- prompt / 角色漂移：人设、审查方式、system prompt 变了要归档。
- 工具权限和 live action：外部写入、账号操作、发布提交必须有确认门。
- eval / fixture 隔离：评测数据、AI 模拟用户、golden case 放 `.test/ai/fixtures/` 或 `.test/ai/reports/`。
- concurrent agents：多代理并行必须记录 `run_id`、owner、touched paths、state file、merge rule、conflict gate。
- reproducibility：关键验证要记录 command、exit code、输入 fixture、依赖 lockfile、seed、artifact hash。
- trace_sensitive_data：tracing、tool 参数、模型输入输出涉及敏感数据时要关闭、脱敏或隔离。
- 内容安全、隐私、版权：生成内容、用户数据、公开素材要有边界。
- 证据保留：原始日志进证据目录，报告写摘要。把长日志糊进上下文，是给下一轮 AI 挖坑。

这套规则对齐 OMC 的状态/证据思路，也贴近 CLI-Anything 的 harness 思路：工具要产生真实、可检查、可复放的产物，而不是在聊天里表演“我已完成”。

## 硬编码假设检查

归档和打包时，`validate` 会提醒常见 AI 硬编码：

- `C:\Users\...`、`/Users/...`、`/home/...`、`/root/...`
- browser profile、`user-data-dir`、`profile-directory`
- `user_id`、`workspace_id`、`book_id`、`channel_id` 这类平台/账号 ID literal
- API key、token、cookie、sessionid literal
- `localhost:3000` 这类固定端口
- temp/download/output path
- `model: latest/auto/default`
- `your-name`、`yourusername`、`replace-me`

处理方式不要装聪明：

- 是产品/平台契约：写进 `.plan/SPEC.md`。
- 是本机配置：移到 env/config/local ignored 文件。
- 是示例：只留在 README 或 `.test/user` 指南里，并标成 example。
- 是历史噪音：进 `.plan/archive/` 或 `.test/ai/`。
- 是 secret 或账号材料：移除。

## knowledge

`knowledge/` 是解释材料：

- `openai-sdk.md`
- `omc-framework.md`
- `openspec-framework.md`
- `superdev-framework.md`
- `cli-anything-framework.md`
- `pure-md-framework.md`
- `opencli-framework.md`
- `product-prototype-knowledge.md`
- `china-mainland-delivery.md`
- `ui-commercial-2026.md`
- `../quality/current-verdict-2026-06-01.md`
- `question-bank.json`
- `index.json`

项目真实状态看 `.plan/`、`.kit/` 和验证证据。

## 规模感知

KIT 根据需求描述自动推断项目规模，分为 `quick`（1 天内）、`standard`（2-5 天）、`deep`（1 周以上）三级。`quick` 合并 PRD/SPEC/CHECKLIST 为单份 PLAN.md；`standard` 走标准三件套；`deep` 强制 Architecture Review 和 Risk Ledger。用户可通过 `--level` 参数覆盖推断结果。

## 沙盒模板

`init` 支持 `--template` 参数选择 3 套核心模板：`default`（通用代码项目）、`data-ml`（数据分析/ML）、`fullstack`（Web/CLI 复杂应用）。每套模板自带 README.md + TEST.md，子代理在干净会话中启动前，TEST.md 必须先就位。

## 实验框架

用户声明"需要做对照实验"时，KIT 创建多轮多组实验结构：V1/V2/V3 × group-a/b/c，最多 3 轮。每组独立目录，通过 `cp -r` 主项目源码创建，批量确认所有变量配置后才启动子代理。实验结果汇总为 REPORT-vN.md，用户审阅后决定继续、采用某组或归档。

## 心跳监控

后台 bash 长任务自动启用心跳监控，按任务类型预设阈值：`default`（120 秒）、`build`（600 秒）、`training`（1800 秒）、`download`（300 秒）。超时或 PID 消失时自动重试最多 3 次，3 次失败后写入 `.kit/blockers.json` 并通知用户。

## 自检

```powershell
python -X utf8 <codex-home>\skills\.system\skill-creator\scripts\quick_validate.py <path-to-kit-skills>
node <path-to-kit-skills>\bin\spec-loop-kit.mjs validate --cwd <scratch-project> --profile auto
node <path-to-kit-skills>\bin\spec-loop-kit.mjs audit --cwd <path-to-kit-skills> --profile skill-package --json
node --check <path-to-kit-skills>\bin\spec-loop-kit.mjs
node <path-to-kit-skills>\scripts\contract-tests.mjs
npm pack --dry-run
```

## 最近更新

**版本：0.4.1**  
**更新日期：2026-06-01**

本次更新围绕 Hedge 语义检查后的硬问题修复：

- 增加 `Phase Start`、`Phase Closure` 和 `Requirement-to-Run Handoff`，让每个 phase 启动和结束都有目标、总结、评价、风险、建议和下一条命令。
- 增加 `Delivery Contents Gate`：验收、打包、归档或交接前必须确认交付内容物；Codex 长阶段建议使用 Goal 模式。
- 增加商业交付能力：四重 95 分评审、中国大陆交付场景、2026 商业 UI 质量门、知识库/智能体自我督导要求。
- 重新压清 `/kit-run` 与 `/kit-check` 边界：`/kit-run` 负责实现、自测、修复和基础验收；`/kit-check` 负责 Hedge、极端场景、语义风险和 go/no-go 判断。
- 明确需求确认后必须先列出计划总览、全需求审查和执行计划，再衔接 `/kit-run start`。
- `/kit-pack` 的破坏性清理示例增加路径预览、用户确认和 Windows PowerShell 安全提示；`rm -rf` 不再作为可直接盲复制的步骤。
- `/kit-run test` 明确为开发期项目测试；`/kit-test` 保持为交付前验收层，负责版本边界、临时验收包、验收测试和报告。
- Hedge 缺失时不能声称最终 ready；必须记录 `adversarial_check: incomplete`，并由用户显式接受风险。
- `/kit-loop` 增加 `KIT_LOOP_DEPTH`、`.kit/kit.lock`、最大轮次/时长和 blocker pointer-only 规则，降低递归与并发交错风险。
- `spec-loop-kit.mjs` 增加 JSON 解析错误报告和递归扫描上限，避免坏配置被静默忽略或大仓库扫描失控。
- 合同测试增至 12 条，覆盖坏 JSON 和扫描上限；Codex 与 Claude Code 两侧 `npm run check:all` 均通过。
- 修正中文交付漂移：大陆/中文客户交付场景在 `/kit-test` 阶段强制检查中文优先 README、HANDOFF、计划文档、UI 验收和验收报告，防止英文模板进入 V1 交付包。

## License

`MIT License`。见 `LICENSE`。
