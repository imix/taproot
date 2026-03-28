import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join, relative } from 'path';
import { spawnSync } from 'child_process';
import type { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { runDodChecks, readImplSourceFiles } from '../core/dod-runner.js';
import type { DodReport, DodResult } from '../core/dod-runner.js';

export { DodReport, DodResult };

/** Return files with uncommitted changes that are not in the impl's ## Source Files list. */
export function getOutOfScopeChanges(implPath: string, cwd: string): string[] {
  const sourceFiles = readImplSourceFiles(implPath, cwd);
  if (sourceFiles === null) return []; // no Source Files section — skip check

  const gitResult = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd, encoding: 'utf-8' });
  if (gitResult.error || gitResult.status !== 0) return []; // not a git repo or git error

  const uncommitted = (gitResult.stdout ?? '')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const path = line.slice(3).trim();
      const arrowIdx = path.lastIndexOf(' -> ');
      return arrowIdx >= 0 ? path.slice(arrowIdx + 4) : path;
    })
    .filter(Boolean);

  const implFileSet = new Set(sourceFiles.map(f => f.startsWith('./') ? f.slice(2) : f));
  // Also exclude the impl.md itself
  const relImpl = relative(cwd, resolve(cwd, implPath)).replace(/\\/g, '/');

  return uncommitted.filter(f => {
    const norm = f.startsWith('./') ? f.slice(2) : f;
    if (implFileSet.has(norm)) return false;
    if (norm === relImpl || norm === implPath) return false;
    return true;
  });
}

export function registerDod(program: Command): void {
  const dodCmd = program
    .command('dod [impl-path]')
    .description('Run Definition of Done checks; mark impl complete if all pass')
    .option('--dry-run', 'Run checks but do not update impl.md state')
    .option('--cwd <dir>', 'Working directory for running shell commands')
    .option('--resolve <condition>', 'Record agent resolution for a named condition (repeatable)', (v: string, a: string[]) => [...a, v], [] as string[])
    .option('--note <note>', 'Resolution note (used with --resolve, repeatable)', (v: string, a: string[]) => [...a, v], [] as string[])
    .option('--rerun-tests', 'Ignore cached test result and re-execute testsCommand')
    .option('--stash', 'Auto-stash uncommitted out-of-scope changes before running checks')
    .option('--ignore-dirty', 'Skip the uncommitted changes pre-check')
    .action(async (implPath: string | undefined, options: { dryRun?: boolean; cwd?: string; resolve?: string[]; note?: string[]; rerunTests?: boolean; stash?: boolean; ignoreDirty?: boolean }) => {
      const cwd = options.cwd ? resolve(options.cwd) : process.cwd();

      // --rerun-tests requires impl-path
      if (options.rerunTests && !implPath) {
        process.stderr.write('Error: --rerun-tests requires an impl-path argument\n');
        process.exitCode = 1;
        return;
      }

      // --resolve mode: write one or more resolutions to impl.md
      if (options.resolve && options.resolve.length > 0) {
        if (!implPath) {
          process.stderr.write('Error: --resolve requires an impl-path argument\n');
          process.exitCode = 1;
          return;
        }
        // Reject --resolve "tests-passing" when testsCommand is configured
        const { config } = loadConfig(cwd);
        if (config.testsCommand) {
          const testsPassingAttempt = options.resolve.find(r => r === 'tests-passing');
          if (testsPassingAttempt) {
            process.stderr.write(
              'Error: tests-passing cannot be resolved by assertion when testsCommand is configured. ' +
              `Run taproot dod ${implPath} to execute tests and record evidence.\n`
            );
            process.exitCode = 1;
            return;
          }
        }
        const notes = options.note ?? [];
        for (let i = 0; i < options.resolve.length; i++) {
          const condition = options.resolve[i]!;
          const note = notes[i] ?? '';
          writeResolution(implPath, condition, note, cwd);
          process.stdout.write(`Recorded resolution for "${condition}" in ${implPath}\n`);
        }
        return;
      }

      // Step 0: uncommitted changes pre-check
      if (implPath && !options.ignoreDirty && !options.resolve?.length) {
        if (options.stash) {
          const stashResult = spawnSync('git', ['stash'], { cwd, encoding: 'utf-8', stdio: 'pipe' });
          if (stashResult.status !== 0) {
            process.stderr.write(`Error: git stash failed: ${stashResult.stderr ?? ''}\n`);
            process.exitCode = 1;
            return;
          }
          process.stdout.write('Stashed out-of-scope changes. Run `git stash pop` to restore them after DoD completes.\n');
        } else {
          const outOfScope = getOutOfScopeChanges(implPath, cwd);
          if (outOfScope.length > 0) {
            process.stderr.write(
              `Uncommitted changes detected outside this impl's scope:\n` +
              outOfScope.map(f => `  • ${f}`).join('\n') + '\n\n' +
              `These may pollute the implementation commit.\n` +
              `  [S] git stash, then re-run:  taproot dod ${implPath} (or --stash to auto-stash)\n` +
              `  [I] ignore and continue:     taproot dod ${implPath} --ignore-dirty\n` +
              `  [A] abort and review changes manually\n`
            );
            process.exitCode = 1;
            return;
          }
        }
      }

      const report = await runDod({ implPath, dryRun: options.dryRun ?? false, cwd, rerunTests: options.rerunTests });

      if (!report.configured) {
        process.stdout.write('No Definition of Done configured — skipping checks.\n');
        if (implPath && !options.dryRun) {
          markImplComplete(resolve(cwd, implPath));
          const cascade = cascadeUsecaseState(resolve(cwd, implPath));
          if (cascade) process.stdout.write(`Advanced parent usecase state: ${cascade}\n`);
          process.stdout.write(`Marked ${implPath} complete.\n`);
        }
        return;
      }

      printReport(report);

      if (report.allPassed) {
        if (implPath && !options.dryRun) {
          if (report.usecaseCascade) process.stdout.write(`Advanced parent usecase state: ${report.usecaseCascade}\n`);
          process.stdout.write(`\nAll checks passed. Marked ${implPath} complete.\n`);
        } else if (implPath && options.dryRun) {
          process.stdout.write('\nAll checks passed. (dry-run: impl.md not updated)\n');
        } else {
          process.stdout.write('\nAll checks passed.\n');
        }
      } else {
        process.stdout.write('\nDefinition of Done not met — impl not marked complete.\n');
        process.exitCode = 1;
      }
    });

  // Suppress the default help output for the option name clash with commander reserved word
  void dodCmd;
}

export async function runDod(options: {
  implPath?: string;
  dryRun?: boolean;
  cwd?: string;
  rerunTests?: boolean;
}): Promise<DodReport> {
  const cwd = options.cwd ?? process.cwd();
  const { config } = loadConfig(cwd);
  const report = await runDodChecks(config.definitionOfDone, cwd, {
    implPath: options.implPath,
    config,
    rerunTests: options.rerunTests,
  });

  if (options.implPath && !options.dryRun && report.allPassed) {
    const absPath = resolve(cwd, options.implPath);
    markImplComplete(absPath);
    const cascade = cascadeUsecaseState(absPath);
    return { ...report, usecaseCascade: cascade ?? undefined };
  }

  return report;
}

function printReport(report: DodReport): void {
  const pass = '✓';
  const fail = '✗';
  for (const result of report.results) {
    const icon = result.passed ? pass : fail;
    process.stdout.write(`  ${icon} ${result.name}\n`);
    if (!result.passed) {
      if (result.output) {
        const indented = result.output.split('\n').map(l => `      ${l}`).join('\n');
        process.stdout.write(`${indented}\n`);
      }
      process.stdout.write(`    → ${result.correction}\n`);
    }
  }
}

/** Advance parent usecase.md state from 'specified' → 'implemented' when impl is marked complete. */
export function cascadeUsecaseState(absImplPath: string): string | null {
  const usecasePath = join(dirname(dirname(absImplPath)), 'usecase.md');
  if (!existsSync(usecasePath)) return null;
  const content = readFileSync(usecasePath, 'utf-8');
  if (!/\*\*State:\*\*\s*specified/.test(content)) return null;
  const today = new Date().toISOString().slice(0, 10);
  const updated = content
    .replace(/(\*\*State:\*\*\s*)specified/, '$1implemented')
    .replace(/(\*\*Last reviewed:\*\*\s*)\d{4}-\d{2}-\d{2}/, `$1${today}`);
  writeFileSync(usecasePath, updated, 'utf-8');
  return 'specified → implemented';
}

function markImplComplete(absPath: string): void {
  if (!existsSync(absPath)) {
    throw new Error(`impl.md not found at ${absPath}`);
  }
  const content = readFileSync(absPath, 'utf-8');
  const updated = content.replace(
    /(\*\*State:\*\*\s*)(planned|in-progress|needs-rework)/,
    '$1complete'
  );
  if (updated === content) return; // already complete or pattern not found
  writeFileSync(absPath, updated, 'utf-8');
}

/** Write an agent-check resolution to ## DoD Resolutions section in impl.md. */
export function writeResolution(implPath: string, condition: string, note: string, cwd: string): void {
  const absPath = resolve(cwd, implPath);
  if (!existsSync(absPath)) {
    throw new Error(`impl.md not found at ${absPath}`);
  }
  const timestamp = new Date().toISOString();
  const entry = `- condition: ${condition} | note: ${note} | resolved: ${timestamp}`;

  let content = readFileSync(absPath, 'utf-8');
  const resolutionHeader = '## DoD Resolutions';

  const hasResolutionSection = /^## DoD Resolutions$/m.test(content);
  if (hasResolutionSection) {
    // Append to existing section before the next ## heading or end of file
    content = content.replace(
      /(^## DoD Resolutions\n)([\s\S]*?)(\n^##\s|$)/m,
      (_, header, body, suffix) => {
        const trimmed = body.trimEnd();
        return `${header}${trimmed ? trimmed + '\n' : ''}${entry}\n${suffix}`;
      }
    );
  } else {
    // Append new section at end of file
    content = content.trimEnd() + `\n\n${resolutionHeader}\n${entry}\n`;
  }

  writeFileSync(absPath, content, 'utf-8');
}
