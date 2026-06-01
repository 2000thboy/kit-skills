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

  const blockedRun = run(["run", "--cwd", project, "--json"]);
  assert(blockedRun.code === 2, `run without handoff should block, got ${blockedRun.code}`);
  const blockedPayload = parseJson(blockedRun.stdout, "blocked run payload");
  assert(blockedPayload.state === "blocked-before-run", "run should record blocked-before-run state");
  assert(fs.existsSync(path.join(project, ".kit", "run-state.json")), "missing run state file after blocked run");

  fs.appendFileSync(path.join(project, "README.md"), "\n## Requirement-to-Run Handoff\nDelivery Contents Gate\n", "utf8");

  const runResult = run(["run", "--cwd", project, "--json"]);
  assert(runResult.code === 0, `run with handoff should pass: ${runResult.stderr}`);
  const runPayload = parseJson(runResult.stdout, "run payload");
  assert(runPayload.state === "run-closed", "run should record run-closed state");
  assert(runPayload.required_next_command === "/kit-check diff", "run should bridge to /kit-check diff");
  assert(fs.existsSync(path.join(project, runPayload.evidence.report_file)), "missing run closure report");

  const checkResult = run(["check", "--cwd", project, "--json"]);
  assert([0, 2].includes(checkResult.code), `check should return go or fix/block, got ${checkResult.code}`);
  const checkPayload = parseJson(checkResult.stdout, "check payload");
  assert(checkPayload.gates.run_closure_present === true, "check should prove run closure presence");
  assert(["go", "fix"].includes(checkPayload.decision), `unexpected check decision: ${checkPayload.decision}`);
  assert(fs.existsSync(path.join(project, ".kit", "check-state.json")), "missing check state file");
  assert(fs.existsSync(path.join(project, checkPayload.evidence.report_file)), "missing kit-check report");
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
