# OpenAI SDK

## 一句话

OpenAI SDK 是直接调用 OpenAI API 的工程入口。它适合你已经知道自己要做什么，然后用代码调用模型、工具、文件、流式输出或结构化输出。

它不是产品框架。它不会替你定义目标用户、验收标准、任务拆分、质量门禁或发布证据。把 SDK 当成 KIT，就等于把发动机当成整辆车，开发新手最容易在这里把自己绕晕。

## 适合什么

- 直接集成模型能力到产品后端。
- 用 Responses API 做文本、图片、文件、工具调用和多轮工作流。
- 用官方 Python 或 JavaScript/TypeScript SDK 接入 REST API。
- 用 Agents SDK 做代码级 agent 编排、工具、handoff、streaming 和 tracing。

## 不适合什么

- 只靠 SDK 管产品需求和范围。
- 只靠 SDK 做多人协作、任务验收、证据归档。
- 只靠 SDK 实现浏览器发布、平台账号操作、长内容质量审查。

这些需要 KIT 记录事实和门禁，再把具体执行路由给 SDK、项目脚本、OpenCLI、QA skill 或 team runner。

## 和 KIT 的关系

| 问题 | OpenAI SDK | KIT |
|---|---|---|
| 怎么调用模型 | 负责 | 不负责 |
| 用哪个接口实现产品能力 | 可实现 | 记录选型和原因 |
| 谁审查、谁执行、证据在哪里 | 不负责 | 负责 |
| 需求变化是否越界 | 不负责 | 负责 |
| 发布前是否能声称完成 | 不负责 | 负责 stop gate |

## 推荐用法

在 `.plan/SPEC.md` 写清：

- SDK 用在什么能力上。
- 输入输出 schema 是什么。
- 失败、超时、重试和日志策略。
- 是否需要人工确认。
- 验证命令和证据路径。

## 官方参考

- OpenAI quickstart: https://platform.openai.com/docs/quickstart
- Responses API: https://platform.openai.com/docs/api-reference/responses
- OpenAI Python SDK: https://github.com/openai/openai-python
- OpenAI JavaScript/TypeScript SDK: https://github.com/openai/openai-node
- Agents SDK: https://platform.openai.com/docs/guides/agents-sdk/
