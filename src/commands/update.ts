import { existsSync, rmSync, readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, renameSync, chmodSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { buildConfigurationMd } from '../core/configuration.js';
import type { Command } from 'commander';
import { generateAdapters, type AgentName } from '../adapters/index.js';
import { installSkills, installDocs, SKILL_FILES, wrapperScript, hookScriptContent } from './init.js';
import { resolveAgentDir } from '../core/paths.js';
import { runOverview } from './overview.js';
import { DEFAULT_CONFIG, loadConfig } from '../core/config.js';
import { loadLanguagePack, supportedLanguages } from '../core/language.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import type { FolderNode } from '../validators/types.js';
import yaml from 'js-yaml';

const TAPROOT_START = '<!-- TAPROOT:START -->';

// Stale paths left behind by older taproot versions
const STALE_PATHS = [
  '.claude/skills/taproot', // pre-tr- layout: skills were in a subdirectory
  // tr- files that lived in skills/ before moving to commands/
  // resolved dynamically for globbing — see removeStale()
];

function installWrapper(cwd: string): string[] {
  const msgs: string[] = [];
  const binDir = join(cwd, 'taproot', 'agent', 'bin');
  const wrapperPath = join(binDir, 'taproot');
  mkdirSync(binDir, { recursive: true });
  const existed = existsSync(wrapperPath);
  writeFileSync(wrapperPath, wrapperScript(), { mode: 0o755 });
  // Ensure executable bit (writeFileSync mode is masked by umask on some systems)
  chmodSync(wrapperPath, 0o755);
  msgs.push(`${existed ? 'updated' : 'created'}  taproot/agent/bin/taproot`);
  return msgs;
}

function migrateHierarchyToSpecs(cwd: string): string[] {
  const msgs: string[] = [];
  const settingsPath = join(cwd, 'taproot', 'settings.yaml');
  if (!existsSync(settingsPath)) return msgs;

  const content = readFileSync(settingsPath, 'utf-8');
  if (!/^root:\s*['"]?taproot\/?['"]?\s*$/m.test(content)) return msgs;

  const taprootDir = join(cwd, 'taproot');
  const specsDir = join(taprootDir, 'specs');
  if (existsSync(specsDir)) return msgs; // already migrated

  const EXCLUDE = new Set(['agent', 'global-truths', 'node_modules', 'specs', '.git']);
  const dirsToMove = readdirSync(taprootDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !EXCLUDE.has(e.name));

  if (dirsToMove.length === 0) return msgs;

  mkdirSync(specsDir, { recursive: true });
  for (const dir of dirsToMove) {
    renameSync(join(taprootDir, dir.name), join(specsDir, dir.name));
    msgs.push(`migrated taproot/${dir.name}/ → taproot/specs/${dir.name}/`);
  }

  const updated = content.replace(/^(root:\s*)['"]?taproot\/?['"]?(\s*)$/m, 'root: taproot/specs/');
  writeFileSync(settingsPath, updated, 'utf-8');
  msgs.push(`updated  taproot/settings.yaml (root: taproot/specs/)`);

  return msgs;
}

function setCliWrapper(cwd: string): string[] {
  const msgs: string[] = [];
  const settingsPath = join(cwd, 'taproot', 'settings.yaml');
  if (!existsSync(settingsPath)) return msgs;
  const content = readFileSync(settingsPath, 'utf-8');
  if (/^cli:/m.test(content)) return msgs; // already set — don't overwrite
  const updated = content.trimEnd() + `\ncli: './taproot/agent/bin/taproot'\n`;
  writeFileSync(settingsPath, updated, 'utf-8');
  msgs.push(`updated  taproot/settings.yaml (cli: ./taproot/agent/bin/taproot)`);
  return msgs;
}

function bumpTaprootVersion(cwd: string): string[] {
  const msgs: string[] = [];
  const settingsPath = join(cwd, 'taproot', 'settings.yaml');
  if (!existsSync(settingsPath)) return msgs;
  const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'package.json'), 'utf-8')) as { version: string };
  const newVersion = pkg.version;
  let content = readFileSync(settingsPath, 'utf-8');
  if (/^taproot_version:/m.test(content)) {
    content = content.replace(/^taproot_version:.*$/m, `taproot_version: '${newVersion}'`);
  } else {
    // Append before first blank line after last key, or at end
    content = content.trimEnd() + `\ntaproot_version: '${newVersion}'\n`;
  }
  writeFileSync(settingsPath, content, 'utf-8');
  msgs.push(`updated  taproot/settings.yaml (taproot_version: ${newVersion})`);
  return msgs;
}

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

  // aider: .aider.conf.yml with taproot read: entries, or CONVENTIONS.md with taproot header
  const aiderConfPath = join(cwd, '.aider.conf.yml');
  const conventionsPath = join(cwd, 'CONVENTIONS.md');
  if (
    (existsSync(aiderConfPath) && (
      readFileSync(aiderConfPath, 'utf-8').includes('.taproot/skills/') ||
      readFileSync(aiderConfPath, 'utf-8').includes('taproot/agent/skills/')
    )) ||
    (existsSync(conventionsPath) && readFileSync(conventionsPath, 'utf-8').includes('taproot init --agent aider'))
  ) {
    installed.push('aider');
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
  const oldSkillsDir = join(cwd, 'taproot', 'skills');
  const newSkillsDir = join(cwd, '.taproot', 'skills');
  if (existsSync(oldSkillsDir) && !existsSync(newSkillsDir)) {
    mkdirSync(join(cwd, '.taproot'), { recursive: true });
    renameSync(oldSkillsDir, newSkillsDir);
    messages.push(`migrated taproot/skills/ → .taproot/skills/`);
  } else if (existsSync(oldSkillsDir)) {
    rmSync(oldSkillsDir, { recursive: true, force: true });
    messages.push(`removed  taproot/skills/ (already migrated to .taproot/skills/)`);
  }

  // Migrate old layout (.taproot/) → new layout (taproot/agent/, taproot/settings.yaml)
  const oldSettings = join(cwd, '.taproot', 'settings.yaml');
  const newSettings = join(cwd, 'taproot', 'settings.yaml');
  const oldDotTaprootSkills = join(cwd, '.taproot', 'skills');
  const newAgentSkills = join(cwd, 'taproot', 'agent', 'skills');
  const oldDotTaprootDocs = join(cwd, '.taproot', 'docs');
  const newAgentDocs = join(cwd, 'taproot', 'agent', 'docs');

  // settings.yaml migration is handled unconditionally earlier in runUpdate
  if (existsSync(oldDotTaprootSkills) && !existsSync(newAgentSkills)) {
    mkdirSync(join(cwd, 'taproot', 'agent'), { recursive: true });
    renameSync(oldDotTaprootSkills, newAgentSkills);
    messages.push(`migrated .taproot/skills/ → taproot/agent/skills/`);
  }
  if (existsSync(oldDotTaprootDocs) && !existsSync(newAgentDocs)) {
    mkdirSync(join(cwd, 'taproot', 'agent'), { recursive: true });
    renameSync(oldDotTaprootDocs, newAgentDocs);
    messages.push(`migrated .taproot/docs/ → taproot/agent/docs/`);
  }
  const oldConfigMd = join(cwd, '.taproot', 'CONFIGURATION.md');
  const newConfigMd = join(cwd, 'taproot', 'agent', 'CONFIGURATION.md');
  if (existsSync(oldConfigMd) && !existsSync(newConfigMd) && existsSync(join(cwd, 'taproot', 'agent'))) {
    renameSync(oldConfigMd, newConfigMd);
    messages.push(`migrated .taproot/CONFIGURATION.md → taproot/agent/CONFIGURATION.md`);
  }
  const oldBacklog = join(cwd, '.taproot', 'backlog.md');
  const newBacklog = join(cwd, 'taproot', 'backlog.md');
  if (existsSync(oldBacklog) && !existsSync(newBacklog)) {
    renameSync(oldBacklog, newBacklog);
    messages.push(`migrated .taproot/backlog.md → taproot/backlog.md`);
  }
  const agentBacklog = join(cwd, 'taproot', 'agent', 'backlog.md');
  if (existsSync(agentBacklog) && !existsSync(newBacklog)) {
    renameSync(agentBacklog, newBacklog);
    messages.push(`migrated taproot/agent/backlog.md → taproot/backlog.md`);
  }

  // Remove taproot/_brainstorms/
  const brainsDir = join(cwd, 'taproot', '_brainstorms');
  if (existsSync(brainsDir)) {
    rmSync(brainsDir, { recursive: true, force: true });
    messages.push(`removed  taproot/_brainstorms/`);
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

  // Always: migrate .taproot/settings.yaml → taproot/settings.yaml if old layout detected
  const oldSettingsPath = join(cwd, '.taproot', 'settings.yaml');
  const newSettingsPath = join(cwd, 'taproot', 'settings.yaml');
  if (existsSync(oldSettingsPath)) {
    if (!existsSync(newSettingsPath)) {
      mkdirSync(join(cwd, 'taproot'), { recursive: true });
      writeFileSync(newSettingsPath, readFileSync(oldSettingsPath, 'utf-8'));
      messages.push(`migrated .taproot/settings.yaml → taproot/settings.yaml`);
    }
    unlinkSync(oldSettingsPath);
    messages.push(`removed  .taproot/settings.yaml`);
  }

  // Always: migrate flat taproot/ hierarchy → taproot/specs/ subfolder
  messages.push(...migrateHierarchyToSpecs(cwd));

  // Always (when taproot project present): install/refresh wrapper, migrate old hooks, bump version
  const isTaprootProject = existsSync(newSettingsPath) || existsSync(join(cwd, 'taproot', 'agent'));
  if (isTaprootProject) {
    messages.push(...installWrapper(cwd));
  }
  const hookPath = join(cwd, '.git', 'hooks', 'pre-commit');
  if (existsSync(hookPath)) {
    const hookContent = readFileSync(hookPath, 'utf-8');
    if (hookContent.includes('validate-structure') || hookContent.includes('validate-format') || hookContent.includes('taproot commithook') || hookContent.includes('@imix-js/taproot') || hookContent.includes('npx')) {
      writeFileSync(hookPath, hookScriptContent(), { mode: 0o755 });
      messages.push(`migrated .git/hooks/pre-commit → wrapper-based hook`);
    }
  }
  if (isTaprootProject) {
    messages.push(...bumpTaprootVersion(cwd));
    messages.push(...setCliWrapper(cwd));
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
      if (result.error) {
        messages.push(`error    ${result.error}`);
        continue;
      }
      for (const file of result.files) {
        const rel = file.path.replace(cwd + '/', '').replace(cwd + '\\', '');
        const verb = file.status === 'created' ? 'created' : file.status === 'updated' ? 'updated' : 'exists  ';
        messages.push(`${verb}  ${rel}`);
      }
    }
  }

  // Refresh/install skills — always when claude adapter is present, otherwise only if already installed
  const agentDir = resolveAgentDir(cwd);
  const skillsDir = join(agentDir, 'skills');
  const docsDir = join(agentDir, 'docs');
  const isNewLayout = agentDir === join(cwd, 'taproot', 'agent');
  const skillsDisplayDir = isNewLayout ? 'taproot/agent/skills' : '.taproot/skills';
  const docsDisplayDir = isNewLayout ? 'taproot/agent/docs' : '.taproot/docs';
  const hasInstalledSkills = existsSync(skillsDir) &&
    SKILL_FILES.some(f => existsSync(join(skillsDir, f)));

  if (agents.includes('claude') || hasInstalledSkills) {
    messages.push('');
    messages.push(...installSkills(skillsDir, true, pack, vocab, skillsDisplayDir));
    messages.push(...installDocs(docsDir, true, docsDisplayDir));
  }

  // Install or refresh CONFIGURATION.md in the agent dir
  const taprootConfigDir = agentDir;
  const configMdPath = join(taprootConfigDir, 'CONFIGURATION.md');
  try {
    mkdirSync(taprootConfigDir, { recursive: true });
    const content = buildConfigurationMd(isNewLayout);
    const existed = existsSync(configMdPath);
    writeFileSync(configMdPath, content, 'utf-8');
    messages.push('');
    const configMdRel = isNewLayout ? 'taproot/agent/CONFIGURATION.md' : '.taproot/CONFIGURATION.md';
    messages.push(`${existed ? 'updated' : 'created'}  ${configMdRel}`);
  } catch (err) {
    messages.push(`warning  Could not write CONFIGURATION.md: ${(err as Error).message}`);
  }

  // Refresh cross-links (## Behaviours / ## Implementations sections)
  // Reload config here — migrations above may have updated root in settings.yaml
  const { config: currentConfig } = loadConfig(cwd);
  const taprootDir = join(cwd, currentConfig.root);
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
      writeFileSync(hookPath, hookScriptContent(), { mode: 0o755 });
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
