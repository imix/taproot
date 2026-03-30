import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { spawnSync } from 'child_process';
import { runTruthSign } from './truth-sign.js';
function getStagedFiles(cwd) {
    const result = spawnSync('git', ['diff', '--cached', '--name-only'], {
        cwd,
        encoding: 'utf-8',
    });
    if (result.status !== 0)
        return [];
    return result.stdout.split('\n').filter(Boolean);
}
function hasHierarchyFiles(staged) {
    return staged.some(f => f.startsWith('taproot/') &&
        !f.startsWith('taproot/global-truths/') &&
        !f.startsWith('taproot/agent/') &&
        (f.endsWith('/intent.md') ||
            f.endsWith('/usecase.md') ||
            f.endsWith('/impl.md') ||
            f === 'taproot/intent.md' ||
            f === 'taproot/usecase.md' ||
            f === 'taproot/impl.md'));
}
function hasGlobalTruths(cwd) {
    return existsSync(join(cwd, 'taproot', 'global-truths'));
}
export function runCommit(options) {
    const { message, all, dryRun, cwd } = options;
    // Ensure we're in a git repo
    const repoCheck = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
        cwd,
        encoding: 'utf-8',
    });
    if (repoCheck.status !== 0) {
        process.stderr.write('Not a git repository.\n');
        return 1;
    }
    if (dryRun) {
        // Show what would happen without making changes
        const staged = getStagedFiles(cwd);
        const wouldStageAll = all;
        const wouldTruthSign = hasGlobalTruths(cwd) && (staged.length > 0 || all);
        process.stdout.write('Dry-run mode — no changes will be made.\n');
        process.stdout.write(`  git add .: ${wouldStageAll ? 'yes' : 'no'}\n`);
        process.stdout.write(`  truth-sign: ${wouldTruthSign ? 'yes (hierarchy files present)' : 'no'}\n`);
        process.stdout.write(`  git commit: ${message ? `yes -m "${message}"` : 'yes (editor)'}\n`);
        return 0;
    }
    // Stage all if requested
    if (all) {
        const addResult = spawnSync('git', ['add', '.'], { cwd, encoding: 'utf-8' });
        if (addResult.status !== 0) {
            process.stderr.write((addResult.stderr ?? '') + '\n');
            return 1;
        }
    }
    // Check something is staged
    const staged = getStagedFiles(cwd);
    if (staged.length === 0) {
        process.stderr.write('Nothing staged. Use `taproot commit --all` to stage all changes, or `git add <files>` first.\n');
        return 1;
    }
    // Truth-sign if needed
    if (hasGlobalTruths(cwd) && hasHierarchyFiles(staged)) {
        const signResult = runTruthSign({ cwd });
        if (signResult !== 0) {
            process.stderr.write('taproot truth-sign failed — commit aborted.\n');
            return 1;
        }
        // Stage the session marker
        const sessionFile = '.taproot/.truth-check-session';
        if (existsSync(join(cwd, sessionFile))) {
            const addSession = spawnSync('git', ['add', sessionFile], { cwd, encoding: 'utf-8' });
            if (addSession.status !== 0) {
                process.stderr.write((addSession.stderr ?? '') + '\n');
                return 1;
            }
        }
    }
    // Run git commit
    const commitArgs = ['commit'];
    if (message) {
        commitArgs.push('-m', message);
    }
    const commitResult = spawnSync('git', commitArgs, {
        cwd,
        stdio: 'inherit',
        encoding: 'utf-8',
    });
    if (commitResult.status !== 0) {
        // git itself prints hook output to stderr via stdio: 'inherit'
        process.stderr.write('Commit blocked by pre-commit hook. Fix the issues above and re-run `taproot commit`.\n');
        return 1;
    }
    return 0;
}
export function registerCommit(program) {
    program
        .command('commit [message]')
        .description('Orchestrate git add → truth-sign → git commit in one step')
        .option('--all', 'Stage all changes before committing (git add .)')
        .option('--dry-run', 'Show what would happen without making changes')
        .option('--cwd <dir>', 'Working directory')
        .action((message, options) => {
        const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
        process.exitCode = runCommit({ message, all: options.all, dryRun: options.dryRun, cwd });
    });
}
//# sourceMappingURL=commit.js.map