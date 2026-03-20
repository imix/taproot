import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';

interface CriterionRef {
  id: string;
  usecasePath: string;
}

interface TestRef {
  id: string;
  file: string;
  line: number;
}

export interface AcceptanceReport {
  specCriteria: CriterionRef[];
  covered: string[];
  uncovered: CriterionRef[];
  orphaned: TestRef[];
  missingSections: string[];
}

const DEFAULT_TEST_DIRS = ['test', 'tests', 'spec'];
const AC_ID_IN_SPEC = /^\*\*AC-(\d+):/gm;
const DEPRECATED_AC_LINE = /^~~\*\*AC-\d+.*$/gm;
const AC_ID_IN_TEST = /AC-(\d+)/g;

export function registerAcceptanceCheck(program: Command): void {
  program
    .command('acceptance-check')
    .description('Verify acceptance criteria coverage: every AC-N in specs must appear in a test file')
    .option('--path <path>', 'Root path to collect criteria from (overrides config)')
    .option('--tests <dir>', 'Test directory to scan (repeatable; defaults to test/, tests/, spec/)', collect, [])
    .option('--format <fmt>', 'Output format: text or json (default: text)')
    .action(async (options: { path?: string; tests: string[]; format?: string }) => {
      const cwd = process.cwd();
      const { config, configDir } = loadConfig(cwd);

      const rootPath = options.path
        ? resolve(options.path)
        : config.root.startsWith('/') ? config.root : resolve(configDir, config.root);

      const testDirs = options.tests.length > 0
        ? options.tests.map(d => resolve(d))
        : DEFAULT_TEST_DIRS.map(d => resolve(cwd, d)).filter(existsSync);

      if (testDirs.length === 0) {
        process.stderr.write(
          'No test directory found — checked test/, tests/, spec/. Use --tests <dir> to specify.\n'
        );
        process.exitCode = 1;
        return;
      }

      const report = runAcceptanceCheck(rootPath, testDirs);

      if (options.format === 'json') {
        process.stdout.write(JSON.stringify(report, null, 2) + '\n');
      } else {
        printReport(report);
      }

      if (report.uncovered.length > 0 || report.orphaned.length > 0) {
        process.exitCode = 1;
      }
    });
}

function collect(val: string, acc: string[]): string[] {
  acc.push(val);
  return acc;
}

export function runAcceptanceCheck(rootPath: string, testDirs: string[]): AcceptanceReport {
  const specCriteria = collectCriteria(rootPath);
  const testRefs = scanTestFiles(testDirs);
  const missingSections = collectMissingSections(rootPath);

  const specIds = new Set(specCriteria.map(c => c.id));
  const testIds = new Set(testRefs.map(t => t.id));

  const covered = [...specIds].filter(id => testIds.has(id));
  const uncovered = specCriteria.filter(c => !testIds.has(c.id));
  const orphaned = testRefs.filter(t => !specIds.has(t.id));

  return { specCriteria, covered, uncovered, orphaned, missingSections };
}

/** Walk the hierarchy and extract AC-N IDs from ## Acceptance Criteria sections. */
export function collectCriteria(rootPath: string): CriterionRef[] {
  if (!existsSync(rootPath)) return [];

  const tree = walkHierarchy(rootPath);
  const nodes = flattenTree(tree).filter(n => n.marker === 'behaviour');
  const refs: CriterionRef[] = [];

  for (const node of nodes) {
    const filePath = join(node.absolutePath, 'usecase.md');
    let content: string;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    const doc = parseMarkdown(filePath, content);
    const acSection = doc.sections.get('acceptance criteria');
    if (!acSection) continue;

    // Strip deprecated criteria lines (~~**AC-N: ...) before matching
    const body = acSection.rawBody.replace(DEPRECATED_AC_LINE, '');
    AC_ID_IN_SPEC.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = AC_ID_IN_SPEC.exec(body)) !== null) {
      refs.push({ id: `AC-${m[1]}`, usecasePath: filePath });
    }
  }

  return refs;
}

/** Collect usecase.md files that have impl children but no ## Acceptance Criteria section. */
export function collectMissingSections(rootPath: string): string[] {
  if (!existsSync(rootPath)) return [];

  const tree = walkHierarchy(rootPath);
  const nodes = flattenTree(tree).filter(n => n.marker === 'behaviour');
  const missing: string[] = [];

  for (const node of nodes) {
    const hasImpl = node.children.some(c => c.marker === 'impl');
    if (!hasImpl) continue;

    const filePath = join(node.absolutePath, 'usecase.md');
    let content: string;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    const doc = parseMarkdown(filePath, content);
    if (!doc.sections.has('acceptance criteria')) {
      missing.push(filePath);
    }
  }

  return missing;
}

/** Walk test directories and collect all AC-N references with file+line. */
export function scanTestFiles(testDirs: string[]): TestRef[] {
  const refs: TestRef[] = [];
  for (const dir of testDirs) {
    if (existsSync(dir)) walkTestDir(dir, refs);
  }
  return refs;
}

function walkTestDir(dir: string, refs: TestRef[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = join(dir, entry);
    try {
      if (statSync(full).isDirectory()) {
        walkTestDir(full, refs);
      } else if (isTestFile(entry)) {
        scanFile(full, refs);
      }
    } catch {
      // skip unreadable entries
    }
  }
}

function isTestFile(name: string): boolean {
  return /\.(test|spec)\.[jt]sx?$/.test(name) || /\.(test|spec)\.py$/.test(name);
}

function scanFile(filePath: string, refs: TestRef[]): void {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return;
  }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    AC_ID_IN_TEST.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = AC_ID_IN_TEST.exec(line)) !== null) {
      if (m[1]) refs.push({ id: `AC-${m[1]}`, file: filePath, line: i + 1 });
    }
  }
}

function printReport(report: AcceptanceReport): void {
  const behaviourCount = new Set(report.specCriteria.map(c => c.usecasePath)).size;
  const totalSpec = report.specCriteria.length;

  if (report.uncovered.length === 0 && report.orphaned.length === 0 && report.missingSections.length === 0) {
    process.stdout.write(`✓ ${totalSpec} criteria covered across ${behaviourCount} behaviours\n`);
    return;
  }

  if (report.covered.length > 0) {
    process.stdout.write(`✓ ${report.covered.length} criteria covered\n\n`);
  }

  if (report.uncovered.length > 0) {
    process.stdout.write(`✗ Uncovered criteria (defined in spec, missing from tests):\n`);
    for (const c of report.uncovered) {
      process.stdout.write(`  ${c.id}  ${c.usecasePath}\n`);
    }
    process.stdout.write('\n');
  }

  if (report.orphaned.length > 0) {
    const seen = new Set<string>();
    process.stdout.write(`✗ Orphaned references (in tests, not defined in any spec):\n`);
    for (const t of report.orphaned) {
      const key = `${t.id}:${t.file}:${t.line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      process.stdout.write(`  ${t.id}  ${t.file}:${t.line}\n`);
    }
    process.stdout.write('\n');
  }

  if (report.missingSections.length > 0) {
    process.stdout.write(`⚠ Missing ## Acceptance Criteria sections:\n`);
    for (const p of report.missingSections) {
      process.stdout.write(`  ${p}\n`);
    }
    process.stdout.write('\n');
  }

  const parts: string[] = [];
  if (report.uncovered.length > 0) parts.push(`${report.uncovered.length} uncovered`);
  if (report.orphaned.length > 0) parts.push(`${report.orphaned.length} orphaned`);
  if (report.missingSections.length > 0) parts.push(`${report.missingSections.length} missing section`);
  process.stdout.write(parts.join(', ') + '\n');
}
