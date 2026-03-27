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
import yaml from 'js-yaml';
import { SKILL_FILES } from '../commands/init.js';
import { loadConfig } from '../core/config.js';
import { resolveAgentDir } from '../core/paths.js';
import { loadLanguagePack, substituteTokens, applyVocabulary, getStructuralKeys } from '../core/language.js';

/** Returns the relative skills path for use in generated adapter content. */
function resolveSkillsRelPath(projectRoot: string, filename: string): string {
  const agentDir = resolveAgentDir(projectRoot);
  const isNewLayout = agentDir === join(projectRoot, 'taproot', 'agent');
  return isNewLayout ? `taproot/agent/skills/${filename}` : `.taproot/skills/${filename}`;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_SKILLS_DIR = resolve(__dirname, '..', '..', 'skills');

// Markers for idempotent section injection into existing files
const TAPROOT_START = '<!-- TAPROOT:START -->';
const TAPROOT_END = '<!-- TAPROOT:END -->';

export type AgentName = 'claude' | 'cursor' | 'copilot' | 'windsurf' | 'gemini' | 'generic' | 'aider';
export const ALL_AGENTS: AgentName[] = ['claude', 'cursor', 'copilot', 'windsurf', 'gemini', 'generic', 'aider'];

export type AgentTier = 1 | 2 | 3;

export const AGENT_TIERS: Record<AgentName, AgentTier> = {
  claude:   1,
  gemini:   2,
  aider:    2,
  cursor:   3,
  copilot:  3,
  windsurf: 3,
  generic:  3,
};

const TIER_LABELS: Record<AgentTier, string> = {
  1: 'Tier 1 — fully supported',
  2: 'Tier 2 — implemented & tested',
  3: 'Tier 3 — community supported',
};

export function getTierLabel(agent: AgentName): string {
  return TIER_LABELS[AGENT_TIERS[agent]];
}

export interface AdapterResult {
  agent: AgentName;
  files: Array<{ path: string; status: 'created' | 'updated' | 'exists' }>;
  error?: string;
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function generateAdapters(agents: AgentName | AgentName[] | 'all', projectRoot: string): AdapterResult[] {
  const targets = agents === 'all' ? ALL_AGENTS : Array.isArray(agents) ? agents : [agents];
  return targets.map(agent => generateAdapter(agent, projectRoot));
}

function generateAdapter(agent: AgentName, projectRoot: string): AdapterResult {
  const { config } = loadConfig(projectRoot);
  const pack = config.language ? loadLanguagePack(config.language) : null;
  const vocab = config.vocabulary ?? null;
  const cli = config.cli;
  const skills = loadSkills(pack, vocab);
  switch (agent) {
    case 'claude':   return generateClaudeAdapter(skills, projectRoot, cli);
    case 'cursor':   return generateCursorAdapter(skills, projectRoot, cli);
    case 'copilot':  return generateCopilotAdapter(skills, projectRoot, cli);
    case 'windsurf': return generateWindsurfAdapter(skills, projectRoot, cli);
    case 'gemini':   return generateGeminiAdapter(skills, projectRoot, cli);
    case 'generic':  return generateGenericAdapter(skills, projectRoot, cli);
    case 'aider':    return generateAiderAdapter(skills, projectRoot);
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

function loadSkills(pack?: ReturnType<typeof loadLanguagePack>, vocab?: Record<string, string> | null): SkillDef[] {
  return SKILL_FILES.map(filename => {
    const name = filename.replace('.md', '');
    const path = join(BUNDLED_SKILLS_DIR, filename);
    let content = existsSync(path) ? readFileSync(path, 'utf-8') : `# Skill: ${name}\n\n(skill file not found)`;
    if (pack) content = substituteTokens(content, pack);
    if (vocab && Object.keys(vocab).length > 0) {
      const structuralKeys = getStructuralKeys(pack ?? null);
      const { result } = applyVocabulary(content, vocab, structuralKeys);
      content = result;
    }
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
  'intent', 'behaviour', 'implement', 'refine', 'promote', 'decompose', 'trace', 'discover', 'sweep',
]);

function generateClaudeAdapter(skills: SkillDef[], projectRoot: string, cli?: string): AdapterResult {
  const targetDir = join(projectRoot, '.claude', 'commands');
  mkdirSync(targetDir, { recursive: true });

  const files: AdapterResult['files'] = [];

  for (const skill of skills) {
    const destPath = join(targetDir, `tr-${skill.filename}`);
    const existed = existsSync(destPath);
    const content = buildClaudeSkillFile(skill, projectRoot, cli);
    writeFileSync(destPath, content, 'utf-8');
    files.push({ path: destPath, status: existed ? 'updated' : 'created' });
  }

  // Configuration Quick Reference — a standalone reference file (not a skill launcher)
  const refPath = join(targetDir, 'tr-taproot.md');
  const refExisted = existsSync(refPath);
  writeFileSync(refPath, buildClaudeConfigRefFile(cli, projectRoot), 'utf-8');
  files.push({ path: refPath, status: refExisted ? 'updated' : 'created' });

  return { agent: 'claude', files };
}

function buildClaudeConfigRefFile(cli?: string, projectRoot?: string): string {
  return `---
name: 'tr-taproot'
description: 'Taproot configuration quick reference — settings.yaml options and how to apply them'
---

# Taproot — Configuration Reference

This file is a quick reference for configuring taproot. Read it when asked to change taproot settings (language, vocabulary, definition of done, etc.).

${buildConfigQuickRef(cli, projectRoot)}
`;
}

function buildClaudeSkillFile(skill: SkillDef, projectRoot: string, cli?: string): string {
  const taprootBin = cli ?? 'taproot';
  const overviewStep = TREE_MODIFYING_SKILLS.has(skill.name)
    ? `\n7. Run \`${taprootBin} overview\` to update @{project-root}/taproot/OVERVIEW.md with the current project state`
    : '';
  const skillPath = resolveSkillsRelPath(projectRoot, skill.filename);
  const invocationNote = cli
    ? `\n<!-- taproot:cli-invocation: ${cli} -->\n**CLI:** All taproot commands in this skill must use \`${cli}\` instead of bare \`taproot\`.\n`
    : '';
  return `---
name: 'tr-${skill.name}'
description: '${skill.description.replace(/'/g, "\\'")}'
---
${invocationNote}
IT IS CRITICAL THAT YOU FOLLOW THESE STEPS EXACTLY:

<steps CRITICAL="TRUE">
1. LOAD the FULL skill file at @{project-root}/${skillPath}
2. READ its entire contents — this contains the complete skill definition with steps, inputs, and output format
3. FOLLOW every step in the ## Steps section precisely and in order
4. When the skill references other taproot commands (e.g. \`/taproot:intent\`), use the corresponding \`/tr-intent\` command instead
5. Save all outputs to the paths specified in the skill's ## Output section
6. When the skill says to run \`taproot <cmd>\`, run \`${taprootBin} <cmd>\` instead${overviewStep}
</steps>
`;
}


// ─── Cursor adapter ───────────────────────────────────────────────────────────
// .cursor/rules/taproot.md — one combined rules file

function generateCursorAdapter(skills: SkillDef[], projectRoot: string, cli?: string): AdapterResult {
  const targetDir = join(projectRoot, '.cursor', 'rules');
  mkdirSync(targetDir, { recursive: true });

  const destPath = join(targetDir, 'taproot.md');
  const existed = existsSync(destPath);
  const content = buildCursorRulesFile(skills, cli, projectRoot);
  writeFileSync(destPath, content, 'utf-8');

  return {
    agent: 'cursor',
    files: [{ path: destPath, status: existed ? 'updated' : 'created' }],
  };
}

function buildCursorRulesFile(skills: SkillDef[], cli?: string, projectRoot?: string): string {
  const skillIndex = skills.map(s =>
    `- \`@taproot ${s.name}\` — ${s.description}`
  ).join('\n');

  const skillSections = skills.map(s => `
---

## @taproot ${s.name}

${s.content}
`.trimStart()).join('\n');

  const newLayout = projectRoot != null && resolveAgentDir(projectRoot) === join(projectRoot, 'taproot', 'agent');
  const globs = newLayout ? '["taproot/**"]' : '["taproot/**", ".taproot/settings.yaml"]';
  return `---
description: Taproot requirement hierarchy — skill definitions and document conventions
globs: ${globs}
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

${buildConfigQuickRef(cli, projectRoot)}

${skillSections}
`.trimStart();
}

// ─── GitHub Copilot adapter ───────────────────────────────────────────────────
// .github/copilot-instructions.md — appends/replaces a marked section

function generateCopilotAdapter(skills: SkillDef[], projectRoot: string, cli?: string): AdapterResult {
  const targetDir = join(projectRoot, '.github');
  mkdirSync(targetDir, { recursive: true });

  const destPath = join(targetDir, 'copilot-instructions.md');
  const existed = existsSync(destPath);

  const taprootSection = buildCopilotSection(skills, cli, projectRoot);
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

function buildCopilotSection(skills: SkillDef[], cli?: string, projectRoot?: string): string {
  const skillSummary = skills.map(s =>
    `- **\`/taproot:${s.name}\`** — ${s.description}. Full definition: \`${resolveSkillsRelPath(projectRoot ?? '', s.filename)}\``
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

${buildConfigQuickRef(cli)}
${TAPROOT_END}
`;
}

// ─── Windsurf adapter ─────────────────────────────────────────────────────────
// .windsurfrules — appends/replaces a marked section

function generateWindsurfAdapter(skills: SkillDef[], projectRoot: string, cli?: string): AdapterResult {
  const destPath = join(projectRoot, '.windsurfrules');
  const existed = existsSync(destPath);

  const taprootSection = buildWindsurfSection(skills, cli);
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

function buildWindsurfSection(skills: SkillDef[], cli?: string): string {
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

${buildConfigQuickRef(cli)}

## Skill Definitions

${skillSections}
${TAPROOT_END}
`;
}

// ─── Gemini CLI adapter ───────────────────────────────────────────────────────
// One .toml file per skill in .gemini/commands/, prefixed with tr-
// Invoked as /tr-<name> in Gemini CLI

function generateGeminiAdapter(skills: SkillDef[], projectRoot: string, cli?: string): AdapterResult {
  const targetDir = join(projectRoot, '.gemini', 'commands');
  mkdirSync(targetDir, { recursive: true });

  const files: AdapterResult['files'] = [];

  for (const skill of skills) {
    const destPath = join(targetDir, `tr-${skill.name}.toml`);
    const existed = existsSync(destPath);
    const content = buildGeminiSkillFile(skill, projectRoot, cli);
    writeFileSync(destPath, content, 'utf-8');
    files.push({ path: destPath, status: existed ? 'updated' : 'created' });
  }

  // Configuration Quick Reference reference file
  const refPath = join(targetDir, 'tr-taproot.toml');
  const refExisted = existsSync(refPath);
  writeFileSync(refPath, buildGeminiConfigRefFile(cli, projectRoot), 'utf-8');
  files.push({ path: refPath, status: refExisted ? 'updated' : 'created' });

  return { agent: 'gemini', files };
}

function buildGeminiConfigRefFile(cli?: string, projectRoot?: string): string {
  const prefix = cli ?? DEFAULT_CLI_PREFIX;
  const newLayout = projectRoot != null && resolveAgentDir(projectRoot) === join(projectRoot, 'taproot', 'agent');
  const settingsPath = newLayout ? 'taproot/settings.yaml' : '.taproot/settings.yaml';
  const configDoc = newLayout ? 'taproot/agent/CONFIGURATION.md' : '.taproot/CONFIGURATION.md';
  return `description = "Taproot configuration quick reference — settings.yaml options and how to apply them"

prompt = """
# Taproot — Configuration Reference

Read this when asked to change taproot settings (language, vocabulary, definition of done, etc.).

## Configuration Quick Reference

Edit ${settingsPath} to configure taproot. Run taproot update after changes.

Options:
- language: Language pack for section headers and keywords (e.g. de, fr, es). Default: English.
- vocabulary: Domain-specific term substitutions in skill output (e.g. feature: story).
- definitionOfDone: Shell commands run as gates before implementation commits.
- cli: CLI invocation prefix. Default: ${DEFAULT_CLI_PREFIX}. Override: cli: taproot (global install).

<!-- taproot:cli-invocation: ${prefix} -->
When running taproot commands in this project, replace bare \`taproot\` with: ${prefix}
Example: ${prefix} dod taproot/some-intent/some-behaviour/impl-name/impl.md

See ${configDoc} for the full reference and examples.
"""
`;
}

function buildGeminiSkillFile(skill: SkillDef, projectRoot: string, cli?: string): string {
  const taprootBin = cli ?? 'taproot';
  const overviewStep = TREE_MODIFYING_SKILLS.has(skill.name)
    ? `\n6. Run \`${taprootBin} overview\` to update taproot/OVERVIEW.md with the current project state`
    : '';
  const skillPath = resolveSkillsRelPath(projectRoot, skill.filename);
  const invocationNote = cli
    ? `\n# CLI: all taproot commands in this skill must use \`${cli}\` instead of bare \`taproot\`\n`
    : '';
  return `description = "${skill.description.replace(/"/g, '\\"')}"

prompt = """${invocationNote}
IT IS CRITICAL THAT YOU FOLLOW THESE STEPS EXACTLY:

1. LOAD the FULL skill file at ${skillPath}
2. READ its entire contents — this contains the complete skill definition with steps, inputs, and output format
3. FOLLOW every step in the ## Steps section precisely and in order
4. Save all outputs to the paths specified in the skill's ## Output section
5. When the skill says to run \`taproot <cmd>\`, run \`${taprootBin} <cmd>\` instead${overviewStep}
"""
`;
}

// ─── Generic adapter ──────────────────────────────────────────────────────────
// AGENTS.md at project root — readable by any AI agent on startup

function generateGenericAdapter(skills: SkillDef[], projectRoot: string, cli?: string): AdapterResult {
  const destPath = join(projectRoot, 'AGENTS.md');
  const existed = existsSync(destPath);

  const taprootSection = buildGenericAgentsFile(skills, cli);
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

function buildGenericAgentsFile(skills: SkillDef[], cli?: string): string {
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

${buildConfigQuickRef(cli)}

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

// ─── Aider adapter ────────────────────────────────────────────────────────────
// .aider.conf.yml — Aider config with read: entries for skill context
// CONVENTIONS.md — taproot workflow instructions for Aider sessions

// Taproot read paths injected into .aider.conf.yml
function aiderReadPaths(skills: SkillDef[], projectRoot: string): string[] {
  return [
    ...skills.map(s => resolveSkillsRelPath(projectRoot, s.filename)),
    'CONVENTIONS.md',
  ];
}

export function generateAiderAdapter(skills: SkillDef[], projectRoot: string): AdapterResult {
  const files: AdapterResult['files'] = [];

  // Handle .aider.conf.yml
  const confPath = join(projectRoot, '.aider.conf.yml');
  const confExisted = existsSync(confPath);
  const readPaths = aiderReadPaths(skills, projectRoot);

  if (confExisted) {
    const raw = readFileSync(confPath, 'utf-8');
    let parsed: Record<string, unknown>;
    try {
      parsed = (yaml.load(raw) as Record<string, unknown>) ?? {};
    } catch {
      // Return error — do not modify file
      return {
        agent: 'aider',
        files: [{ path: confPath, status: 'exists' }],
        error: `Cannot merge — \`.aider.conf.yml\` is not valid YAML. Fix the file and re-run \`taproot init --agent aider\`.`,
      };
    }

    // Merge read: entries
    const existing = Array.isArray(parsed['read']) ? (parsed['read'] as string[]) : [];
    const merged = [...existing];
    for (const p of readPaths) {
      if (!merged.includes(p)) merged.push(p);
    }
    parsed['read'] = merged;

    writeFileSync(confPath, yaml.dump(parsed), 'utf-8');
    files.push({ path: confPath, status: 'updated' });
  } else {
    writeFileSync(confPath, buildAiderConfYml(readPaths), 'utf-8');
    files.push({ path: confPath, status: 'created' });
  }

  // Write CONVENTIONS.md
  const conventionsPath = join(projectRoot, 'CONVENTIONS.md');
  const conventionsExisted = existsSync(conventionsPath);
  writeFileSync(conventionsPath, buildAiderConventionsMd(skills, projectRoot), 'utf-8');
  files.push({ path: conventionsPath, status: conventionsExisted ? 'updated' : 'created' });

  return { agent: 'aider', files };
}

function buildAiderConfYml(readPaths: string[]): string {
  const readList = readPaths.map(p => `  - ${p}`).join('\n');
  return `# Taproot agent adapter — generated by taproot init --agent aider
# Re-run taproot update to refresh. Do not remove read: entries added below.
read:
${readList}
`;
}

function buildAiderConventionsMd(skills: SkillDef[], projectRoot: string): string {
  const skillList = skills.map(s =>
    `- **${s.name}** — ${s.description}. Full definition: \`${resolveSkillsRelPath(projectRoot, s.filename)}\``
  ).join('\n');

  return `# Taproot Conventions for Aider

<!-- Auto-generated by taproot init --agent aider. Re-run taproot update to refresh. -->

This project uses **Taproot** to maintain a living requirement hierarchy alongside the code. Before making changes, check whether the relevant behaviour spec exists in \`taproot/\`.

## Hierarchy

\`\`\`
taproot/
├── <intent-slug>/          # business goal (intent.md)
│   └── <behaviour-slug>/   # system behaviour (usecase.md)
│       └── <impl-slug>/    # implementation record (impl.md)
\`\`\`

- **Intent** (\`intent.md\`): stakeholders, goal, success criteria, constraints
- **Behaviour** (\`usecase.md\`): actor, preconditions, main flow, postconditions, acceptance criteria
- **Implementation** (\`impl.md\`): source files, commits, tests — traceability bridge

## Workflows

Invoke these by natural language in your Aider session (e.g. "implement the behaviour at taproot/my-intent/my-behaviour/"):

${skillList}

## Commit Convention

When implementing a behaviour, commit with:
\`\`\`
taproot(<intent>/<behaviour>/<impl>): <what this commit does>
\`\`\`

## CLI Commands

\`\`\`bash
taproot validate-structure   # check folder hierarchy rules
taproot validate-format      # check document schemas
taproot coverage             # completeness tree
taproot check-orphans        # find broken references
taproot sync-check           # detect stale specs
\`\`\`

## Pre-commit Hook

The pre-commit hook enforces DoD/DoR gates and spec quality on every commit. If it rejects a commit, the error message includes a correction hint — fix the issue and re-commit.
`;
}

// ─── CLI Invocation Block ─────────────────────────────────────────────────────

const DEFAULT_CLI_PREFIX = 'npx @imix-js/taproot';
const CLI_INVOCATION_MARKER_PREFIX = '<!-- taproot:cli-invocation:';

export function buildInvocationBlock(cli?: string): string {
  const prefix = cli ?? DEFAULT_CLI_PREFIX;
  return `${CLI_INVOCATION_MARKER_PREFIX} ${prefix} -->
When running taproot commands in this project, replace bare \`taproot\` with: \`${prefix}\`
Example: \`${prefix} dod taproot/some-intent/some-behaviour/impl-name/impl.md\``;
}

// ─── Configuration Quick Reference ───────────────────────────────────────────

function buildConfigQuickRef(cli?: string, projectRoot?: string): string {
  const prefix = cli ?? DEFAULT_CLI_PREFIX;
  const newLayout = projectRoot != null && resolveAgentDir(projectRoot) === join(projectRoot, 'taproot', 'agent');
  const settingsPath = newLayout ? 'taproot/settings.yaml' : '.taproot/settings.yaml';
  const configDoc = newLayout ? 'taproot/agent/CONFIGURATION.md' : '.taproot/CONFIGURATION.md';
  return `## Configuration Quick Reference

Edit \`${settingsPath}\` to configure taproot. Run \`taproot update\` after changes.

| Option | Type | Description |
|--------|------|-------------|
| \`language\` | string | Language pack for section headers and keywords (e.g. \`de\`, \`fr\`, \`es\`). Default: English. |
| \`vocabulary\` | map | Domain-specific term substitutions in skill output (e.g. \`feature: story\`). |
| \`definitionOfDone\` | list | Shell commands run as gates before implementation commits. |
| \`cli\` | string | CLI invocation prefix. Default: \`${DEFAULT_CLI_PREFIX}\`. Override: \`cli: taproot\` (global install). |

See \`${configDoc}\` for the full reference and examples.

${buildInvocationBlock(prefix)}`;
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
