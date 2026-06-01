# 路径输出规范（IDE vs CLI）

> 所有 AI 产出文件的路径输出，必须根据用户环境选择正确格式。

---

## 环境检测优先级

1. **读取 `.kit/config.json` 的 `env_type`**（如果存在）
2. **检测当前宿主**：Claude Code/Cursor/Windsurf → IDE；纯终端 → CLI
3. **无法检测时 → 主动询问用户**

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ 环境检测
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

不确定你当前的使用环境：

[ ] "IDE"（VS Code / Cursor / Windsurf / JetBrains）
    → 路径支持 Ctrl+左键点击打开
    → 输出相对路径

[ ] "CLI"（终端 / 命令行）
    → 路径需要完整可访问格式
    → 附带查看命令建议

选择后我会记住你的偏好。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 路径格式对照

### IDE 环境

| 场景 | 输出格式 | 示例 |
|---|---|---|
| 文件产出 | 相对路径（可点击） | `.plan/PRD.md` |
| 报告生成 | 相对路径 + 提示 | `.test/ai/reports/acceptance-YYYYMMDD.md`（点击打开） |
| 目录结构 | 相对路径 | `.kit/`、`.workflow/` |
| 证据路径 | 相对路径 | `.test/ai/evidence/screenshot.png` |

**特点：**
- 使用正斜杠 `/`（IDE 通用格式）
- 不输出完整绝对路径（IDE 自动解析）
- 可配合提示语：`（Ctrl+左键点击打开）`

### CLI 环境

| 场景 | 输出格式 | 示例 |
|---|---|---|
| 文件产出 | 绝对路径 + 查看命令 | `D:\projects\my-app\.plan\PRD.md`（`cat` 查看） |
| 报告生成 | 绝对路径 + 查看命令 | `D:\projects\my-app\.test\ai\reports\...`（`cat` 查看） |
| 目录结构 | 绝对路径 | `D:\projects\my-app\kit-skills\` |
| 证据路径 | 绝对路径 + 查看命令 | `D:\projects\my-app\.test\ai\evidence\...` |

**特点：**
- 使用系统原生路径分隔符（Windows `\`，Unix `/`）
- 必须输出完整绝对路径（用户需要复制粘贴）
- 附带查看命令建议：`cat`、`less`、`code`、`notepad`
- 标注当前工作目录（cwd）

---

## 禁止行为

- ❌ IDE 环境输出绝对路径（占屏幕空间，不需要）
- ❌ CLI 环境输出相对路径（用户不知道 cwd 在哪）
- ❌ 不检测环境就默认输出一种格式
- ❌ 混合使用 `\` 和 `/` 在同一输出中

---

## 模板

### IDE 模板

```markdown
文件已生成：`.plan/PRD.md`（Ctrl+左键点击打开）
报告位置：`.test/ai/reports/acceptance-20260101.md`
证据目录：`.test/ai/evidence/`
```

### CLI 模板

```markdown
文件已生成：{cwd}\.plan\PRD.md
查看命令：cat {cwd}\.plan\PRD.md

报告位置：{cwd}\.test\ai\reports\acceptance-20260101.md
查看命令：cat {cwd}\.test\ai\reports\acceptance-20260101.md

证据目录：{cwd}\.test\ai\evidence\
列出命令：ls {cwd}\.test\ai\evidence\
```

---

## 版本

- v1.0: 2026-06-01 建立
