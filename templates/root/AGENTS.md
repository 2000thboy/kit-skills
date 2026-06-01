# AGENTS.md — {{project_name}}

项目版本: `{{project_version}}`
KIT 模板版本: `{{kit_version}}`
宿主: `{{host}}`

按以下顺序阅读:

1. `README.md`
2. `.plan/PRD.md`
3. `.plan/SPEC.md`
4. `.plan/CHECKLIST.md`
5. `.kit/config.json`
6. `.kit/version.json`
7. `.workflow/README.md`
8. `.test/README.md`
9. `.test/config.json`

规则:

- 保持根目录 `README.md` 作为面向用户的入口。不要创建 `.plan/README.md`。
- 保持 `project_version` 在 `.kit/version.json`、`AGENTS.md`、包/发布元数据和 git 标签（如有）之间一致。
- 使用 `.workflow/` 作为唯一的 KIT 管理工作流目录。
- 将 AI 自检、脚本化的浏览器/CLI 运行、模型生成的反馈、演练、夹具和包验证放在 `.test/ai/` 下。
- 仅将真实的用户测试包、用户说明、验收表单、反馈和返回的证据放在 `.test/user/` 下。
- AI 模拟的用户属于 AI 测试。不要将其归档为真实用户测试。
- 不要创建根目录的 `output/` 或 `outputs/`。在归档清理期间，将现有内容分类到 `.test/ai/`、`.test/user/` 或 `.plan/archive/`。
- 在变更架构、工作流入口、版本策略或测试策略之前，先更新 `.plan/SPEC.md`。
