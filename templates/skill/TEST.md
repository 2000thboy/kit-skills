# {{project_name}} 测试指引

> 模板类型: `skill` — 可复用 Skill 包
> 适用宿主: Claude Code, Codex, OpenCode, Cursor, Windsurf 等

## 快速开始

### 1. 结构完整性检查

```bash
# 检查必备文件
ls SKILL.md README.md .kit/version.json

# 检查 SKILL.md 格式（必须有 frontmatter）
head -20 SKILL.md | grep -E "^---$|^name:|^description:|^argument-hint:"
```

### 2. Skill 包自检

```bash
# 如 skill 包含 npm 包结构
npm run check
npm run check:contract
npm run check:self-audit
npm run check:pack
npm pack --dry-run

# 如 skill 包含 helper 脚本
node --check bin/*.mjs
```

### 3. 宿主兼容性测试

```bash
# Claude Code
claude --skill {{project_name}}-eval/ --test

# 或手动验证：将 skill 路径提供给 AI，测试关键命令是否被正确识别
```

## Skill 结构检查清单

- [ ] `SKILL.md` 存在且包含有效 frontmatter（name, description）
- [ ] `README.md` 存在且包含人类可读的使用说明
- [ ] 宿主入口正确：`CLAUDE.md`（Claude）或 `AGENTS.md`（Codex/通用）
- [ ] `.kit/version.json` 存在且版本号符合语义化版本
- [ ] `bin/` 中的脚本可执行（如有）
- [ ] `modes/` / `templates/` / `quality/` / `knowledge/` 目录结构合理
- [ ] 无敏感信息泄漏（API key、账号、cookie、secret-like literal）
- [ ] 无硬编码本机路径（`C:\Users\...`, `/Users/...`）
- [ ] 无未使用的导入、变量或文件

## AI 自测流程

1. **结构检查**: 确认所有必备文件存在且格式正确
2. **命令识别测试**: 在宿主中测试 `/{{skill_name}}` 或相关命令是否被正确路由
3. **模板渲染测试**: 如 skill 包含模板，验证模板变量替换是否正确
4. **知识材料检查**: 确认 `knowledge/` 中的内容是解释性的，不冒充项目事实
5. **跨宿主一致性**: 如支持多宿主，确认各宿主入口文件内容一致
6. **打包测试**: `npm pack --dry-run` 无警告，包大小合理
7. **记录证据**: 将自检结果保存到 `.test/ai/reports/`

## 验收标准

- [ ] `SKILL.md` frontmatter 完整且有效
- [ ] `README.md` 包含：定位、快速开始、何时使用/不使用、命令说明
- [ ] 宿主入口文件指向正确的详细 spec 文件
- [ ] `.kit/version.json` 与 `package.json`（如有）版本一致
- [ ] 无 P0 级结构问题
- [ ] 自检报告已归档到 `.test/ai/reports/`

## 常用命令速查

| 任务 | 命令 |
|------|------|
| 结构检查 | `ls SKILL.md README.md .kit/version.json` |
| SKILL.md 格式 | `head -20 SKILL.md` |
| 打包测试 | `npm pack --dry-run` |
| 脚本语法 | `node --check bin/*.mjs` |
| 版本一致性 | `cat .kit/version.json` |

## 故障排查

- **宿主不识别 skill**: 检查 `SKILL.md` frontmatter 格式，确认 `name:` 和 `description:` 存在
- **命令路由错误**: 检查 `modes/` 中的命令定义是否与宿主预期一致
- **模板渲染失败**: 确认模板变量使用 `{{var}}` 格式且变量名无拼写错误
- **打包警告**: 检查 `.gitignore` 和 `package.json` files 字段，排除不应打包的文件
- **跨宿主行为不一致**: 对比各宿主入口文件，确认指向相同的 `modes/` 和 `quality/` 文件
