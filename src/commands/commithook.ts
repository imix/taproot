import { spawnSync } from 'child_process';
import { resolve } from 'path';
import type { Command } from 'commander';
import { parseMarkdown } from '../core/markdown-parser.js';
import { runDorChecks, type DorReport } from '../core/dor-runner.js';
import { runDod } from './dod.js';
import { runValidateStructure } from './validate-structure.js';
import { runValidateFormat } from './validate-format.js';
import { renderViolations } from '../core/reporter.js';

// ─── File classification ───────────────────────────────────────────────────────

function isImplMd(f: string): boolean {
  return /^taproot[/\\].+[/\\]impl\.md$/.test(f);
}

function isHierarchyFile(f: string): boolean {
  return f.startsWith('taproot/') || f.startsWith('taproot\\');
}

function isSourceFile(f: string): boolean {
  return !isHierarchyFile(f) && !f.startsWith('.taproot/') && !f.startsWith('.taproot\\');
}

function getStagedFiles(cwd: string): string[] {
  const result = spawnSync('git', ['diff', '--cached', '--name-only'], {
    cwd,
    encoding: 'utf-8',
  });
  if (result.status !== 0) return [];
  return result.stdout.split('\n').filter(Boolean);
}

type CommitTier = 'plain' | 'requirement' | 'declaration' | 'implementation';

function classifyCommit(files: string[]): CommitTier[] {
  const hasImplMd = files.some(isImplMd);
  const hasSource = files.some(isSourceFile);
  const hasHierarchy = files.some(f => isHierarchyFile(f) && !isImplMd(f));

  if (!hasImplMd && !hasHierarchy) return ['plain'];

  const tiers: CommitTier[] = [];
  if (hasHierarchy) tiers.push('requirement');
  if (hasImplMd && hasSource) tiers.push('implementation');
  else if (hasImplMd) tiers.push('declaration');
  return tiers;
}

// ─── Status-only change check ─────────────────────────────────────────────────

function checkStatusOnly(
  implRelPath: string,
  cwd: string
): { passed: boolean; message: string } {
  // New file in HEAD?
  const head = spawnSync('git', ['show', `HEAD:${implRelPath}`], { cwd, encoding: 'utf-8' });
  if (head.status !== 0) {
    return {
      passed: false,
      message: `${implRelPath} is new — commit impl.md alone first (declaration commit) before committing source code`,
    };
  }

  const staged = spawnSync('git', ['show', `:${implRelPath}`], { cwd, encoding: 'utf-8' });
  if (staged.status !== 0) return { passed: true, message: '' }; // unstaged, skip

  const headParsed = parseMarkdown(implRelPath, head.stdout);
  const stagedParsed = parseMarkdown(implRelPath, staged.stdout);

  const allSections = new Set([...headParsed.sections.keys(), ...stagedParsed.sections.keys()]);
  const changedSections: string[] = [];
  for (const section of allSections) {
    const headBody = headParsed.sections.get(section)?.rawBody ?? '';
    const stagedBody = stagedParsed.sections.get(section)?.rawBody ?? '';
    if (headBody !== stagedBody) changedSections.push(section);
  }

  const ALLOWED_IMPL_SECTIONS = new Set(['status', 'dod resolutions']);
  const nonStatus = changedSections.filter(s => !ALLOWED_IMPL_SECTIONS.has(s));
  if (nonStatus.length > 0) {
    return {
      passed: false,
      message: `impl.md has changes outside ## Status (sections: ${nonStatus.join(', ')}). Stage impl.md changes in a separate declaration commit.`,
    };
  }
  return { passed: true, message: '' };
}

// ─── Reporting ────────────────────────────────────────────────────────────────

function printDorReport(report: DorReport): void {
  for (const r of report.results) {
    const icon = r.passed ? '✓' : '✗';
    process.stdout.write(`  ${icon} ${r.name}\n`);
    if (!r.passed) {
      if (r.output) {
        for (const line of r.output.split('\n')) {
          process.stdout.write(`      ${line}\n`);
        }
      }
      process.stdout.write(`    → ${r.correction}\n`);
    }
  }
}

// ─── Main hook logic ──────────────────────────────────────────────────────────

export async function runCommithook(options: { cwd: string }): Promise<number> {
  const { cwd } = options;
  const staged = getStagedFiles(cwd);
  const tiers = classifyCommit(staged);

  if (tiers.includes('plain')) return 0;

  let failed = false;

  // Requirement tier: validate hierarchy files
  if (tiers.includes('requirement')) {
    const structViolations = await runValidateStructure({ cwd });
    const formatViolations = await runValidateFormat({ cwd });
    const violations = [...structViolations, ...formatViolations];
    if (violations.some(v => v.type === 'error')) {
      process.stdout.write('taproot commithook — Requirement commit: hierarchy violations found\n');
      process.stdout.write(renderViolations(violations));
      failed = true;
    }
  }

  // Declaration tier: DoR check on the behaviour spec
  if (tiers.includes('declaration')) {
    for (const implFile of staged.filter(isImplMd)) {
      const report = runDorChecks(implFile, cwd);
      if (!report.allPassed) {
        process.stdout.write(`taproot commithook — Declaration commit: DoR failed for ${implFile}\n`);
        printDorReport(report);
        failed = true;
      }
    }
  }

  // Implementation tier: Status-only check + DoD
  if (tiers.includes('implementation')) {
    for (const implFile of staged.filter(isImplMd)) {
      const statusCheck = checkStatusOnly(implFile, cwd);
      if (!statusCheck.passed) {
        process.stdout.write(`taproot commithook — Implementation commit: ${statusCheck.message}\n`);
        failed = true;
        continue;
      }
      const dodReport = await runDod({
        implPath: resolve(cwd, implFile),
        dryRun: true,
        cwd,
      });
      if (!dodReport.allPassed) {
        process.stdout.write(`taproot commithook — Implementation commit: DoD failed for ${implFile}\n`);
        for (const r of dodReport.results) {
          if (!r.passed) {
            process.stdout.write(`  ✗ ${r.name}\n`);
            if (r.output) process.stdout.write(`      ${r.output}\n`);
            process.stdout.write(`    → ${r.correction}\n`);
          }
        }
        failed = true;
      }
    }
  }

  return failed ? 1 : 0;
}

export function registerCommithook(program: Command): void {
  program
    .command('commithook')
    .description('Pre-commit hook: classify staged files and run appropriate quality gates')
    .option('--cwd <dir>', 'Working directory')
    .action(async (options: { cwd?: string }) => {
      const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
      const code = await runCommithook({ cwd });
      process.exitCode = code;
    });
}
