#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const templates = path.join(root, "templates");

// Graceful interruption: ensure partial writes are not left behind
process.on("SIGINT", () => {
  process.stderr.write("\n[spec-loop-kit] Interrupted.\n");
  process.exit(130);
});
const VALID_PROFILES = new Set([
  "auto",
  "generic-project",
  "frontend-ui",
  "long-content-publishing",
  "archive-cleanup",
  "skill-package"
]);
const PROFILE_LIST = "auto|generic-project|frontend-ui|long-content-publishing|archive-cleanup|skill-package";
const VALID_HOSTS = new Set([
  "auto",
  "generic",
  "codex",
  "claude",
  "opencode",
  "agents"
]);
const VALID_LEVELS = new Set(["0", "1", "2", "3", "4"]);
const VALID_TEMPLATES = new Set(["default", "data-ml", "fullstack"]);
const LEVEL_SCALE_MAP = {
  "0": "quick",
  "1": "quick",
  "2": "standard",
  "3": "deep",
  "4": "deep"
};

function parseArgs(argv) {
  if (argv.length > 100) {
    throw new Error(`Too many arguments (${argv.length}). Max allowed: 100.`);
  }
  const args = {
    command: argv[2],
    cwd: process.cwd(),
    owner: "unassigned",
    level: "1",
    profile: "auto",
    host: "auto",
    force: false,
    json: false,
    workflow: false,
    experiment: false,
    template: "default",
    withTest: false,
    withEval: false,
    withCron: false,
    withUser: false,
    withSoul: false,
    longTask: false
  };
  for (let i = 3; i < argv.length; i += 1) {
    function requireValue(flag) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("-")) {
        const hints = {
          "--level": "--level requires a value. Must be one of: 0, 1, 2, 3, 4",
          "--template": "--template requires a value. Must be one of: default, data-ml, fullstack",
          "--profile": `--profile requires a value. Must be one of: ${PROFILE_LIST}`,
          "--host": "--host requires a value. Must be one of: auto, generic, codex, claude, opencode, agents"
        };
        throw new Error(hints[flag] || `${flag} requires a value.`);
      }
      i += 1;
      return next;
    }
    const value = argv[i];
    if (value === "--force") {
      args.force = true;
    } else if (value === "--json") {
      args.json = true;
    } else if (value === "--workflow") {
      args.workflow = true;
    } else if (value === "--experiment") {
      args.experiment = true;
    } else if (value === "--with-test") {
      args.withTest = true;
    } else if (value === "--with-eval") {
      args.withEval = true;
    } else if (value === "--with-cron") {
      args.withCron = true;
    } else if (value === "--with-user") {
      args.withUser = true;
    } else if (value === "--with-soul") {
      args.withSoul = true;
    } else if (value === "--long-task") {
      args.longTask = true;
    } else if (value === "--skip-brainstorm") {
      args.skipBrainstorm = true;
    } else if (value === "--template") {
      args.template = normalizeTemplate(requireValue("--template"));
    } else if (value === "--owner") {
      const ownerVal = requireValue("--owner");
      if (ownerVal.length > 100) {
        throw new Error(`--owner must be at most 100 characters. Received: ${ownerVal.length}`);
      }
      const OWNER_PATTERN = /^[a-zA-Z0-9一-龥\s\-_]+$/;
      if (!OWNER_PATTERN.test(ownerVal)) {
        throw new Error(`--owner contains invalid characters. Allowed: alphanumeric, Chinese characters, spaces, hyphens, underscores. Received: ${ownerVal}`);
      }
      args.owner = ownerVal;
    } else if (value === "--level") {
      args.level = normalizeLevel(requireValue("--level"));
    } else if (value === "--profile") {
      args.profile = normalizeProfile(requireValue("--profile"));
    } else if (value === "--host") {
      args.host = normalizeHost(requireValue("--host"));
    } else if (value === "--cwd") {
      const rawCwd = requireValue("--cwd");
      if (!rawCwd || rawCwd.trim().length === 0) {
        throw new Error(`--cwd requires a non-empty path. Received: "${rawCwd}"`);
      }
      const resolvedCwd = path.resolve(rawCwd);
      const currentCwd = process.cwd();
      // Critical fix Sec-4.1: prevent path traversal — reject parent-dir references
      const normalized = path.normalize(resolvedCwd);
      const pathParts = normalized.split(path.sep);
      if (pathParts.includes("..")) {
        throw new Error(`--cwd cannot contain parent-directory references (..). Received: ${rawCwd}`);
      }
      // For existing paths: additionally verify it's not a system/sensitive directory
      if (fs.existsSync(resolvedCwd)) {
        try {
          const realCwd = fs.realpathSync(resolvedCwd);
          // Block known system directories (Windows and Unix)
          const blockedRoots = process.platform === "win32"
            ? ["C:\\\\Windows", "C:\\\\Program Files", "C:\\\\ProgramData"]
            : ["/etc", "/usr", "/bin", "/sbin", "/lib", "/sys", "/proc", "/dev"];
          for (const blocked of blockedRoots) {
            if (realCwd.toLowerCase().startsWith(blocked.toLowerCase())) {
              throw new Error(`--cwd points to a system directory (${realCwd}). Use a user-writable path instead.`);
            }
          }
        } catch (e) {
          if (e.message.includes("--cwd points to")) throw e;
          throw new Error(`--cwd path is not accessible: ${resolvedCwd}`);
        }
      }
      args.cwd = resolvedCwd;
    } else if (value === "--help" || value === "-h") {
      args.help = true;
    } else if (value?.startsWith("-")) {
      throw new Error(`Unknown option: ${value}`);
    }
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(cwd, rel) {
  return fs.existsSync(path.join(cwd, rel));
}

function readText(cwd, rel) {
  const target = path.join(cwd, rel);
  return fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
}

function render(text, data) {
  const result = text.replaceAll("{{project_name}}", data.projectName)
    .replaceAll("{{owner}}", data.owner)
    .replaceAll("{{level}}", data.level)
    .replaceAll("{{profile}}", data.profile)
    .replaceAll("{{host}}", data.host)
    .replaceAll("{{host_entry}}", data.hostEntry)
    .replaceAll("{{host_entry_role}}", data.hostEntryRole)
    .replaceAll("{{date}}", data.date)
    .replaceAll("{{kit_version}}", data.kitVersion)
    .replaceAll("{{project_version}}", data.projectVersion)
    .replaceAll("{{scale}}", data.scale);
  const leftover = result.match(/\{\{[^}]+\}\}/g);
  if (leftover) {
    console.warn(`[spec-loop-kit] Warning: unrendered placeholders in template: ${leftover.join(", ")}`);
  }
  return result;
}

function writeTemplate(source, target, data, force) {
  if (!fs.existsSync(source)) {
    return { target, status: "error", error: `Template source not found: ${source}` };
  }
  const existed = fs.existsSync(target);
  if (existed && !force) {
    return { target, status: "skipped" };
  }
  // Backup before overwrite (Critical fix V-6)
  if (existed && force) {
    const backupDir = path.join(path.dirname(target), ".kit", "backup");
    ensureDir(backupDir);
    const backupName = `${path.basename(target)}.${Date.now()}.bak`;
    fs.copyFileSync(target, path.join(backupDir, backupName));
  }
  ensureDir(path.dirname(target));
  const content = render(fs.readFileSync(source, "utf8"), data);
  fs.writeFileSync(target, content, "utf8");
  return { target, status: existed ? "overwritten" : "created" };
}

function normalizeProfile(profile) {
  if (profile.length > 50) {
    throw new Error(`Invalid profile: too long (max 50 chars)`);
  }
  if (!VALID_PROFILES.has(profile)) {
    throw new Error(`Invalid profile: ${profile}`);
  }
  return profile;
}

function normalizeHost(host) {
  if (host.length > 50) {
    throw new Error(`Invalid host: too long (max 50 chars)`);
  }
  if (!VALID_HOSTS.has(host)) {
    throw new Error(`Invalid host: ${host}`);
  }
  return host;
}

function normalizeLevel(level) {
  if (level.length > 50) {
    throw new Error(`Invalid level: too long (max 50 chars)`);
  }
  if (!VALID_LEVELS.has(level)) {
    throw new Error(`Invalid level: ${level}. Must be one of: 0, 1, 2, 3, 4`);
  }
  return level;
}

function normalizeTemplate(template) {
  if (template.length > 50) {
    throw new Error(`Invalid template: too long (max 50 chars)`);
  }
  if (!VALID_TEMPLATES.has(template)) {
    throw new Error(`Invalid template: ${template}. Must be one of: default, data-ml, fullstack`);
  }
  return template;
}

function scaleFromLevel(level) {
  return LEVEL_SCALE_MAP[level] || "standard";
}

function detectHost(cwd, requested) {
  normalizeHost(requested);
  if (requested !== "auto") return requested;
  if (exists(cwd, "CLAUDE.md") || exists(cwd, ".claude")) return "claude";
  if (exists(cwd, ".opencode")) return "opencode";
  if (exists(cwd, ".codex")) return "codex";
  if (exists(cwd, "AGENTS.md")) return "agents";
  const envText = Object.keys(process.env)
    .filter((key) => key.toLowerCase().includes("claude") || key.toLowerCase().includes("codex") || key.toLowerCase().includes("opencode"))
    .join("\n")
    .toLowerCase();
  if (envText.includes("claude")) return "claude";
  if (envText.includes("opencode")) return "opencode";
  if (envText.includes("codex")) return "codex";
  return "generic";
}

function hostEntryFor(host) {
  return host === "claude" ? "CLAUDE.md" : "AGENTS.md";
}

function hostEntryRoleFor(host) {
  if (host === "claude") return "Claude Code 主指令文件";
  if (host === "codex") return "Codex 主指令文件";
  if (host === "opencode") return "OpenCode/Agent 桥接指令文件";
  return "通用 Agent 指令文件";
}

function detectProfile(cwd, requested) {
  normalizeProfile(requested);
  if (requested !== "auto") return requested;
  const text = [
    readText(cwd, "AGENTS.md"),
    readText(cwd, "README.md"),
    readText(cwd, "package.json")
  ].join("\n").toLowerCase();
  // Check for project-local skills that indicate content publishing
  const localSkillsDir = path.join(cwd, "skills");
  let hasContentSkill = false;
  if (fs.existsSync(localSkillsDir)) {
    try {
      const skillDirs = fs.readdirSync(localSkillsDir);
      for (const dir of skillDirs) {
        const skillMd = path.join(localSkillsDir, dir, "SKILL.md");
        if (fs.existsSync(skillMd)) {
          const skillText = fs.readFileSync(skillMd, "utf8").toLowerCase();
          if (skillText.includes("publish") || skillText.includes("content") || skillText.includes("article")) {
            hasContentSkill = true;
            break;
          }
        }
      }
    } catch (_e) {
      // ignore read errors
    }
  }

  if (exists(cwd, "SKILL.md") && exists(cwd, "bin/spec-loop-kit.mjs") && exists(cwd, "templates")) {
    return "skill-package";
  }
  if (
    exists(cwd, "fanqie-cli.js") ||
    exists(cwd, "workflow-runner.js") ||
    hasContentSkill ||
    text.includes("publish") ||
    text.includes("long-form") ||
    text.includes("novel")
  ) {
    return "long-content-publishing";
  }
  if (exists(cwd, "frontend") || text.includes("vite") || text.includes("react") || text.includes("ui/ux")) {
    return "frontend-ui";
  }
  return "generic-project";
}

function addIssue(report, severity, code, message, file = "", fix = "") {
  report[severity.toLowerCase()].push({ code, message, file, fix });
}

function includesAny(text, values) {
  return values.some((value) => text.includes(value));
}

function readCorpus(cwd) {
  const candidates = [
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    ".test/README.md",
    ".test/config.json",
    ".plan/PRD.md",
    ".plan/SPEC.md",
    ".plan/CHECKLIST.md",
    ".kit/config.json",
    ".kit/version.json",
    ".workflow/README.md",
    ".workflow/codex.md",
    ".workflow/workbuddy.md",
    ".workflow/trae-solo.md",
    "knowledge/index.json",
    "knowledge/openspec-framework.md",
    "knowledge/superdev-framework.md",
    "knowledge/cli-anything-framework.md",
    "knowledge/question-bank.json",
    ".workflows/00-node-confirmation-runbook.md",
    ".workflows/04-hotspot-knowledge-mystery.md",
    "docs/workflows/daily-mystery-scheduler-contract.md",
    "skills/daily-mystery-fanqie/SKILL.md",
    "package.json"
  ];
  return candidates.map((rel) => readText(cwd, rel)).join("\n");
}

function deepResearchCandidatePaths(cwd) {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  const skillNames = ["deep-research", "Geek-skills-deep-research"];
  const projectRoots = ["skills", ".agents/skills", ".claude/skills", ".codex/skills"];
  const hostRoots = home ? [
    path.join(home, ".agents", "skills"),
    path.join(home, ".codex", "skills"),
    path.join(home, ".claude", "skills")
  ] : [];
  const candidates = [];

  for (const rootName of projectRoots) {
    for (const skillName of skillNames) {
      candidates.push({
        scope: "project",
        path: path.join(cwd, rootName, skillName, "SKILL.md")
      });
    }
  }
  for (const rootName of hostRoots) {
    for (const skillName of skillNames) {
      candidates.push({
        scope: "host",
        path: path.join(rootName, skillName, "SKILL.md")
      });
    }
  }
  return candidates;
}

function findDeepResearchSkill(cwd) {
  const checked = deepResearchCandidatePaths(cwd);
  const locations = checked.filter((item) => fs.existsSync(item.path));
  return {
    installed: locations.length > 0,
    locations: locations.map((item) => ({ scope: item.scope, path: item.path })),
    checked_locations: checked.map((item) => item.path)
  };
}

function findWorkflowEntries(cwd) {
  return [
    ".workflow/README.md",
    ".workflow/codex.md",
    ".workflow/workbuddy.md",
    ".workflow/trae-solo.md",
    ".workflows",
    "docs/workflows",
    "skills/daily-mystery-fanqie/SKILL.md",
    "workflow-runner.js",
    "README.md"
  ].filter((rel) => exists(cwd, rel));
}

function parseJsonFile(cwd, rel) {
  const text = readText(cwd, rel);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function listFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function shouldSkipScanPath(rel) {
  const normalized = rel.replaceAll("\\", "/");
  return normalized.startsWith(".git/") ||
    normalized.startsWith("node_modules/") ||
    normalized.startsWith("vendor/") ||
    normalized.startsWith("dist/") ||
    normalized.startsWith("build/") ||
    normalized.startsWith("coverage/") ||
    normalized.startsWith(".next/") ||
    normalized.startsWith(".nuxt/") ||
    normalized.startsWith(".venv/") ||
    normalized.startsWith("venv/") ||
    normalized.startsWith("__pycache__/") ||
    normalized.startsWith(".pytest_cache/") ||
    normalized.startsWith(".mypy_cache/") ||
    normalized.startsWith(".pilotdeck-runtime/") ||
    normalized.startsWith(".kitdeck/state/") ||
    normalized.startsWith(".kitdeck/reports/") ||
    normalized.startsWith(".plan/archive/") ||
    normalized.startsWith(".plan/runs/") ||
    normalized.startsWith(".test/ai/evidence/") ||
    normalized.startsWith(".test/ai/reports/") ||
    normalized.startsWith(".test/ai/packages/") ||
    normalized.startsWith("evals/evidence/") ||
    normalized.startsWith("tests/") ||
    normalized.endsWith("package-lock.json") ||
    normalized.endsWith("pnpm-lock.yaml") ||
    normalized.endsWith("yarn.lock");
}

function isScannableTextFile(rel) {
  const ext = path.extname(rel).toLowerCase();
  return [
    ".md",
    ".txt",
    ".json",
    ".jsonc",
    ".yaml",
    ".yml",
    ".js",
    ".mjs",
    ".cjs",
    ".ts",
    ".tsx",
    ".jsx",
    ".py",
    ".sh",
    ".ps1",
    ".bat",
    ".cmd",
    ".example"
  ].includes(ext);
}

function scanTextFiles(cwd) {
  return listFilesRecursive(cwd)
    .map((file) => ({
      file,
      rel: path.relative(cwd, file)
    }))
    .filter(({ rel }) => !shouldSkipScanPath(rel))
    .filter(({ rel }) => isScannableTextFile(rel))
    .filter(({ file }) => {
      try {
        return fs.statSync(file).size <= 512 * 1024;
      } catch {
        return false;
      }
    });
}

function summarizeMatches(matches, max = 5) {
  return matches.slice(0, max).map((item) => {
    const suffix = item.line ? `:${item.line}` : "";
    return `${item.rel}${suffix}`;
  }).join(", ");
}

function collectPatternMatches(cwd, patterns) {
  const grouped = new Map();
  for (const { file, rel } of scanTextFiles(cwd)) {
    let text = "";
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const lines = text.split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      for (const pattern of patterns) {
        if (!pattern.regex.test(line)) continue;
        const group = grouped.get(pattern.code) || {
          ...pattern,
          matches: []
        };
        group.matches.push({ rel, line: index + 1 });
        grouped.set(pattern.code, group);
      }
    }
  }
  return [...grouped.values()].filter((item) => item.matches.length > 0);
}


function checkNameConsistency(cwd, report) {
  const folderName = path.basename(cwd);

  let gitRepoName = null;
  try {
    const gitConfigPath = path.join(cwd, ".git", "config");
    if (fs.existsSync(gitConfigPath)) {
      const gitConfig = fs.readFileSync(gitConfigPath, "utf8");
      const remoteMatch = gitConfig.match(/\[remote "origin"\][^\[]*?\s*url\s*=\s*([^\n]+)/s);
      if (remoteMatch) {
        const url = remoteMatch[1].trim();
        const repoMatch = url.match(/\/([^\/]+?)(?:\.git)?$/);
        if (repoMatch) {
          gitRepoName = repoMatch[1];
        }
      }
    }
  } catch {
    // Ignore git read errors
  }

  let readmeName = null;
  const readme = readText(cwd, "README.md");
  const readmeMatch = readme.match(/^#\s+(.+?)(?:\s*[-—|]\s*|\s*$)/m);
  if (readmeMatch) {
    readmeName = readmeMatch[1].trim();
  }

  const names = [];
  if (folderName) names.push({ source: "文件夹名", name: folderName });
  if (gitRepoName) names.push({ source: "Git 仓库名", name: gitRepoName });
  if (readmeName && readmeName !== "{{project_name}}") names.push({ source: "README 标题", name: readmeName });

  if (names.length >= 2) {
    const normalize = (s) => s.toLowerCase().replace(/[\s\-_]+/g, "");
    const firstNorm = normalize(names[0].name);
    const mismatches = names.filter((n) => normalize(n.name) !== firstNorm);
    if (mismatches.length > 0) {
      const details = names.map((n) => `${n.source}: "${n.name}"`).join(" | ");
      addIssue(report, "p1", "name-inconsistency", `项目名称不一致: ${details}`, "README.md / .git/config", "统一文件夹名、Git 仓库名和 README 标题中的项目名称。");
    }
  }
}

function checkSkillFrameworkDeclaration(cwd, report) {
  const prd = readText(cwd, ".plan/PRD.md");
  const spec = readText(cwd, ".plan/SPEC.md");
  const corpus = `${prd}\n${spec}`;

  const isSkill = includesAny(corpus, [
    "Primary object: skill",
    "主对象: skill",
    "主对象 | skill",
    "对象 | skill",
    "开发对象 | skill",
    "skill"
  ]) || /skill\s*包/.test(corpus) || /skill-package/.test(corpus);

  if (!isSkill) return;

  const readme = readText(cwd, "README.md");

  const hasSkillDeclaration = includesAny(readme, [
    "这是一个 skill",
    "这是一个 skill 包",
    "本 skill",
    "Skill 包",
    "skill 包",
    "可复用 skill",
    "skill 入口",
    "skill 定义"
  ]);

  if (!hasSkillDeclaration) {
    addIssue(report, "p1", "missing-skill-declaration", "项目被分类为 skill，但 README.md 未明确声明这是一个 skill 包。", "README.md", "在 README.md 中明确说明这是一个可复用的 skill 包，包含 SKILL.md 入口、使用场景和宿主兼容性。");
  }

  const hasBenchmark = includesAny(readme, [
    "对标",
    "benchmark",
    "参考产品",
    "同类产品",
    "类似产品",
    "竞品"
  ]);

  const hasFramework = includesAny(readme, [
    "框架",
    "规范",
    "标准",
    "架构",
    "framework",
    "standard",
    "规范说明"
  ]);

  if (!hasBenchmark) {
    addIssue(report, "p2", "missing-skill-benchmark", "Skill 项目的 README.md 缺少对标产品说明。", "README.md", "列出同类或对标产品（如 Claude Skills、Cursor Rules 等），帮助用户理解本 skill 的定位。");
  }

  if (!hasFramework) {
    addIssue(report, "p2", "missing-skill-framework", "Skill 项目的 README.md 缺少框架或规范说明。", "README.md", "说明本 skill 遵循的规范、目录结构和设计原则。");
  }
}

function checkPmAuditStatus(cwd, report) {
  const auditFiles = [
    { rel: ".kit/pm-audit-prd.md", stage: "PRD" },
    { rel: ".kit/pm-audit-spec.md", stage: "SPEC" },
    { rel: ".kit/pm-audit-checklist.md", stage: "CHECKLIST" }
  ];
  for (const { rel, stage } of auditFiles) {
    if (exists(cwd, rel)) {
      const text = readText(cwd, rel);
      const hasBlocker = /🔴\s*阻断项/.test(text) && !/🔴\s*阻断项.*\n.*\|.*\|.*\|\s*无/.test(text);
      if (hasBlocker) {
        addIssue(report, "p0", `pm-audit-blocker-${stage.toLowerCase()}`, `${stage} 的 PM 审计存在 🔴 阻断项.`, rel, "进入实施前修复阻断项.");
      }
      report.evidence.pm_audit = report.evidence.pm_audit || {};
      report.evidence.pm_audit[stage] = { exists: true, hasBlocker };
    } else {
      report.evidence.pm_audit = report.evidence.pm_audit || {};
      report.evidence.pm_audit[stage] = { exists: false };
    }
  }
}

function checkUserConfirmation(cwd, report) {
  const docs = [
    { rel: ".plan/PRD.md", stage: "PRD" },
    { rel: ".plan/SPEC.md", stage: "SPEC" },
    { rel: ".plan/CHECKLIST.md", stage: "CHECKLIST" }
  ];
  for (const { rel, stage } of docs) {
    const text = readText(cwd, rel);
    const confirmed = /✅\s*用户确认/.test(text);
    if (!confirmed) {
      addIssue(report, "p1", `missing-user-confirmation-${stage.toLowerCase()}`, `${stage} 缺少用户确认标记.`, rel, `在 ${rel} 底部添加 "✅ 用户确认 | 时间: ... | 版本: ...".`);
    }
    report.evidence.user_confirmation = report.evidence.user_confirmation || {};
    report.evidence.user_confirmation[stage] = { confirmed };
  }
}

function checkBase(cwd, report) {
  checkPmAuditStatus(cwd, report);
  checkUserConfirmation(cwd, report);
  // Critical fix M-4: composite check — PM audit must have no 🔴 AND user must confirm
  const stages = ["PRD", "SPEC", "CHECKLIST"];
  for (const stage of stages) {
    const pmAudit = report.evidence.pm_audit?.[stage];
    const userConfirm = report.evidence.user_confirmation?.[stage];
    if (pmAudit?.hasBlocker && userConfirm?.confirmed) {
      addIssue(report, "p0", `pm-user-conflict-${stage.toLowerCase()}`, `${stage} 存在 🔴 PM 审计阻断项但用户已确认. 先修复阻断项用户确认才有效.`, `.kit/pm-audit-${stage.toLowerCase()}.md`, "先解决 PM 审计 🔴 阻断项，然后重新与用户确认.");
    }
  }
  for (const rel of [".plan/PRD.md", ".plan/SPEC.md", ".plan/CHECKLIST.md"]) {
    if (!exists(cwd, rel)) {
      addIssue(report, "p0", "missing-plan-file", `缺少 ${rel}`, rel, "运行 init 或恢复当前事实文件.");
    }
  }

  const checklist = readText(cwd, ".plan/CHECKLIST.md");
  if (!checklist.includes("任务列表前置规划")) {
    addIssue(report, "p0", "missing-task-first-gate", "Checklist 缺少 任务列表前置规划.", ".plan/CHECKLIST.md", "添加阻塞式任务优先规划门.");
  }
  if (!includesAny(checklist, ["stop gate", "Stop gate", "停止门", "验收门", "fanqie-publish"])) {
    addIssue(report, "p0", "missing-stop-gate", "未找到显式停止门或人工验收门.", ".plan/CHECKLIST.md", "记录用户/平台/人工验收停止门.");
  }
  if (!exists(cwd, ".kit")) {
    addIssue(report, "p1", "missing-kit-entry", "缺少 .kit 项目状态入口.", ".kit", "创建 .kit/ 或记录为何该项目不由 KIT 管理.");
  }
  if (exists(cwd, ".plan/README.md")) {
    addIssue(report, "p1", "plan-readme-entry-conflict", ".plan/README.md 存在，但 README 应位于项目根目录.", ".plan/README.md", "将面向用户的项目说明移至根目录 README.md. .plan/ 仅用于 PRD, SPEC, CHECKLIST, archive 和 runs.");
  }
  if (!exists(cwd, ".test")) {
    addIssue(report, "p1", "missing-test-package", "缺少 .test/ 隔离测试包.", ".test", "创建 .test/，包含 ai/ 和 user/ 通道, README.md 和 config.json.");
  }
  if (!exists(cwd, ".test/README.md")) {
    addIssue(report, "p1", "missing-test-readme", "缺少 .test/README.md 测试入口.", ".test/README.md", "在 .test/README.md 中记录前端、skill、CLI/后端和 workflow 测试路径.");
  }
  if (!exists(cwd, ".test/config.json")) {
    addIssue(report, "p1", "missing-test-config", "缺少 .test/config.json 测试包清单.", ".test/config.json", "记录版本以及 .test/ai 和 .test/user 根目录.");
  }
  for (const rel of [".test/ai", ".test/user", ".test/user/README.md"]) {
    if (!exists(cwd, rel)) {
      addIssue(report, "p1", "missing-test-lane", `缺少 ${rel}.`, rel, "AI 自检产物放在 .test/ai/，真实用户测试产物放在 .test/user/.");
    }
  }
  if (exists(cwd, "TESTING.md")) {
    addIssue(report, "p1", "root-testing-entry-conflict", "根目录 TESTING.md 存在，但 KIT 测试材料应位于 .test/ 下.", "TESTING.md", "将测试说明移至 .test/README.md 并在 SPEC/CHECKLIST 中记录变更.");
  }
  checkLooseOutputDirs(cwd, report);
  checkVersionContract(cwd, report);

  const prd = readText(cwd, ".plan/PRD.md");
  if (includesAny(prd, ["待补充", "TBD", "TODO"])) {
    addIssue(report, "p1", "prd-placeholders", "PRD 仍包含占位产品事实.", ".plan/PRD.md", "将占位符替换为目标用户、目标、范围和可观察验收标准.");
  }

  const spec = readText(cwd, ".plan/SPEC.md");
  if (!includesAny(spec, ["Handoff", "交接", "routed", "路由", "Primary loop", "主循环"])) {
    addIssue(report, "p1", "missing-handoff-schema", "SPEC 未记录路由能力或交接模式.", ".plan/SPEC.md", "记录负责人、路由工具/skill、审批状态、证据路径和回退方案.");
  }

  const corpus = readCorpus(cwd);
  checkHostEntry(cwd, report);
  checkDeepResearchSkill(cwd, report, corpus);
  checkEntryAndCharterConsistency(cwd, report, corpus);
  checkWorkflowOption(cwd, report);
  checkCapabilitySkillInventory(cwd, report, corpus);
  checkInvocationStatusBrief(cwd, report, corpus);
  checkArchiveInteractionGate(cwd, report, corpus);
  checkRequirementObjectClassification(cwd, report, corpus);
  checkBrowserAndImageRoutes(cwd, report, corpus);
  checkModelAgentDevelopmentRisks(cwd, report, corpus);
  checkHardcodedAssumptions(cwd, report);
  checkRuntimeIndexSync(cwd, report);
  checkSandboxArchivePaths(cwd, report);
  checkNameConsistency(cwd, report);
  checkSkillFrameworkDeclaration(cwd, report);
}

function checkLooseOutputDirs(cwd, report) {
  for (const rel of ["output", "outputs"]) {
    if (exists(cwd, rel)) {
      addIssue(
        report,
        "p1",
        "loose-output-dir",
        `${rel}/ 存在于仓库根目录. AI 输出文件夹不是有效的 KIT 测试包.`,
        rel,
        "分类处理: AI 自检产物 -> .test/ai/; 真实用户测试材料 -> .test/user/; 过期历史 -> .plan/archive/. 不要将 output(s)/ 作为活跃根目录保留."
      );
    }
  }
}

function checkModelAgentDevelopmentRisks(cwd, report, corpus) {
  const hasModelOrAgentScope = includesAny(corpus, [
    "OpenAI SDK",
    "Claude SDK",
    "Agents SDK",
    "LLM",
    "model",
    "模型",
    "提示词",
    "prompt",
    "tool call",
    "工具调用",
    "workflow runner",
    "多 Agent",
    "multi-agent"
  ]);
  if (!hasModelOrAgentScope) return;

  if (!includesAny(corpus, ["Model / Agent Risk Ledger", "模型/Agent 风险账本", "模型风险", "agent risk"])) {
    addIssue(
      report,
      "p1",
      "missing-model-agent-risk-ledger",
      "项目涉及 Model/Agent 开发，但 SPEC 未记录 model/agent 风险账本.",
      ".plan/SPEC.md",
      "记录提供方/模型版本、成本/配额、上下文/分片策略、工具权限、评测数据隔离、提示词漂移、内容安全、证据保留和回退方案."
    );
    return;
  }

  const p1RiskChecks = [
    ["missing-cost-quota-policy", ["cost", "budget", "quota", "rate limit", "rpm", "tpm", "DEFERRED", "限额", "额度", "成本"], "成本/配额/限速策略"],
    ["missing-context-policy", ["context", "token", "chunk", "truncation", "max_context", "上下文", "分片", "截断"], "上下文、token 和截断策略"],
    ["missing-tool-permission-policy", ["tool permission", "权限", "allowlist", "denylist", "live action", "危险操作", "确认门"], "工具权限和实时操作策略"],
    ["missing-eval-data-isolation", ["eval", "fixture", "golden", "benchmark", ".test/ai/fixtures", "评测"], "评测/fixture 数据隔离"]
  ];
  for (const [code, terms, label] of p1RiskChecks) {
    if (!includesAny(corpus, terms)) {
      addIssue(report, "p1", code, `Model/Agent 风险账本缺少 ${label}.`, ".plan/SPEC.md", `添加 ${label}；model/agent 项目不能将其视为装饰.`);
    }
  }

  const p2RiskChecks = [
    ["missing-model-version-policy", ["model version", "model_version", "model_id", "pinned", "模型版本", "provider", "提供方"], "模型/提供方版本策略"],
    ["missing-prompt-drift-policy", ["prompt drift", "角色漂移", "system prompt", "persona", "人设"], "提示词/人设漂移策略"],
    ["missing-content-safety-policy", ["copyright", "版权", "safety", "合规", "内容安全", "PII", "隐私"], "内容安全、隐私或版权策略"],
    ["missing-evidence-retention-policy", ["retention", "日志", "log", "evidence retention", "证据保留", "上下文污染"], "日志/证据保留策略"],
    ["missing-trace-sensitive-data-policy", ["trace_sensitive_data", "tracing", "trace", "sensitive data", "敏感数据"], "追踪敏感数据策略"],
    ["missing-concurrent-agent-policy", ["run_id", "owner", "lock", "touched paths", "conflict", "并发", "冲突"], "并发 Agent 冲突策略"],
    ["missing-reproducibility-policy", ["exit code", "artifact hash", "lockfile", "seed", "可复现", "哈希"], "可复现性策略"]
  ];
  for (const [code, terms, label] of p2RiskChecks) {
    if (!includesAny(corpus, terms)) {
      addIssue(report, "p2", code, `Model/Agent 风险账本缺少 ${label}.`, ".plan/SPEC.md", `当 model/agent 行为影响交付或测试时，添加 ${label}.`);
    }
  }

  const hasLiveActionScope = includesAny(corpus, [
    "publish",
    "提交",
    "发布",
    "外发",
    "delete",
    "删除",
    "账号",
    "cookie",
    "token",
    "live action",
    "--live"
  ]);
  if (hasLiveActionScope && !includesAny(corpus, ["CONFIRM_REQUIRED", "Stop Gate", "停止门", "人工确认", "allowlist", "denylist"])) {
    addIssue(report, "p0", "missing-live-action-stop-gate", "Model/Agent 工作流涉及实时或账号敏感操作，但缺少硬确认/权限门.", ".plan/SPEC.md", "在实时写入、删除、提交、账号操作或发布前添加 allowlist/denylist 以及 CONFIRM_REQUIRED 或等效硬停止.");
  }

  const userLaneDir = path.join(cwd, ".test", "user");
  const suspiciousUserFiles = listFilesRecursive(userLaneDir)
    .filter((file) => !["README.md", ".gitkeep"].includes(path.basename(file)))
    .filter((file) => {
      try {
        const text = fs.readFileSync(file, "utf8");
        return includesAny(text, ["AI generated feedback", "model-generated feedback", "mock user", "模拟用户", "AI 模拟用户"]);
      } catch {
        return false;
      }
    })
    .map((file) => path.relative(cwd, file));
  if (suspiciousUserFiles.length > 0) {
    addIssue(report, "p1", "possible-ai-feedback-in-user-lane", `真实用户通道中发现疑似 AI/模拟/模型反馈: ${suspiciousUserFiles.join(", ")}`, ".test/user", "将 AI 模拟用户和模型生成反馈移至 .test/ai/.");
  }
}

function checkHardcodedAssumptions(cwd, report) {
  const patterns = [
    {
      severity: "p1",
      code: "hardcoded-local-user-path",
      label: "local user path",
      regex: /\b[A-Za-z]:\\Users\\[^\\\s"'`]+|\/Users\/[^/\s"'`]+|\/home\/[^/\s"'`]+|\/root\/[^/\s"'`]+/i,
      fix: "Move local machine paths into config/env/test fixtures, or mark them as example-only in docs."
    },
    {
      severity: "p1",
      code: "hardcoded-browser-profile",
      label: "browser profile or user-data-dir",
      regex: /(user-data-dir|profile-directory|Chrome Profile|Default\\Preferences|Local State|browser profile|浏览器\s*profile|登录态路径)/i,
      fix: "Do not bake login/browser profile paths into shared code. Record the host-local setup and keep account material out of git."
    },
    {
      severity: "p1",
      code: "hardcoded-platform-identity",
      label: "platform/account/workspace id",
      regex: /\b(user|account|tenant|workspace|project|book|org|team|channel|chat|file|folder|platform)[_-]?id\b\s*[:=]\s*["']?[A-Za-z0-9_-]{6,}/i,
      fix: "Confirm whether the id is environment-specific. Move it into config/env or document why it is intentionally fixed."
    },
    {
      severity: "p1",
      code: "hardcoded-secret-like-literal",
      label: "secret-like literal",
      regex: /\b(OPENAI_API_KEY|ANTHROPIC_AUTH_TOKEN|api[_-]?key|secret|token|cookie|sessionid)\b\s*[:=]\s*["'][^"']{8,}["']/i,
      fix: "Remove committed secret-like values. Use local ignored config, env vars, or a secret manager."
    },
    {
      severity: "p2",
      code: "hardcoded-localhost-port",
      label: "localhost or fixed port",
      regex: /\b(localhost|127\.0\.0\.1|0\.0\.0\.0):\d{2,5}\b/i,
      fix: "Confirm whether the port is a project contract or just a local example. Record it in SPEC/test docs if intentional."
    },
    {
      severity: "p2",
      code: "hardcoded-temp-or-download-path",
      label: "temp/download path",
      regex: /\b(downloads?|tmp|temp|output_path|download_dir)\b\s*[:=]\s*["'][^"']+["']|\/tmp\/|%TEMP%|%TMP%/i,
      fix: "Use .test/ai sandboxes or configurable temp paths; do not make one machine's temp/download path the project contract."
    },
    {
      severity: "p2",
      code: "hardcoded-placeholder-value",
      label: "placeholder value",
      regex: /\b(your[-_ ]?name|your[-_ ]?username|your[-_ ]?api[-_ ]?key|replace[-_ ]?me|changeme|example\.com)\b/i,
      fix: "Replace placeholders in active project files, or mark them clearly as examples in README/test guides."
    },
    {
      severity: "p2",
      code: "hardcoded-floating-model-alias",
      label: "floating model alias",
      regex: /\b(model|MODEL|model_id|provider_model)\b\s*[:=]\s*["']?(latest|auto|default|sonnet|opus|haiku)["']?/i,
      fix: "Pin the model or document alias resolution, upgrade policy, and revalidation trigger in Model / Agent Risk Ledger."
    }
  ];
  const matches = collectPatternMatches(cwd, patterns);
  report.evidence.hardcoded_assumptions = matches.map((item) => ({
    code: item.code,
    count: item.matches.length,
    samples: item.matches.slice(0, 5)
  }));

  for (const item of matches) {
    const samples = summarizeMatches(item.matches);
    addIssue(
      report,
      item.severity,
      item.code,
      `Potential hardcoded ${item.label} found (${item.matches.length} match${item.matches.length === 1 ? "" : "es"}): ${samples}`,
      samples,
      item.fix
    );
  }
}

function checkVersionContract(cwd, report) {
  const version = parseJsonFile(cwd, ".kit/version.json");
  if (!version) {
    addIssue(report, "p1", "missing-version-contract", "Missing or invalid .kit/version.json.", ".kit/version.json", "Create .kit/version.json and keep project_version aligned with package.json, AGENTS.md, git tags, and release notes.");
    return;
  }

  const projectVersion = version.project_version;
  const pkg = parseJsonFile(cwd, "package.json");
  if (pkg?.version && projectVersion && pkg.version !== projectVersion) {
    addIssue(report, "p1", "version-mismatch-package", `package.json version (${pkg.version}) differs from .kit/version.json (${projectVersion}).`, "package.json / .kit/version.json", "Update both files in the same release change.");
  }
  const kitConfig = parseJsonFile(cwd, ".kit/config.json");
  if (kitConfig?.project_version && projectVersion && kitConfig.project_version !== projectVersion) {
    addIssue(report, "p1", "version-mismatch-kit-config", `.kit/config.json version (${kitConfig.project_version}) differs from .kit/version.json (${projectVersion}).`, ".kit/config.json / .kit/version.json", "Update the status snapshot and version contract together.");
  }
  const testConfig = parseJsonFile(cwd, ".test/config.json");
  if (testConfig?.project_version && projectVersion && testConfig.project_version !== projectVersion) {
    addIssue(report, "p1", "version-mismatch-test-config", `.test/config.json version (${testConfig.project_version}) differs from .kit/version.json (${projectVersion}).`, ".test/config.json / .kit/version.json", "Update the test package version and KIT version contract together.");
  }
  if (testConfig && (!testConfig.ai || !testConfig.user)) {
    addIssue(report, "p1", "test-config-missing-lanes", ".test/config.json does not define separate ai and user lanes.", ".test/config.json", "Define .test/ai for AI self-checks and .test/user for real user testing packages.");
  }

  const hostEntry = report.evidence.host?.entry || "AGENTS.md";
  const versionTextTargets = [
    ["README.md", "version-not-recorded-in-readme"],
    [hostEntry, "version-not-recorded-in-host-entry"],
    [".plan/SPEC.md", "version-not-recorded-in-spec"],
    [".workflow/README.md", "version-not-recorded-in-workflow"]
  ];
  for (const [rel, code] of versionTextTargets) {
    const text = readText(cwd, rel);
    if (text && projectVersion && !text.includes(projectVersion)) {
      addIssue(report, "p2", code, `${rel} exists but does not record the current project version.`, rel, "Add the same project_version used by .kit/version.json.");
    }
  }
}

function checkHostEntry(cwd, report) {
  const host = report.evidence.host?.detected || detectHost(cwd, "auto");
  const entry = hostEntryFor(host);
  const entryText = readText(cwd, entry);
  if (!entryText) {
    addIssue(report, "p1", "missing-host-entry", `Missing host entry ${entry} for detected host ${host}.`, entry, `Create ${entry} and point it to .plan/, .kit/, .workflow/, and .test/.`);
    return;
  }
  const requiredAnchors = [".plan", ".kit", ".workflow", ".test"];
  const missingAnchors = requiredAnchors.filter((anchor) => !entryText.includes(anchor));
  if (missingAnchors.length > 0) {
    addIssue(report, "p1", "host-entry-missing-kit-anchors", `${entry} does not reference required KIT anchors: ${missingAnchors.join(", ")}.`, entry, "Reference .plan/, .kit/, .workflow/, and .test/ so the host reads the right contract.");
  }
  if (host === "claude") {
    const agents = readText(cwd, "AGENTS.md");
    if (agents && !includesAny(agents, ["CLAUDE.md", ".plan", ".kit", ".workflow", ".test"])) {
      addIssue(report, "p2", "agents-not-bridged-for-claude", "AGENTS.md exists in a Claude-hosted project but does not bridge to CLAUDE.md or KIT anchors.", "AGENTS.md", "Make CLAUDE.md the Claude primary entry; AGENTS.md may exist only as a bridge for other hosts.");
    }
  }
}

function checkDeepResearchSkill(cwd, report, corpus) {
  const status = findDeepResearchSkill(cwd);
  report.evidence.deep_research_skill = status;
  if (!status.installed) {
    addIssue(
      report,
      "p1",
      "missing-deep-research-skill",
      "Deep research skill is not installed in host or project skill roots.",
      "Capability Skill Inventory",
      "Put deep-research at the top of optional install recommendations; use it for file search plus file-informed web research, then record install target and evidence in .plan/SPEC.md."
    );
    return;
  }

  if (!includesAny(corpus, ["deep-research", "Deep research", "deep research", "文件检索", "联网搜索"])) {
    addIssue(
      report,
      "p2",
      "deep-research-not-recorded",
      "Deep research skill is installed but the project facts do not record how it will be used or deferred.",
      ".plan/SPEC.md",
      "Record deep-research host/project status, location, purpose, approval state, and evidence in Capability Skill Inventory."
    );
  }
}

function checkEntryAndCharterConsistency(cwd, report, corpus) {
  if (!exists(cwd, "README.md")) {
    addIssue(report, "p2", "missing-root-readme", "Root README.md is missing.", "README.md", "Add a root README that points to the active project facts and workflow entry.");
  }

  const hasAgents = exists(cwd, "AGENTS.md");
  const hasClaude = exists(cwd, "CLAUDE.md");
  if (hasAgents && hasClaude) {
    const agents = readText(cwd, "AGENTS.md");
    const claude = readText(cwd, "CLAUDE.md");
    const linked = includesAny(agents, ["CLAUDE.md", ".plan", "PRD.md", "SPEC.md", "CHECKLIST.md"]) &&
      includesAny(claude, ["AGENTS.md", ".plan", "PRD.md", "SPEC.md", "CHECKLIST.md"]);
    if (!linked) {
      addIssue(report, "p1", "unlinked-agent-charters", "AGENTS.md and CLAUDE.md both exist but do not share a clear dependency or fact-source bridge.", "AGENTS.md / CLAUDE.md", "Keep the active host entry primary. The inactive entry may exist only as a bridge to the active entry and .plan/.kit/.workflow/.test anchors.");
    }
  }

  const hasRootCharters = hasAgents || hasClaude || exists(cwd, "README.md") || exists(cwd, ".workflow/README.md");
  if (hasRootCharters && !includesAny(corpus, ["Charter Consistency", "章程一致性", "入口一致性", "AGENTS.md", "CLAUDE.md"])) {
    addIssue(report, "p1", "missing-charter-consistency-check", "Project entry files exist but SPEC does not record charter/plan consistency.", ".plan/SPEC.md", "Record whether README, active host entry, .workflow/README.md, .test/README.md, and .plan agree on goal, scope, and workflow.");
  }
}

function checkWorkflowOption(cwd, report) {
  const workflowDir = path.join(cwd, ".workflow");
  const hasWorkflowDir = fs.existsSync(workflowDir);
  const hasDocsWorkflows = exists(cwd, "docs/workflows");
  const hasLegacyWorkflows = exists(cwd, ".workflows");
  const spec = readText(cwd, ".plan/SPEC.md");

  if (hasDocsWorkflows) {
    addIssue(report, "p1", "legacy-docs-workflows", "docs/workflows/ exists, but KIT now uses .workflow/ as the single workflow directory.", "docs/workflows", "Move or bridge workflow documents into .workflow/ and record legacy status in .plan/SPEC.md.");
  }
  if (hasLegacyWorkflows) {
    addIssue(report, "p1", "legacy-workflows-dir", ".workflows/ exists, but KIT now uses .workflow/ as the single workflow directory.", ".workflows", "Move or bridge legacy workflow runner/docs into .workflow/ and record runner compatibility in .plan/SPEC.md.");
  }

  if (!hasWorkflowDir) {
    addIssue(report, "p1", "missing-workflow-entry", "Missing .workflow/ KIT workflow entry.", ".workflow/README.md", "Create .workflow/ as the single workflow entry, or record why this project is not workflow-managed.");
    return;
  }

  if (!exists(cwd, ".workflow/README.md")) {
    addIssue(report, "p1", "missing-workflow-readme", ".workflow exists but .workflow/README.md is missing.", ".workflow/README.md", "Add a workflow README as the entrypoint.");
  }
  if (!includesAny(spec, [".workflow/README.md", "Active workflow entry", "active workflow entry", "当前 workflow 入口"])) {
    addIssue(report, "p1", "workflow-entry-not-recorded", ".workflow/ exists but SPEC does not record it as the workflow entry.", ".plan/SPEC.md", "Record Active workflow entry: .workflow/README.md.");
  }
  for (const rel of [".workflow/codex.md", ".workflow/workbuddy.md", ".workflow/trae-solo.md"]) {
    if (!exists(cwd, rel)) {
      addIssue(report, "p2", "missing-workflow-preset", `Optional workflow preset missing: ${rel}`, rel, "Add the preset if this host/workflow needs a stable read path.");
    }
  }
}

function checkCapabilitySkillInventory(cwd, report, corpus) {
  const impliedRoutedCapability = includesAny(corpus, [
    "deep research",
    "deep-research",
    "QA",
    "quality assurance",
    "ultraqa",
    "auto-verify",
    "browser",
    "浏览器",
    "OpenCLI",
    "opencli",
    "publishing",
    "delivery",
    "外发",
    "提交",
    "发布",
    "multi-agent",
    "多 Agent",
    "team",
    "ultrawork",
    "OpenAI SDK",
    "Claude SDK",
    "生图",
    "image generation",
    "security review",
    "visual review"
  ]);
  if (!impliedRoutedCapability) return;

  if (!includesAny(corpus, ["Capability Skill Inventory", "业务 Skill 盘点", "Host status", "Project status", "Install target"])) {
    addIssue(report, "p1", "missing-capability-skill-inventory", "Routed capabilities are implied but host/project business skill inventory is not documented.", ".plan/SPEC.md", "Inspect host and project skills/workflows/runners; record need, host status, project status, recommended skill/tool, install target, approval, and evidence.");
  }
}

function checkInvocationStatusBrief(cwd, report, corpus) {
  const initialized = exists(cwd, ".plan/PRD.md") || exists(cwd, ".kit");
  if (!initialized) return;

  if (!includesAny(corpus, ["Invocation Status Brief", "调用状态提醒", "当前状态", "方向变化", "status brief"])) {
    addIssue(
      report,
      "p1",
      "missing-invocation-status-brief",
      "Initialized KIT project lacks the every-invocation status brief contract.",
      ".plan/SPEC.md / .plan/CHECKLIST.md",
      "Record current status, endpoint, direction drift, next safe action, and user decision requirement for resumed KIT calls."
    );
    return;
  }

  if (!includesAny(corpus, ["终点", "Definition of Done", "stop gate", "Stop Gate"])) {
    addIssue(
      report,
      "p1",
      "missing-project-endpoint",
      "Status brief exists but does not define the project endpoint or stop gate.",
      ".plan/PRD.md / .plan/SPEC.md",
      "Add Definition of Done plus Stop Gate so resumed work knows what completion means."
    );
  }

  if (!includesAny(corpus, ["question-bank.json", "SB*", "SB1", "固定追问"])) {
    addIssue(
      report,
      "p2",
      "missing-question-bank-status-reference",
      "Status questions are not tied to the compact question bank.",
      ".plan/SPEC.md",
      "Reference knowledge/question-bank.json SB* IDs instead of repeating long fixed questions."
    );
  }
}

function checkArchiveInteractionGate(cwd, report, corpus) {
  const archiveScope = exists(cwd, ".plan") || includesAny(corpus, ["归档", "archive", "cleanup", "打包", "移动流程文件"]);
  if (!archiveScope) return;

  if (!includesAny(corpus, ["Archive Interaction Gate", "归档前交互确认", "AR*", "归档前确认"])) {
    addIssue(
      report,
      "p1",
      "missing-archive-interaction-gate",
      "Archive/cleanup scope lacks the pre-archive interaction gate.",
      ".plan/SPEC.md / .plan/CHECKLIST.md",
      "Before archiving or moving process files, record when to ask the user and when aligned docs/data allow proceeding without ceremony."
    );
    return;
  }

  if (!includesAny(corpus, ["PRD", "SPEC", "CHECKLIST", ".kit", ".workflow", ".test", "live files", "目标一致"])) {
    addIssue(
      report,
      "p1",
      "missing-archive-alignment-sources",
      "Archive gate does not list the fact sources that must align before silent cleanup.",
      ".plan/SPEC.md",
      "Require PRD/SPEC/CHECKLIST/.kit/.workflow/.test/entry/live files alignment before archive movement without user interaction."
    );
  }

  if (!includesAny(corpus, ["不需要提问", "No question", "不用问", "no P0/P1", "P0/P1"])) {
    addIssue(
      report,
      "p2",
      "missing-archive-no-question-rule",
      "Archive gate does not define when no user question is needed.",
      ".plan/SPEC.md",
      "State that no question is needed only when validate has no relevant P0/P1 and docs/data/live files agree."
    );
  }
}

function checkRequirementObjectClassification(cwd, report, corpus) {
  const classificationTerms = [
    "Development Object Classification",
    "Primary object",
    "开发对象分类",
    "skill",
    "stable-workflow",
    "cli-harness",
    "frontend-backend-app",
    "omc-orchestration",
    "opencli-automation",
    "sdk-integration",
    "design-prototype"
  ];
  if (!includesAny(corpus, classificationTerms)) {
    addIssue(
      report,
      "p1",
      "missing-development-object-classification",
      "Project facts do not classify what the user is building.",
      ".plan/PRD.md / .plan/SPEC.md",
      "Classify the primary object before framework selection: skill, stable workflow, CLI harness, frontend/backend app, OMC orchestration, OpenCLI automation, SDK integration, pure MD framework, or design prototype."
    );
    return;
  }

  if (!includesAny(corpus, ["Framework Routing Decision", "OpenSpec", "Super Dev", "CLI-Anything", "clianthing", "OMC", "OpenCLI"])) {
    addIssue(
      report,
      "p2",
      "missing-framework-routing-decision",
      "Development object is implied but framework routing decision is not recorded.",
      ".plan/SPEC.md",
      "Record why the project should use KIT only, OpenSpec, Super Dev, CLI-Anything, OMC, OpenCLI, SDK integration, or a stable workflow."
    );
  }

  if (includesAny(corpus, ["frontend", "backend", "full-stack", "全栈", "前端", "后端"]) && !includesAny(corpus, ["OpenSpec", "Super Dev"])) {
    addIssue(
      report,
      "p2",
      "frontend-backend-framework-not-considered",
      "Frontend/backend scope exists but OpenSpec/Super Dev were not considered.",
      ".plan/SPEC.md",
      "For frontend/backend stack selection, consider OpenSpec for spec-driven change management and Super Dev for governed delivery."
    );
  }
}

function checkBrowserAndImageRoutes(cwd, report, corpus) {
  const hasBrowserScope = includesAny(corpus, [
    "browser",
    "浏览器",
    "page inspection",
    "DOM",
    "screenshot",
    "截图",
    "平台页面",
    "后台页面",
    "click/form",
    "页面自动化"
  ]);
  const hasLoginStateScope = includesAny(corpus, [
    "登录态",
    "login state",
    "logged-in",
    "cookie",
    "cookies",
    "session",
    "账号",
    "bound profile",
    "Chrome Profile"
  ]);
  if (hasBrowserScope && hasLoginStateScope) {
    if (!includesAny(corpus, ["OpenCLI", "opencli", "project-standard", "项目标准", "绑定浏览器", "bound:"])) {
      addIssue(report, "p1", "missing-login-browser-route", "Browser work mentions login/session state but no logged-in browser technical route is documented.", ".plan/SPEC.md", "Record project-standard tool or OpenCLI route, auth/session material policy, evidence path, and fallback.");
    }
    if (includesAny(corpus, ["Playwright", "playwright"]) && !includesAny(corpus, ["OpenCLI", "opencli", "项目标准", "auth-state", "storageState"])) {
      addIssue(report, "p1", "playwright-login-state-risk", "Playwright appears near logged-in browser work without an auth-state policy or OpenCLI/project-standard boundary.", ".plan/SPEC.md", "Use Playwright mainly for E2E or document safe auth-state handling; use OpenCLI/project-standard runner for logged-in browser evidence.");
    }
  }

  const hasImageGenerationScope = includesAny(corpus, [
    "生图",
    "图片生成",
    "生成图片",
    "AI images",
    "image generation",
    "generated image",
    "character image",
    "background image",
    "cover image",
    "封面",
    "角色图",
    "背景图",
    "缩略图"
  ]);
  if (hasImageGenerationScope) {
    if (!includesAny(corpus, ["生图点", "image point", "image-generation point", "资产类型", "尺寸/数量", "尺寸数量"])) {
      addIssue(report, "p1", "missing-image-generation-points", "Image generation is in scope but concrete generation points are not documented.", ".plan/PRD.md", "List screens/scenes/assets/covers/characters/backgrounds/thumbnails that need generated images and their product purpose.");
    }
    if (!includesAny(corpus, ["Codex image", "imagegen", "Seedream", "DALL", "provider", "提供方", "生成工具", "推荐工具"])) {
      addIssue(report, "p1", "missing-image-generation-method", "Image generation is in scope but provider/tool choice is not documented.", ".plan/SPEC.md", "Record provider/tool, prompt ownership, dimensions, storage path, approval gate, and fallback rule.");
    }
  }
}

function checkFrontend(cwd, report) {
  const corpus = readCorpus(cwd);
  if (!includesAny(corpus, [".test/ai/evidence", ".test/user/evidence", "screenshot", "截图", "visual"])) {
    addIssue(report, "p0", "missing-visual-evidence", "Frontend/UI profile lacks visual evidence path.", ".plan/SPEC.md", "Record AI screenshot evidence under .test/ai/evidence/ and user evidence under .test/user/evidence/.");
  }
  if (!includesAny(corpus, ["OpenCLI", "Playwright", "browser", "浏览器", "project-standard"])) {
    addIssue(report, "p1", "missing-browser-tool", "Browser/evidence tool is not documented.", ".plan/SPEC.md", "Record the project-standard browser evidence tool and fallback.");
  }
  if (!exists(cwd, "docs/ui-ux")) {
    addIssue(report, "p2", "missing-uiux-docs", "Missing docs/ui-ux/ for stable UI/UX source material.", "docs/ui-ux", "Create docs/ui-ux/ when UI/UX facts exist.");
  }
}

function checkLongContentPublishing(cwd, report) {
  const corpus = readCorpus(cwd);
  const workflowEntries = findWorkflowEntries(cwd);
  report.evidence.workflow_entries = workflowEntries;

  if (!includesAny(corpus, ["fanqie-publish", "publish confirmation", "真实发布", "confirm-live", "外发确认", "写入确认", "提交确认", "live delivery", "CONFIRM_REQUIRED", "live delivery: 不适用", "外发/写入/提交/发布: 不适用"])) {
    addIssue(report, "p0", "missing-live-delivery-gate", "Live delivery/write/submit/publish confirmation gate is missing.", ".plan/SPEC.md", "Record a human gate for live delivery, or explicitly mark external write/submit/publish as not applicable.");
  }
  if (!includesAny(corpus, ["dry-run", "dry run", "--live", "confirm-live", "live flags"])) {
    addIssue(report, "p0", "missing-dry-run-live-isolation", "Dry-run/live isolation is missing.", ".plan/SPEC.md", "Document dry-run commands and explicit live flags.");
  }
  if (includesAny(corpus, ["ANTHROPIC_AUTH_TOKEN=", "OPENAI_API_KEY=", "cookie=", "Cookie:", "sessionid="])) {
    addIssue(report, "p0", "possible-secret-material", "Possible account/token/cookie material appears in project text.", "", "Move secrets to local ignored config and sanitize committed docs.");
  }
  if (!includesAny(corpus, ["data/runs", "audit.jsonl", "state_path", "状态", "resume"])) {
    addIssue(report, "p0", "missing-run-state", "Resumable workflow state or audit log is missing.", ".plan/SPEC.md", "Record state file and audit log path.");
  }
  if (!includesAny(corpus, ["AI粗制滥造", "quality review", "质量", "template stitching", "empty/water", "阻断"])) {
    addIssue(report, "p0", "missing-content-quality-blocker", "Content/workflow quality blocker is missing.", ".plan/SPEC.md", "Record quality blockers before live delivery or completion confirmation.");
  }
  if (!includesAny(corpus, [".test/ai/evidence", ".test/ai/reports", ".test/user/evidence", ".test/user/feedback", "evidence/log", "publish evidence", "delivery evidence", "run evidence", "产物证据", "运行证据", "证据"])) {
    addIssue(report, "p0", "missing-delivery-evidence", "Delivery/run evidence path is missing.", ".plan/SPEC.md", "Record AI evidence under .test/ai/ and user-facing evidence under .test/user/.");
  }

  const p1Checks = [
    ["node graph", ["Node Graph", "node graph", "->", "节点"], "missing-node-graph"],
    ["artifact root", ["artifacts/", "artifact_root", "output_root", "产物"], "missing-artifact-root"],
    ["human gates", ["Human Gates", "human gate", "CONFIRM_REQUIRED", "人工确认"], "missing-human-gates"],
    ["executor ownership", ["executor", "执行器", "Claude", "OpenCode", "OpenAI SDK", "Node"], "missing-executor-ownership"],
    ["chunk policy", ["chunk", "分片", "章节", "manuscript"], "missing-chunk-policy"],
    ["review matrix", ["review matrix", "评审", "reviewer", "parallel-review"], "missing-review-matrix"],
    ["format/encoding gate", ["UTF-8", "encoding", "乱码", "format", "格式"], "missing-format-encoding-gate"]
  ];
  for (const [label, terms, code] of p1Checks) {
    if (!includesAny(corpus, terms)) {
      addIssue(report, "p1", code, `Missing ${label}.`, ".plan/SPEC.md", `Record ${label} for long-content workflow.`);
    }
  }
  if (!includesAny(corpus, ["DEFERRED", "quota", "额度", "创建作品数量超出每日上限"])) {
    addIssue(report, "p1", "missing-quota-deferred", "Quota/deferred behavior is not documented.", ".plan/SPEC.md", "Record platform quota and DEFERRED handling.");
  }
}

function checkArchiveCleanup(cwd, report) {
  const rootMarkdown = fs.existsSync(cwd)
    ? fs.readdirSync(cwd).filter((name) => name.endsWith(".md") && !["README.md", "AGENTS.md", "CLAUDE.md"].includes(name))
    : [];
  if (rootMarkdown.length > 0) {
    addIssue(report, "p1", "unclassified-root-markdown", `Root Markdown candidates need classification: ${rootMarkdown.join(", ")}`, ".", "Classify as keep, archive, docs, or evidence after reference checks.");
  }
  for (const rel of [".super-dev", ".superpowers", ".agents", ".claude", ".codex", "output"]) {
    if (exists(cwd, rel)) {
      addIssue(report, "p2", "process-dir-review", `Process/tooling directory needs current-state review: ${rel}`, rel, "Inspect entrypoint and references before archiving anything.");
    }
  }
}

function checkRuntimeIndexSync(cwd, report) {
  const version = parseJsonFile(cwd, ".kit/version.json");
  const config = parseJsonFile(cwd, ".kit/config.json");
  const runtimeIndex = parseJsonFile(cwd, ".kit/case-runtime-index.json");

  // Check version consistency across .kit/ files
  const versions = [];
  if (version?.project_version) versions.push({ file: ".kit/version.json", ver: version.project_version });
  if (config?.project_version) versions.push({ file: ".kit/config.json", ver: config.project_version });
  if (runtimeIndex?.project_version) versions.push({ file: ".kit/case-runtime-index.json", ver: runtimeIndex.project_version });

  if (versions.length >= 2) {
    const first = versions[0].ver;
    const mismatched = versions.filter((v) => v.ver !== first);
    if (mismatched.length > 0) {
      addIssue(
        report,
        "p1",
        "runtime-index-version-mismatch",
        `.kit/ version mismatch: ${versions.map((v) => `${v.file}=${v.ver}`).join(", ")}.`,
        ".kit/",
        "Align .kit/version.json, .kit/config.json, and .kit/case-runtime-index.json to the same project_version before archiving."
      );
    }
  }

  // Check runtime index stage consistency
  if (runtimeIndex) {
    const indexStage = runtimeIndex.current_stage || runtimeIndex.stage;
    const configStage = config?.current_stage || config?.stage;
    if (indexStage && configStage && indexStage !== configStage) {
      addIssue(
        report,
        "p1",
        "runtime-index-stage-mismatch",
        `.kit/case-runtime-index.json stage (${indexStage}) differs from .kit/config.json stage (${configStage}).`,
        ".kit/case-runtime-index.json",
        "Synchronize stage markers across .kit/ files to prevent cross-session state pollution."
      );
    }
  }

  // Check if .plan/ version markers match .kit/ version
  const prd = readText(cwd, ".plan/PRD.md");
  const spec = readText(cwd, ".plan/SPEC.md");
  const planVersionMatch = prd.match(/(?:版本|version)[\s:=]+v?(\d+\.\d+\.\d+)/i) || spec.match(/(?:版本|version)[\s:=]+v?(\d+\.\d+\.\d+)/i);
  if (planVersionMatch && versions.length > 0) {
    const planVer = planVersionMatch[1];
    const kitVer = versions[0].ver;
    if (planVer !== kitVer) {
      addIssue(
        report,
        "p1",
        "plan-kit-version-drift",
        `.plan/ version marker (v${planVer}) differs from .kit/ version (${kitVer}).`,
        ".plan/PRD.md / .kit/version.json",
        "Keep .plan/ and .kit/ version markers in sync to avoid runtime index pollution."
      );
    }
  }
}

function checkSandboxArchivePaths(cwd, report) {
  const planDir = path.join(cwd, ".plan");
  if (!fs.existsSync(planDir)) return;

  const planFiles = fs.readdirSync(planDir).filter((name) => name.endsWith(".md"));
  // M-7 fix: allow v1.0.md, v1.0.0.md, v2.md etc.
  const sandboxPattern = /^(?:susx|sandbox|eval|experiment|ab-test|v\d+(?:\.\d+)*)[-_]/i;
  const candidates = planFiles.filter((name) => sandboxPattern.test(name) && !name.match(/^(PRD|SPEC|CHECKLIST|README)\.md$/i));

  if (candidates.length > 0) {
    addIssue(
      report,
      "p1",
      "sandbox-candidates-in-plan-dir",
      `Sandbox/experiment candidate files found in .plan/: ${candidates.join(", ")}.`,
      ".plan/",
      "Move sandbox experiment candidates to .test/ai/sandboxes/<sandbox>/_archive/. Keep .plan/ for active PRD/SPEC/CHECKLIST only."
    );
  }

  // Check if .test/ai/sandboxes/ archive structure exists when needed
  const sandboxesDir = path.join(cwd, ".test", "ai", "sandboxes");
  if (fs.existsSync(sandboxesDir)) {
    const sandboxes = fs.readdirSync(sandboxesDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    for (const sandbox of sandboxes) {
      const archiveDir = path.join(sandboxesDir, sandbox, "_archive");
      if (!fs.existsSync(archiveDir)) {
        addIssue(
          report,
          "p2",
          "missing-sandbox-archive-dir",
          `Sandbox ${sandbox} lacks _archive/ directory.`,
          `.test/ai/sandboxes/${sandbox}/`,
          "Create _archive/ under each sandbox to store historical plan candidates and evidence."
        );
      }
    }
  }
}

function checkSkillPackage(cwd, report) {
  const requiredPaths = [
    "SKILL.md",
    "README.md",
    "AGENTS.md",
    "CLAUDE.md",
    "LICENSE",
    "package.json",
    "agents/openai.yaml",
    "bin/spec-loop-kit.mjs",
    "templates",
    "knowledge",
    "knowledge/index.json",
    "knowledge/openspec-framework.md",
    "knowledge/superdev-framework.md",
    "knowledge/cli-anything-framework.md",
    "knowledge/question-bank.json"
  ];
  for (const rel of requiredPaths) {
    if (!exists(cwd, rel)) {
      addIssue(report, "p0", "missing-skill-package-file", `Missing package file or directory: ${rel}`, rel, "Restore it before publishing the skill package.");
    }
  }

  const pkg = parseJsonFile(cwd, "package.json");
  if (!pkg) {
    addIssue(report, "p0", "invalid-package-json", "package.json is missing or invalid.", "package.json", "Fix package metadata before publishing.");
  } else {
    if (pkg.license !== "MIT") {
      addIssue(report, "p1", "license-not-mit", "package.json license is not MIT.", "package.json", "Set license to MIT and keep LICENSE aligned.");
    }
    if (!pkg.bin?.["spec-loop-kit"]) {
      addIssue(report, "p1", "missing-helper-bin", "package.json does not expose spec-loop-kit bin.", "package.json", "Add bin.spec-loop-kit pointing to ./bin/spec-loop-kit.mjs.");
    }
    for (const scriptName of ["check", "check:contract", "check:self-audit", "check:pack"]) {
      if (!pkg.scripts?.[scriptName]) {
        addIssue(report, "p1", "missing-package-script", `package.json missing script: ${scriptName}`, "package.json", "Add syntax, self-audit, and package dry-run scripts.");
      }
    }
    const files = Array.isArray(pkg.files) ? pkg.files : [];
    for (const rel of ["SKILL.md", "README.md", "AGENTS.md", "CLAUDE.md", "LICENSE", "agents", "bin", "scripts", "templates", "knowledge", ".kit", ".test"]) {
      if (!files.includes(rel)) {
        addIssue(report, "p1", "package-files-missing-entry", `package.json files does not include ${rel}.`, "package.json", "Include all files needed for a portable skill package.");
      }
    }
    if (!pkg.repository || !pkg.homepage || !pkg.bugs) {
      addIssue(report, "p2", "missing-package-repo-metadata", "package.json lacks repository/homepage/bugs metadata.", "package.json", "Add GitHub metadata for public distribution.");
    }
  }

  const packageTestPaths = [
    ".kit/version.json",
    ".kit/config.json",
    ".test/README.md",
    ".test/config.json",
    ".test/ai/reports",
    ".test/ai/packages",
    ".test/user/README.md"
  ];
  for (const rel of packageTestPaths) {
    if (!exists(cwd, rel)) {
      addIssue(report, "p1", "missing-skill-self-audit-path", `Missing self-audit/package testing path: ${rel}`, rel, "Keep skill package proof under .test/ and version state under .kit/.");
    }
  }

  checkLooseOutputDirs(cwd, report);
  checkVersionContract(cwd, report);

  const readme = readText(cwd, "README.md");
  const skill = readText(cwd, "SKILL.md");
  const combined = `${readme}\n${skill}`;
  if (!includesAny(combined, ["AI 模拟用户", "AI-simulated users"])) {
    addIssue(report, "p1", "missing-ai-user-test-boundary", "Docs do not define AI-simulated user vs real user testing.", "README.md / SKILL.md", "State that AI-simulated users go under .test/ai/, real humans under .test/user/.");
  }
  if (!includesAny(combined, ["output/", "outputs/"])) {
    addIssue(report, "p1", "missing-output-dir-policy", "Docs do not forbid loose output/outputs directories.", "README.md / SKILL.md", "Record output/outputs classification into .test/ai, .test/user, or .plan/archive.");
  }
  if (!includesAny(combined, ["Model / Agent Risk Ledger", "模型/Agent 风险账本", "模型开发"])) {
    addIssue(report, "p2", "missing-model-agent-docs", "Docs do not explain model/agent development risk tracking.", "README.md / SKILL.md", "Document model version, cost/quota, context truncation, prompt drift, tool permissions, eval isolation, and evidence retention.");
  }

  const skillLines = skill ? skill.split(/\r?\n/).length : 0;
  if (skillLines > 700) {
    addIssue(report, "p2", "skill-doc-long", `SKILL.md is ${skillLines} lines; it may be heavy for host skill loading.`, "SKILL.md", "Later split reference material into knowledge/ while keeping the entrypoint lean.");
  }

  // Critical fix S-6.3: skill-package self-audit must also run archive checks
  checkRuntimeIndexSync(cwd, report);
  checkSandboxArchivePaths(cwd, report);
  checkNameConsistency(cwd, report);
  checkSkillFrameworkDeclaration(cwd, report);
}

function buildReport(args) {
  const cwd = path.resolve(args.cwd);
  const profile = detectProfile(cwd, args.profile);
  const host = detectHost(cwd, args.host);
  const report = {
    schema_version: 1,
    cwd,
    profile,
    host,
    status: "PASS",
    p0: [],
    p1: [],
    p2: [],
    evidence: {
      cwd_exists: fs.existsSync(cwd),
      host: {
        requested: args.host,
        detected: host,
        entry: hostEntryFor(host),
        role: hostEntryRoleFor(host),
        entry_exists: exists(cwd, hostEntryFor(host))
      },
      workflow_entries: []
    },
    recommended_next_action: "未发现阻断性 KIT 问题."
  };

  if (!fs.existsSync(cwd)) {
    addIssue(report, "p0", "missing-cwd", `目标 cwd 不存在: ${cwd}`, cwd, "请使用已存在的项目路径.");
  } else {
    if (profile === "skill-package") {
      checkSkillPackage(cwd, report);
    } else {
      checkBase(cwd, report);
    }
    if (profile === "frontend-ui") checkFrontend(cwd, report);
    if (profile === "long-content-publishing") checkLongContentPublishing(cwd, report);
    if (profile === "archive-cleanup") checkArchiveCleanup(cwd, report);
  }

  if (report.p0.length > 0) {
    report.status = "BLOCKED";
    report.recommended_next_action = "修复 P0 项后再声称项目已就绪.";
  } else if (report.p1.length > 0) {
    report.status = "WARN";
    report.recommended_next_action = "项目可继续，但应显式解决或接受 P1 风险.";
  } else if (report.p2.length > 0) {
    report.status = "PASS_WITH_NOTES";
    report.recommended_next_action = "项目可继续；方便时清理 P2 项.";
  }
  return report;
}

function printHumanReport(report) {
  console.log(`KIT 验证: ${report.status}`);
  console.log(`cwd: ${report.cwd}`);
  console.log(`profile: ${report.profile}`);
  console.log(`host: ${report.host} (${report.evidence.host?.entry || "unknown"})`);
  for (const severity of ["p0", "p1", "p2"]) {
    console.log(`\n${severity.toUpperCase()} (${report[severity].length})`);
    if (report[severity].length === 0) {
      console.log("- 无");
      continue;
    }
    for (const issue of report[severity]) {
      const file = issue.file ? ` [${issue.file}]` : "";
      console.log(`- ${issue.code}${file}: ${issue.message}`);
      if (issue.fix) console.log(`  修复: ${issue.fix}`);
    }
  }
  if (report.evidence.workflow_entries?.length) {
    console.log(`\nWorkflow 入口: ${report.evidence.workflow_entries.join(", ")}`);
  }
  if (report.evidence.deep_research_skill) {
    const status = report.evidence.deep_research_skill.installed ? "已安装" : "缺失";
    const locations = report.evidence.deep_research_skill.locations.map((item) => item.path).join(", ");
    console.log(`\nDeep research skill: ${status}${locations ? ` (${locations})` : ""}`);
  }
  console.log(`\n下一步: ${report.recommended_next_action}`);
}

function initProject(args) {
  const cwd = path.resolve(args.cwd);
  const projectName = path.basename(cwd);

  // Critical fix V-1: enforce brainstorm gate before init
  if (!args.skipBrainstorm) {
    const hasProductInfo = args.owner && args.owner.length > 0;
    const isEmptyDir = !fs.existsSync(cwd) || fs.readdirSync(cwd).length === 0;
    if (!hasProductInfo || isEmptyDir) {
      console.warn("\n*** 警告 ***");
      console.warn("检测到未明确产品意图的初始化。");
      console.warn("建议：先运行头脑风暴，或如果确定请使用 --skip-brainstorm。");
      console.warn("\n跳过此警告: node spec-loop-kit.mjs init --skip-brainstorm ...");
    }
  }

  const host = detectHost(cwd, args.host);
  const hostEntry = hostEntryFor(host);
  const data = {
    projectName,
    owner: args.owner,
    level: args.level,
    profile: args.profile === "auto" ? "generic-project" : normalizeProfile(args.profile),
    host,
    hostEntry,
    hostEntryRole: hostEntryRoleFor(host),
    date: new Date().toISOString().slice(0, 10),
    kitVersion: parseJsonFile(root, "package.json")?.version || "0.0.0",
    projectVersion: parseJsonFile(cwd, "package.json")?.version || "0.1.0",
    scale: scaleFromLevel(args.level)
  };

  ensureDir(cwd);
  const scale = scaleFromLevel(args.level);

  // Core directories — scale-aware creation
  let coreDirs = [
    ".plan",
    ".plan/runs",
    ".plan/archive",
    ".kit"
  ];

  if (scale === "quick") {
    // quick (level 0-1): minimal structure, skip .workflow presets and docs
    coreDirs = coreDirs.concat([
      ".test",
      ".test/ai",
      ".test/user"
    ]);
  } else if (scale === "standard") {
    // standard (level 2): current default structure
    coreDirs = coreDirs.concat([
      ".workflow",
      ".workflow/scripts",
      ".test",
      ".test/ai",
      ".test/user",
      "docs/architecture",
      "docs/ui-ux"
    ]);
  } else if (scale === "deep") {
    // deep (level 3-4): full structure with evals and tests auto-created
    coreDirs = coreDirs.concat([
      ".workflow",
      ".workflow/scripts",
      ".test",
      ".test/ai",
      ".test/user",
      "docs/architecture",
      "docs/ui-ux",
      "tests",
      "tests/unit",
      "tests/integration",
      "tests/acceptance",
      "evals",
      "evals/run",
      "evals/reports",
      "evals/evidence"
    ]);
  }
  for (const dir of coreDirs) ensureDir(path.join(cwd, dir));

  // Optional directories — created based on flags (can override scale defaults)
  if (args.withWorkflow || args.workflow) {
    const workflowDirs = [".workflow", ".workflow/scripts"];
    for (const dir of workflowDirs) ensureDir(path.join(cwd, dir));
  }
  if (args.withTest) {
    const testDirs = ["tests", "tests/unit", "tests/integration", "tests/acceptance"];
    for (const dir of testDirs) ensureDir(path.join(cwd, dir));
  }
  if (args.withEval) {
    const evalDirs = ["evals", "evals/run", "evals/reports", "evals/evidence"];
    for (const dir of evalDirs) ensureDir(path.join(cwd, dir));
  }
  if (args.withCron) {
    const cronDirs = [".cron", ".cron/jobs", ".cron/schedules", ".cron/logs"];
    for (const dir of cronDirs) ensureDir(path.join(cwd, dir));
  }
  if (args.experiment) {
    ensureDir(path.join(cwd, ".workflow", "scripts"));
    const expBase = path.join(cwd, "project-experiments", "v1");
    const expGroups = ["group-a", "group-b", "group-c"];
    for (const group of expGroups) {
      const groupBase = path.join(expBase, group);
      ensureDir(path.join(groupBase, "src"));
      ensureDir(path.join(groupBase, "config"));
      ensureDir(path.join(groupBase, "data"));
      ensureDir(path.join(groupBase, "results"));
      // Write group-specific TEST.md
      const groupTestPath = path.join(groupBase, "TEST.md");
      if (!fs.existsSync(groupTestPath) || args.force) {
        fs.writeFileSync(groupTestPath, `# ${group.toUpperCase()} 测试说明\n\n## 运行命令\n<!-- 填写该组的特定测试命令 -->\n\n## 预期输出\n<!-- 描述预期输出 / 指标 -->\n\n## 通过标准\n<!-- 定义该组通过的条件 -->\n`, "utf8");
      }
      // Write heartbeat config for each group
      const heartbeatConfig = generateHeartbeatConfig("default");
      const heartbeatPath = path.join(groupBase, "config", "heartbeat.json");
      if (!fs.existsSync(heartbeatPath) || args.force) {
        fs.writeFileSync(heartbeatPath, JSON.stringify({
          task_type: "default",
          interval: heartbeatConfig.interval,
          timeout: heartbeatConfig.timeout,
          retries: heartbeatConfig.retries,
          retry_count: 0,
          status: "active",
          last_check: null
        }, null, 2), "utf8");
      }
    }
    ensureDir(path.join(cwd, "project-experiments", "v2"));
    ensureDir(path.join(cwd, "project-experiments", "v3"));
    // Write VARIABLES-v1.md template
    const variablesPath = path.join(expBase, "VARIABLES-v1.md");
    if (!fs.existsSync(variablesPath) || args.force) {
      fs.writeFileSync(variablesPath, `# V1 实验变量\n\n## 基准来源\n- 项目: ${data.projectName}\n- 提交: <!-- git commit hash -->\n\n## 分组配置\n\n### group-a (基线)\n- 数据: <!-- 例如: data/raw/ -->\n- 配置: <!-- 例如: config/baseline.yaml -->\n- 参数: <!-- 关键参数 -->\n\n### group-b (变体 1)\n- 数据: <!-- 例如: data/augmented/ -->\n- 配置: <!-- 例如: config/variant1.yaml -->\n- 参数: <!-- 关键参数 -->\n\n### group-c (变体 2)\n- 数据: <!-- 例如: data/synthetic/ -->\n- 配置: <!-- 例如: config/variant2.yaml -->\n- 参数: <!-- 关键参数 -->\n\n## 预期指标\n<!-- 定义目标指标和改进阈值 -->\n`, "utf8");
    }
    // Write REPORT-v1.md template
    const reportPath = path.join(expBase, "REPORT-v1.md");
    if (!fs.existsSync(reportPath) || args.force) {
      fs.writeFileSync(reportPath, `# V1 实验报告\n\n## 摘要\n<!-- 一段结果摘要 -->\n\n## 分组结果\n\n### group-a (基线)\n- 状态: <!-- 通过 / 失败 -->\n- 关键指标: <!-- 记录指标 -->\n- 证据: <!-- 证据路径 -->\n\n### group-b (变体 1)\n- 状态: <!-- 通过 / 失败 -->\n- 关键指标: <!-- 记录指标 -->\n- 证据: <!-- 证据路径 -->\n\n### group-c (变体 2)\n- 状态: <!-- 通过 / 失败 -->\n- 关键指标: <!-- 记录指标 -->\n- 证据: <!-- 证据路径 -->\n\n## 对比分析\n<!-- 各组差异分析 -->\n\n## 结论\n<!-- 哪组表现最好？是否继续 V2？ -->\n\n## 后续步骤\n- [ ] 用户审核与决策\n- [ ] 将优胜组提升到主项目（如适用）\n- [ ] 设计 V2 变量（如继续）\n`, "utf8");
    }
    // Write heartbeat watchdog script to .workflow/scripts/
    const watchdogPath = path.join(cwd, ".workflow", "scripts", "heartbeat-watchdog.ps1");
    if (!fs.existsSync(watchdogPath) || args.force) {
      fs.writeFileSync(watchdogPath, generateHeartbeatWatchdogScript(), "utf8");
    }
    // Run sub-agent checklist for each experiment group
    console.log("\n--- 子代理启动清单 ---");
    let totalFails = 0;
    for (const group of expGroups) {
      const groupCwd = path.join(expBase, group);
      const results = runSubAgentChecklist(groupCwd, { experiment: true, groupCount: expGroups.length });
      const { failCount } = printChecklistReport(results, group);
      totalFails += failCount;
      console.log("");
    }
    if (totalFails > 0) {
      console.log(`警告: 共 ${totalFails} 项失败. 启动子代理前请先修复.`);
    } else {
      console.log("所有组清单通过 — 可以安全启动子代理.");
    }
  }

  // Template-specific directories and files — skipped for quick scale (minimal structure)
  if (scale !== "quick") {
    const templateDirs = {
      "default": ["src", "tests", "evals", "logs"],
      "data-ml": ["data", "data/raw", "data/processed", "notebooks", "models", "results", "src", "tests", "logs"],
      "fullstack": ["frontend", "frontend/src", "frontend/tests", "backend", "backend/src", "backend/tests", "e2e", "e2e/tests", "e2e/fixtures", "docker", "docs", "logs"]
    };
    for (const dir of templateDirs[args.template] || []) {
      ensureDir(path.join(cwd, dir));
    }
  }
  // Core files — scale-aware creation
  const files = [
    ["root/README.md", "README.md"],
    ["root/.gitignore", ".gitignore"],
    [host === "claude" ? "root/CLAUDE.md" : "root/AGENTS.md", hostEntry],
    ["plan/PRD.md", ".plan/PRD.md"],
    ["plan/SPEC.md", ".plan/SPEC.md"],
    ["plan/CHECKLIST.md", ".plan/CHECKLIST.md"],
    ["kit/config.json", ".kit/config.json"],
    ["kit/version.json", ".kit/version.json"],
    ["test/README.md", ".test/README.md"],
    ["test/config.json", ".test/config.json"],
    ["test/user-README.md", ".test/user/README.md"]
  ];

  // Workflow files — only for standard and deep scales
  if (scale !== "quick") {
    files.push(
      ["workflow/README.md", ".workflow/README.md"],
      ["workflow/status.md", ".workflow/status.md"],
      ["workflow/codex.md", ".workflow/codex.md"],
      ["workflow/workbuddy.md", ".workflow/workbuddy.md"],
      ["workflow/trae-solo.md", ".workflow/trae-solo.md"]
    );
  }

  // Optional files
  if (args.withWorkflow || args.workflow) {
    files.push(["workflow/status.md", ".workflow/status.md"]);
  }
  if (args.withTest) {
    files.push(["tests/README.md", "tests/README.md"]);
  }
  if (args.withEval) {
    files.push(["evals/config.yaml", "evals/config.yaml"]);
  }
  if (args.withUser) {
    files.push(["root/USER.md", "USER.md"]);
  }
  if (args.withSoul) {
    files.push(["root/SOUL.md", "SOUL.md"]);
  }

  // Template-specific sandbox files (README.md + TEST.md) — placed under .test/ai/sandboxes/
  // to avoid overwriting root README.md (Critical fix S-4.1)
  const templateFileList = {
    "default": [["default/README.md", ".test/ai/sandboxes/default/README.md"], ["default/TEST.md", ".test/ai/sandboxes/default/TEST.md"]],
    "data-ml": [["data-ml/README.md", ".test/ai/sandboxes/data-ml/README.md"], ["data-ml/TEST.md", ".test/ai/sandboxes/data-ml/TEST.md"]],
    "fullstack": [["fullstack/README.md", ".test/ai/sandboxes/fullstack/README.md"], ["fullstack/TEST.md", ".test/ai/sandboxes/fullstack/TEST.md"]],
    "skill": [["skill/README.md", ".test/ai/sandboxes/skill/README.md"], ["skill/TEST.md", ".test/ai/sandboxes/skill/TEST.md"]],
    "stable-workflow": [["stable-workflow/README.md", ".test/ai/sandboxes/stable-workflow/README.md"], ["stable-workflow/TEST.md", ".test/ai/sandboxes/stable-workflow/TEST.md"]]
  };
  for (const [src, dest] of templateFileList[args.template] || []) {
    files.push([src, dest]);
  }

  const results = files.map(([src, dest]) => writeTemplate(
    path.join(templates, src),
    path.join(cwd, dest),
    data,
    args.force
  ));

  const errors = results.filter(r => r.status === "error");
  if (errors.length > 0) {
    console.error(`\n*** 错误 *** ${errors.length} 个模板写入失败:`);
    for (const err of errors) {
      console.error(`  ✗ ${path.relative(cwd, err.target)}: ${err.error}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`\nSpec Loop Kit 已初始化: ${cwd}`);
    for (const result of results) {
      console.log(`${result.status.padEnd(8)} ${path.relative(cwd, result.target)}`);
    }
  }
}

function runSubAgentChecklist(cwd, options = {}) {
  const results = [];

  // 1. Check sandbox directory exists and required files are present
  // S-3.4 fix: check required files instead of "empty" (init already creates files)
  const sandboxExists = fs.existsSync(cwd);
  const hasRequiredFiles = sandboxExists
    ? fs.existsSync(path.join(cwd, "README.md"))
      && fs.existsSync(path.join(cwd, "TEST.md"))
      && fs.existsSync(path.join(cwd, "config.json"))
    : false;
  results.push({
    item: "sandbox_dir",
    status: sandboxExists && hasRequiredFiles ? "pass" : (sandboxExists ? "warn" : "fail"),
    message: sandboxExists
      ? (hasRequiredFiles ? "OK (所需文件已存在)" : "缺少所需文件 (README.md, TEST.md, config.json)")
      : "缺少沙盒目录"
  });

  // 2. Check TEST.md exists in sandbox root
  const testMdExists = fs.existsSync(path.join(cwd, "TEST.md"));
  results.push({
    item: "test_md",
    status: testMdExists ? "pass" : "fail",
    message: testMdExists ? "OK" : "缺少 TEST.md"
  });

  // 3. Check README.md exists in sandbox root
  const readmeExists = fs.existsSync(path.join(cwd, "README.md"));
  results.push({
    item: "readme_md",
    status: readmeExists ? "pass" : "warn",
    message: readmeExists ? "OK" : "缺少 README.md"
  });

  // 4. Check git status is clean (if cwd is in a git repo)
  let gitClean = true;
  let gitMessage = "非 git 仓库或状态干净";
  try {
    const { execSync } = require("node:child_process");
    execSync("git rev-parse --git-dir", { cwd, stdio: "pipe" });
    const status = execSync("git status --porcelain", { cwd, encoding: "utf8", stdio: "pipe" });
    gitClean = status.trim().length === 0;
    gitMessage = gitClean ? "OK" : `未提交更改: ${status.trim().split("\n").length} 个文件`;
  } catch {
    // 非 git 仓库或 git 不可用
  }
  results.push({
    item: "git_clean",
    status: gitClean ? "pass" : "warn",
    message: gitMessage
  });

  // 5. Check VARIABLES.md is recorded and user confirmed (experiment scenario)
  if (options.experiment) {
    const variablesPath = path.join(cwd, "VARIABLES.md");
    const variablesExists = fs.existsSync(variablesPath);
    results.push({
      item: "variables_md",
      status: variablesExists ? "pass" : "warn",
      message: variablesExists ? "OK" : "缺少 VARIABLES.md (实验场景)"
    });
  } else {
    results.push({
      item: "variables_md",
      status: "skip",
      message: "已跳过 (非实验模式)"
    });
  }

  // 6. Check disk space is sufficient (experiment scenario: estimate per-group size x group count)
  if (options.experiment) {
    let diskOk = true;
    let diskMessage = "OK";
    try {
      const groupCount = options.groupCount || 3;
      const minSpaceMB = 50 * groupCount;
      const platform = process.platform;
      if (platform === "win32") {
        const drive = path.parse(cwd).root.replace("\\", "");
        // Sec-2.1 fix: whitelist drive letter to prevent command injection
        if (!/^[A-Za-z]$/.test(drive)) {
          throw new Error(`Invalid drive letter: ${drive}`);
        }
        const { execSync } = require("node:child_process");
        const out = execSync(`wmic logicaldisk where "DeviceID='${drive}:'" get FreeSpace /value`, { encoding: "utf8", stdio: "pipe" });
        const match = out.match(/FreeSpace=(\d+)/);
        if (match) {
          const freeMB = parseInt(match[1], 10) / (1024 * 1024);
          diskOk = freeMB >= minSpaceMB;
          diskMessage = diskOk ? `OK (${Math.round(freeMB)}MB 可用)` : `磁盘空间不足 (${Math.round(freeMB)}MB 可用, 需要 ${minSpaceMB}MB)`;
        }
      } else {
        const result = spawnSync("df", ["-m", cwd], { encoding: "utf8" });
        if (result.status !== 0) {
          throw new Error(`df command failed: ${result.stderr || result.error?.message || "unknown error"}`);
        }
        const lines = result.stdout.trim().split("\n");
        const out = lines[lines.length - 1];
        const parts = out.trim().split(/\s+/);
        const freeMB = parseInt(parts[3], 10);
        diskOk = freeMB >= minSpaceMB;
        diskMessage = diskOk ? `OK (${freeMB}MB 可用)` : `磁盘空间不足 (${freeMB}MB 可用, 需要 ${minSpaceMB}MB)`;
      }
    } catch {
      diskMessage = "无法检查磁盘空间";
    }
    results.push({
      item: "disk_space",
      status: diskOk ? "pass" : "warn",
      message: diskMessage
    });
  } else {
    results.push({
      item: "disk_space",
      status: "skip",
      message: "已跳过 (非实验模式)"
    });
  }

  // 7. Check dependency environment is ready (Node/Python/CUDA etc.)
  let depOk = true;
  let depMessage = "OK";
  try {
    const { execSync } = require("node:child_process");
    const checks = [];
    try { execSync("node --version", { stdio: "pipe" }); checks.push("Node"); } catch { /* ignore */ }
    try { execSync("python --version", { stdio: "pipe" }); checks.push("Python"); } catch {
      try { execSync("python3 --version", { stdio: "pipe" }); checks.push("Python3"); } catch { /* ignore */ }
    }
    try { execSync("nvidia-smi", { stdio: "pipe" }); checks.push("CUDA"); } catch { /* ignore */ }
    if (checks.length === 0) {
      depOk = false;
      depMessage = "未检测到 Node/Python/CUDA";
    } else {
      depMessage = `已发现: ${checks.join(", ")}`;
    }
  } catch {
    depMessage = "无法检查依赖环境";
  }
  results.push({
    item: "dependencies",
    status: depOk ? "pass" : "warn",
    message: depMessage
  });

  // 8. 检查心跳监控是否已配置 (长任务场景)
  if (options.longTask) {
    const hasHeartbeat = fs.existsSync(path.join(cwd, ".cron")) || fs.existsSync(path.join(cwd, "logs"));
    results.push({
      item: "heartbeat",
      status: hasHeartbeat ? "pass" : "warn",
      message: hasHeartbeat ? "OK" : "未找到 .cron/ 或 logs/ 用于心跳监控"
    });
  } else {
    results.push({
      item: "heartbeat",
      status: "skip",
      message: "已跳过 (非长任务模式)"
    });
  }

  // 9. 检查子代理 cwd 指向沙盒 (而非主项目)
  const mainProjectIndicators = [".git", ".plan", ".kit", ".workflow"];
  const isMainProject = mainProjectIndicators.some((ind) => fs.existsSync(path.join(cwd, ind)));
  results.push({
    item: "cwd_is_sandbox",
    status: isMainProject ? "warn" : "pass",
    message: isMainProject ? "cwd 似乎是主项目 (包含 .git/.plan/.kit/.workflow)" : "OK"
  });

  return results;
}

function printChecklistReport(results, groupName) {
  const prefix = groupName ? `[${groupName}] ` : "";
  console.log(`${prefix}子代理启动清单`);
  console.log(`${prefix}${"=".repeat(40)}`);
  let failCount = 0;
  let warnCount = 0;
  for (const r of results) {
    const icon = r.status === "pass" ? "PASS" : r.status === "fail" ? "FAIL" : r.status === "skip" ? "SKIP" : "WARN";
    console.log(`${prefix}[${icon}] ${r.item.padEnd(18)} ${r.message}`);
    if (r.status === "fail") failCount += 1;
    if (r.status === "warn") warnCount += 1;
  }
  console.log(`${prefix}${"=".repeat(40)}`);
  if (failCount > 0) {
    console.log(`${prefix}结果: 阻断 (${failCount} 失败, ${warnCount} 警告)`);
    console.log(`${prefix}操作: 启动子代理前修复失败项.`);
  } else if (warnCount > 0) {
    console.log(`${prefix}结果: 警告 (${warnCount} 项警告)`);
    console.log(`${prefix}操作: 启动子代理前审查警告.`);
  } else {
    console.log(`${prefix}结果: 通过 — 可以安全启动子代理.`);
  }
  return { failCount, warnCount };
}

function generateHeartbeatConfig(taskType = "default") {
  const presets = {
    default: { interval: 30, timeout: 120, retries: 3 },
    build: { interval: 60, timeout: 600, retries: 3 },
    training: { interval: 300, timeout: 1800, retries: 3 },
    download: { interval: 60, timeout: 300, retries: 3 }
  };
  return presets[taskType] || presets.default;
}

function recordHeartbeatBlocker(cwd, command, retries, taskType = "default") {
  const blockersPath = path.join(cwd, ".kit", "blockers.json");
  let blockers = { entries: [] };
  if (fs.existsSync(blockersPath)) {
    try {
      blockers = JSON.parse(fs.readFileSync(blockersPath, "utf8"));
      if (!Array.isArray(blockers.entries)) {
        blockers.entries = [];
      }
    } catch {
      blockers = { entries: [] };
    }
  }
  blockers.entries.push({
    type: "heartbeat_timeout",
    command,
    retries,
    timestamp: new Date().toISOString(),
    task_type: taskType
  });
  ensureDir(path.dirname(blockersPath));
  fs.writeFileSync(blockersPath, JSON.stringify(blockers, null, 2), "utf8");
}

function generateHeartbeatWatchdogScript() {
  return [
    "param(",
    "  [Parameter(Mandatory=$true)][int]$Pid,",
    "  [Parameter(Mandatory=$true)][string]$TaskType,",
    "  [int]$Interval = 30,",
    "  [int]$Timeout = 120,",
    "  [int]$Retries = 3",
    ")",
    "",
    "# Windows 心跳看门狗",
    "# 通过 PID 监控进程，检查 stdout 输出，处理超时和重试",
    "",
    "$retryCount = 0",
    "$lastOutputTime = Get-Date",
    "$stdoutFile = $null",
    "",
    "function Test-ProcessAlive {",
    "  param([int]$TargetPid, [string]$ExpectedName)",
    "  try {",
    "    $proc = Get-Process -Id $TargetPid -ErrorAction Stop",
    "    # Sec-10.1: 验证进程名以防止 PID 复用攻击",
    "    if ($ExpectedName -and $proc.Name -ne $ExpectedName) {",
    "      Write-Warning \"[watchdog] PID $TargetPid 进程名不匹配: 期望 $ExpectedName, 实际 $($proc.Name). 已跳过.\"",
    "      return $false",
    "    }",
    "    return -not $proc.HasExited",
    "  } catch {",
    "    # V-7: 报告具体错误而非静默吞掉",
    "    Write-Warning \"[watchdog] Get-Process PID $TargetPid 失败: $($_.Exception.Message)\"",
    "    return $false",
    "  }",
    "}",
    "",
    "function Stop-ProcessGracefully {",
    "  param([int]$TargetPid, [string]$ExpectedName)",
    "  try {",
    "    $proc = Get-Process -Id $TargetPid -ErrorAction Stop",
    "    # Sec-10.1: 终止前验证进程名",
    "    if ($ExpectedName -and $proc.Name -ne $ExpectedName) {",
    "      Write-Warning \"[watchdog] PID $TargetPid 进程名不匹配. 终止操作已中止.\"",
    "      return",
    "    }",
    "    Stop-Process -Id $TargetPid -Force:$false -ErrorAction Stop",
    "    Start-Sleep -Seconds 5",
    "    if (Test-ProcessAlive -TargetPid $TargetPid -ExpectedName $ExpectedName) {",
    "      Stop-Process -Id $TargetPid -Force -ErrorAction Stop",
    "    }",
    "  } catch {",
    "    # V-7: 报告具体错误",
    "    Write-Warning \"[watchdog] Stop-Process PID $TargetPid 失败: $($_.Exception.Message)\"",
    "  }",
    "}",
    "",
    'Write-Host "[heartbeat-watchdog] 开始监控 PID $Pid (任务类型: $TaskType, 间隔: ${Interval}s, 超时: ${Timeout}s, 重试: $Retries)"',
    "",
    "while ($retryCount -lt $Retries) {",
    "  Start-Sleep -Seconds $Interval",
    "",
    "  # 检查进程是否仍在运行",
    "  if (-not (Test-ProcessAlive -TargetPid $Pid)) {",
    '    Write-Host "[heartbeat-watchdog] PID $Pid 已不再运行."',
    "    $retryCount += 1",
    "    if ($retryCount -ge $Retries) {",
    '      Write-Error "[heartbeat-watchdog] 进程丢失，已重试 $Retries 次. 任务标记为失败."',
    "      exit 1",
    "    }",
    '    Write-Host "[heartbeat-watchdog] 重试 $retryCount / $Retries — 进程丢失，看门狗模式不支持重启."',
    "    continue",
    "  }",
    "",
    "  # 如果存在 stdout 文件，检查其输出",
    "  $possibleStdoutFiles = @(",
    '    ".plan/runs/latest.stdout",',
    '    ".plan/runs/latest.log",',
    '    "output.log",',
    '    "stdout.log"',
    "  )",
    "  foreach ($candidate in $possibleStdoutFiles) {",
    "    if (Test-Path $candidate) {",
    "      $stdoutFile = $candidate",
    "      break",
    "    }",
    "  }",
    "",
    "  $hasOutput = $false",
    "  if ($stdoutFile -and (Test-Path $stdoutFile)) {",
    "    $lastWrite = (Get-Item $stdoutFile).LastWriteTime",
    "    if ($lastWrite -gt $lastOutputTime) {",
    "      $lastOutputTime = $lastWrite",
    "      $hasOutput = $true",
    "    }",
    "  }",
    "",
    "  $elapsed = ([DateTime]::Now - $lastOutputTime).TotalSeconds",
    "  if (-not $hasOutput -and $elapsed -gt $Timeout) {",
    '    Write-Host "[heartbeat-watchdog] PID $Pid 超时 (已 ${elapsed}s 无输出)."',
    "    Stop-ProcessGracefully -TargetPid $Pid",
    "    $retryCount += 1",
    "    if ($retryCount -ge $Retries) {",
    '      Write-Error "[heartbeat-watchdog] 任务失败，已重试 $Retries 次."',
    "      exit 1",
    "    }",
    '    Write-Host "[heartbeat-watchdog] 重试 $retryCount / $Retries — 已发送 SIGTERM，等待重启..."',
    "  }",
    "}",
    "",
    'Write-Host "[heartbeat-watchdog] 监控已结束."'
  ].join("\n");
}

function printUsage() {
  console.log("用法:");
  console.log("  spec-loop-kit --help");
  console.log("  spec-loop-kit init [--cwd <path>] [--owner <name>] [--level 0-4] [--profile <name>] [--host auto|generic|codex|claude|opencode|agents] [--template default|data-ml|fullstack] [--workflow] [--experiment] [--with-test] [--with-eval] [--with-cron] [--with-user] [--with-soul] [--force]");
  console.log("    --level 控制项目规模和目录深度:");
  console.log("      0-1 (快速):  <1 天项目的最小结构 — 仅 .plan/, .kit/, .test/");
  console.log("      2   (标准):  2-5 天项目的默认结构 — 增加 .workflow/, docs/");
  console.log("      3-4 (深度):  1+ 周项目的完整结构 — 增加 tests/, evals/, acceptance/");
  console.log("    --template 选择沙盒模板:");
  console.log("      default:   通用代码项目 — src/, tests/, evals/, logs/");
  console.log("      data-ml:   数据/ML 项目 — data/, notebooks/, models/, results/");
  console.log("      fullstack: Web/CLI 项目 — frontend/, backend/, e2e/, docker/");
  console.log("    可选标志可覆盖规模默认值: --workflow, --experiment, --with-test, --with-eval, --with-cron, --with-user, --with-soul");
  console.log(`  spec-loop-kit validate [--cwd <path>] [--profile ${PROFILE_LIST}] [--host auto|generic|codex|claude|opencode|agents] [--json]`);
  console.log(`  spec-loop-kit audit [--cwd <path>] [--profile ${PROFILE_LIST}] [--host auto|generic|codex|claude|opencode|agents] [--json]`);
  console.log("  spec-loop-kit checklist [--cwd <path>] [--experiment] [--long-task] [--json]");
  console.log("    对指定 cwd 运行子代理启动清单.");
  console.log("    --experiment: 启用实验专属检查 (VARIABLES.md, 磁盘空间).");
  console.log("    --long-task:  启用长任务检查 (心跳监控).");
  console.log("  spec-loop-kit run [--help]");
  console.log("    /kit-run 的执行层助手. 读取 modes/run.md 和 quality/pre-code.md 门控.");
  console.log("    用于打印运行模式参考或验证编码前准备状态.");
  console.log("  spec-loop-kit check [--help]");
  console.log("    /kit-check 的质量层助手. 读取 modes/check.md 和 quality/ 定义.");
  console.log("    用于打印检查模式参考或运行快速自检.");
  console.log("  spec-loop-kit loop [--help]");
  console.log("    /kit-loop 的自动巡航助手. 读取 modes/loop.md 中的检查点和范围规则.");
  console.log("    用于打印循环模式参考或验证循环配置.");
  console.log("  spec-loop-kit sync [--cwd <path>]");
  console.log("    检查 CLAUDE.md / AGENTS.md / README.md 对齐 (版本, 宿主, 锚点).");
  console.log("    同步则退出码 0, 发现差异则退出码 1.");
}

try {
  const args = parseArgs(process.argv);
  if (args.command === "--help" || args.command === "-h" || (!args.command && args.help)) {
    printUsage();
    process.exit(0);
  } else if (args.command === "init") {
    initProject(args);
  } else if (args.command === "validate" || args.command === "audit") {
    const report = buildReport(args);
    if (args.json || args.command === "audit") {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printHumanReport(report);
    }
    process.exit(report.p0.length > 0 ? 2 : 0);
  } else if (args.command === "checklist") {
    const results = runSubAgentChecklist(args.cwd, { experiment: args.experiment, longTask: args.longTask });
    if (args.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      printChecklistReport(results);
    }
    const failCount = results.filter((r) => r.status === "fail").length;
    process.exit(failCount > 0 ? 2 : 0);
  } else if (args.command === "run") {
    if (args.help) {
      console.log("spec-loop-kit run — Execution layer helper for /kit-run");
      console.log("");
      console.log("This command prints the run-mode reference and validates pre-code readiness.");
      console.log("It does not execute code; it guides the AI through modes/run.md and quality/pre-code.md.");
      console.log("");
      console.log("Pre-code gate:");
      console.log("  1. Research the tech stack (check official docs, do not guess APIs).");
      console.log("  2. Read project config (tsconfig, lint rules, .env).");
      console.log("  3. Declare UI toolchain (lock icon library: Lucide/Heroicons/Tabler).");
      console.log("  4. Confirm API contract and design tokens.");
      console.log("  5. Establish page structure + verify build with zero errors.");
      console.log("");
      console.log("File-write 4-item self-check:");
      console.log("  [ ] Is 'use client' necessary?");
      console.log("  [ ] Icons come from the declared icon library (not emoji).");
      console.log("  [ ] Colors come from design tokens (not hard-coded hex).");
      console.log("  [ ] Import paths are correct and API paths match architecture.");
      console.log("");
      console.log("Frontend-first flow:");
      console.log("  1. Implement frontend + UI first (based on docs/ui-ux/).");
      console.log("  2. Screenshot check (preview confirmation gate).");
      console.log("  3. User confirms UI.");
      console.log("  4. Then implement backend + integration.");
      console.log("");
      console.log("Implementation closure 5-item check:");
      console.log("  1. Build has zero errors.");
      console.log("  2. Lint has zero errors.");
      console.log("  3. No console red errors.");
      console.log("  4. New code connects to real call chains.");
      console.log("  5. New logs/alerts verify real path triggers.");
      process.exit(0);
    }
    // Print reference and exit; actual execution is handled by the AI reading modes/run.md
    console.log("Run mode reference loaded. The AI should read modes/run.md and quality/pre-code.md for full behavior.");
    console.log("Use --help for a quick reference of the gates and checks.");
    process.exit(0);
  } else if (args.command === "check") {
    if (args.help) {
      console.log("spec-loop-kit check — Quality layer helper for /kit-check");
      console.log("");
      console.log("This command prints the check-mode reference and runs a quick self-check.");
      console.log("Full quality flywheel behavior is in modes/check.md and quality/ definitions.");
      console.log("");
      console.log("Quality flywheel:");
      console.log("  Inspect -> Produce report -> [User confirms] -> Fix -> [User confirms] -> Regression check -> Archive");
      console.log("");
      console.log("Divergent inspection (when user reports one issue, check all related):");
      console.log("  User: 'Button position is wrong' -> Check all buttons, forms, mobile, z-index");
      console.log("  User: 'Mock data found' -> Check all API calls, loading states, error handling, empty states");
      console.log("");
      console.log("Vibe Coding 18-item checklist (see knowledge/anti-patterns.md):");
      console.log("  UI:  z-index wars, overflow, responsive, text truncation, loading/mock, empty state");
      console.log("  Data: real API vs mock, CRUD backend, form persistence, refresh survival");
      console.log("  Function: button behavior, route pages, form validation, link navigation");
      console.log("");
      console.log("Grading levels:");
      console.log("  L1 Static analysis (auto): unused imports, type errors, build failures");
      console.log("  L2 Build-time check (auto): console errors, API contract mismatch, mock residue");
      console.log("  L3 Browser check (semi-auto): generate checklist -> user confirms -> run Playwright");
      console.log("");
      console.log("Adaptive exit:");
      console.log("  - 2 consecutive rounds with no new issues -> converged exit");
      console.log("  - Severity downgrade (P0->P1->P2) -> gradual exit");
      console.log("  - User says 'enough' -> immediate exit");
      console.log("  - Max rounds: default 3, configurable");
      process.exit(0);
    }
    console.log("Check mode reference loaded. The AI should read modes/check.md and quality/ for full behavior.");
    console.log("Use --help for a quick reference of the flywheel and checklist.");
    process.exit(0);
  } else if (args.command === "loop") {
    if (args.help) {
      console.log("spec-loop-kit loop — Autonomous cruise helper for /kit-loop");
      console.log("");
      console.log("This command prints the loop-mode reference and validates loop configuration.");
      console.log("Full autonomous cruise behavior is in modes/loop.md.");
      console.log("");
      console.log("Loop workflow:");
      console.log("  /kit-loop <duration> -> User confirms scope -> Start -> [Checkpoint every 4h] ->");
      console.log("  Auto /kit-check diff -> Fix -> Continue -> [User can stop anytime] -> Final report");
      console.log("");
      console.log("Scope boundaries:");
      console.log("  - Authorized fix range (files, directories, issue severity)");
      console.log("  - Checkpoint frequency (default: every 4 hours)");
      console.log("  - Notification method (console, file, optional external)");
      console.log("  - Termination conditions (time, milestone, issue zero, user stop)");
      console.log("");
      console.log("Evidence trail:");
      console.log("  - All fixes logged to .kit/loop-state.md");
      console.log("  - Checkpoints produce reports under .test/ai/reports/");
      console.log("  - Rollback plan recorded before risky changes");
      console.log("");
      console.log("Safety rules:");
      console.log("  - Never auto-fix outside authorized range");
      console.log("  - Always report before fixing P0 issues");
      console.log("  - User stop is immediate and honored");
      console.log("  - Max 3 auto-retry per issue, then escalate to user");
      process.exit(0);
    }
    console.log("Loop mode reference loaded. The AI should read modes/loop.md for full behavior.");
    console.log("Use --help for a quick reference of the cruise workflow and safety rules.");
    process.exit(0);
  } else if (args.command === "sync") {
    const cwd = path.resolve(args.cwd);
    const issues = [];
    const claude = readText(cwd, "CLAUDE.md");
    const agents = readText(cwd, "AGENTS.md");
    const readme = readText(cwd, "README.md");
    if (claude && agents) {
      const claudeVer = claude.match(/Project version: `([^`]+)`/);
      const agentsVer = agents.match(/Project version: `([^`]+)`/);
      if (claudeVer && agentsVer && claudeVer[1] !== agentsVer[1]) {
        issues.push(`Version mismatch: CLAUDE.md=${claudeVer[1]}, AGENTS.md=${agentsVer[1]}`);
      }
      const claudeHost = claude.match(/Host: `([^`]+)`/);
      const agentsHost = agents.match(/Host: `([^`]+)`/);
      if (claudeHost && agentsHost && claudeHost[1] !== agentsHost[1]) {
        issues.push(`Host mismatch: CLAUDE.md=${claudeHost[1]}, AGENTS.md=${agentsHost[1]}`);
      }
    }
    if (readme) {
      const readmeVer = readme.match(/(?:version|版本)[\s:=]+v?(\d+\.\d+\.\d+)/i);
      const pkg = parseJsonFile(cwd, "package.json");
      if (readmeVer && pkg?.version && readmeVer[1] !== pkg.version) {
        issues.push(`README.md version (${readmeVer[1]}) differs from package.json (${pkg.version})`);
      }
    }
    if (issues.length > 0) {
      console.error("Sync issues found:");
      for (const issue of issues) console.error(`  - ${issue}`);
      process.exit(1);
    } else {
      console.log("Host entries and README are in sync.");
      process.exit(0);
    }
  } else {
    printUsage();
    process.exit(args.command ? 1 : 0);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
