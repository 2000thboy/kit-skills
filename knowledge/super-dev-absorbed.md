<!-- kit-skills v2.0 -->
<!-- Super-Dev Essence Absorption List -->

# 吸收的 super-dev 精华清单

kit-skills v2.0 从 super-dev 中系统性吸收以下设计精华，同时明确丢弃不适配的部分。

---

## 精华吸收表

| super-dev 精华 | 吸收位置 | 方式 | 说明 |
|---------------|---------|------|------|
| 编码前 5 步门禁 | `quality/pre-code.md` | 完整继承 | 技术栈预研 → 项目配置读取 → UI 工具链声明 → API 契约确认 → 页面结构+构建零错误 |
| 写文件前 4 项自检 | `modes/run.md` | 完整继承 | "use client" 必要性 / 图标来源 / 颜色 token / import 路径正确性 |
| 实现闭环 5 项检查 | `quality/post-code.md` | 完整继承 | build 无错误 / lint 无 error / 无控制台红错 / 接入真实调用链 / 日志验证路径触发 |
| UI emoji 禁令 | `SKILL.md` hooks | 完整继承（PreToolUse hook） | 拦截 emoji 写入，强制使用 Lucide/Heroicons/Tabler |
| AI 模板化禁令 | `SKILL.md` | 完整继承 | 禁止紫色渐变、卡片墙无层次、硬编码颜色等模板化痕迹 |
| 前端优先 + preview 确认 | `modes/run.md` | 完整继承 | 先前端 UI → 截图检查 → 用户确认 → 再后端联调 |
| research 双引擎 | `modes/check.md` | 完整继承 | 引擎 1（本地知识：knowledge/ + .kit/）+ 引擎 2（联网研究：WebSearch/WebFetch） |
| SESSION_BRIEF 机制 | `templates/session-brief.md` | 改编为 kit 风格 | 每次调用先报状态：当前进度 / 终点 / 方向变化 / 下一步 / 需用户决定 |
| 错误恢复 3 阶段策略 | `modes/check.md` | 完整继承 | 阶段 1（自动修复）→ 阶段 2（用户确认后修复）→ 阶段 3（回滚+报告） |
| 图标库锁定（Lucide/Heroicons/Tabler） | `modes/run.md` | 完整继承 | 项目初始化时锁定，写文件前自检确认 |
| 设计 token 强制 | `modes/run.md` | 完整继承 | 禁止硬编码颜色，强制使用 CSS 变量或 Tailwind 自定义 token |

---

## 丢弃的 super-dev 设计

以下设计被明确丢弃，不进入 kit-skills v2.0：

| 丢弃的设计 | 原因 |
|-----------|------|
| 11 位专家角色 | 过度分解，实际执行时角色边界模糊，增加心智负担 |
| 独立 `output/` 目录 | 与 kit-skills 目录结构冲突，KIT 使用 `.test/ai/` 和 `.test/user/` |
| `.super-dev/` 目录 | 与 kit-skills 结构冲突，能力合并到 `modes/` 和 `quality/` |
| Python CLI 工具 | Windows 不兼容，kit-skills 使用 Node.js `.mjs` 脚本 |
| tmux 依赖 | Windows 不兼容，kit-skills 不依赖终端复用工具 |
| 线性 9 阶段流水线 | 无递归能力，无法处理质量飞轮的循环特性；改为状态机驱动 |

---

## 吸收原则

1. **精华提取，非整体复制**：只吸收经过验证有效的具体实践，不复制整体架构
2. **结构适配**：将 super-dev 的概念映射到 kit-skills 的目录结构（modes/quality/templates/knowledge）
3. **Windows 兼容**：丢弃所有 *nix-only 工具依赖（Python CLI、tmux、bash 脚本）
4. **状态机驱动**：用循环状态机替代线性流水线，支持质量飞轮的递归收敛
5. **证据优先**：保留 super-dev 的"证据 > 自报"原则，所有声称必须有验证产物

---

## 与 super-dev 的边界

kit-skills v2.0 不替代 super-dev，而是**吸收其有效部分后独立演进**：

- **super-dev 仍适合**：大型前后端项目、需要严格交付治理、有专门 QA 团队的场景
- **kit-skills v2.0 更适合**：中小型项目、个人开发者、快速迭代、Windows 环境、需要产品语言驱动的场景
- **共存方式**：同一项目可以先使用 kit-skills 建档和初始化，在规模扩大后迁移到 super-dev 的治理模式
