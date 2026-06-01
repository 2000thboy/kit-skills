# 测试包 — {{project_name}}

> 项目版本: `{{project_version}}`
> KIT 模板版本: `{{kit_version}}`
> 宿主: `{{host}}`
> 更新日期: `{{date}}`

## 用途

`.test/` 是隔离的测试包、验收包和证据区。它不放框架自动发现的测试代码；单元、集成、端到端测试代码应放在 `tests/`，AI 全程序自测应放在 `evals/`。

`.test/` 有两个通道：

- `.test/ai/`: AI/自检证据、演练、打包验证和自动化日志。
- `.test/user/`: 真实用户测试包、面向用户的说明、安装包、验收表单、反馈和用户证据。

不要混用这两个通道。AI 验证不是用户测试。用户反馈不是 CI 输出。区分虽小，却能大幅减少混乱。

如果 AI 代理模拟用户、扮演测试者、驱动浏览器、运行 CLI 或生成反馈，它仍然属于 `.test/ai/`。`.test/user/` 仅用于真实人类或外部用户测试者，以及为他们准备的包。

不要创建根目录的 `output/` 或 `outputs/`。这些文件夹本质上是目录形式的歧义。将其内容分类到 `.test/ai/`、`.test/user/` 或 `.plan/archive/`。

## 目录结构

```text
.test/
  README.md
  config.json
  ai/
    sandboxes/
    reports/
    evidence/
    packages/
    fixtures/
  user/
    README.md
    packages/
    guides/
    acceptance/
    feedback/
    evidence/
```

## 前端应用

测试前记录真实项目命令：

```powershell
<安装命令>
<开发服务器命令>
<构建命令>
<测试命令>
```

检查项：

- 应用在文档记录的 URL 打开
- 第一个可用工作流无需开发者备注即可运行
- 布局适配桌面端和移动端
- 无文本重叠或控件裁剪
- 浏览器/截图证据保存在 `.test/user/evidence/`（用户运行）或 `.test/ai/evidence/`（AI 运行）

## Skill 包

从包根目录运行验证和打包演练：

```powershell
<skill 验证命令>
<打包演练命令>
```

将 AI 演练文件列表保存在 `.test/ai/packages/`。这些是过程材料，不进入 V1 交付包。将用户可安装包保存在 `.test/user/packages/`。

## 后端或 CLI

从 `.test/ai/sandboxes/<version>/<test-slug>/` 驱动 AI CLI 检查：

```powershell
<设置命令>
<冒烟命令>
<失败/边界情况命令>
```

将命令输出和退出码保存在 `.test/ai/reports/`。

## 用户测试包

此处仅放置面向用户的材料：

```text
.test/user/
  README.md
  packages/
  guides/
  acceptance/
  feedback/
  evidence/
```

交付给用户前，准备：

- `.test/user/README.md` 中的安装/打开说明
- `.test/user/packages/` 中的已测试包或 URL 指针
- `.test/user/guides/` 中的用户应尝试内容
- `.test/user/acceptance/` 中的通过/失败检查清单
- `.test/user/feedback/` 中的反馈表单或备注
- `.test/user/evidence/` 中的截图、录屏或返回证据

不要将 AI 生成的模拟反馈放在此处。如果模型假装是用户，它属于 `.test/ai/reports/`。

## 工作流项目

阅读 `.workflow/README.md`，然后是 `.plan/`、`.kit/` 和本文件。

检查项：

- 恢复路径清晰
- 演练路径与实时操作分离
- 状态和证据路径有文档记录
- 人工停止关卡可见
- 旧的 `.workflows/` 或 `docs/workflows/` 路径已迁移、桥接或标记为历史
