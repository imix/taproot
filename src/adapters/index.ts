/**
 * Agent adapter generators.
 *
 * Each generator reads the canonical skill definitions from the bundled
 * skills/ directory and produces agent-specific wrapper files. Adapters
 * are derived — regenerating them is always safe and idempotent.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SKILL_FILES } from '../commands/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_SKILLS_DIR = resolve(__dirname, '..', '..', 'skills');

// Markers for idempotent section injection into existing files
const TAPROOT_START = '<!-- TAPROOT:START -->';
const TAPROOT_END = '<!-- TAPROOT:END -->';

export type AgentName = 'claude' | 'cursor' | 'copilot' | 'windsurf' | 'generic';
export const ALL_AGENTS: AgentName[] = ['claude', 'cursor', 'copilot', 'windsurf', 'generic'];

export interface AdapterResult {
  agent: AgentName;
  files: Array<{ path: string; status: 'created' | 'updated' | 'exists' }>;
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function generateAdapters(agents: AgentName | AgentName[] | 'all', projectRoot: string): AdapterResult[] {
  const targets = agents === 'all' ? ALL_AGENTS : Array.isArray(agents) ? agents : [agents];
  return targets.map(agent => generateAdapter(agent, projectRoot));
}

function generateAdapter(agent: AgentName, projectRoot: string): AdapterResult {
  const skills = loadSkills();
  switch (agent) {
    case 'claude':   return generateClaudeAdapter(skills, projectRoot);
    case 'cursor':   return generateCursorAdapter(skills, projectRoot);
    case 'copilot':  return generateCopilotAdapter(skills, projectRoot);
    case 'windsurf': return generateWindsurfAdapter(skills, projectRoot);
    case 'generic':  return generateGenericAdapter(skills, projectRoot);
  }
}

// ─── Skill loading ────────────────────────────────────────────────────────────

interface SkillDef {
  filename: string;    // e.g. 'intent.md'
  name: string;        // e.g. 'intent'
  content: string;     // full markdown content
  description: string; // first non-empty line after ## Description
  invocation: string;  // e.g. '/taproot:intent'
}

function loadSkills(): SkillDef[] {
  return SKILL_FILES.map(filename => {
    const name = filename.replace('.md', '');
    const path = join(BUNDLED_SKILLS_DIR, filename);
    const content = existsSync(path) ? readFileSync(path, 'utf-8') : `# Skill: ${name}\n\n(skill file not found)`;
    const description = extractFirstSentence(content);
    return { filename, name, content, description, invocation: `/taproot:${name}` };
  });
}

function extractFirstSentence(content: string): string {
  const descMatch = /^## Description\s*\n+([\s\S]+?)(?=\n##|\n\n\n|$)/m.exec(content);
  if (!descMatch) return '';
  const body = descMatch[1]?.trim() ?? '';
  // First sentence or first line
  const sentence = body.split(/\.\s+/)[0] ?? body.split('\n')[0] ?? '';
  return sentence.replace(/\.$/, '').trim();
}

// ─── Claude Code adapter ──────────────────────────────────────────────────────
// One .md file per skill in .claude/commands/, prefixed with tr-
// Invoked as /tr-<name>

// Skills that modify the taproot hierarchy — need OVERVIEW.md regenerated after
const TREE_MODIFYING_SKILLS = new Set([
  'intent', 'behaviour', 'implement', 'refine', 'promote', 'decompose', 'trace', 'discover',
]);

function generateClaudeAdapter(skills: SkillDef[], projectRoot: string): AdapterResult {
  const targetDir = join(projectRoot, '.claude', 'commands');
  mkdirSync(targetDir, { recursive: true });

  const files: AdapterResult['files'] = [];

  for (const skill of skills) {
    const destPath = join(targetDir, `tr-${skill.filename}`);
    const existed = existsSync(destPath);
    const content = buildClaudeSkillFile(skill);
    writeFileSync(destPath, content, 'utf-8');
    files.push({ path: destPath, status: existed ? 'updated' : 'created' });
  }

  return { agent: 'claude', files };
}

function buildClaudeSkillFile(skill: SkillDef): string {
  const overviewStep = TREE_MODIFYING_SKILLS.has(skill.name)
    ? '\n6. Run `taproot overview` to update @{project-root}/taproot/OVERVIEW.md with the current project state'
    : '';
  return `---
name: 'tr-${skill.name}'
description: '${skill.description.replace(/'/g, "\\'")}'
---

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS EXACTLY:

<steps CRITICAL="TRUE">
1. LOAD the FULL skill file at @{project-root}/.taproot/skills/${skill.filename}
2. READ its entire contents — this contains the complete skill definition with steps, inputs, and output format
3. FOLLOW every step in the ## Steps section precisely and in order
4. When the skill references other taproot commands (e.g. \`/taproot:intent\`), use the corresponding \`/tr-intent\` command instead
5. Save all outputs to the paths specified in the skill's ## Output section${overviewStep}
</steps>
`;
}


// ─── Cursor adapter ───────────────────────────────────────────────────────────
// .cursor/rules/taproot.md — one combined rules file

function generateCursorAdapter(skills: SkillDef[], projectRoot: string): AdapterResult {
  const targetDir = join(projectRoot, '.cursor', 'rules');
  mkdirSync(targetDir, { recursive: true });

  const destPath = join(targetDir, 'taproot.md');
  const existed = existsSync(destPath);
  const content = buildCursorRulesFile(skills);
  writeFileSync(destPath, content, 'utf-8');

  return {
    agent: 'cursor',
    files: [{ path: destPath, status: existed ? 'updated' : 'created' }],
  };
}

function buildCursorRulesFile(skills: SkillDef[]): string {
  const skillIndex = skills.map(s =>
    `- \`@taproot ${s.name}\` — ${s.description}`
  ).join('\n');

  const skillSections = skills.map(s => `
---

## @taproot ${s.name}

${s.content}
`.trimStart()).join('\n');

  return `---
description: Taproot requirement hierarchy — skill definitions and document conventions
globs: ["taproot/**", ".taproot/settings.yaml"]
alwaysApply: false
---

# Taproot Skills for Cursor

This project uses [Taproot](https://github.com/anthropics/taproot) to maintain a living requirement hierarchy alongside the codebase. The hierarchy lives in \`taproot/\` with three layers: **intent** (why), **behaviour** (what), and **implementation** (how).

## Available Skills

Invoke these by mentioning \`@taproot <skill>\` in chat:

${skillIndex}

## Quick Reference

- Hierarchy lives in \`taproot/\` — intents → behaviours → implementations
- Validate with: \`taproot validate-structure\` and \`taproot validate-format\`
- See coverage: \`taproot coverage\`

${skillSections}
`.trimStart();
}

// ─── GitHub Copilot adapter ───────────────────────────────────────────────────
// .github/copilot-instructions.md — appends/replaces a marked section

function generateCopilotAdapter(skills: SkillDef[], projectRoot: string): AdapterResult {
  const targetDir = join(projectRoot, '.github');
  mkdirSync(targetDir, { recursive: true });

  const destPath = join(targetDir, 'copilot-instructions.md');
  const existed = existsSync(destPath);

  const taprootSection = buildCopilotSection(skills);
  let finalContent: string;

  if (existed) {
    const existing = readFileSync(destPath, 'utf-8');
    finalContent = replaceTaprootSection(existing, taprootSection);
  } else {
    finalContent = taprootSection;
  }

  writeFileSync(destPath, finalContent, 'utf-8');
  return {
    agent: 'copilot',
    files: [{ path: destPath, status: existed ? 'updated' : 'created' }],
  };
}

function buildCopilotSection(skills: SkillDef[]): string {
  const skillSummary = skills.map(s =>
    `- **\`/taproot:${s.name}\`** — ${s.description}. Full definition: \`.taproot/skills/${s.filename}\``
  ).join('\n');

  return `${TAPROOT_START}
## Taproot Requirement Hierarchy

This project uses Taproot to maintain traceability from business intent to code. The hierarchy lives in \`taproot/\` with three layers:

- **Intent** (\`intent.md\`): business goal, stakeholders, success criteria
- **Behaviour** (\`usecase.md\`): observable system behaviour in UseCase format
- **Implementation** (\`impl.md\`): links to source files, commits, and tests

### Available Taproot Skills

${skillSummary}

### CLI Commands

Run these to validate and inspect the hierarchy:
- \`taproot validate-structure\` — check folder nesting rules
- \`taproot validate-format\` — check document schemas
- \`taproot coverage\` — view completeness summary
- \`taproot check-orphans\` — find broken references
- \`taproot sync-check\` — detect stale specs

### Conventions

- Commits that implement a behaviour: \`taproot(<intent>/<behaviour>/<impl>): <message>\`
- Full conventions: \`taproot/CONVENTIONS.md\`
${TAPROOT_END}
`;
}

// ─── Windsurf adapter ─────────────────────────────────────────────────────────
// .windsurfrules — appends/replaces a marked section

function generateWindsurfAdapter(skills: SkillDef[], projectRoot: string): AdapterResult {
  const destPath = join(projectRoot, '.windsurfrules');
  const existed = existsSync(destPath);

  const taprootSection = buildWindsurfSection(skills);
  let finalContent: string;

  if (existed) {
    const existing = readFileSync(destPath, 'utf-8');
    finalContent = replaceTaprootSection(existing, taprootSection);
  } else {
    finalContent = taprootSection;
  }

  writeFileSync(destPath, finalContent, 'utf-8');
  return {
    agent: 'windsurf',
    files: [{ path: destPath, status: existed ? 'updated' : 'created' }],
  };
}

function buildWindsurfSection(skills: SkillDef[]): string {
  const skillIndex = skills.map(s =>
    `- \`/taproot:${s.name}\` — ${s.description}`
  ).join('\n');

  const skillSections = skills.map(s => `
### /taproot:${s.name}

${s.content}
`.trimStart()).join('\n');

  return `${TAPROOT_START}
# Taproot Requirement Hierarchy

This project uses Taproot to maintain traceability from business intent to code. The hierarchy lives in \`taproot/\`.

## Taproot Skills

${skillIndex}

## Skill Definitions

${skillSections}
${TAPROOT_END}
`;
}

// ─── Generic adapter ──────────────────────────────────────────────────────────
// AGENTS.md at project root — readable by any AI agent on startup

function generateGenericAdapter(skills: SkillDef[], projectRoot: string): AdapterResult {
  const destPath = join(projectRoot, 'AGENTS.md');
  const existed = existsSync(destPath);

  const taprootSection = buildGenericAgentsFile(skills);
  let finalContent: string;

  if (existed) {
    const existing = readFileSync(destPath, 'utf-8');
    finalContent = replaceTaprootSection(existing, taprootSection);
  } else {
    finalContent = taprootSection;
  }

  writeFileSync(destPath, finalContent, 'utf-8');
  return {
    agent: 'generic',
    files: [{ path: destPath, status: existed ? 'updated' : 'created' }],
  };
}

function buildGenericAgentsFile(skills: SkillDef[]): string {
  const skillIndex = skills.map(s =>
    `- **\`/taproot:${s.name}\`** — ${s.description}`
  ).join('\n');

  const skillSections = skills.map(s => `
---

${s.content}
`.trimStart()).join('\n');

  return `${TAPROOT_START}
# Taproot — Agent Instructions

This project uses **Taproot** to maintain a living requirement hierarchy alongside the code. Before making changes, check whether the relevant behaviour spec exists in \`taproot/\`.

## Hierarchy Overview

\`\`\`
taproot/
├── <intent-slug>/          # business goal (intent.md)
│   └── <behaviour-slug>/   # system behaviour (usecase.md)
│       └── <impl-slug>/    # implementation record (impl.md)
\`\`\`

- **Intent** (\`intent.md\`): stakeholders, goal, success criteria, constraints
- **Behaviour** (\`usecase.md\`): actor, preconditions, main flow, postconditions, error conditions
- **Implementation** (\`impl.md\`): source files, commits, tests — traceability bridge

## Using Taproot Skills

The following skills are available. Invoke them by name when the user asks for the corresponding action.

${skillIndex}

## CLI Commands

\`\`\`bash
taproot validate-structure   # check folder hierarchy rules
taproot validate-format      # check document schemas
taproot coverage             # completeness tree
taproot check-orphans        # find broken references
taproot sync-check           # detect stale specs
taproot link-commits         # auto-link git commits to impl.md
\`\`\`

## Commit Convention

When implementing a behaviour, commit with:
\`\`\`
taproot(<intent>/<behaviour>/<impl>): <what this commit does>
\`\`\`

## Skill Definitions

${skillSections}
${TAPROOT_END}
`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Replace the Taproot section (between markers) in an existing file,
 * or append it if no markers are present.
 */
function replaceTaprootSection(existing: string, newSection: string): string {
  const startIdx = existing.indexOf(TAPROOT_START);
  const endIdx = existing.indexOf(TAPROOT_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return (
      existing.slice(0, startIdx) +
      newSection +
      existing.slice(endIdx + TAPROOT_END.length)
    );
  }

  // No markers — append
  return existing.trimEnd() + '\n\n' + newSection;
}
