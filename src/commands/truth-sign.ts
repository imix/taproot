import { resolve, basename } from 'path';
import { spawnSync } from 'child_process';
import type { Command } from 'commander';
import {
  globalTruthsDir,
  collectApplicableTruths,
  docLevelFromFilename,
  writeTruthSession,
  type TruthFile,
} from '../core/truth-checker.js';

function getStagedFiles(cwd: string): string[] {
  const result = spawnSync('git', ['diff', '--cached', '--name-only'], {
    cwd,
    encoding: 'utf-8',
  });
  if (result.status !== 0) return [];
  return result.stdout.split('\n').filter(Boolean);
}

function getStagedContent(filePath: string, cwd: string): string {
  const result = spawnSync('git', ['show', `:${filePath}`], { cwd, encoding: 'utf-8' });
  return result.status === 0 ? result.stdout : '';
}

export function runTruthSign(options: { cwd: string }): number {
  const { cwd } = options;

  if (!globalTruthsDir(cwd)) {
    process.stdout.write('No taproot/global-truths/ — nothing to sign.\n');
    return 0;
  }

  const staged = getStagedFiles(cwd);
  const hierarchyDocs = staged.filter(f =>
    f.startsWith('taproot/') &&
    (f.endsWith('/intent.md') || f.endsWith('/usecase.md') ||
     f === 'taproot/intent.md' || f === 'taproot/usecase.md')
  );

  if (hierarchyDocs.length === 0) {
    process.stdout.write('No staged hierarchy documents — truth sign is a no-op.\n');
    return 0;
  }

  // Collect applicable truths across all staged doc levels (union)
  const allTruths = new Map<string, TruthFile>();
  const stagedDocContents: Array<{ path: string; content: string }> = [];

  for (const doc of hierarchyDocs) {
    const level = docLevelFromFilename(basename(doc));
    if (!level) continue;
    const content = getStagedContent(doc, cwd);
    stagedDocContents.push({ path: doc, content });
    for (const t of collectApplicableTruths(cwd, level)) {
      allTruths.set(t.relPath, t);
    }
  }

  writeTruthSession(cwd, stagedDocContents, [...allTruths.values()]);
  process.stdout.write(
    `Truth check signed for ${hierarchyDocs.length} file(s) against ${allTruths.size} truth(s).\n`
  );
  return 0;
}

export function registerTruthSign(program: Command): void {
  program
    .command('truth-sign')
    .description('Record a truth-check session marker after agent approval (called by tr-commit)')
    .option('--cwd <dir>', 'Working directory')
    .action((options: { cwd?: string }) => {
      const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
      process.exitCode = runTruthSign({ cwd });
    });
}
