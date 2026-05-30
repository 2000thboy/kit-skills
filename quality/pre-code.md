# kit-skills v2.0

# 编码前 5 步门禁（Pre-Code Gate）

继承 super-dev 精华。任何代码写入前，必须依次通过以下 5 步。
未通过则停止编码，返回诊断报告，不进入下一步。

---

## Step 1: 技术栈预研（Tech Stack Research）

**做什么**
确认项目使用的框架、库、API 的最新版本和签名，不凭记忆猜测。

**怎么做**
- [ ] 读取项目根目录 `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` 等依赖文件
- [ ] 识别核心依赖（框架、UI 库、状态管理、HTTP 客户端等）
- [ ] 对不确定的 API，使用 WebSearch 或 WebFetch 查询官方文档最新版本
- [ ] 记录查询到的 API 签名、版本号、 breaking changes

**通过标准**
- 所有核心依赖的版本和 API 签名已确认
- 无 "应该差不多" 的假设
- 发现 breaking change 时已有应对方案

**失败处理**
- 若官方文档无法访问 → 记录替代来源（GitHub release notes、npm 页面）
- 若发现重大 breaking change → 暂停编码，向用户报告影响范围和选项
- 若技术栈未确定 → 返回 Step 0（brainstorm / 技术选型讨论）

---

## Step 2: 读取项目配置（Project Config Discovery）

**做什么**
全面读取项目级配置文件，理解构建、类型、路径别名等约束。

**怎么做**
- [ ] 读取 `tsconfig.json` — 确认 target、module、paths、strict 模式
- [ ] 读取 `vite.config.*` / `next.config.*` / `webpack.config.*` — 确认别名、插件、代理
- [ ] 读取 `tailwind.config.*` / `postcss.config.*` — 确认主题扩展、自定义 token
- [ ] 读取 `.env` / `.env.local` / `.env.example` — 确认环境变量约定
- [ ] 读取 `package.json` scripts — 确认可用命令（build / dev / lint / test）
- [ ] 若存在 `super-dev.yaml` / `.kit/config.json` — 读取项目级约定

**通过标准**
- 路径别名已知（如 `@/`、`~/`）
- 构建命令已知且可运行
- 类型检查严格模式已知
- 环境变量命名约定已知

**失败处理**
- 若配置文件缺失或损坏 → 记录问题，询问是否创建/修复
- 若路径别名与代码中实际使用不一致 → 以配置文件为准，标记需要修复的代码
- 若存在多个冲突的配置（如两个 tsconfig）→ 确认主配置并记录

---

## Step 3: 声明 UI 工具链（UI Toolchain Declaration）

**做什么**
锁定图标库、颜色系统、字体和间距系统，防止编码时出现风格漂移。

**怎么做**
- [ ] **图标库**：确认使用 Lucide / Heroicons / Tabler / 其他，写入 `.kit/config.json` 或 `docs/ui-ux/icon-system.md`
- [ ] **颜色系统**：确认使用 Tailwind tokens / CSS variables / CSS-in-JS theme，列出主色、辅色、中性色、语义色（success/warning/error/info）
- [ ] **字体系统**：确认字体族、字重、行高、字号阶梯（xs/sm/base/lg/xl/2xl...）
- [ ] **间距系统**：确认 spacing scale（Tailwind 默认或自定义）
- [ ] **圆角/阴影**：确认 border-radius 和 box-shadow 的 token

**通过标准**
- 所有 UI 决策有文档记录
- 无 "随便用一个" 的占位
- 与 `docs/ui-ux/` 现有文档一致（如有）

**失败处理**
- 若项目无 UI 文档 → 基于现有代码提取实际使用的模式，创建最小文档
- 若发现代码中混用多个图标库 → 标记清理任务，选择一个主库
- 若发现硬编码 hex 颜色 → 标记替换为 token 的任务

---

## Step 4: 确认 API 契约和设计 Token（API Contract & Design Token）

**做什么**
确认前后端接口契约、API 路径、请求/响应格式、错误码，以及设计 token 的映射关系。

**怎么做**
- [ ] 读取 `docs/architecture/api.md` 或等效文档 — 确认 REST/GraphQL/gRPC 路径
- [ ] 读取 `docs/ui-ux/design-tokens.md` 或等效文档 — 确认 token 命名和值
- [ ] 检查 `src/api/` 或等效目录 — 确认现有 API 客户端模式（axios/fetch/tRPC）
- [ ] 确认错误码映射：400（参数错误）、401（未认证）、403（无权限）、404（不存在）、500（服务端错误）
- [ ] 确认认证方式：Bearer token / Cookie / API key / OAuth
- [ ] 确认响应格式统一约定（如 `{ success: boolean, data: T, error?: { code, message } }`）

**通过标准**
- 所有 API 路径与文档一致
- 请求/响应类型已定义（TypeScript interface / Zod schema / 等）
- 错误处理策略已知
- 设计 token 与代码中的映射关系清晰

**失败处理**
- 若 API 文档缺失 → 基于现有代码反向提取，创建最小文档，标记为 "待后端确认"
- 若发现 API 路径不一致（文档 vs 代码）→ 以文档为准，标记代码需要更新
- 若设计 token 未定义 → 创建基础 token 集，后续迭代扩展

---

## Step 5: 建立页面结构 + 验证构建零错误（Structure + Zero-Error Build）

**做什么**
创建目录结构和入口文件，运行首次构建，确认零错误。

**怎么做**
- [ ] 按 SPEC 创建目录结构（pages/ components/ hooks/ api/ stores/ 等）
- [ ] 创建入口文件（空壳即可，如 `pages/dashboard/index.tsx`）
- [ ] 运行 `npm run build`（或等效命令）
- [ ] 运行 `npm run type-check` / `tsc --noEmit`（如有）
- [ ] 运行 `npm run lint`（如有）
- [ ] 确认 exit code 为 0

**通过标准**
- 目录结构符合 SPEC
- 构建命令 exit 0，无 error
- 类型检查无 error（warning 可接受但需记录）
- lint 无 error

**失败处理**
- 若构建失败 → 诊断错误，修复后重新运行
- 若类型错误来自现有代码（非本次新增）→ 记录但不阻塞，标记为技术债
- 若 lint 规则过于严格导致大量误报 → 记录规则名称，建议调整配置

---

## 门禁汇总

| 步骤 | 名称 | 核心产出 | 阻塞条件 |
|------|------|----------|----------|
| 1 | 技术栈预研 | API 签名确认表 | 核心依赖版本未知 |
| 2 | 项目配置读取 | 配置约束清单 | 构建命令未知 |
| 3 | UI 工具链声明 | UI 决策记录 | 图标库/颜色系统未锁定 |
| 4 | API 契约确认 | API 映射表 + 错误码策略 | API 路径不一致 |
| 5 | 结构 + 零错误构建 | 目录结构 + 构建通过证据 | 构建 exit 非 0 |

**编码前写文件自检（4 项）**

每次写入文件前，额外自检：
- [ ] `"use client"` 是否需要？（Next.js App Router 场景）
- [ ] 图标来自声明的图标库？（不是 emoji）
- [ ] 颜色来自设计 token？（不是硬编码 hex）
- [ ] import 路径正确？API 路径与架构文档一致？
