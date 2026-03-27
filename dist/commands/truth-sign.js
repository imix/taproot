import { resolve, basename } from 'path';
import { spawnSync } from 'child_process';
import { globalTruthsDir, collectApplicableTruths, docLevelFromFilename, writeTruthSession, } from '../core/truth-checker.js';
function getStagedFiles(cwd) {
    const result = spawnSync('git', ['diff', '--cached', '--name-only'], {
        cwd,
        encoding: 'utf-8',
    });
    if (result.status !== 0)
        return [];
    return result.stdout.split('\n').filter(Boolean);
}
function getStagedContent(filePath, cwd) {
    const result = spawnSync('git', ['show', `:${filePath}`], { cwd, encoding: 'utf-8' });
    return result.status === 0 ? result.stdout : '';
}
export function runTruthSign(options) {
    const { cwd } = options;
    if (!globalTruthsDir(cwd)) {
        process.stdout.write('No taproot/global-truths/ — nothing to sign.\n');
        return 0;
    }
    const staged = getStagedFiles(cwd);
    // Hierarchy docs: intent.md, usecase.md (not global-truths)
    const hierarchyDocs = staged.filter(f => f.startsWith('taproot/') &&
        !f.startsWith('taproot/global-truths/') &&
        (f.endsWith('/intent.md') || f.endsWith('/usecase.md') ||
            f === 'taproot/intent.md' || f === 'taproot/usecase.md'));
    // Impl.md files (not global-truths)
    const implMdFiles = staged.filter(f => f.startsWith('taproot/') &&
        !f.startsWith('taproot/global-truths/') &&
        (f.endsWith('/impl.md') || f === 'taproot/impl.md'));
    // Source files: non-taproot, non-.taproot
    const sourceFiles = staged.filter(f => !f.startsWith('taproot/') && !f.startsWith('.taproot/'));
    if (hierarchyDocs.length === 0 && implMdFiles.length === 0 && sourceFiles.length === 0) {
        process.stdout.write('No staged hierarchy documents or implementation files — truth sign is a no-op.\n');
        return 0;
    }
    const allTruths = new Map();
    const stagedDocContents = [];
    // Hierarchy docs: include content, collect truths by level
    for (const doc of hierarchyDocs) {
        const level = docLevelFromFilename(basename(doc));
        if (!level)
            continue;
        const content = getStagedContent(doc, cwd);
        stagedDocContents.push({ path: doc, content });
        for (const t of collectApplicableTruths(cwd, level)) {
            allTruths.set(t.relPath, t);
        }
    }
    // Impl-level: impl.md content + source file path list as identity anchor
    if (implMdFiles.length > 0 || sourceFiles.length > 0) {
        for (const doc of implMdFiles) {
            const content = getStagedContent(doc, cwd);
            stagedDocContents.push({ path: doc, content });
        }
        if (sourceFiles.length > 0) {
            stagedDocContents.push({
                path: '__impl_sources__',
                content: [...sourceFiles].sort().join('\n'),
            });
        }
        for (const t of collectApplicableTruths(cwd, 'impl')) {
            allTruths.set(t.relPath, t);
        }
    }
    writeTruthSession(cwd, stagedDocContents, [...allTruths.values()]);
    const signingCount = hierarchyDocs.length + implMdFiles.length + (sourceFiles.length > 0 ? 1 : 0);
    process.stdout.write(`Truth check signed for ${signingCount} file(s) against ${allTruths.size} truth(s).\n`);
    return 0;
}
export function registerTruthSign(program) {
    program
        .command('truth-sign')
        .description('Record a truth-check session marker after agent approval (called by tr-commit)')
        .option('--cwd <dir>', 'Working directory')
        .action((options) => {
        const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
        process.exitCode = runTruthSign({ cwd });
    });
}
//# sourceMappingURL=truth-sign.js.map