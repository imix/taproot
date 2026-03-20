import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, relative } from 'path';
import { spawnSync } from 'child_process';
import { loadConfig } from '../core/config.js';
const AGENT_CLI = {
    claude: 'claude',
    gemini: 'gemini',
    cursor: 'cursor',
    generic: 'llm',
};
function resolveAgentCli(agents) {
    for (const agent of agents) {
        const cli = AGENT_CLI[agent] ?? agent;
        const check = spawnSync(cli, ['--version'], { encoding: 'utf-8' });
        if (check.status === 0)
            return cli;
    }
    return 'claude';
}
export function runApply(options) {
    const cwd = options.cwd ?? process.cwd();
    const { config } = loadConfig(cwd);
    // Read inputs
    if (!existsSync(resolve(cwd, options.filelistPath))) {
        throw new Error(`Filelist not found: ${options.filelistPath}`);
    }
    if (!existsSync(resolve(cwd, options.promptPath))) {
        throw new Error(`Prompt file not found: ${options.promptPath}`);
    }
    const filelist = readFileSync(resolve(cwd, options.filelistPath), 'utf-8')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));
    const prompt = readFileSync(resolve(cwd, options.promptPath), 'utf-8').trim();
    // Validate all paths before processing any
    for (const filePath of filelist) {
        const abs = resolve(cwd, filePath);
        const rel = relative(config.root, abs);
        if (rel.startsWith('..')) {
            throw new Error(`Path outside taproot/: ${filePath}`);
        }
        if (!existsSync(abs)) {
            throw new Error(`Path not found: ${filePath}`);
        }
    }
    const agentCli = options.agentCli ?? resolveAgentCli(config.agents);
    const results = [];
    for (const filePath of filelist) {
        const abs = resolve(cwd, filePath);
        const snapshot = readFileSync(abs, 'utf-8');
        const fullPrompt = `${prompt}\n\nFile to modify: ${filePath}`;
        const result = spawnSync(agentCli, ['-p', fullPrompt], {
            cwd,
            encoding: 'utf-8',
            timeout: 120_000,
            env: { ...process.env, TAPROOT_APPLY_FILE: abs },
        });
        if (result.status !== 0) {
            writeFileSync(abs, snapshot, 'utf-8');
            results.push({
                path: filePath,
                status: 'error',
                reason: (result.stderr ?? result.stdout ?? 'non-zero exit').trim().split('\n')[0],
            });
            continue;
        }
        const after = readFileSync(abs, 'utf-8');
        if (after === snapshot) {
            results.push({ path: filePath, status: 'skipped' });
        }
        else {
            results.push({ path: filePath, status: 'modified' });
        }
    }
    return results;
}
export function registerApply(program) {
    program
        .command('apply <filelist> <prompt>')
        .description('Apply a prompt task to each file in a filelist using the configured agent')
        .option('--cwd <dir>', 'Working directory')
        .action((filelistPath, promptPath, options) => {
        const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
        let results;
        try {
            results = runApply({ filelistPath, promptPath, cwd });
        }
        catch (err) {
            process.stderr.write(`Error: ${err.message}\n`);
            process.exitCode = 1;
            return;
        }
        const modified = results.filter(r => r.status === 'modified').length;
        const skipped = results.filter(r => r.status === 'skipped').length;
        const errors = results.filter(r => r.status === 'error');
        process.stdout.write(`\nApply complete — ${results.length} files processed\n`);
        process.stdout.write(`  ✓ modified:  ${modified}\n`);
        process.stdout.write(`  ○ skipped:   ${skipped}\n`);
        process.stdout.write(`  ✗ errors:    ${errors.length}\n`);
        for (const e of errors) {
            process.stdout.write(`    ${e.path} — ${e.reason ?? 'unknown error'}\n`);
        }
        if (errors.length > 0)
            process.exitCode = 1;
    });
}
//# sourceMappingURL=apply.js.map