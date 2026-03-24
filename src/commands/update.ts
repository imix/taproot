import { existsSync, rmSync, readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, renameSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';
import { buildConfigurationMd } from '../core/configuration.js';
import type { Command } from 'commander';
import { generateAdapters, type AgentName } from '../adapters/index.js';
import { installSkills, SKILL_FILES } from './init.js';
import { runOverview } from './overview.js';
import { DEFAULT_CONFIG, loadConfig } from '../core/config.js';
import { loadLanguagePack, supportedLanguages } from '../core/language.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import type { FolderNode } from '../validators/types.js';

const TAPROOT_START = '<!-- TAPROOT:START -->';

// Stale paths left behind by older taproot versions
const STALE_PATHS = [
  '.claude/skills/taproot', // pre-tr- layout: skills were in a subdirectory
  // tr- files that lived in skills/ before moving to commands/
  // resolved dynamically for globbing — see removeStale()
];

function detectInstalledAgents(cwd: string): AgentName[] {
  const installed: AgentName[] = [];

  // claude: tr-*.md files in .claude/commands/ (current), .claude/skills/ (old), or taproot/ subdir (oldest)
  const claudeCommandsDir = join(cwd, '.claude', 'commands');
  const claudeSkillsDir = join(cwd, '.claude', 'skills');
  const oldClaudeSubdir = join(cwd, '.claude', 'skills', 'taproot');
  if (
    (existsSync(claudeCommandsDir) && readdirSync(claudeCommandsDir).some(f => f.startsWith('tr-'))) ||
    existsSync(oldClaudeSubdir) ||
    (existsSync(claudeSkillsDir) && readdirSync(claudeSkillsDir).some(f => f.startsWith('tr-')))
  ) {
    installed.push('claude');
  }

  // cursor: .cursor/rules/taproot.md
  if (existsSync(join(cwd, '.cursor', 'rules', 'taproot.md'))) {
    installed.push('cursor');
  }

  // copilot: .github/copilot-instructions.md containing taproot section
  const copilotPath = join(cwd, '.github', 'copilot-instructions.md');
  if (existsSync(copilotPath) && readFileSync(copilotPath, 'utf-8').includes(TAPROOT_START)) {
    installed.push('copilot');
  }

  // windsurf: .windsurfrules containing taproot section
  const windsurfPath = join(cwd, '.windsurfrules');
  if (existsSync(windsurfPath) && readFileSync(windsurfPath, 'utf-8').includes(TAPROOT_START)) {
    installed.push('windsurf');
  }

  // generic: AGENTS.md containing taproot section
  const agentsPath = join(cwd, 'AGENTS.md');
  if (existsSync(agentsPath) && readFileSync(agentsPath, 'utf-8').includes(TAPROOT_START)) {
    installed.push('generic');
  }

  return installed;
}

function removeStale(cwd: string): string[] {
  const messages: string[] = [];

  // Remove old taproot/ subdirectory
  const oldSubdir = join(cwd, '.claude', 'skills', 'taproot');
  if (existsSync(oldSubdir)) {
    rmSync(oldSubdir, { recursive: true, force: true });
    messages.push(`removed  .claude/skills/taproot`);
  }

  // Remove tr-*.md files that were placed in .claude/skills/ (before commands/ layout)
  const claudeSkillsDir = join(cwd, '.claude', 'skills');
  if (existsSync(claudeSkillsDir)) {
    for (const f of readdirSync(claudeSkillsDir)) {
      if (f.startsWith('tr-') && f.endsWith('.md')) {
        unlinkSync(join(claudeSkillsDir, f));
        messages.push(`removed  .claude/skills/${f}`);
      }
    }
  }

  // Migrate taproot/skills/ → .taproot/skills/
  const oldSkillsDir = join(cwd, DEFAULT_CONFIG.root, 'skills');
  const newSkillsDir = join(cwd, '.taproot', 'skills');
  if (existsSync(oldSkillsDir) && !existsSync(newSkillsDir)) {
    mkdirSync(join(cwd, '.taproot'), { recursive: true });
    renameSync(oldSkillsDir, newSkillsDir);
    messages.push(`migrated taproot/skills/ → .taproot/skills/`);
  } else if (existsSync(oldSkillsDir)) {
    rmSync(oldSkillsDir, { recursive: true, force: true });
    messages.push(`removed  taproot/skills/ (already migrated to .taproot/skills/)`);
  }

  // Remove taproot/_brainstorms/
  const brainsDir = join(cwd, DEFAULT_CONFIG.root, '_brainstorms');
  if (existsSync(brainsDir)) {
    rmSync(brainsDir, { recursive: true, force: true });
    messages.push(`removed  taproot/_brainstorms/`);
  }

  // Migrate old pre-commit hook content to taproot commithook
  const hookPath = join(cwd, '.git', 'hooks', 'pre-commit');
  if (existsSync(hookPath)) {
    const hookContent = readFileSync(hookPath, 'utf-8');
    if (hookContent.includes('validate-structure') || hookContent.includes('validate-format')) {
      writeFileSync(hookPath, '#!/bin/sh\ntaproot commithook\n', { mode: 0o755 });
      messages.push(`migrated .git/hooks/pre-commit → taproot commithook`);
    }
  }

  return messages;
}

function extractTitle(content: string, fallback: string): string {
  const m = content.match(/^# (?:[^:\n]+: )?(.+)$/m);
  return m?.[1]?.trim() ?? fallback;
}

function upsertLinkSection(
  content: string,
  docPath: string,
  sectionTitle: string,
  childNodes: FolderNode[],
  childDoc: string,
): string {
  const managedHeader = `## ${sectionTitle} <!-- taproot-managed -->`;

  // Build desired links: rel path → title
  const desiredLinks: Array<{ rel: string; title: string }> = [];
  for (const child of childNodes) {
    const childDocPath = join(child.absolutePath, childDoc);
    if (!existsSync(childDocPath)) continue;
    const rel = './' + relative(dirname(docPath), childDocPath).replace(/\\/g, '/');
    const childContent = readFileSync(childDocPath, 'utf-8');
    desiredLinks.push({ rel, title: extractTitle(childContent, child.name) });
  }

  const lines = content.split('\n');

  // Find section start: any "## <Title>" line (with or without managed comment)
  const sectionPattern = new RegExp(`^## ${sectionTitle}(\\s|$)`);
  const sectionStartIdx = lines.findIndex(l => sectionPattern.test(l));

  if (sectionStartIdx === -1) {
    if (desiredLinks.length === 0) return content;
    // Insert before ## Status or append at end
    const statusIdx = lines.findIndex(l => /^## Status(\s|$)/.test(l));
    const newBlock = [managedHeader, ...desiredLinks.map(l => `- [${l.title}](${l.rel})`), ''];
    if (statusIdx !== -1) {
      lines.splice(statusIdx, 0, ...newBlock, '');
    } else {
      if (lines[lines.length - 1] !== '') lines.push('');
      lines.push(...newBlock);
    }
    return lines.join('\n');
  }

  // Find section end: next "## " heading or EOF
  let sectionEndIdx = lines.length;
  for (let i = sectionStartIdx + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i]!)) {
      sectionEndIdx = i;
      break;
    }
  }

  // Process body lines: prune stale links, collect existing
  const bodyLines = lines.slice(sectionStartIdx + 1, sectionEndIdx);
  const existingRels = new Set<string>();
  const prunedBody: string[] = [];

  for (const line of bodyLines) {
    const linkMatch = line.match(/\[.*?\]\((.+?)\)/);
    if (linkMatch) {
      const rel = linkMatch[1]!;
      const resolved = resolve(dirname(docPath), rel);
      if (!existsSync(resolved)) continue; // prune stale
      existingRels.add(rel);
    }
    prunedBody.push(line);
  }

  // Append missing links
  for (const { rel, title } of desiredLinks) {
    if (!existingRels.has(rel)) {
      prunedBody.push(`- [${title}](${rel})`);
    }
  }

  // Replace the section (update header to managed form, replace body)
  lines.splice(sectionStartIdx, sectionEndIdx - sectionStartIdx, managedHeader, ...prunedBody);
  return lines.join('\n');
}

export function refreshLinks(cwd: string, taprootDir: string): string[] {
  const messages: string[] = [];
  if (!existsSync(taprootDir)) return messages;

  const tree = walkHierarchy(taprootDir);
  const nodes = flattenTree(tree).filter(n => n.marker === 'intent' || n.marker === 'behaviour');

  for (const node of nodes) {
    const markerFile = node.marker === 'intent' ? 'intent.md' : 'usecase.md';
    const docPath = join(node.absolutePath, markerFile);
    if (!existsSync(docPath)) continue;

    const childMarker = node.marker === 'intent' ? 'behaviour' : 'impl';
    const childDoc = childMarker === 'behaviour' ? 'usecase.md' : 'impl.md';
    const sectionTitle = node.marker === 'intent' ? 'Behaviours' : 'Implementations';

    const childNodes = node.children.filter(c => c.marker === childMarker);

    const content = readFileSync(docPath, 'utf-8');
    const updated = upsertLinkSection(content, docPath, sectionTitle, childNodes, childDoc);

    if (updated !== content) {
      writeFileSync(docPath, updated, 'utf-8');
      messages.push(`updated  ${relative(cwd, docPath)}`);
    }
  }

  return messages;
}

export async function runUpdate(options: { cwd?: string; withHooks?: boolean }): Promise<string[]> {
  const cwd = options.cwd ?? process.cwd();
  const messages: string[] = [];

  // Validate language pack before modifying any files (AC-4)
  const { config } = loadConfig(cwd);
  let pack = null;
  if (config.language) {
    pack = loadLanguagePack(config.language);
    if (!pack) {
      messages.push(
        `error    Unknown language pack '${config.language}'. ` +
        `Supported: ${supportedLanguages().join(', ')}. ` +
        `No files modified.`
      );
      return messages;
    }
    messages.push(`language ${config.language} (${Object.keys(pack).length} tokens)`);
  }

  // Validate vocabulary overrides before modifying any files
  const vocab = config.vocabulary ?? null;
  if (vocab && Object.keys(vocab).length > 0) {
    const emptyKeys = Object.entries(vocab)
      .filter(([, v]) => v === '')
      .map(([k]) => k);
    if (emptyKeys.length > 0) {
      for (const key of emptyKeys) {
        messages.push(
          `error    Vocabulary override '${key}' maps to an empty string — ` +
          `this would silently delete the term from skill files. ` +
          `Provide a non-empty replacement or remove the key.`
        );
      }
      messages.push('No files modified.');
      return messages;
    }
    messages.push(`vocabulary ${Object.keys(vocab).length} overrides`);
  }

  const agents = detectInstalledAgents(cwd);

  if (agents.length === 0) {
    messages.push('No taproot agent adapters detected — nothing to update.');
    messages.push('Run `taproot init --agent <name>` to install adapters.');
    return Promise.resolve(messages);
  }

  messages.push(`Detected adapters: ${agents.join(', ')}`);
  messages.push('');

  // Remove stale paths from old versions
  messages.push(...removeStale(cwd));

  // Regenerate detected adapters
  for (const agent of agents) {
    const results = generateAdapters(agent, cwd);
    for (const result of results) {
      for (const file of result.files) {
        const rel = file.path.replace(cwd + '/', '').replace(cwd + '\\', '');
        const verb = file.status === 'created' ? 'created' : file.status === 'updated' ? 'updated' : 'exists  ';
        messages.push(`${verb}  ${rel}`);
      }
    }
  }

  // Refresh/install skills — always when claude adapter is present, otherwise only if already installed
  const skillsDir = join(cwd, '.taproot', 'skills');
  const hasInstalledSkills = existsSync(skillsDir) &&
    SKILL_FILES.some(f => existsSync(join(skillsDir, f)));

  if (agents.includes('claude') || hasInstalledSkills) {
    messages.push('');
    messages.push(...installSkills(skillsDir, true, pack, vocab));
  }

  // Install or refresh .taproot/CONFIGURATION.md (AC-6/AC-7 of update-adapters-and-skills)
  const taprootConfigDir = join(cwd, '.taproot');
  const configMdPath = join(taprootConfigDir, 'CONFIGURATION.md');
  try {
    mkdirSync(taprootConfigDir, { recursive: true });
    const content = buildConfigurationMd();
    const existed = existsSync(configMdPath);
    writeFileSync(configMdPath, content, 'utf-8');
    messages.push('');
    messages.push(`${existed ? 'updated' : 'created'}  .taproot/CONFIGURATION.md`);
  } catch (err) {
    messages.push(`warning  Could not write .taproot/CONFIGURATION.md: ${(err as Error).message}`);
  }

  // Refresh cross-links (## Behaviours / ## Implementations sections)
  const taprootDir = join(cwd, DEFAULT_CONFIG.root);
  const linkMsgs = refreshLinks(cwd, taprootDir);
  if (linkMsgs.length > 0) {
    messages.push('');
    messages.push(...linkMsgs);
  }

  // Regenerate OVERVIEW.md
  const overviewMsgs = await runOverview({ taprootDir, cwd });
  if (overviewMsgs.length > 0) {
    messages.push('');
    messages.push(...overviewMsgs);
  }

  // Install hook if --with-hooks and none exists
  if (options.withHooks) {
    const hookDir = join(cwd, '.git', 'hooks');
    const hookPath = join(hookDir, 'pre-commit');
    if (existsSync(join(cwd, '.git')) && !existsSync(hookPath)) {
      mkdirSync(hookDir, { recursive: true });
      writeFileSync(hookPath, '#!/bin/sh\ntaproot commithook\n', { mode: 0o755 });
      messages.push(`created  .git/hooks/pre-commit`);
    } else if (existsSync(hookPath)) {
      messages.push(`exists   .git/hooks/pre-commit`);
    }
  }

  messages.push('');
  messages.push('Update complete.');
  return messages;
}

export function registerUpdate(program: Command): void {
  program
    .command('update')
    .description('Regenerate agent adapters and refresh installed skills')
    .option('--path <path>', 'Project directory to update', process.cwd())
    .option('--with-hooks', 'Install pre-commit hook if not already present')
    .action(async (options: { path: string; withHooks?: boolean }) => {
      const msgs = await runUpdate({ cwd: options.path, withHooks: options.withHooks });
      for (const msg of msgs) {
        process.stdout.write(msg + '\n');
      }
    });
}
