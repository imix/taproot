import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { runDodChecks } from '../core/dod-runner.js';
import type { DodReport, DodResult } from '../core/dod-runner.js';

export { DodReport, DodResult };

export function registerDod(program: Command): void {
  program
    .command('dod [impl-path]')
    .description('Run Definition of Done checks; mark impl complete if all pass')
    .option('--dry-run', 'Run checks but do not update impl.md state')
    .option('--cwd <dir>', 'Working directory for running shell commands')
    .action(async (implPath: string | undefined, options: { dryRun?: boolean; cwd?: string }) => {
      const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
      const report = await runDod({ implPath, dryRun: options.dryRun ?? false, cwd });

      if (!report.configured) {
        process.stdout.write('No Definition of Done configured — skipping checks.\n');
        if (implPath && !options.dryRun) {
          process.stdout.write(`Marked ${implPath} complete.\n`);
        }
        return;
      }

      printReport(report);

      if (report.allPassed) {
        if (implPath && !options.dryRun) {
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
}

export async function runDod(options: {
  implPath?: string;
  dryRun?: boolean;
  cwd?: string;
}): Promise<DodReport> {
  const cwd = options.cwd ?? process.cwd();
  const { config } = loadConfig(cwd);
  const report = runDodChecks(config.definitionOfDone, cwd);

  if (options.implPath && !options.dryRun && report.allPassed) {
    markImplComplete(options.implPath);
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

function markImplComplete(implPath: string): void {
  const absPath = resolve(implPath);
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
