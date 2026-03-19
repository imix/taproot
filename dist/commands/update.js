import { existsSync, rmSync, readdirSync, readFileSync, unlinkSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';
import { generateAdapters } from '../adapters/index.js';
import { installSkills, SKILL_FILES } from './init.js';
import { runOverview } from './overview.js';
import { DEFAULT_CONFIG } from '../core/config.js';
const TAPROOT_START = '<!-- TAPROOT:START -->';
// Stale paths left behind by older taproot versions
const STALE_PATHS = [
    '.claude/skills/taproot', // pre-tr- layout: skills were in a subdirectory
    // tr- files that lived in skills/ before moving to commands/
    // resolved dynamically for globbing — see removeStale()
];
function detectInstalledAgents(cwd) {
    const installed = [];
    // claude: tr-*.md files in .claude/commands/ (current), .claude/skills/ (old), or taproot/ subdir (oldest)
    const claudeCommandsDir = join(cwd, '.claude', 'commands');
    const claudeSkillsDir = join(cwd, '.claude', 'skills');
    const oldClaudeSubdir = join(cwd, '.claude', 'skills', 'taproot');
    if ((existsSync(claudeCommandsDir) && readdirSync(claudeCommandsDir).some(f => f.startsWith('tr-'))) ||
        existsSync(oldClaudeSubdir) ||
        (existsSync(claudeSkillsDir) && readdirSync(claudeSkillsDir).some(f => f.startsWith('tr-')))) {
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
function removeStale(cwd) {
    const messages = [];
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
    }
    else if (existsSync(oldSkillsDir)) {
        rmSync(oldSkillsDir, { recursive: true, force: true });
        messages.push(`removed  taproot/skills/ (already migrated to .taproot/skills/)`);
    }
    // Remove taproot/_brainstorms/
    const brainsDir = join(cwd, DEFAULT_CONFIG.root, '_brainstorms');
    if (existsSync(brainsDir)) {
        rmSync(brainsDir, { recursive: true, force: true });
        messages.push(`removed  taproot/_brainstorms/`);
    }
    return messages;
}
export async function runUpdate(options) {
    const cwd = options.cwd ?? process.cwd();
    const messages = [];
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
        messages.push(...installSkills(skillsDir));
    }
    // Regenerate OVERVIEW.md
    const taprootDir = join(cwd, DEFAULT_CONFIG.root);
    const overviewMsgs = await runOverview({ taprootDir, cwd });
    if (overviewMsgs.length > 0) {
        messages.push('');
        messages.push(...overviewMsgs);
    }
    messages.push('');
    messages.push('Update complete.');
    return messages;
}
export function registerUpdate(program) {
    program
        .command('update')
        .description('Regenerate agent adapters and refresh installed skills')
        .option('--path <path>', 'Project directory to update', process.cwd())
        .action(async (options) => {
        const msgs = await runUpdate({ cwd: options.path });
        for (const msg of msgs) {
            process.stdout.write(msg + '\n');
        }
    });
}
//# sourceMappingURL=update.js.map