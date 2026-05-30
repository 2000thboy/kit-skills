# kit-skills v2.0

# 编码后实现闭环 5 项检查（Post-Code Closure）

继承 super-dev 精华。代码写入后，必须通过以下 5 项检查才能认为"实现完成"。

---

## Check 1: Build 无错误（Build Zero Errors）

**做什么**
运行项目构建命令，确认 exit code 为 0，无任何 error。

**怎么做**
- [ ] 运行 `npm run build`（或 `yarn build`、`pnpm build`、等效命令）
- [ ] 检查 stdout/stderr，确认无 `error` 级别输出
- [ ] 记录构建时间、包体积变化（如有显著变化）

**通过标准**
- exit code === 0
- 无 TypeScript 编译 error
- 无 bundler（Vite/Webpack/Rollup）error
- 无 CSS/PostCSS/Tailwind error

**失败处理**
- 若构建失败 → 诊断根因，修复后重新构建
- 若错误来自现有代码 → 评估是否本次修复，或标记为技术债
- 若构建时间过长 → 检查是否引入大型依赖，记录优化建议

---

## Check 2: Lint 无 Error（Lint Zero Errors）

**做什么**
运行 lint 命令，确认无 error 级别问题。Warning 可接受但需记录。

**怎么做**
- [ ] 运行 `npm run lint`（或 `eslint .`、`prettier --check`、等效命令）
- [ ] 检查输出，分类统计 error / warning 数量
- [ ] 对新增代码，确认无 error

**通过标准**
- error count === 0
- 新增代码无 warning（理想）或 warning 已记录原因
- 代码风格符合项目约定

**失败处理**
- 若存在 error → 修复后重新 lint
- 若 warning 来自现有代码且数量庞大 → 不阻塞本次交付，标记为技术债
- 若 lint 规则与项目实际风格冲突 → 记录规则名，建议调整配置

---

## Check 3: 无控制台红色错误（No Console Red Errors）

**做什么**
启动应用，检查浏览器控制台（DevTools Console）无红色 error。

**怎么做**
- [ ] 运行 `npm run dev`（或等效启动命令）
- [ ] 打开浏览器，访问相关页面
- [ ] 打开 DevTools → Console 面板
- [ ] 过滤 "error" 级别，确认无红色错误
- [ ] 检查 Network 面板，确认无 4xx/5xx 请求错误（排除预期内的 401 等）

**通过标准**
- Console 无红色 error（排除已知的第三方库 warning）
- 无未捕获的 Promise rejection
- 无 404 资源加载失败（CSS/JS/图片/字体）

**失败处理**
- 若发现运行时 error → 定位文件和行号，修复
- 若发现 404 资源 → 检查路径配置、public 目录、CDN 配置
- 若发现第三方库报错 → 评估版本兼容性，记录 workaround

---

## Check 4: 新增代码接入真实调用链（Real Call Chain Verification）

**做什么**
确认新增代码被真实调用，不是死代码（dead code）。

**怎么做**
- [ ] 使用 `grep` / `rg` 搜索新增导出（函数、组件、hook）的 import 引用
- [ ] 确认新增组件在 JSX/TSX 中被使用（不是只定义不渲染）
- [ ] 确认新增 API 调用在真实流程中被触发（不是只定义不调用）
- [ ] 确认新增路由在导航中被链接（不是孤立页面）
- [ ] 检查 tree-shaking 是否可能移除新增代码（若代码未被引用）

**通过标准**
- 每个新增导出至少有一个真实 import
- 每个新增组件至少在一个页面/父组件中被渲染
- 每个新增 API 调用至少在一个用户操作路径中被触发

**失败处理**
- 若发现死代码 → 删除或接入调用链
- 若新增代码被条件渲染隐藏 → 确认条件路径可触发，添加测试覆盖
- 若新增代码是工具函数 → 确认至少有一个调用方，或标记为 "待使用"

---

## Check 5: 新增日志/告警验证真实路径触发（Path Execution Verification）

**做什么**
添加临时日志或确认机制，验证代码路径确实被执行，API 被真实调用。

**怎么做**
- [ ] 在新增的关键函数/组件入口添加 `console.log('[KIT-CHECK] <name> triggered')`
- [ ] 触发对应的用户操作（点击、提交、导航等）
- [ ] 确认控制台出现对应日志
- [ ] 对 API 调用，确认 Network 面板出现真实请求（非 mock）
- [ ] 验证完成后，可选择保留日志（生产环境应移除或替换为正式日志库）

**通过标准**
- 用户操作触发后，对应代码路径日志出现
- API 请求在 Network 面板可见，状态码符合预期
- 无 mock 拦截器（MSW / json-server / 本地 mock）干扰真实请求

**失败处理**
- 若日志未出现 → 检查条件分支、路由守卫、权限控制是否阻止执行
- 若 API 请求被 mock 拦截 → 确认 mock 配置，移除相关 mock 或切换到真实环境
- 若 API 返回非预期状态码 → 检查请求参数、认证信息、后端状态

---

## 闭环检查汇总

| 检查项 | 命令/方法 | 通过标准 | 失败处理 |
|--------|-----------|----------|----------|
| Build 无错误 | `npm run build` | exit 0, 无 error | 修复构建错误 |
| Lint 无 error | `npm run lint` | error count 0 | 修复 lint 错误 |
| 控制台无红错 | 浏览器 DevTools | 无红色 error | 修复运行时错误 |
| 真实调用链 | grep/rg import | 每个导出有引用 | 删除死代码或接入调用链 |
| 路径触发验证 | console.log + 操作 | 日志出现 + API 真实 | 检查分支/mock/后端 |

**注意**
- 以上 5 项全部通过，方可标记任务为 "完成"
- 任何一项失败，必须修复后重新检查
- 检查证据（截图、日志、命令输出）应归档到 `.test/ai/evidence/` 或等效目录
