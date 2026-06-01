# {{project_name}} 沙盒使用说明

> 模板类型: `stable-workflow` — 稳定工作流 + Runner Contract
> 创建日期: {{date}}
> 项目规模: {{scale}}

## 沙盒用途

本沙盒用于隔离工作流的开发、调试与验证，防止未经验证的 workflow 脚本或配置影响生产环境。

## 目录结构

```
{{project_name}}/
  .workflow/            # 工作流定义目录（KIT-managed）
    README.md           # 当前可恢复入口、流程说明
    status.md           # 当前状态快照
    codex.md            # Codex 宿主预设
    workbuddy.md        # WorkBuddy 宿主预设
    trae-solo.md        # Trae Solo 宿主预设
    scripts/            # 工作流脚本
  docs/                 # 稳定文档（架构、UI/UX）
  scripts/              # 辅助脚本
  logs/                 # 执行日志
  README.md             # 本文件
  TEST.md               # 测试指引
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
# 沙盒清理必须先预览路径并确认目标在当前工作区内
pwd
ls -la {{project_name}}-eval/
# 确认无未合并修改后，再由用户明确批准删除
```

## 隔离规则

1. **AI 只写沙盒**: AI 代理只能在 `{{project_name}}-eval/` 中修改文件，不得直接修改主项目 `{{project_name}}/`。
2. **Runner 隔离**: 沙盒中的 workflow 脚本使用独立的环境变量和配置，不与生产 runner 共享状态。
3. **单向流动**:
   ```
   主项目 → git clone → 沙盒（开发/调试）
   沙盒通过测试 → 人工审核 → 合并回主项目 → 发布到生产 runner
   ```
4. **日志隔离**: 沙盒执行产生的日志存放于 `logs/`，不污染主项目的 `.workflow/` 或生产日志系统。

## Workflow 验证

开发过程中应随时验证 workflow 的可执行性：

```bash
# 检查 workflow 入口文件存在
ls .workflow/README.md .workflow/scripts/

# 检查脚本可执行性（PowerShell）
Get-Command .workflow/scripts/*.ps1

# 检查脚本可执行性（Bash）
chmod +x .workflow/scripts/*.sh
bash -n .workflow/scripts/*.sh

# 验证 workflow 配置语法（YAML/JSON）
python -c "import yaml; yaml.safe_load(open('.workflow/config.yaml'))"
```

## 合并回主项目

```bash
# 方式1: git push
cd {{project_name}}-eval/
git push origin <分支名>

# 方式2: 手动复制关键改动
# - .workflow/README.md（入口更新）
# - .workflow/scripts/（脚本变更）
# - .workflow/status.md（状态快照）
# - docs/（稳定文档更新）
```

## 注意事项

- `.workflow/` 是唯一 KIT-managed workflow 目录，不要新建 `docs/workflows/`。
- 老项目已有 `docs/workflows/` 或 `.workflows/` 时，归档时迁移或桥接到 `.workflow/`。
- 工作流脚本必须包含错误处理（`set -e` 或 `$ErrorActionPreference = "Stop"`）。
- 涉及外部调用（API、浏览器、文件写入）时，必须区分 dry-run 和 live 模式。
- 环境变量和敏感配置不得硬编码，应使用 `.env` 或 runner  secrets。
