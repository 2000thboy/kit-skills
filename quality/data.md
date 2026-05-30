# kit-skills v2.0

# 数据质量检查清单（Vibe Coding 专项检测 — 数据层）

针对 AI 生成代码中常见的数据层质量问题，逐项检查。
确保数据流真实、持久、可靠。

---

## 1. API 响应是 Mock 还是真实？

**检测方法**
- [ ] 检查 `src/api/` 或等效目录，搜索 "mock"、"faker"、"msw"、"json-server"
- [ ] 检查 Network 面板，确认请求域名是真实后端还是 localhost mock
- [ ] 检查是否有 `if (process.env.NODE_ENV === 'development')` 返回 mock 数据
- [ ] 检查 API 响应时间是否异常快（<50ms 通常是本地 mock）

**常见错误模式**
- 整个页面使用 `const data = [...]` 硬编码假数据
- 使用 MSW（Mock Service Worker）拦截所有 API 请求
- 开发环境全部走 mock，从未联调真实后端
- API 函数存在但未实际调用（只定义了接口）

**修复建议**
- 移除所有 mock 数据，替换为真实 API 调用
- 如需保留 mock 用于测试，将其隔离到 `__tests__/` 或 `mocks/` 目录
- 开发环境也应能切换真实后端（通过环境变量或代理配置）
- 确认 API baseURL 指向真实服务

**严重程度**: P0（mock 数据 = 功能未实现）

---

## 2. 所有 CRUD 操作有真实后端吗？

**检测方法**
- [ ] 列出页面所有操作：Create（创建）、Read（读取）、Update（更新）、Delete（删除）
- [ ] 每个操作检查是否调用真实 API
- [ ] 检查 Network 面板，确认每个操作都有对应的 HTTP 请求

**常见错误模式**
- 列表页有数据（Read 实现），但新增按钮无反应（Create 未实现）
- 编辑表单提交后刷新页面，数据恢复原样（Update 未实现）
- 删除按钮点击后前端移除元素，但刷新后数据还在（Delete 未实现）
- 只有 Read，无 Create/Update/Delete（只读页面）

**修复建议**
- 每个操作必须对应真实 API 调用
- Create: `POST /resource`
- Read: `GET /resource` 或 `GET /resource/:id`
- Update: `PUT /resource/:id` 或 `PATCH /resource/:id`
- Delete: `DELETE /resource/:id`
- 操作成功后刷新列表数据（重新 fetch）

**严重程度**: P0（CRUD 不完整 = 功能残缺）

---

## 3. 表单提交后数据真的保存了吗？

**检测方法**
- [ ] 填写表单并提交
- [ ] 提交成功后刷新页面（F5 / Cmd+R）
- [ ] 确认数据仍然存在
- [ ] 检查 Network 面板，确认提交请求 payload 正确
- [ ] 检查响应，确认返回了保存后的数据或成功状态

**常见错误模式**
- 表单提交只更新前端状态，未调用 API
- API 调用成功但后端未实际保存（后端返回 200 但实际无写入）
- 提交后显示成功 toast，但刷新后数据丢失
- 乐观更新（optimistic update）失败未回滚

**修复建议**
- 表单提交必须调用真实 API
- 提交后等待 API 响应成功再显示成功状态
- 成功后重新获取数据（invalidate query cache）
- 实现错误回滚：API 失败时恢复原始数据

**严重程度**: P0（数据不保存 = 功能完全失效）

---

## 4. 刷新页面数据还在吗？

**检测方法**
- [ ] 在页面上进行数据操作（新增/编辑/删除）
- [ ] 刷新页面（F5 / Cmd+R）
- [ ] 确认数据状态与刷新前一致
- [ ] 检查 localStorage / sessionStorage / IndexedDB 是否有持久化数据（如设计需要）

**常见错误模式**
- 数据只存在前端状态（React state / Vue ref），未持久化
- 使用 URL query 传递状态，刷新后丢失
- 表单草稿未自动保存到 localStorage
- 用户登录状态刷新后丢失（token 未持久化）

**修复建议**
- 业务数据由后端持久化，前端刷新后重新获取
- 表单草稿可自动保存到 localStorage（按产品设计）
- 认证 token 保存到 localStorage / cookie，刷新后自动恢复登录
- 页面状态（如筛选条件）可同步到 URL query，刷新后保留

**严重程度**: P0（刷新丢数据 = 不可用）

---

## 5. 加载状态是否真实反映 API 状态？

**检测方法**
- [ ] 模拟慢速网络（DevTools → Network → Slow 3G）
- [ ] 触发数据加载，观察 loading 状态
- [ ] 检查 loading 是否在 API 请求开始时显示、结束时消失
- [ ] 检查是否有 loading 状态闪烁（快速出现又消失）

**常见错误模式**
- Loading 状态是固定值，不绑定 API 状态
- API 已返回但 loading 仍在显示（未正确更新状态）
- 多个并发请求导致 loading 状态混乱（一个完成就关闭，但其他还在进行）
- 使用 `setTimeout` 模拟 loading 时间，而非真实 API 状态

**修复建议**
- Loading 状态必须绑定到真实的 `isLoading` / `isPending` / `isFetching`
- 使用 React Query / SWR / VueUse 等库自动管理 loading 状态
- 多个并发请求时，使用计数器或全局 loading 状态
- 避免人为延迟（`setTimeout`），loading 时间由网络决定

**严重程度**: P1（影响用户感知和体验）

---

## 6. 错误状态是否显示真实错误信息？

**检测方法**
- [ ] 模拟 API 错误（DevTools → Network → Block request URL）
- [ ] 模拟后端返回 400/401/403/404/500
- [ ] 检查错误提示内容
- [ ] 检查错误提示是否帮助用户理解和解决问题

**常见错误模式**
- 所有错误只显示 "Something went wrong"
- 错误提示是英文，但用户界面是中文
- 401 错误不提示重新登录
- 400 错误不显示具体字段验证失败信息
- 网络错误和服务器错误使用相同提示

**修复建议**
- 按错误码分类提示：
  - 400: 显示后端返回的具体验证错误（字段级）
  - 401: "登录已过期，请重新登录" + 跳转登录
  - 403: "无权限执行此操作" + 联系管理员指引
  - 404: "请求的资源不存在"
  - 500: "服务暂时不可用，请稍后重试" + 错误 ID
  - 网络错误: "网络连接失败，请检查网络后重试"
- 错误信息使用用户语言（中文界面 = 中文错误提示）

**严重程度**: P0（错误无意义 = 用户无法自助解决）

---

## 7. 数据格式是否符合 API 契约？

**检测方法**
- [ ] 对比前端 TypeScript 类型 / Zod schema 和后端 API 文档
- [ ] 检查请求 payload 字段名、类型、是否必填
- [ ] 检查响应数据字段名、类型、嵌套结构
- [ ] 使用运行时类型检查（Zod / io-ts / Yup）验证

**常见错误模式**
- 前端用 `camelCase`，后端用 `snake_case`，未做转换
- 前端期望 `user.name`，后端返回 `user.full_name`
- 日期字段前端用 `Date`，后端用 ISO string，未统一
- 数字字段后端返回 string（如 `"123"`），前端按 number 处理
- 可选字段前端标记为必填，导致提交失败

**修复建议**
- 前后端统一命名规范，或在 API 层做自动转换
- 使用 Zod / Yup 定义 schema，在 API 层统一校验和转换
- 日期统一使用 ISO 8601 string 传输，前端按需转换
- 建立 API 契约文档（OpenAPI / Swagger），前后端共同遵守
- 使用类型生成工具（如 `openapi-typescript`）从契约生成前端类型

**严重程度**: P0（数据格式不一致 = 运行时错误）

---

## 8. 分页/无限滚动是否正确实现？

**检测方法**
- [ ] 检查列表分页参数（page / limit / offset / cursor）
- [ ] 触发分页/滚动加载，检查新数据是否正确追加
- [ ] 检查总页数/总数是否正确显示
- [ ] 检查快速滚动时是否重复请求（防抖/去重）
- [ ] 检查空页（最后一页）是否正确处理

**常见错误模式**
- 分页参数错误（如 `page` 从 0 开始但后端从 1 开始）
- 无限滚动重复加载同一页（未更新 cursor/page）
- 快速滚动时触发大量重复请求
- 最后一页后继续请求，返回空数组但仍在 loading
- 分页切换后未回到顶部

**修复建议**
- 明确分页协议（page-based / offset-based / cursor-based）
- 使用 React Query / SWR 的 `useInfiniteQuery` 管理无限滚动
- 添加请求去重（相同参数不重复请求）
- 判断 `hasNextPage`（后端返回 hasMore 或前端判断 list.length < total）
- 分页切换后自动滚动到顶部

**严重程度**: P1（影响大数据量场景可用性）

---

## 检查汇总表

| 检查项 | 检测方法 | 严重程度 | 常见错误 |
|--------|----------|----------|----------|
| API 是否真实 | 搜索 mock + Network 面板 | P0 | 硬编码数据、MSW 拦截 |
| CRUD 完整性 | 列出操作 → 检查 API 调用 | P0 | 只有 Read，无 CUD |
| 表单保存验证 | 提交 → 刷新 → 确认 | P0 | 只更新前端状态 |
| 刷新持久化 | 操作 → 刷新 → 确认 | P0 | 状态未持久化 |
| Loading 真实性 | Slow 3G + 观察状态 | P1 | 固定 loading、setTimeout |
| 错误信息质量 | 模拟错误 → 检查提示 | P0 | "Something went wrong" |
| 数据格式一致 | 类型对比 + Zod 校验 | P0 | camelCase vs snake_case |
| 分页/无限滚动 | 滚动测试 + 参数检查 | P1 | 重复请求、空页未处理 |
