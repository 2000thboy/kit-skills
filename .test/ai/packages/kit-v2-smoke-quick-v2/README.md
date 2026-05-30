# kit-v2-smoke-quick-v2 沙盒使用说明

> 模板类型: `default` — 纯代码/通用项目
> 创建日期: 2026-05-30
> 项目规模: quick

## 沙盒用途

本沙盒用于隔离 AI 开发/测试环境与主项目，防止 AI 迭代污染人类工作区。

## 目录结构

```
kit-v2-smoke-quick-v2/
  src/              # 源代码
  tests/            # 测试代码（pytest / jest / 等）
  evals/            # AI 自测配置与证据
  logs/             # 执行日志
  README.md         # 本文件
  TEST.md           # 测试指引
```

## 创建与销毁

### 创建沙盒

```bash
# 从主项目克隆（推荐）
git clone <主项目地址> kit-v2-smoke-quick-v2-eval/

# 或使用 cp -r（无 git 时）
cp -r kit-v2-smoke-quick-v2/ kit-v2-smoke-quick-v2-eval/
```

### 销毁沙盒

```bash
# 沙盒可随时销毁重建
rm -rf kit-v2-smoke-quick-v2-eval/
```

## 隔离规则

1. **AI 只写沙盒**: AI 代理只能在 `kit-v2-smoke-quick-v2-eval/` 中修改文件，不得直接修改主项目 `kit-v2-smoke-quick-v2/`。
2. **人类只读沙盒**: 人类工作区是单一事实来源，沙盒中的代码需经审核后才能合并回主项目。
3. **单向流动**:
   ```
   主项目 → git clone → 沙盒（AI 开发/测试）
   沙盒通过测试 → 人工审核 → 合并回主项目
   ```
4. **日志与证据**: AI 自测产生的截图、日志、报告存放于 `evals/` 和 `logs/`，不污染主项目。

## 合并回主项目

沙盒通过全部测试后，将改动合并回主项目：

```bash
# 方式1: git push（沙盒是独立 clone）
cd kit-v2-smoke-quick-v2-eval/
git push origin <分支名>

# 方式2: 手动复制（无 git 时）
# 将 src/ 中修改的文件复制回主项目对应位置
```

## 注意事项

- 沙盒不是长期存储区，测试完成后应及时归档或销毁。
- 不要在沙盒中提交敏感信息（API Key、账号密码等）。
- 沙盒中的 `node_modules/`、`__pycache__/` 等缓存目录应加入 `.gitignore`。
