#!/usr/bin/env npx tsx
/**
 * build-cursor-plugin.ts
 *
 * Generates channels/cursor/ plugin artifacts from the canonical SKILL_FILES list.
 * Re-run after adding or renaming skills in src/commands/init.ts.
 *
 * Usage: npx tsx scripts/build-cursor-plugin.ts
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load SKILL_FILES from compiled dist (run `npm run build` first)
const initModule = await import(join(ROOT, 'dist/commands/init.js'));
const SKILL_FILES: string[] = initModule.SKILL_FILES;

const SKILLS_SRC_DIR = join(ROOT, 'skills');
const CHANNEL_DIR = join(ROOT, 'channels', 'cursor');

// ─── Commands ─────────────────────────────────────────────────────────────────

const COMMANDS = [
  { name: 'initialize',        title: 'Initialize',         skill: 'guide',   description: 'Initialize taproot in this project and start the onboarding walkthrough' },
  { name: 'status',            title: 'Status',             skill: 'status',  description: 'Show taproot coverage dashboard — implementations, orphans, stale specs' },
  { name: 'route-requirement', title: 'Route Requirement',  skill: 'ineed',   description: 'Route a natural language requirement to the right place in the hierarchy' },
  { name: 'report-bug',        title: 'Report Bug',         skill: 'bug',     description: 'Diagnose a defect through structured root cause analysis (5-Why)' },
  { name: 'build-plan',        title: 'Build Plan',         skill: 'plan',    description: 'Build a prioritised implementation plan from backlog and hierarchy gaps' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractDescription(skillFilename: string): string {
  const skillPath = join(SKILLS_SRC_DIR, skillFilename);
  if (!existsSync(skillPath)) return skillFilename.replace('.md', '');
  const content = readFileSync(skillPath, 'utf-8');
  const match = /^## Description\s*\n+([\s\S]+?)(?=\n##|\n\n\n|$)/m.exec(content);
  if (!match) return skillFilename.replace('.md', '');
  const body = match[1]?.trim() ?? '';
  const sentence = body.split(/\.\s+/)[0] ?? body.split('\n')[0] ?? '';
  return sentence.replace(/\.$/, '').trim();
}

function buildSkillLauncher(name: string, description: string): string {
  // Escape quotes for YAML frontmatter
  const safeDesc = description.replace(/"/g, '\\"');
  return `---
name: "tr-${name}"
description: "${safeDesc}"
---

Load and follow the full skill definition at \`taproot/agent/skills/${name}.md\` in the current workspace.

Follow every step in the skill's \`## Steps\` section precisely and in order. Use the \`cli:\` value from \`taproot/settings.yaml\` for all taproot CLI commands (default: \`taproot\`).
`;
}

function buildRulesFile(): string {
  return `---
description: Taproot requirement hierarchy — document conventions and workflow rules
globs: ["taproot/**"]
alwaysApply: false
---

# Taproot Conventions

This project uses [Taproot](https://github.com/imix/taproot) to maintain a living requirement hierarchy alongside the codebase. The hierarchy lives in \`taproot/\` with three layers: **intent** (why), **behaviour** (what), and **implementation** (how).

## Why / What / How rule

Each layer must stay in its lane:
- \`intent.md\` answers *why* — business outcome, stakeholders, success criteria. No solution language.
- \`usecase.md\` answers *what* — observable, actor-visible behaviour. No SQL, REST, or HTTP verbs in Main Flow.
- \`impl.md\` answers *how* — code, design decisions, test coverage. Technical detail belongs here only.

## Skills

Invoke taproot skills with \`/tr-<name>\` in chat. All skills load their instructions from \`taproot/agent/skills/\`.

## Commit convention

Use \`taproot commit "message"\` instead of plain \`git commit\` — handles traceability signing automatically.

## Validation

- \`taproot validate-structure\` — checks hierarchy integrity
- \`taproot validate-format\` — checks spec format compliance
- \`taproot coverage\` — shows implementation coverage
`;
}

function buildCommandFile(cmd: typeof COMMANDS[number]): string {
  return `---
name: "${cmd.title}"
description: "${cmd.description}"
---

Invoke \`/tr-${cmd.skill}\` — load and follow \`taproot/agent/skills/${cmd.skill}.md\` in the current workspace.
`;
}

function buildReadme(skillCount: number): string {
  return `# Taproot for Cursor

AI-driven specs, enforced at commit time. Code without traceability doesn't merge.

## What this plugin provides

- **${skillCount} skills** — each taproot workflow available as a \`/tr-<name>\` slash command
- **Rules** — taproot conventions injected as agent context when taproot files are open
- **Commands** — common actions available without knowing skill names

## Skills

All skills are thin launchers — invoking \`/tr-<name>\` directs Cursor's agent to load the full skill definition from \`taproot/agent/skills/<name>.md\` in your workspace. The skill file is the single source of truth; this plugin never duplicates content.

## Commands

| Command | Purpose |
|---------|---------|
| Initialize | Start the taproot onboarding walkthrough |
| Status | Show coverage dashboard |
| Route Requirement | Route a natural language requirement to the hierarchy |
| Report Bug | Diagnose a defect through root cause analysis |
| Build Plan | Build a prioritised implementation plan |

## Prerequisites

- Node.js installed
- Taproot CLI: \`npm install -g @imix-js/taproot\` or use via \`npx\`
- A taproot hierarchy in your project (\`taproot init\` to create one)

## Source

Plugin generated from [taproot](https://github.com/imix/taproot) via \`scripts/build-cursor-plugin.ts\`.
Re-run the build script after upgrading taproot to pick up new or renamed skills.
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`Building Cursor plugin from ${SKILL_FILES.length} skills...`);

// Clean and recreate skills directory
const skillsOutDir = join(CHANNEL_DIR, 'skills');
if (existsSync(skillsOutDir)) rmSync(skillsOutDir, { recursive: true });
mkdirSync(skillsOutDir, { recursive: true });

// Generate skill launchers
for (const filename of SKILL_FILES) {
  const name = filename.replace('.md', '');
  const description = extractDescription(filename);
  const skillDir = join(skillsOutDir, name);
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, 'SKILL.md'), buildSkillLauncher(name, description));
  console.log(`  skill: tr-${name}`);
}

// Generate rules
const rulesDir = join(CHANNEL_DIR, 'rules');
mkdirSync(rulesDir, { recursive: true });
writeFileSync(join(rulesDir, 'taproot.mdc'), buildRulesFile());
console.log('  rules: taproot.mdc');

// Generate commands
const commandsDir = join(CHANNEL_DIR, 'commands');
mkdirSync(commandsDir, { recursive: true });
for (const cmd of COMMANDS) {
  writeFileSync(join(commandsDir, `${cmd.name}.md`), buildCommandFile(cmd));
  console.log(`  command: ${cmd.title}`);
}

// Generate README
writeFileSync(join(CHANNEL_DIR, 'README.md'), buildReadme(SKILL_FILES.length));
console.log('  README.md');

console.log(`\nDone — ${SKILL_FILES.length} skills, ${COMMANDS.length} commands written to channels/cursor/`);
