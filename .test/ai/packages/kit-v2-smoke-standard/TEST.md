# kit-v2-smoke-standard 测试指引

> 模板类型: `data-ml` — 数据分析/ML/实验项目
> 适用框架: pytest / Jupyter / scikit-learn / PyTorch / TensorFlow 等

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
# 或
conda env create -f environment.yml
conda activate kit-v2-smoke-standard
```

### 2. 数据 Pipeline 端到端运行

```bash
# 运行完整数据 pipeline（数据清洗 → 特征工程 → 模型训练 → 评估）
python src/pipeline.py --config configs/default.yaml

# 或分步运行
python src/data_prep.py
python src/feature_engineering.py
python src/train.py --epochs 50
python src/evaluate.py
```

### 3. 验证数据完整性

```bash
# 检查原始数据是否存在
python -c "import os; assert os.path.exists('data/raw/'), 'data/raw/ missing'"

# 检查处理后数据
python -c "import pandas as pd; df = pd.read_csv('data/processed/train.csv'); print(f'Shape: {df.shape}')"
```

## 模型指标复现

### 复现步骤

1. **确认环境一致**:
   ```bash
   python --version
   pip list > env-snapshot.txt
   ```

2. **确认随机种子**:
   ```python
   import random, numpy as np, torch
   random.seed(42)
   np.random.seed(42)
   torch.manual_seed(42)
   ```

3. **运行训练**:
   ```bash
   python src/train.py --config configs/reproduce.yaml
   ```

4. **对比指标**:
   ```bash
   python src/evaluate.py --model models/model-v1.pkl --test-data data/processed/test.csv
   ```

### 指标记录格式

在 `results/` 中创建 `metrics-YYYYMMDD.json`:

```json
{
  "model_version": "v1",
  "dataset": "data/processed/train.csv",
  "seed": 42,
  "metrics": {
    "accuracy": 0.92,
    "precision": 0.89,
    "recall": 0.91,
    "f1": 0.90
  },
  "training_time_sec": 120,
  "hardware": "NVIDIA RTX 4090"
}
```

## 测试结构

```
tests/
  test_data_prep.py       # 数据清洗测试
  test_features.py        # 特征工程测试
  test_model.py           # 模型逻辑测试
  test_pipeline.py        # 端到端 pipeline 测试
```

## AI 自测流程

1. **数据验证**: 确认 `data/raw/` 和 `data/processed/` 数据完整
2. **运行单元测试**: `pytest tests/ -v`
3. **运行端到端 pipeline**: `python src/pipeline.py`
4. **验证指标复现**: 对比当前结果与历史 `results/metrics-*.json`
5. **检查 notebook 可运行**: `jupyter nbconvert --to notebook --execute notebooks/analysis.ipynb`
6. **记录证据**: 将训练曲线、指标对比保存到 `results/evidence/`
7. **生成报告**: 在 `results/` 中写入 `EXPERIMENT.md`

## 验收标准

- [ ] 数据 pipeline 端到端运行无报错
- [ ] 模型指标与历史记录一致（误差 <= 1%）
- [ ] 所有 pytest 测试通过
- [ ] Notebook 可完整执行无报错
- [ ] 训练日志已归档到 `logs/`
- [ ] 实验报告已写入 `results/EXPERIMENT.md`

## 常用命令速查

| 任务 | 命令 |
|------|------|
| 运行全部测试 | `pytest tests/ -v` |
| 运行单个测试 | `pytest tests/test_model.py::test_forward -v` |
| 运行 notebook | `jupyter nbconvert --execute notebooks/analysis.ipynb` |
| 训练模型 | `python src/train.py --config configs/default.yaml` |
| 评估模型 | `python src/evaluate.py --model models/model-v1.pkl` |
| 检查数据 | `python -c "import pandas as pd; print(pd.read_csv('data/raw/data.csv').shape)"` |

## 故障排查

- **数据缺失**: 检查 `data/raw/` 是否存在，路径是否正确
- **指标不一致**: 检查随机种子、数据版本、模型版本是否一致
- **OOM（内存不足）**: 减小 batch size，或使用 `torch.cuda.empty_cache()`
- **CUDA 不可用**: 检查 `torch.cuda.is_available()`，确认 CUDA 驱动和 PyTorch 版本匹配
