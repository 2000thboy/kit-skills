# {{project_name}}

> 负责人: {{owner}}
> 级别: {{level}}
> 配置: {{profile}}
> 项目版本: {{project_version}}
> 创建日期: {{date}}

## 当前概况

- 产品事实: `.plan/PRD.md`
- 技术契约: `.plan/SPEC.md`
- 任务与证据: `.plan/CHECKLIST.md`
- 项目状态: `.kit/config.json`
- 版本契约: `.kit/version.json`
- 宿主入口: `{{host_entry}}`
- 测试包: `.test/README.md`

## 工作流入口

使用 `.workflow/README.md` 作为工作流入口，包含宿主预设、恢复规则、工作流脚本和历史工作流契约。

不要创建 `docs/workflows/`。如果项目中已有 `.workflows/` 或 `docs/workflows/`，将其视为遗留材料，并在 `.plan/SPEC.md` 中记录迁移或桥接方案。

## 开发规则

如果本 README 与 `.plan/` 中的内容冲突，先更新过时的文件，再实施变更。

根目录的 `README.md` 是唯一项目 README。不要添加 `.plan/README.md`。

测试材料应归入 `.test/`，而不是放在根目录的松散 Markdown 文件中。

AI 自检、脚本运行、模型生成的反馈、夹具和包验证放入 `.test/ai/`。真实的用户包、说明、验收表单、反馈和返回的证据放入 `.test/user/`。AI 模拟的用户仍然是 AI。

不要创建根目录的 `output/` 或 `outputs/`。如果在归档清理期间已存在，将内容分类到 `.test/ai/`、`.test/user/` 或 `.plan/archive/`。
