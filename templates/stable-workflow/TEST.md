# {{project_name}} 测试指引

> 模板类型: `stable-workflow` — 稳定工作流 + Runner Contract
> 适用 runner: Bash/PowerShell, n8n, Temporal, GitHub Actions 等

## 快速开始

### 1. 结构完整性检查

```bash
# 检查必备文件
ls .workflow/README.md

# 检查脚本存在且可执行
ls .workflow/scripts/
```

### 2. 脚本语法检查

```bash
# Bash 脚本
bash -n .workflow/scripts/*.sh

# PowerShell 脚本
powershell -Command "Get-Command .workflow/scripts/*.ps1"
```

### 3. Dry-run 验证

```bash
# 运行 workflow 的 dry-run 模式（不执行实际副作用）
./.workflow/scripts/run.sh --dry-run
# 或
. .workflow/scripts/run.ps1 -DryRun
```

## Workflow 检查清单

- [ ] `.workflow/README.md` 存在且包含流程说明和恢复路径
- [ ] `.workflow/scripts/` 中的脚本可执行且语法正确
- [ ] 脚本包含错误处理（`set -e` 或 `$ErrorActionPreference = "Stop"`）
- [ ] 区分 dry-run 和 live 模式，live 模式有确认门
- [ ] 环境变量和敏感配置未硬编码
- [ ] 日志输出到 `logs/` 而非 stdout 刷屏
- [ ] 外部依赖（API、服务）有可用性检查和超时处理
- [ ] 回滚策略已定义

## AI 自测流程

1. **结构检查**: 确认 `.workflow/` 目录结构和必备文件
2. **语法检查**: 所有脚本通过 `bash -n` 或 PowerShell 语法验证
3. **Dry-run 测试**: 运行 `--dry-run` 模式，确认流程逻辑正确
4. **错误处理测试**: 故意制造错误输入，确认脚本优雅失败
5. **超时测试**: 模拟外部服务延迟，确认超时机制生效
6. **日志检查**: 确认日志输出格式统一、路径正确
7. **记录证据**: 将测试结果保存到 `.test/ai/reports/`

## 验收标准

- [ ] `.workflow/README.md` 包含完整流程说明
- [ ] 所有脚本通过语法检查
- [ ] Dry-run 模式可正常运行且无副作用
- [ ] Live 模式有人工确认门
- [ ] 错误处理覆盖主要失败路径
- [ ] 日志结构清晰且已归档
- [ ] 无 P0 级问题
- [ ] 测试报告已归档到 `.test/ai/reports/`

## 常用命令速查

| 任务 | Bash | PowerShell |
|------|------|------------|
| 语法检查 | `bash -n script.sh` | `Get-Command script.ps1` |
| Dry-run | `./script.sh --dry-run` | `. script.ps1 -DryRun` |
| 查看日志 | `tail -f logs/latest.log` | `Get-Content logs/latest.log -Wait` |
| 检查变量 | `echo $VAR` | `Write-Host $env:VAR` |
| 测试超时 | `timeout 30 ./script.sh` | `Start-Job { script }; Wait-Job -Timeout 30` |

## 故障排查

- **脚本无法执行**: 检查文件权限（`chmod +x`）或执行策略（`Set-ExecutionPolicy`）
- **Dry-run 仍产生副作用**: 检查脚本中是否所有写操作都受 `--dry-run` 条件控制
- **环境变量缺失**: 确认 `.env` 文件存在且已加载，或 runner 已正确配置 secrets
- **外部调用失败**: 检查网络连通性、API 凭证有效期、服务端点 URL
- **日志丢失**: 确认日志目录存在且有写入权限，检查日志轮转配置
- **跨 runner 不兼容**: 如 workflow 需要在多个 runner（Bash + PowerShell）上运行，分别测试
