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
