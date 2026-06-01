# {{project_name}} 沙盒使用说明

> 模板类型: `skill` — 可复用 Skill 包
> 创建日期: {{date}}
> 项目规模: {{scale}}

## 沙盒用途

本沙盒用于隔离 skill 包的开发、测试与迭代，防止未经验证的 skill 结构污染宿主环境的 skill 目录。

## 目录结构

```
{{project_name}}/
  SKILL.md          # Skill 入口定义（name, description, argument-hint）
  README.md         # 人类 onboarding 文档
  AGENTS.md         # Codex/通用宿主入口
  CLAUDE.md         # Claude 宿主主入口（如适用）
  bin/              # 可执行脚本或 helper
  knowledge/        # 解释性知识材料（非项目事实）
  modes/            # 模式/子命令定义
  templates/        # 可复用模板
  quality/          # 质量门禁定义
  .kit/             # KIT 元数据（config.json, version.json）
  .test/            # 测试包
    ai/             # AI 自检、fixtures、报告
    user/           # 真实用户测试包
  README.md         # 本文件
  TEST.md           # 测试指引
```

## 创建与销毁

### 创建沙盒

```bash
# 从主项目克隆（推荐）
git clone <主项目地址> {{project_name}}-eval/

# 或使用 cp -r（无 git 时）
cp -r {{project_name}}/ {{project_name}}-eval/
```

### 销毁沙盒

```bash
# 沙盒可随时销毁重建
rm -rf {{project_name}}-eval/
```

## 隔离规则

1. **AI 只写沙盒**: AI 代理只能在 `{{project_name}}-eval/` 中修改文件，不得直接修改主项目 `{{project_name}}/`，更不得直接写入宿主 skill 目录（如 `~/.claude/skills/`）。
2. **宿主隔离**: 测试 skill 时，使用 `--skill` 参数指向沙盒路径，而不是安装到宿主目录。
3. **单向流动**:
   ```
   主项目 → git clone → 沙盒（开发/测试）
   沙盒通过测试 → 人工审核 → 合并回主项目 → 发布/安装到宿主
   ```
4. **版本锁定**: 沙盒中测试的 skill 版本必须与 `.kit/version.json` 一致，防止版本漂移。

## Skill 结构自检

开发过程中应随时运行结构检查：

```bash
# 检查 SKILL.md 格式
node --check bin/spec-loop-kit.mjs  # 如 skill 包含 helper 脚本

# 检查 package.json（如 skill 包含 npm 包）
npm pack --dry-run

# 检查关键文件存在
ls SKILL.md README.md .kit/version.json
```

## 合并回主项目

```bash
# 方式1: git push
cd {{project_name}}-eval/
git push origin <分支名>

# 方式2: 手动复制关键改动
# - SKILL.md / README.md / AGENTS.md / CLAUDE.md
# - bin/ 中的脚本更新
# - modes/ / templates/ / quality/ / knowledge/ 中的内容
# - .kit/version.json 版本升级
```

## 注意事项

- **不要**在沙盒中直接修改宿主目录（如 `~/.claude/skills/`）中的已安装 skill。
- Skill 包必须包含 `SKILL.md`，否则宿主无法识别。
- `knowledge/` 只放解释性材料，项目真实状态看 `.plan/` 和 `.kit/`。
- 敏感材料（账号、cookie、token、大文件）不得进入 skill 包。
- 多宿主同步：如果在 Codex、Claude、WorkBuddy 等多个宿主中使用，保持行为一致，除非文件明确是宿主特定的（如 launcher shim）。
