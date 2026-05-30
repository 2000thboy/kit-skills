# kit-v2-smoke 沙盒使用说明

> 模板类型: `data-ml` — 数据分析/ML/实验项目
> 创建日期: 2026-05-30
> 项目规模: standard

## 沙盒用途

本沙盒用于隔离数据实验、模型训练与主项目，确保实验可复现、数据不污染生产环境。

## 目录结构

```
kit-v2-smoke/
  data/
    raw/            # 原始数据（只读，永不修改）
    processed/      # 清洗后的数据
  notebooks/        # Jupyter / Colab 笔记本
  models/           # 训练好的模型文件
  results/          # 实验结果、图表、指标
  src/              # 源码（数据 pipeline、特征工程、模型定义）
  tests/            # 测试代码
  logs/             # 训练日志、执行日志
  README.md         # 本文件
  TEST.md           # 测试指引
```

## 创建与销毁

### 创建沙盒

```bash
# 从主项目克隆（推荐）
git clone <主项目地址> kit-v2-smoke-eval/

# 或使用 cp -r（无 git 时）
cp -r kit-v2-smoke/ kit-v2-smoke-eval/
```

### 销毁沙盒

```bash
# 沙盒可随时销毁重建（模型文件大，注意备份重要结果）
rm -rf kit-v2-smoke-eval/
```

## 隔离规则

1. **AI 只写沙盒**: AI 代理只能在 `kit-v2-smoke-eval/` 中修改文件，不得直接修改主项目 `kit-v2-smoke/`。
2. **数据只进不出**: `data/raw/` 中的原始数据只读，处理后的数据写入 `data/processed/`。
3. **模型版本化**: `models/` 中的模型文件按版本命名，如 `model-v1-20250630.pkl`。
4. **单向流动**:
   ```
   主项目 → git clone → 沙盒（实验/训练）
   实验通过 → 人工审核 → 合并代码与结果回主项目
   ```
5. **实验记录**: 每次实验的结果必须记录到 `results/` 并附 `EXPERIMENT.md` 说明。

## 数据管理

- `data/raw/`: 存放原始数据，加入 `.gitignore`，不上传 Git。
- `data/processed/`: 存放清洗后的数据，可上传样本或元数据。
- 大数据集使用外部存储（S3、GCS、NAS）并在 `README.md` 中记录路径。

## 合并回主项目

```bash
# 方式1: git push
cd kit-v2-smoke-eval/
git push origin <分支名>

# 方式2: 手动复制关键结果
# - src/ 中的代码改动
# - notebooks/ 中的分析结论
# - results/ 中的关键图表和指标
# - models/ 中的最终模型（如体积过大，只传元数据）
```

## 注意事项

- 模型文件可能很大，确保 `.gitignore` 已配置。
- 实验参数应记录到 `results/EXPERIMENT.md`，确保可复现。
- GPU 资源紧张时，避免在沙盒中同时运行多个训练任务。
- 敏感数据不得离开 `data/raw/`，处理后的数据需脱敏。
