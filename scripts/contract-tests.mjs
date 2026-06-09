#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cli = path.join(root, "bin", "spec-loop-kit.mjs");
const node = process.execPath;
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kit-contract-"));
const results = [];

function run(args, options = {}) {
  const result = spawnSync(node, [cli, ...args], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      ...options.env
    }
  });
  return {
    code: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: "PASS" });
  } catch (error) {
    results.push({ name, status: "FAIL", error: error.message });
  }
}

function read(rel) {
  return fs.readFileSync(path.join(tmpRoot, rel), "utf8");
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

const zhReadme = `# acceptance-app 中文验收应用

项目版本: \`0.1.0\`

这是面向中文用户的 V1 演示项目 README。README 只作为用户指南和 GitHub 首页入口，不写阶段报告、验收报告或交接报告。

## 功能

- 可运行的本地应用。
- 中文使用说明。
- 基础测试命令。
- 验收材料索引。

## 快速开始

\`\`\`powershell
npm test
$env:PORT=4171; npm start
\`\`\`

## 怎么使用

1. 打开本地页面。
2. 按页面提示完成核心流程。
3. 运行测试确认项目可用。

## 测试

运行 \`npm test\`。

## 项目结构

\`\`\`text
.
├─ README.md
├─ HANDOFF.md
├─ .plan/
└─ .test/
\`\`\`

## 验收材料在哪里

报告和证据不放在 README 主体里。请查看 \`HANDOFF.md\`、\`.plan/\`、\`.test/ai/reports/\` 和 \`.test/ai/evidence/\`。
`;

const zhHandoff = `# 交接说明：acceptance-app 中文验收应用

日期: 2026-06-01

## 运行方式

\`\`\`powershell
npm test
$env:PORT=4171; npm start
\`\`\`

打开 \`http://localhost:4171\`。这是本地示例端口，实际交付时以运行日志中的端口为准。

## 已交付内容

- 中文可读的项目入口说明。
- 可运行的 V1 演示应用。
- 计划、规格、任务清单和验收证据。
- 桌面端、移动端、空态和成功态截图。
- 面向中国大陆客户的交付风险说明。

## 交付内容物

状态: 已确认用于 V1 客户交接。

包含项、不包含项、运行方式、验收证据和已知风险与 README、计划文档、验收报告保持一致。

## 需求到执行交接

已确认需求: 这是面向中国大陆客户交接的 V1 演示项目，用户已经确认范围、边界和验收方式。

计划: \`.plan/PRD.md\`、\`.plan/SPEC.md\`、\`.plan/CHECKLIST.md\` 已关闭核心任务，下一步按命令链执行。

下一步命令: \`/kit-run start -> /kit-check diff -> /kit-test -> /kit-pack\`
`;

const zhPrd = `# PRD - 中文验收应用

## 产品目标

为中国大陆客户提供一个可以当天评审的 V1 演示应用。用户需要看到清晰的业务目标、运行方式、交付内容、验收证据和后续上线风险。

## 用户价值

业务负责人可以用中文理解项目做了什么、怎么打开、哪些功能已经完成、哪些内容不属于本次交付。开发者可以根据计划文档继续实现或修复。

## 范围

包含应用主体、中文交付文档、基础测试、截图证据和四角色评分。不包含真实支付、生产部署、正式账号体系和线上客户数据。

✅ 用户确认 | 时间: 2026-06-01 | 版本: 0.1.0
`;

const zhSpec = `# SPEC - 中文验收应用

## 技术方案

项目使用 Node.js 测试脚本和本地文件证据完成 V1 验收。交付路径为 \`/kit-run -> /kit-check -> /kit-test -> /kit-pack\`，每一步都必须写入状态文件和报告。

## 章程一致性

README.md、AGENTS.md、.workflow/README.md、.test/README.md、PRD、SPEC、CHECKLIST 和 .kit/version.json 的目标、范围、版本和证据路径必须一致。

## Capability Skill Inventory

## 能力与工具

宿主状态: Codex 已安装 kit-skills 和 deep-research。项目状态: 不需要项目内安装 skill。批准状态: 本夹具不需要额外批准。证据: 合同测试。

## 登录浏览器路径

如果验收涉及登录态浏览器，标准路径是使用项目指定浏览器自动化或 OpenCLI；认证材料只保存在用户环境，不进入交付包。当前夹具没有真实登录账号，证据路径为 .test/ai/evidence。

## 调用状态简报

当前状态: V1 验收。终点: Definition of Done with Stop Gate。question-bank.json SB1 已被引用。

## 归档交互门

归档前确认: PRD、SPEC、CHECKLIST、.kit、.workflow、.test、README、HANDOFF 和实际文件必须对齐。只有 validate 没有 P0/P1 且事实一致时，才可以减少额外追问。

## 框架路由决策

本夹具只使用 KIT。OpenSpec 和 Super Dev 对这个小型后端夹具不是必需项。

## Model / Agent Risk Ledger

## 模型与智能体风险账本

Provider/model version: none。Cost budget quota rate limit: none。Context token chunk truncation: none。Tool permission policy: allowlist only, denylist live action and dangerous operations。Eval isolation: contract temp directory。Prompt drift policy / 提示词/人设漂移策略: not applicable。Trace sensitive data policy: no traces retained。Reproducibility policy / 可复现性策略: deterministic fixture。Content safety: no content generation。Evidence retention: .test/ai/reports。

✅ 用户确认 | 时间: 2026-06-01 | 版本: 0.1.0
`;

const zhChecklist = `# CHECKLIST - 中文验收应用

任务列表前置规划
停止门/验收门

- [x] 完成应用实现。
- [x] 运行 npm test。
- [x] README、HANDOFF、PRD、SPEC、CHECKLIST、UI 验收和验收报告均为中文优先。
- [x] 保存桌面端、移动端、空态和成功态截图证据。
- [x] 明确包含内容、不包含内容、运行方式、验收证据、已知风险和下一步命令。
- [x] 确认该清单可以让中文用户直接判断当前版本是否适合进入交付打包。

✅ 用户确认 | 时间: 2026-06-01 | 版本: 0.1.0
`;

const zhUiAcceptance = `# UI 验收证据

## 结论

桌面端、移动端、空态、成功态和错误态截图已经保存。页面需要让中国大陆客户在不阅读代码的情况下理解当前状态、下一步动作和交付边界。

## 检查项

- 桌面端截图存在且能看到主要业务流程。
- 移动端截图使用完整页面证据，不只截首屏。
- 空态提供下一步指引。
- 成功态或错误态提供明确反馈。
- 中文文案优先，保留必要命令、路径和 API 英文。
`;

const zhAcceptanceReport = `# /kit-test 验收报告

日期: 2026-06-01

## 结论

V1 演示包通过基础验收，可以进入 /kit-pack。该结论只代表客户评审和交接前验收，不代表已经完成生产上线。

## 证据

- npm test 已通过。
- 四角色评分均不低于 95。
- 桌面端、移动端、空态和成功态截图已保存。
- README、HANDOFF、计划文档和验收说明均为中文优先。

## 风险

生产部署前还需要真实域名、账号、安全、备份、监控、客户确认和合规检查。
`;

const zhFourRoleReview = `# 四角色评审

| 角色 | 分数 | 判断 |
| --- | ---: | --- |
| PM | 95 | 通过。需求边界、交付内容物和客户验收路径清晰。 |
| Code | 95 | 通过。测试命令、状态文件和包输入快照可复核。 |
| Frontend | 95 | 通过。桌面端、移动端、空态和成功态证据完整。 |
| Backend | 95 | 通过。运行、检查、验收和打包命令链清晰。 |
`;

test("help exits 0 and lists public commands", () => {
  const result = run(["--help"]);
  assert(result.code === 0, `expected exit 0, got ${result.code}`);
  assert(result.stdout.includes("spec-loop-kit init"), "missing init usage");
  assert(result.stdout.includes("spec-loop-kit validate"), "missing validate usage");
  assert(result.stdout.includes("spec-loop-kit audit"), "missing audit usage");
});

test("unknown option fails fast", () => {
  const result = run(["validate", "--definitely-not-real"]);
  assert(result.code === 1, `expected exit 1, got ${result.code}`);
  assert(result.stderr.includes("Unknown option"), "missing unknown option error");
});

test("missing cwd returns JSON BLOCKED and exit 2", () => {
  const missing = path.join(tmpRoot, "does-not-exist");
  const result = run(["audit", "--cwd", missing, "--json"]);
  assert(result.code === 2, `expected exit 2, got ${result.code}`);
  const report = parseJson(result.stdout, "missing cwd report");
  assert(report.schema_version === 1, "missing schema_version");
  assert(report.status === "BLOCKED", `expected BLOCKED, got ${report.status}`);
  assert(report.p0.some((issue) => issue.code === "missing-cwd"), "missing missing-cwd issue");
});

test("init generic renders expected files and no placeholders", () => {
  const project = path.join(tmpRoot, "generic app");
  const result = run(["init", "--cwd", project, "--owner", "tester", "--level", "2", "--host", "generic"]);
  assert(result.code === 0, `expected exit 0, got ${result.code}: ${result.stderr}`);
  const required = [
    "README.md",
    "AGENTS.md",
    ".plan/PRD.md",
    ".plan/SPEC.md",
    ".plan/CHECKLIST.md",
    ".kit/config.json",
    ".kit/version.json",
    ".workflow/README.md",
    ".workflow/codex.md",
    ".workflow/workbuddy.md",
    ".workflow/trae-solo.md",
    ".test/README.md",
    ".test/config.json",
    ".test/user/README.md",
    "docs/ui-ux"
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(project, rel)), `missing ${rel}`);
  }
  const rendered = [
    ".plan/PRD.md",
    ".plan/SPEC.md",
    ".plan/CHECKLIST.md",
    ".kit/config.json",
    ".test/config.json",
    ".workflow/README.md",
    "AGENTS.md"
  ].map((rel) => fs.readFileSync(path.join(project, rel), "utf8")).join("\n");
  assert(!/{{[^}]+}}/.test(rendered), "rendered files contain unresolved placeholders");
});

test("init claude creates CLAUDE.md as host entry", () => {
  const project = path.join(tmpRoot, "claude-app");
  const result = run(["init", "--cwd", project, "--owner", "tester", "--level", "1", "--host", "claude"]);
  assert(result.code === 0, `expected exit 0, got ${result.code}`);
  assert(fs.existsSync(path.join(project, "CLAUDE.md")), "missing CLAUDE.md");
  assert(!fs.existsSync(path.join(project, "AGENTS.md")), "AGENTS.md should not be created for claude host");
});

test("validate json has stable shape and exits 0 without P0", () => {
  const project = path.join(tmpRoot, "generic app");
  const result = run(["validate", "--cwd", project, "--profile", "auto", "--host", "generic", "--json"]);
  assert(result.code === 0, `expected exit 0, got ${result.code}: ${result.stderr}`);
  const report = parseJson(result.stdout, "validate report");
  assert(report.schema_version === 1, "missing schema_version");
  for (const key of ["cwd", "profile", "host", "status", "p0", "p1", "p2", "evidence", "recommended_next_action"]) {
    assert(Object.prototype.hasOwnProperty.call(report, key), `missing report key ${key}`);
  }
  assert(Array.isArray(report.p0) && report.p0.length === 0, "expected no P0");
});

test("invalid json config is reported instead of silently ignored", () => {
  const project = path.join(tmpRoot, "invalid-json-app");
  const init = run(["init", "--cwd", project, "--owner", "tester", "--level", "2", "--host", "generic"]);
  assert(init.code === 0, `init expected exit 0, got ${init.code}: ${init.stderr}`);
  fs.writeFileSync(path.join(project, ".test", "config.json"), "{ broken json", "utf8");
  const result = run(["validate", "--cwd", project, "--profile", "auto", "--host", "generic", "--json"]);
  assert(result.code === 0, `expected exit 0, got ${result.code}: ${result.stderr}`);
  const report = parseJson(result.stdout, "invalid json validate report");
  assert(report.p1.some((issue) => issue.code === "invalid-json" && issue.file === ".test/config.json"), "missing invalid-json issue for .test/config.json");
});

test("run/check commands write executable phase state reports", () => {
  const project = path.join(tmpRoot, "state-machine-app");
  const init = run(["init", "--cwd", project, "--owner", "tester", "--level", "2", "--host", "generic", "--skip-brainstorm"]);
  assert(init.code === 0, `init failed: ${init.stderr}`);
  fs.writeFileSync(path.join(project, "package.json"), JSON.stringify({ scripts: { test: "node --version" } }, null, 2), "utf8");

  const blockedRun = run(["run", "--cwd", project, "--json"]);
  assert(blockedRun.code === 2, `run without handoff should block, got ${blockedRun.code}`);
  const blockedPayload = parseJson(blockedRun.stdout, "blocked run payload");
  assert(blockedPayload.state === "blocked-before-run", "run should record blocked-before-run state");
  assert(fs.existsSync(path.join(project, ".kit", "run-state.json")), "missing run state file after blocked run");

  fs.writeFileSync(path.join(project, "README.md"), zhReadme, "utf8");
  fs.writeFileSync(path.join(project, "HANDOFF.md"), zhHandoff, "utf8");
  fs.writeFileSync(path.join(project, ".plan", "CHECKLIST.md"), "# CHECKLIST\n\n任务列表前置规划\n停止门/验收门\n\n- [x] Implement app\n- [x] Run tests\n", "utf8");

  const runResult = run(["run", "--cwd", project, "--json"]);
  assert(runResult.code === 0, `run with handoff should pass: ${runResult.stderr}`);
  const runPayload = parseJson(runResult.stdout, "run payload");
  assert(runPayload.state === "run-closed", "run should record run-closed state");
  assert(runPayload.required_next_command === "/kit-check diff", "run should bridge to /kit-check diff");
  assert(runPayload.commands.some((record) => record.command.includes("npm") && record.command.includes("test")), "run should execute npm test when present");
  assert(fs.existsSync(path.join(project, runPayload.evidence.report_file)), "missing run closure report");

  const checkResult = run(["check", "--cwd", project, "--json"]);
  assert([0, 2].includes(checkResult.code), `check should return go or fix/block, got ${checkResult.code}`);
  const checkPayload = parseJson(checkResult.stdout, "check payload");
  assert(checkPayload.gates.run_closure_present === true, "check should prove run closure presence");
  assert(["go", "fix"].includes(checkPayload.decision), `unexpected check decision: ${checkPayload.decision}`);
  assert(checkPayload.issues && Array.isArray(checkPayload.issues.p0), "check report should include issue details");
  assert(checkPayload.audit_report?.recommended_next_action, "check report should include audit explanation");
  assert(fs.existsSync(path.join(project, ".kit", "check-state.json")), "missing check state file");
  assert(fs.existsSync(path.join(project, checkPayload.evidence.report_file)), "missing kit-check report");
});

test("run blocks when package has no npm test script", () => {
  const project = path.join(tmpRoot, "no-test-script-app");
  const init = run(["init", "--cwd", project, "--owner", "tester", "--level", "2", "--host", "generic", "--skip-brainstorm"]);
  assert(init.code === 0, `init failed: ${init.stderr}`);
  fs.writeFileSync(path.join(project, "package.json"), JSON.stringify({ scripts: { lint: "node --version" } }, null, 2), "utf8");
  fs.writeFileSync(path.join(project, "HANDOFF.md"), `${zhHandoff}\n\n## 交付内容物\n包含: 应用文件。\n不包含: 生产部署。\n已知风险: 仅用于演示。\n证据: 测试和截图。\n`, "utf8");
  fs.writeFileSync(path.join(project, ".plan", "CHECKLIST.md"), "# CHECKLIST\n\n任务列表前置规划\n停止门/验收门\n\n- [x] Implement app\n", "utf8");

  const result = run(["run", "--cwd", project, "--json"]);
  assert(result.code === 2, `run without npm test should block, got ${result.code}`);
  const payload = parseJson(result.stdout, "no test script run payload");
  assert(payload.gates.npm_test_present === false, "run should record missing npm test");
  assert(payload.state === "blocked-before-run", "missing npm test should block run closure");
});

test("test/pack commands require executable acceptance state", () => {
  const project = path.join(tmpRoot, "acceptance");
  const init = run(["init", "--cwd", project, "--owner", "tester", "--level", "2", "--host", "generic", "--skip-brainstorm", "--with-user"]);
  assert(init.code === 0, `init failed: ${init.stderr}`);
  fs.writeFileSync(path.join(project, "package.json"), JSON.stringify({ scripts: { test: "node --version" } }, null, 2), "utf8");
  fs.writeFileSync(path.join(project, "HANDOFF.md"), zhHandoff, "utf8");
  fs.writeFileSync(path.join(project, "README.md"), zhReadme, "utf8");
  fs.writeFileSync(path.join(project, "AGENTS.md"), "# AGENTS\n\nProject version: `0.1.0`\n使用 .plan、.kit、.workflow 和 .test 作为项目事实源。\n", "utf8");
  fs.mkdirSync(path.join(project, ".workflow"), { recursive: true });
  fs.writeFileSync(path.join(project, ".workflow", "README.md"), "# 工作流\n\n项目版本: `0.1.0`\n当前工作流入口: `.workflow/README.md`。\n", "utf8");
  fs.writeFileSync(path.join(project, ".plan", "PRD.md"), zhPrd, "utf8");
  fs.writeFileSync(path.join(project, ".plan", "SPEC.md"), zhSpec, "utf8");
  fs.writeFileSync(path.join(project, ".plan", "CHECKLIST.md"), zhChecklist, "utf8");
  fs.mkdirSync(path.join(project, "docs", "ui-ux"), { recursive: true });
  fs.writeFileSync(path.join(project, "docs", "ui-ux", "ACCEPTANCE.md"), zhUiAcceptance, "utf8");
  fs.mkdirSync(path.join(project, ".test", "ai", "reports"), { recursive: true });
  fs.writeFileSync(path.join(project, ".test", "ai", "reports", "four-role-review.md"), zhFourRoleReview, "utf8");
  for (const rel of [
    ".test/ai/reports/acceptance-20260601.md",
    ".test/ai/evidence/desktop.png",
    ".test/ai/evidence/mobile.png",
    ".test/ai/evidence/state-empty.png",
    ".test/ai/evidence/mobile-state-empty.png",
    ".test/ai/evidence/state-success.png",
    ".test/ai/evidence/mobile-state-success.png"
  ]) {
    fs.mkdirSync(path.dirname(path.join(project, rel)), { recursive: true });
    fs.writeFileSync(path.join(project, rel), rel.endsWith(".md") ? zhAcceptanceReport : "evidence", "utf8");
  }
  fs.mkdirSync(path.join(project, ".test", "ai", "sandboxes", "default", "_archive"), { recursive: true });
  const runResult = run(["run", "--cwd", project, "--json"]);
  assert(runResult.code === 0, `run should pass: ${runResult.stderr}`);
  const checkResult = run(["check", "--cwd", project, "--host", "codex", "--json"]);
  const checkPayload = parseJson(checkResult.stdout, "check payload");
  assert(
    checkPayload.decision === "go",
    `check should naturally return go, got ${checkPayload.decision}: ${JSON.stringify(checkPayload.issues)}`
  );
  const testResult = run(["test", "--cwd", project, "--json"]);
  assert(testResult.code === 0, `test should pass: ${testResult.stderr} ${testResult.stdout}`);
  const testPayload = parseJson(testResult.stdout, "test payload");
  assert(testPayload.state === "acceptance-closed", "test should close acceptance");
  const packResult = run(["pack", "--cwd", project, "--json"]);
  assert(packResult.code === 0, `pack should pass: ${packResult.stderr} ${packResult.stdout}`);
  const packPayload = parseJson(packResult.stdout, "pack payload");
  assert(packPayload.state === "package-created", "pack should create package state");
  assert(fs.existsSync(path.join(project, packPayload.evidence.package_manifest)), "pack should write package manifest");
  assert(packPayload.gates.package_input_snapshot_matches === true, "pack should verify current input snapshot");
  for (const rel of ["AGENTS.md", ".workflow/README.md", ".test/README.md", ".test/user/README.md", "docs/ui-ux/ACCEPTANCE.md"]) {
    assert(fs.existsSync(path.join(project, packPayload.evidence.package_dir, rel)), `pack should include ${rel}`);
  }
});

test("kit-test blocks mainland handoff when delivery docs are not Chinese first", () => {
  const project = path.join(tmpRoot, "english-mainland-docs-app");
  const init = run(["init", "--cwd", project, "--owner", "tester", "--level", "2", "--host", "generic", "--skip-brainstorm", "--with-user"]);
  assert(init.code === 0, `init failed: ${init.stderr}`);
  fs.writeFileSync(path.join(project, "package.json"), JSON.stringify({ scripts: { test: "node --version" } }, null, 2), "utf8");
  fs.writeFileSync(path.join(project, "README.md"), "# English Mainland App\n\nThis V1 handoff is for mainland China customers and includes WeChat browser review, ICP notes, acceptance evidence, and delivery contents.\n\n## Requirement-to-Run Handoff\nConfirmed requirements: ready.\nPlan: closed.\nNext: /kit-run -> /kit-check -> /kit-test -> /kit-pack.\n\n## Delivery Contents Gate\nIncluded: app.\nExcluded: production deployment.\nKnown risks: demo only.\nEvidence: reports and screenshots.\n", "utf8");
  fs.writeFileSync(path.join(project, "HANDOFF.md"), "# Handoff\n\nThis mainland China customer handoff is intentionally English to prove the gate blocks it.\n", "utf8");
  fs.writeFileSync(path.join(project, ".plan", "PRD.md"), "# PRD\n\nThis is an English PRD for a mainland China delivery and should be blocked by /kit-test.\n", "utf8");
  fs.writeFileSync(path.join(project, ".plan", "SPEC.md"), "# SPEC\n\nThis English SPEC mentions WeChat, Alipay, ICP, delivery evidence, and customer handoff.\n", "utf8");
  fs.writeFileSync(path.join(project, ".plan", "CHECKLIST.md"), "# CHECKLIST\n\n- [x] Implement app\n- [x] Run tests\n", "utf8");
  fs.mkdirSync(path.join(project, "docs", "ui-ux"), { recursive: true });
  fs.writeFileSync(path.join(project, "docs", "ui-ux", "ACCEPTANCE.md"), "# UI Acceptance\n\nDesktop, mobile, empty, success, and error screenshots captured.\n", "utf8");
  fs.mkdirSync(path.join(project, ".test", "ai", "reports"), { recursive: true });
  fs.writeFileSync(path.join(project, ".test", "ai", "reports", "four-role-review.md"), "# Four-role Review\n\n| Role | Score | Judgment |\n| --- | ---: | --- |\n| PM | 95 | Pass. |\n| Code | 95 | Pass. |\n| Frontend | 95 | Pass. |\n| Backend | 95 | Pass. |\n", "utf8");
  fs.writeFileSync(path.join(project, ".test", "ai", "reports", "acceptance-20260601.md"), "# Acceptance\n\nEnglish acceptance report for mainland China handoff.\n", "utf8");
  for (const rel of [
    ".test/ai/evidence/desktop.png",
    ".test/ai/evidence/mobile.png",
    ".test/ai/evidence/state-empty.png",
    ".test/ai/evidence/mobile-state-empty.png",
    ".test/ai/evidence/state-success.png",
    ".test/ai/evidence/mobile-state-success.png"
  ]) {
    fs.mkdirSync(path.dirname(path.join(project, rel)), { recursive: true });
    fs.writeFileSync(path.join(project, rel), "evidence", "utf8");
  }
  fs.writeFileSync(path.join(project, ".kit", "check-state.json"), JSON.stringify({ decision: "go" }, null, 2), "utf8");
  const result = run(["test", "--cwd", project, "--json"]);
  assert(result.code === 2, `English mainland docs should block /kit-test, got ${result.code}`);
  const payload = parseJson(result.stdout, "blocked chinese docs payload");
  assert(payload.gates.chinese_delivery_docs.required === true, "Chinese docs gate should be required for mainland handoff");
  assert(payload.gates.chinese_delivery_docs.ok === false, "Chinese docs gate should fail for English-first docs");
});

test("kit-test blocks report-style root README", () => {
  const project = path.join(tmpRoot, "report-readme-app");
  const init = run(["init", "--cwd", project, "--owner", "tester", "--level", "2", "--host", "generic", "--skip-brainstorm", "--with-user"]);
  assert(init.code === 0, `init failed: ${init.stderr}`);
  fs.writeFileSync(path.join(project, "package.json"), JSON.stringify({ scripts: { test: "node --version" } }, null, 2), "utf8");
  fs.writeFileSync(path.join(project, "README.md"), "# report-readme-app\n\n## Phase Start\n\n阶段: plan。\n\n## Requirement-to-Run Handoff\n\n已确认需求: 中文客户交付。\n\n## 验收报告\n\n四角色评审和验收证据都写在 README 里，这是错误示例。\n", "utf8");
  fs.writeFileSync(path.join(project, "HANDOFF.md"), zhHandoff, "utf8");
  fs.writeFileSync(path.join(project, ".plan", "PRD.md"), zhPrd, "utf8");
  fs.writeFileSync(path.join(project, ".plan", "SPEC.md"), zhSpec, "utf8");
  fs.writeFileSync(path.join(project, ".plan", "CHECKLIST.md"), zhChecklist, "utf8");
  fs.mkdirSync(path.join(project, "docs", "ui-ux"), { recursive: true });
  fs.writeFileSync(path.join(project, "docs", "ui-ux", "ACCEPTANCE.md"), zhUiAcceptance, "utf8");
  fs.mkdirSync(path.join(project, ".test", "ai", "reports"), { recursive: true });
  fs.writeFileSync(path.join(project, ".test", "ai", "reports", "four-role-review.md"), zhFourRoleReview, "utf8");
  fs.writeFileSync(path.join(project, ".test", "ai", "reports", "acceptance-20260601.md"), zhAcceptanceReport, "utf8");
  for (const rel of [
    ".test/ai/evidence/desktop.png",
    ".test/ai/evidence/mobile.png",
    ".test/ai/evidence/state-empty.png",
    ".test/ai/evidence/mobile-state-empty.png",
    ".test/ai/evidence/state-success.png",
    ".test/ai/evidence/mobile-state-success.png"
  ]) {
    fs.mkdirSync(path.dirname(path.join(project, rel)), { recursive: true });
    fs.writeFileSync(path.join(project, rel), "evidence", "utf8");
  }
  fs.writeFileSync(path.join(project, ".kit", "check-state.json"), JSON.stringify({ decision: "go" }, null, 2), "utf8");
  const result = run(["test", "--cwd", project, "--json"]);
  assert(result.code === 2, `report-style README should block /kit-test, got ${result.code}`);
  const payload = parseJson(result.stdout, "blocked README guide payload");
  assert(payload.gates.readme_user_guide.ok === false, "README user guide gate should fail");
  assert(payload.gates.readme_user_guide.forbidden_phrases.includes("Phase Start"), "README gate should report Phase Start");
});

test("scan limits are reported when recursive scan is capped", () => {
  const project = path.join(tmpRoot, "scan-limit-app");
  const init = run(["init", "--cwd", project, "--owner", "tester", "--level", "2", "--host", "generic"]);
  assert(init.code === 0, `init expected exit 0, got ${init.code}: ${init.stderr}`);
  const result = run(["audit", "--cwd", project, "--profile", "auto", "--host", "generic", "--json"], {
    env: {
      SPEC_LOOP_KIT_MAX_FILES_TO_SCAN: "1",
      SPEC_LOOP_KIT_MAX_SCAN_DEPTH: "1"
    }
  });
  assert(result.code === 0, `expected exit 0, got ${result.code}: ${result.stderr}`);
  const report = parseJson(result.stdout, "scan limit audit report");
  assert(report.p1.some((issue) => issue.code === "scan-limit-reached"), "missing scan-limit-reached issue");
});

test("audit is JSON even without --json", () => {
  const project = path.join(tmpRoot, "generic app");
  const result = run(["audit", "--cwd", project, "--profile", "auto", "--host", "generic"]);
  assert(result.code === 0, `expected exit 0, got ${result.code}`);
  const report = parseJson(result.stdout, "audit report");
  assert(report.schema_version === 1, "missing schema_version");
});

test("bad profile and bad host fail with exit 1", () => {
  const project = path.join(tmpRoot, "generic app");
  const badProfile = run(["validate", "--cwd", project, "--profile", "nonsense"]);
  assert(badProfile.code === 1, `bad profile expected exit 1, got ${badProfile.code}`);
  assert(badProfile.stderr.includes("Invalid profile"), "missing invalid profile error");
  const badHost = run(["validate", "--cwd", project, "--host", "nonsense"]);
  assert(badHost.code === 1, `bad host expected exit 1, got ${badHost.code}`);
  assert(badHost.stderr.includes("Invalid host"), "missing invalid host error");
});

test("skill-package audit stays free of P0/P1", () => {
  const result = run(["audit", "--cwd", root, "--profile", "skill-package", "--host", "codex", "--json"]);
  assert(result.code === 0, `expected exit 0, got ${result.code}`);
  const report = parseJson(result.stdout, "skill package audit");
  assert(report.p0.length === 0, `unexpected P0: ${report.p0.map((issue) => issue.code).join(", ")}`);
  assert(report.p1.length === 0, `unexpected P1: ${report.p1.map((issue) => issue.code).join(", ")}`);
});

test("phase closure and run handoff contracts are documented", () => {
  const corpus = [
    fs.readFileSync(path.join(root, "SKILL.md"), "utf8"),
    fs.readFileSync(path.join(root, "README.md"), "utf8"),
    fs.readFileSync(path.join(root, "modes", "kit.md"), "utf8"),
    fs.readFileSync(path.join(root, "modes", "run.md"), "utf8")
  ].join("\n");
  assert(corpus.includes("Phase Start"), "missing Phase Start contract");
  assert(corpus.includes("Phase Closure"), "missing Phase Closure contract");
  assert(corpus.includes("Requirement-to-Run Handoff"), "missing Requirement-to-Run Handoff contract");
  assert(corpus.includes("/kit-run start"), "missing explicit /kit-run start bridge");
});

test("kit-run and kit-check responsibility boundary is documented", () => {
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const runMode = fs.readFileSync(path.join(root, "modes", "run.md"), "utf8");
  const checkMode = fs.readFileSync(path.join(root, "modes", "check.md"), "utf8");

  assert(readme.includes("先 `/kit-run`") && readme.includes("再 `/kit-check`"), "README must explain run before check");
  assert(runMode.includes("Basic Acceptance Checklist"), "run mode missing basic acceptance checklist");
  assert(runMode.includes("Run Closure"), "run mode missing Run Closure");
  assert(runMode.includes("/kit-check diff"), "run mode missing handoff to /kit-check diff");
  assert(checkMode.includes("Hedge") && checkMode.includes("Edge Case Review"), "check mode missing Hedge/edge responsibilities");
  assert(checkMode.includes("go/fix/block") || checkMode.includes("go / fix / block"), "check mode missing go/fix/block judgment");
  assert(checkMode.includes("/kit-run fix <scope>"), "check mode missing return path to /kit-run fix");
});

test("phase start, check plan, delivery contents, and Codex goal gates are documented", () => {
  const corpus = [
    fs.readFileSync(path.join(root, "SKILL.md"), "utf8"),
    fs.readFileSync(path.join(root, "README.md"), "utf8"),
    fs.readFileSync(path.join(root, "modes", "kit.md"), "utf8"),
    fs.readFileSync(path.join(root, "modes", "check.md"), "utf8")
  ].join("\n");
  assert(corpus.includes("Phase Start"), "missing phase start report");
  assert(corpus.includes("/kit-check Plan Confirmation"), "missing kit-check plan confirmation");
  assert(corpus.includes("Delivery Contents Gate"), "missing delivery contents gate");
  assert(corpus.includes("Goal mode") || corpus.includes("Goal Mode"), "missing Codex Goal mode hint");
  assert(corpus.includes("included") && corpus.includes("excluded") && corpus.includes("known risks"), "delivery contents must list included/excluded/known risks");
});

test("commercial, mainland, ui, and four-role review gates are documented", () => {
  const requiredFiles = [
    "quality/commercial-delivery.md",
    "quality/four-role-review.md",
    "quality/current-verdict-2026-06-01.md",
    "knowledge/china-mainland-delivery.md",
    "knowledge/ui-commercial-2026.md"
  ];
  for (const rel of requiredFiles) {
    assert(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
  }
  const corpus = [
    fs.readFileSync(path.join(root, "SKILL.md"), "utf8"),
    fs.readFileSync(path.join(root, "README.md"), "utf8"),
    fs.readFileSync(path.join(root, "modes", "check.md"), "utf8"),
    fs.readFileSync(path.join(root, "knowledge", "index.json"), "utf8")
  ].join("\n");
  assert(corpus.includes("Four-Role") || corpus.includes("四重"), "missing four-role review");
  assert(corpus.includes(">= 95") || corpus.includes("≥95"), "missing 95 score gate");
  assert(corpus.includes("china-mainland-delivery"), "missing China mainland routing");
  assert(corpus.includes("ui-commercial-2026"), "missing commercial UI routing");
  assert(corpus.includes("self-supervision") || corpus.includes("自我督导"), "missing agent self-supervision gate");
});

test("delivery cleanup docs do not expose copy-paste destructive delete commands", () => {
  const docs = [
    "modes/kit.md",
    "templates/default/README.md",
    "templates/fullstack/README.md",
    "templates/data-ml/README.md",
    "templates/skill/README.md",
    "templates/stable-workflow/README.md"
  ];
  for (const rel of docs) {
    const content = fs.readFileSync(path.join(root, rel), "utf8");
    assert(!/^\s*rm\s+-rf\b/m.test(content), `${rel} exposes rm -rf as a runnable line`);
    assert(!/^\s*Remove-Item\b.*-Recurse/m.test(content), `${rel} exposes recursive Remove-Item as a runnable line`);
  }
});

test("pack dry-run JSON contains portable runtime files", () => {
  const npmCli = process.env.npm_execpath;
  assert(npmCli && fs.existsSync(npmCli), "npm_execpath is unavailable; run this test through npm run check:contract");
  const result = spawnSync(node, [npmCli, "pack", "--dry-run", "--json"], {
    cwd: root,
    encoding: "utf8"
  });
  assert(result.status === 0, `npm pack failed: ${result.stderr}`);
  const payload = parseJson(result.stdout, "npm pack json");
  const files = new Set(payload[0].files.map((file) => file.path));
  for (const rel of [
    "SKILL.md",
    "README.md",
    "AGENTS.md",
    "CLAUDE.md",
    "bin/spec-loop-kit.mjs",
    "scripts/contract-tests.mjs",
    "templates/plan/PRD.md",
    "templates/plan/SPEC.md",
    "templates/plan/CHECKLIST.md",
    "knowledge/question-bank.json",
    ".test/README.md"
  ]) {
    assert(files.has(rel), `package missing ${rel}`);
  }
  for (const rel of files) {
    assert(!rel.startsWith(".test/ai/packages/"), `package includes historical AI test package: ${rel}`);
  }
});

const failed = results.filter((item) => item.status === "FAIL");
for (const item of results) {
  if (item.status === "PASS") {
    console.log(`PASS ${item.name}`);
  } else {
    console.error(`FAIL ${item.name}: ${item.error}`);
  }
}

try {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
} catch {
  // Test cleanup best effort only.
}

if (failed.length > 0) {
  console.error(`\n${failed.length}/${results.length} contract tests failed.`);
  process.exit(1);
}

console.log(`\n${results.length}/${results.length} contract tests passed.`);
