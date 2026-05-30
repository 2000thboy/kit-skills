# CLI-Anything Framework

## 一句话

CLI-Anything 适合把已有软件或代码库变成 agent-native CLI。它的价值不是“再包一层 API”，而是让 Agent 通过稳定命令、JSON 输出、测试和真实后端能力操作软件。

## 适合什么

- 已有软件或代码库，需要 Agent 可控调用。
- GUI 自动化太脆，需要 CLI/JSON 输出。
- 需要真实后端集成，不想做玩具 wrapper。
- 需要 harness、测试、文档、命令发现和可复现执行。

## 不适合什么

- 用户还没决定产品是什么。
- 只是做一个聊天式 skill。
- 只是前后端产品开发。
- 只是浏览器登录态操作。

## 和 KIT 的关系

KIT 在 brainstorm/建档时先判断用户是不是在做“给已有软件加 agent 接口”。如果是，优先考虑 CLI-Anything/CLI harness，而不是直接做 WebUI。

KIT 记录 CLI harness 的目标、命令边界、JSON 输出、测试方式、真实后端证据、打包方式和用户测试包。

## 决策提示

- 开发效果：Agent 可以用命令稳定操作真实软件。
- 成本：需要理解原代码库和真实后端能力。
- 可反悔点：早期可以先做少量命令。
- 难反悔点：命令 schema、JSON 输出和包名一旦被下游 Agent 使用，改动就是破坏性变更。

## 参考

- https://clianything.net/
- https://github.com/HKUDS/CLI-Anything
