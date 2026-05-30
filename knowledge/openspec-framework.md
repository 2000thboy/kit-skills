# OpenSpec Framework

## 一句话

OpenSpec 是 spec-driven development 框架。它适合前后端产品、平台型软件、多人协作项目，尤其适合需求会持续变化、需要 proposal/spec/tasks 留痕的项目。

## 适合什么

- 前后端 Web/App 产品。
- 有多个能力模块，需要按 capability 管理规格。
- 团队或长期项目，需要 review intent，而不只是 review code。
- 每次需求变更都要留下 proposal、spec delta、design、tasks。

## 不适合什么

- 只是做一个可复用 skill。
- 只是做一个稳定 workflow。
- 只是给已有软件补 agent-native CLI。
- 用户目标还没想清楚，只是在探索产品形态。

## 和 KIT 的关系

KIT 先判断用户到底要开发什么。若用户明确要做前后端产品，且需求会持续演进，KIT 可以推荐 OpenSpec 作为更正式的 spec layer。

OpenSpec 管更完整的 spec-driven 生命周期。KIT 管产品语言入口、项目事实契约、能力路由、验证和归档。

## 决策提示

推荐 OpenSpec 时要说清楚：

- 开发效果：更强的需求变更留痕和规格一致性。
- 成本：目录和流程更重。
- 可反悔点：早期可以从 KIT 迁到 OpenSpec。
- 难反悔点：一旦大量功能按 OpenSpec capability/spec delta 管理，再退回纯 Markdown 会丢结构。

## 参考

- https://openspec.dev/
- https://github.com/Fission-AI/OpenSpec
