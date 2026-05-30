# kit-skills v2.0

# UI 质量检查清单（Vibe Coding 专项检测 — UI 层）

针对 AI 生成代码中常见的 UI 质量问题，逐项检查。
每项包含：检测方法、常见错误模式、修复建议、严重程度。

---

## 1. 元素遮挡/重叠

**检测方法**
- [ ] 浏览器 DevTools → Elements → 检查 z-index 层级
- [ ] 检查 `position: fixed` / `position: sticky` / `position: absolute` 元素的叠加关系
- [ ] 检查 `overflow: hidden` 是否意外裁剪了子元素
- [ ] 在不同滚动位置检查固定元素（header、footer、fab）是否遮挡内容

**常见错误模式**
- Modal/Dialog 被其他元素覆盖（z-index 不够高）
- Dropdown/Select 菜单被父容器 `overflow: hidden` 裁剪
- Fixed header 遮挡页面顶部内容（缺少 `padding-top` 补偿）
- Sticky sidebar 和 main content 重叠
- 多个 fixed 元素（header + banner + fab）堆叠导致可用空间过小

**修复建议**
- 建立 z-index 层级系统（如：base=0, dropdown=100, sticky=200, fixed=300, modal-backdrop=400, modal=500, toast=600）
- 使用 Portal / Teleport 将 modal/dropdown 渲染到 body 层级
- Fixed header 给 body 或 main 添加对应高度的 `padding-top`
- 避免在可能 `overflow: hidden` 的容器内使用 absolute 定位的弹出层

**严重程度**: P0（直接影响可用性）

---

## 2. 响应式断点异常

**检测方法**
- [ ] 浏览器 DevTools → Toggle Device Toolbar → 检查 mobile（<640px）、tablet（640-1024px）、desktop（>1024px）
- [ ] 检查 Tailwind 响应式类（`sm:`、`md:`、`lg:`、`xl:`）是否完整覆盖
- [ ] 检查横向滚动条是否出现（不应出现的横向滚动）
- [ ] 检查内容是否被截断或溢出视口

**常见错误模式**
- 只写了 desktop 样式，mobile 完全崩坏
- `flex-row` 未在 mobile 切换为 `flex-col`
- 表格在 mobile 下横向溢出
- 图片未设置 `max-width: 100%` 导致撑破容器
- Grid 列数在 tablet 下不合理（如 4 列在 tablet 下太挤）

**修复建议**
- Mobile-first 原则：先写 base（mobile），再用 `sm:`、`md:`、`lg:` 扩展
- 表格使用横向滚动容器（`overflow-x-auto`）或卡片式重构
- 图片统一加 `w-full h-auto` 或 `object-cover`
- 使用 Container Queries 处理组件级响应式（如支持）

**严重程度**: P0（移动端不可用 = 大量用户流失）

---

## 3. 文本截断/溢出

**检测方法**
- [ ] 使用长文本测试（如 200 字符标题、长用户名、长 URL）
- [ ] 检查多语言场景（中文、日文、德文通常比英文长）
- [ ] 检查 `text-overflow: ellipsis` 是否正确应用
- [ ] 检查 `white-space: nowrap` 是否导致容器撑破

**常见错误模式**
- 标题无截断处理，撑破卡片高度
- 按钮文字过长导致按钮变形
- 表格单元格内容溢出
- 用户名/邮箱显示区域固定宽度，长内容被截断且无提示
- 多行文本未限制行数，导致卡片高度不一致

**修复建议**
- 单行截断：`truncate`（Tailwind）或 `text-overflow: ellipsis; white-space: nowrap; overflow: hidden`
- 多行截断：`line-clamp-2` / `line-clamp-3`（Tailwind）
- 动态内容区域预留足够弹性空间
- 对可能超长的内容添加 `title` 属性或 tooltip

**严重程度**: P1（影响美观和信息完整度）

---

## 4. 无意义的 Loading/Mock 占位

**检测方法**
- [ ] 检查 Skeleton 屏是否与实际内容结构一致
- [ ] 检查 loading 状态是否真实反映 API 请求状态
- [ ] 检查是否有 "Lorem ipsum" 或 "示例文本" 残留
- [ ] 检查是否有假数据（如 `const mockData = [...]`）未替换为真实 API

**常见错误模式**
- Skeleton 屏结构与实际内容不符（如 skeleton 有 3 行文字，实际只有 1 行）
- Loading 状态永远显示（未绑定真实 loading 变量）
- 页面显示 "Demo Data"、"Test User" 等假数据
- 图片使用 placeholder 未替换为真实图片 URL
- 图表使用静态假数据，未接入真实数据源

**修复建议**
- Skeleton 结构应与真实内容 1:1 对应
- Loading 状态必须绑定到真实的 `isLoading` / `isPending` 变量
- 全局搜索 "mock"、"demo"、"test"、"lorem"、"示例"，确认是否应移除
- 图片使用真实 URL 或合理的 fallback（如首字母头像）

**严重程度**: P0（假数据 = 功能未实现）

---

## 5. 空状态未处理

**检测方法**
- [ ] 清空列表数据，检查是否显示空状态
- [ ] 搜索无结果时，检查是否有提示
- [ ] 断开网络，检查是否有离线提示
- [ ] 新用户首次进入，检查是否有引导空状态

**常见错误模式**
- 列表为空时显示空白区域，用户不知道发生了什么
- 搜索无结果时无提示，用户以为搜索坏了
- 网络断开时页面卡住，无重试机制
- 表格无数据时表头也不显示
- 图表无数据时显示空白或报错

**修复建议**
- 列表空状态：显示插图 + "暂无数据" + 操作按钮（如 "创建第一个"）
- 搜索无结果：显示 "未找到匹配结果" + 搜索建议 + 清除搜索按钮
- 网络断开：显示离线提示 + 重试按钮
- 表格空状态：显示表头 + 空行提示
- 图表空状态：显示 "暂无数据" 占位

**严重程度**: P1（影响用户体验和完成率）

---

## 6. 错误状态未处理

**检测方法**
- [ ] 提交表单时触发验证错误，检查错误提示
- [ ] 模拟 API 400/401/403/404/500，检查错误处理
- [ ] 检查权限不足场景是否有友好提示
- [ ] 检查文件上传失败、图片加载失败是否有 fallback

**常见错误模式**
- 表单验证错误只显示 "请检查输入"，不指出具体字段
- API 错误只显示 "Something went wrong"，无具体信息
- 401 未登录时页面白屏，不跳转登录
- 403 无权限时显示空白，不提示联系管理员
- 图片加载失败显示裂图，无 fallback

**修复建议**
- 表单验证：每个字段独立显示具体错误信息
- API 错误：显示后端返回的具体 message，或按错误码映射为中文提示
- 401：自动跳转登录页或显示登录弹窗
- 403：显示 "无权限访问" + 联系管理员指引
- 500：显示 "服务暂时不可用" + 重试按钮 + 错误 ID（便于排查）
- 图片：使用 `onError` 切换到 fallback 图片或占位图

**严重程度**: P0（错误无提示 = 用户困惑和流失）

---

## 7. 图标来源检查

**检测方法**
- [ ] 全局搜索 emoji（正则：`[\u{1F300}-\u{1F9FF}]` / `[☀-⛿]`）
- [ ] 检查图标 import 来源（应为声明的图标库）
- [ ] 检查是否有内联 SVG 与项目图标库重复

**常见错误模式**
- 使用 emoji 代替图标（如 `🔍` 代替搜索图标）
- 混用多个图标库（Lucide + FontAwesome + 内联 SVG）
- 图标库版本不一致导致样式差异
- 使用图片 PNG 代替矢量图标

**修复建议**
- 统一使用声明的图标库（Lucide / Heroicons / Tabler）
- 使用图标库提供的 React/Vue 组件，确保可样式化
- 移除所有 emoji，替换为对应图标
- 如需自定义图标，使用 SVG 组件化，不要内联 raw SVG

**严重程度**: P1（影响品牌一致性和专业度）

---

## 8. 颜色来源检查

**检测方法**
- [ ] 全局搜索硬编码 hex 颜色（正则：`#[0-9a-fA-F]{3,6}`）
- [ ] 检查 CSS/JSX 中是否有 `rgb()` / `hsl()` 硬编码值
- [ ] 检查 Tailwind 类名是否使用设计 token（如 `bg-primary` 而非 `bg-blue-500`）

**常见错误模式**
- 直接使用 `bg-blue-500`、`text-red-600` 等 Tailwind 默认色
- 内联 style 写死 `color: #1890ff`
- 暗色模式下硬编码颜色不反转
- 不同文件使用相近但不完全相同的颜色值

**修复建议**
- 所有颜色使用设计 token（Tailwind config 自定义色 或 CSS variables）
- 语义化命名：`primary`、`secondary`、`success`、`warning`、`error`、`text-primary`、`bg-surface`
- 暗色模式通过 token 自动切换，不在代码中写条件判断
- 建立颜色对照表，确保全项目一致

**严重程度**: P0（用户已多次拒绝硬编码颜色，见 USER.md）

---

## 9. 项目配置完整性

**检测方法**
- [ ] 检查 `vite.config.js` / `vite.config.ts` 是否存在
- [ ] 检查 `eslint` 配置是否存在（`.eslintrc.*` 或 `eslint.config.*`）
- [ ] 检查 `tsconfig.json` / `jsconfig.json` 是否存在
- [ ] 运行 `npm run lint` 确认不报错
- [ ] 运行 `npm run build` 确认零错误

**常见错误模式**
- 项目初始化后未配置 lint，导致代码风格混乱
- 无 tsconfig/jsconfig，import 路径无别名支持
- 无 vite 配置，无法自定义构建行为
- `npm run lint` 直接报错退出

**修复建议**
- 初始化时即配置 ESLint：`npm init @eslint/config`
- 配置路径别名：`tsconfig.json` / `jsconfig.json` 中定义 `paths`
- 配置 vite.config：至少包含 `resolve.alias` 和 `build` 选项
- 将 lint 和 build 加入 CI 门禁

**严重程度**: P0（无配置 = 无质量保证基础）

---

## 10. CSS 方案检查

**检测方法**
- [ ] 检查是否有 CSS 文件或 CSS-in-JS 方案
- [ ] 检查是否全部使用 inline style
- [ ] 检查是否有统一的样式入口（如 `src/styles/`、`tailwind.css`）

**常见错误模式**
- 所有组件全部使用 `style={{ ... }}` 内联样式
- 无 CSS 文件，无样式复用
- 无设计 token 系统
- 样式散落在各组件中，难以维护

**修复建议**
- 引入 Tailwind CSS、CSS Modules 或 styled-components
- 建立 `src/styles/` 目录，存放全局样式和 token
- 将 inline style 迁移到 className 或 styled 组件
- 定义设计 token 文件（colors、spacing、typography）

**严重程度**: P1（影响可维护性，但功能可用）

---

## 11. 滚动边界

**检测方法**
- [ ] 检查页面/容器是否可滚动（内容超出视口时）
- [ ] 检查滚动是否流畅（无卡顿、无跳动）
- [ ] 检查 fixed/sticky 元素是否阻挡滚动
- [ ] Mobile 检查是否和系统手势冲突（如下拉刷新、左右滑动返回）
- [ ] 检查模态框打开时背景是否应锁定滚动（`overflow: hidden on body`）

**常见错误模式**
- 内容超出但容器不可滚动（未设置 `overflow: auto`）
- 模态框打开时背景仍可滚动
- 滚动条样式不一致（Windows 默认滚动条破坏设计）
- 无限滚动加载时跳动（未预留骨架高度）
- Mobile 左右滑动和页面内轮播冲突

**修复建议**
- 可滚动区域明确设置 `overflow-y-auto` 或 `overflow-auto`
- 模态框打开时锁定 body 滚动（`document.body.style.overflow = 'hidden'`）
- 统一滚动条样式（CSS `scrollbar-width` / `::-webkit-scrollbar`）
- 无限滚动使用骨架屏预留高度，减少布局偏移（CLS）
- Mobile 轮播组件添加 `touch-action: pan-y` 避免和垂直滚动冲突

**严重程度**: P1（影响可用性和体验流畅度）

---

## 10. 触摸目标大小

**检测方法**
- [ ] Mobile 下检查按钮、链接、图标按钮的可点击区域
- [ ] 使用 DevTools → 显示触摸目标大小（部分浏览器支持）
- [ ] 检查相邻可点击元素间距是否足够（避免误触）

**常见错误模式**
- 图标按钮只有 16x16px，远小于推荐尺寸
- 表单复选框/单选框点击区域太小
- 列表项滑动操作按钮太窄
- 相邻按钮间距小于 8px，容易误触

**修复建议**
- 所有可点击元素最小 44x44px（Apple HIG）或 48x48px（Material Design）
- 小图标按钮使用 `p-2` 或 `p-3` 增加点击区域
- 复选框/单选框使用 label 包裹，扩大点击区域到文字
- 相邻可点击元素间距至少 8px

**严重程度**: P1（影响移动端可用性和无障碍访问）

---

## 12. 加载逻辑闪烁

**检测方法**
- [ ] 检查 loading 状态的初始值和切换时机
- [ ] 用慢网络模拟，观察 UI 是否先显示数据再显示 loading
- [ ] 检查 `useEffect` 中 loading 的 set 顺序

**常见错误模式**
- `loading` 初始为 `false`，`useEffect` 中才设为 `true`，导致先显示数据再显示 loading
- 骨架屏和真实内容同时显示
- 加载完成前显示旧数据

**修复建议**
- `loading` 初始值设为 `true`
- 骨架屏和真实内容互斥显示：`loading ? <Skeleton /> : <Content />`
- 数据获取完成后再关闭 loading

**严重程度**: P1（影响用户体验，显得产品不专业）

---

## 检查汇总表

| 检查项 | 检测方法 | 严重程度 | 常见错误 |
|--------|----------|----------|----------|
| 元素遮挡/重叠 | DevTools z-index + 滚动检查 | P0 | Modal 被覆盖、dropdown 被裁剪 |
| 响应式断点 | Device Toolbar 三断点检查 | P0 | 无 mobile 样式、表格溢出 |
| 文本截断/溢出 | 长文本测试 + 多语言检查 | P1 | 标题撑破卡片、按钮变形 |
| Loading/Mock 占位 | 搜索 "mock/demo/lorem" | P0 | 假数据残留、loading 不绑定状态 |
| 空状态未处理 | 清空数据 + 断网测试 | P1 | 空白区域、无重试机制 |
| 错误状态未处理 | 模拟 4xx/5xx + 表单验证 | P0 | "Something went wrong"、白屏 |
| 图标来源 | 搜索 emoji + 检查 import | P0 | Emoji 代替图标、混用库 |
| 颜色来源 | 搜索硬编码 hex | P0 | `bg-blue-500`、暗色模式不反转 |
| 项目配置 | 检查 vite/eslint/tsconfig | P0 | 无 lint、build 配置缺失 |
| CSS 方案 | 检查 inline style 比例 | P1 | 全部 inline style、无复用 |
| 滚动边界 | 滚动测试 + 模态框锁定 | P1 | 不可滚动、背景可滚动 |
| 触摸目标 | Mobile 点击区域检查 | P1 | 16px 图标按钮、间距不足 |
| 加载闪烁 | 检查 loading 初始值和时机 | P1 | 先显示数据再显示 loading |
