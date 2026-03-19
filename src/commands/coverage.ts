import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import type { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';
import { parseImplData } from '../core/impl-reader.js';
import type { FolderNode } from '../validators/types.js';

export type CoverageFormat = 'tree' | 'json' | 'markdown' | 'context';

export interface ImplSummary {
  name: string;
  path: string;
  state: string;
  commitCount: number;
  testCount: number;
}

export interface BehaviourSummary {
  name: string;
  path: string;
  state: string;
  implementations: ImplSummary[];
  subBehaviours: BehaviourSummary[];
}

export interface IntentSummary {
  name: string;
  path: string;
  state: string;
  behaviours: BehaviourSummary[];
}

export interface CoverageReport {
  intents: IntentSummary[];
  totals: {
    intents: number;
    behaviours: number;
    implementations: number;
    completeImpls: number;
    testedImpls: number;
  };
}

export function registerCoverage(program: Command): void {
  program
    .command('coverage')
    .description('Generate a completeness summary of the hierarchy')
    .option('--path <path>', 'Root path (overrides config)')
    .option('--format <format>', 'Output format: tree, json, markdown, context', 'tree')
    .action(async (options: { path?: string; format?: string }) => {
      const { config, configDir } = loadConfig();
      const rootPath = options.path ? resolve(options.path) : config.root;
      const report = await runCoverage({ path: rootPath });
      const format = (options.format ?? 'tree') as CoverageFormat;

      if (format === 'context') {
        const contextPath = join(rootPath, 'CONTEXT.md');
        const content = formatContext(report, contextPath);
        writeFileSync(contextPath, content, 'utf-8');
        process.stdout.write(`CONTEXT.md updated at ${contextPath}\n`);
      } else {
        process.stdout.write(formatReport(report, format));
      }
    });
}

export async function runCoverage(options: {
  path?: string;
  cwd?: string;
}): Promise<CoverageReport> {
  const { config } = loadConfig(options.cwd);
  const rootPath = options.path ? resolve(options.path) : config.root;

  const tree = walkHierarchy(rootPath);
  const intents: IntentSummary[] = [];

  for (const child of tree.children) {
    if (child.marker === 'intent') {
      intents.push(buildIntentSummary(child));
    }
  }

  // Compute totals
  let behaviourCount = 0;
  let implCount = 0;
  let completeCount = 0;
  let testedCount = 0;

  function countBehaviour(b: BehaviourSummary): void {
    behaviourCount++;
    for (const impl of b.implementations) {
      implCount++;
      if (impl.state === 'complete') completeCount++;
      if (impl.testCount > 0) testedCount++;
    }
    for (const sub of b.subBehaviours) countBehaviour(sub);
  }

  for (const intent of intents) {
    for (const b of intent.behaviours) countBehaviour(b);
  }

  return {
    intents,
    totals: {
      intents: intents.length,
      behaviours: behaviourCount,
      implementations: implCount,
      completeImpls: completeCount,
      testedImpls: testedCount,
    },
  };
}

function readState(node: FolderNode, markerFile: string): string {
  try {
    const content = readFileSync(join(node.absolutePath, markerFile), 'utf-8');
    const doc = parseMarkdown(join(node.absolutePath, markerFile), content);
    const statusSection = doc.sections.get('status');
    if (!statusSection) return 'unknown';
    const match = /\*\*State:\*\*\s*(\S+)/.exec(statusSection.rawBody);
    return match?.[1]?.trim() ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function buildImplSummary(node: FolderNode): ImplSummary {
  const filePath = join(node.absolutePath, 'impl.md');
  let state = 'unknown';
  let commitCount = 0;
  let testCount = 0;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const doc = parseMarkdown(filePath, content);
    const data = parseImplData(doc);
    const statusSection = doc.sections.get('status');
    const match = statusSection ? /\*\*State:\*\*\s*(\S+)/.exec(statusSection.rawBody) : null;
    state = match?.[1]?.trim() ?? 'unknown';
    commitCount = data.commits.length;
    testCount = data.testFiles.length;
  } catch {
    // use defaults
  }

  return { name: node.name, path: node.relativePath, state, commitCount, testCount };
}

function buildBehaviourSummary(node: FolderNode): BehaviourSummary {
  const state = readState(node, 'usecase.md');
  const implementations: ImplSummary[] = [];
  const subBehaviours: BehaviourSummary[] = [];

  for (const child of node.children) {
    if (child.marker === 'impl') {
      implementations.push(buildImplSummary(child));
    } else if (child.marker === 'behaviour') {
      subBehaviours.push(buildBehaviourSummary(child));
    }
  }

  return { name: node.name, path: node.relativePath, state, implementations, subBehaviours };
}

function buildIntentSummary(node: FolderNode): IntentSummary {
  const state = readState(node, 'intent.md');
  const behaviours: BehaviourSummary[] = [];

  for (const child of node.children) {
    if (child.marker === 'behaviour') {
      behaviours.push(buildBehaviourSummary(child));
    }
  }

  return { name: node.name, path: node.relativePath, state, behaviours };
}

// ─── Formatters ──────────────────────────────────────────────────────────────

export function formatReport(report: CoverageReport, format: CoverageFormat): string {
  switch (format) {
    case 'json': return JSON.stringify(report, null, 2) + '\n';
    case 'markdown': return formatMarkdown(report);
    default: return formatTree(report);
  }
}

function formatTree(report: CoverageReport): string {
  const lines: string[] = [];

  for (const intent of report.intents) {
    lines.push(`Intent: ${intent.name} [${intent.state}]`);
    const bList = intent.behaviours;
    for (let bi = 0; bi < bList.length; bi++) {
      const isLast = bi === bList.length - 1;
      renderBehaviourTree(bList[bi]!, lines, isLast ? '└─' : '├─', isLast ? '  ' : '│  ');
    }
  }

  lines.push('');
  const t = report.totals;
  lines.push(`${t.intents} intent${t.intents !== 1 ? 's' : ''}, ${t.behaviours} behaviour${t.behaviours !== 1 ? 's' : ''}, ${t.implementations} implementation${t.implementations !== 1 ? 's' : ''}`);
  lines.push(`${t.completeImpls}/${t.implementations} complete, ${t.testedImpls}/${t.implementations} with tests`);
  lines.push('');

  return lines.join('\n');
}

function renderBehaviourTree(
  b: BehaviourSummary,
  lines: string[],
  prefix: string,
  childPrefix: string
): void {
  const implTotal = countAllImpls(b);
  const completeImpls = countCompleteImpls(b);
  const bar = progressBar(completeImpls, implTotal);
  lines.push(`  ${prefix} ${b.name} [${b.state}] ${bar} ${completeImpls}/${implTotal} impl`);

  const allChildren = [...b.implementations, ...b.subBehaviours];
  for (let i = 0; i < b.implementations.length; i++) {
    const impl = b.implementations[i]!;
    const isLast = i === allChildren.length - 1;
    const testWarn = impl.testCount === 0 ? ' ⚠' : '';
    lines.push(`  ${childPrefix}  ${isLast ? '└─' : '├─'} ${impl.name} [${impl.state}, ${impl.commitCount} commit${impl.commitCount !== 1 ? 's' : ''}, ${impl.testCount} test${impl.testCount !== 1 ? 's' : ''}]${testWarn}`);
  }

  for (let i = 0; i < b.subBehaviours.length; i++) {
    const sub = b.subBehaviours[i]!;
    const isLast = i === b.subBehaviours.length - 1;
    renderBehaviourTree(
      sub,
      lines,
      `${childPrefix}  ${isLast ? '└─' : '├─'}`,
      `${childPrefix}  ${isLast ? '  ' : '│  '}`
    );
  }
}

function countAllImpls(b: BehaviourSummary): number {
  return b.implementations.length + b.subBehaviours.reduce((n, s) => n + countAllImpls(s), 0);
}

function countCompleteImpls(b: BehaviourSummary): number {
  return (
    b.implementations.filter(i => i.state === 'complete').length +
    b.subBehaviours.reduce((n, s) => n + countCompleteImpls(s), 0)
  );
}

function progressBar(done: number, total: number, width = 12): string {
  if (total === 0) return '─'.repeat(width);
  const filled = Math.round((done / total) * width);
  return '█'.repeat(filled) + '─'.repeat(width - filled);
}

function formatMarkdown(report: CoverageReport): string {
  const lines: string[] = ['# Taproot Coverage Report', ''];
  const t = report.totals;
  lines.push(`**${t.intents} intents · ${t.behaviours} behaviours · ${t.implementations} implementations**`);
  lines.push(`${t.completeImpls}/${t.implementations} complete · ${t.testedImpls}/${t.implementations} with tests`);
  lines.push('');

  for (const intent of report.intents) {
    lines.push(`## ${intent.name} \`[${intent.state}]\``);
    lines.push('');
    for (const b of intent.behaviours) {
      renderBehaviourMarkdown(b, lines, '###');
    }
  }

  return lines.join('\n');
}

function renderBehaviourMarkdown(b: BehaviourSummary, lines: string[], heading: string): void {
  const implTotal = countAllImpls(b);
  const completeImpls = countCompleteImpls(b);
  lines.push(`${heading} ${b.name} \`[${b.state}]\` — ${completeImpls}/${implTotal} impl`);
  lines.push('');

  if (b.implementations.length > 0) {
    for (const impl of b.implementations) {
      const testWarn = impl.testCount === 0 ? ' ⚠️' : '';
      lines.push(`- **${impl.name}** \`[${impl.state}]\` — ${impl.commitCount} commit${impl.commitCount !== 1 ? 's' : ''}, ${impl.testCount} test${impl.testCount !== 1 ? 's' : ''}${testWarn}`);
    }
    lines.push('');
  }

  const nextHeading = heading.length < 6 ? heading + '#' : heading;
  for (const sub of b.subBehaviours) {
    renderBehaviourMarkdown(sub, lines, nextHeading);
  }
}

// ─── Context format ───────────────────────────────────────────────────────────

export function formatContext(report: CoverageReport, outputPath: string): string {
  const now = new Date().toISOString().slice(0, 10);
  const t = report.totals;
  const lines: string[] = [];

  lines.push('# Taproot Context');
  lines.push('');
  lines.push('<!-- Auto-generated by `taproot coverage --format context` — do not edit manually -->');
  lines.push(`<!-- Last updated: ${now} -->`);
  lines.push('');

  // ── Summary ──────────────────────────────────────────────────────────────
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **${t.intents}** intent${t.intents !== 1 ? 's' : ''} · **${t.behaviours}** behaviour${t.behaviours !== 1 ? 's' : ''} · **${t.implementations}** implementation${t.implementations !== 1 ? 's' : ''}`);
  lines.push(`- ${t.completeImpls}/${t.implementations} implementations complete`);
  lines.push(`- ${t.testedImpls}/${t.implementations} implementations have tests`);
  lines.push('');

  // ── Intent states breakdown ───────────────────────────────────────────────
  const intentsByState = groupBy(report.intents, i => i.state);
  const stateEntries = Object.entries(intentsByState)
    .map(([state, items]) => `${items.length} ${state}`)
    .join(', ');
  if (stateEntries) {
    lines.push(`Intents by state: ${stateEntries}`);
    lines.push('');
  }

  // ── Hierarchy ─────────────────────────────────────────────────────────────
  lines.push('## Hierarchy');
  lines.push('');
  lines.push('```');
  for (const intent of report.intents) {
    lines.push(`${intent.name}/ [${intent.state}]`);
    for (let bi = 0; bi < intent.behaviours.length; bi++) {
      const b = intent.behaviours[bi]!;
      const isLast = bi === intent.behaviours.length - 1;
      renderBehaviourContext(b, lines, isLast ? '  └─' : '  ├─', isLast ? '    ' : '  │ ');
    }
  }
  lines.push('```');
  lines.push('');

  // ── Needs attention ───────────────────────────────────────────────────────
  const unimplemented = collectUnimplemented(report);
  const noTests = collectNoTests(report);
  const inProgress = collectInProgress(report);

  if (unimplemented.length > 0 || noTests.length > 0 || inProgress.length > 0) {
    lines.push('## Needs Attention');
    lines.push('');

    if (inProgress.length > 0) {
      lines.push('**In progress:**');
      for (const item of inProgress) lines.push(`- \`${item}\``);
      lines.push('');
    }

    if (unimplemented.length > 0) {
      lines.push('**Not yet implemented:**');
      for (const item of unimplemented) lines.push(`- \`${item}\``);
      lines.push('');
    }

    if (noTests.length > 0) {
      lines.push('**Missing tests:**');
      for (const item of noTests) lines.push(`- \`${item}\``);
      lines.push('');
    }
  }

  // ── Quick reference ───────────────────────────────────────────────────────
  lines.push('## Quick Reference');
  lines.push('');
  lines.push('```bash');
  lines.push('taproot validate-structure   # check folder hierarchy');
  lines.push('taproot validate-format      # check document schemas');
  lines.push('taproot coverage             # tree view');
  lines.push('taproot check-orphans        # broken references');
  lines.push('taproot sync-check           # stale specs');
  lines.push('taproot link-commits         # link git commits to impl.md');
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

function renderBehaviourContext(
  b: BehaviourSummary,
  lines: string[],
  prefix: string,
  childPrefix: string
): void {
  const implTotal = countAllImpls(b);
  const completeImpls = countCompleteImpls(b);
  lines.push(`${prefix} ${b.name}/ [${b.state}] ${completeImpls}/${implTotal} impl`);

  const allChildren = [...b.implementations, ...b.subBehaviours];
  for (let i = 0; i < b.implementations.length; i++) {
    const impl = b.implementations[i]!;
    const isLast = i === allChildren.length - 1;
    const warn = impl.testCount === 0 ? ' ⚠ no tests' : '';
    lines.push(`${childPrefix}  ${isLast ? '└─' : '├─'} ${impl.name} [${impl.state}]${warn}`);
  }

  for (let i = 0; i < b.subBehaviours.length; i++) {
    const sub = b.subBehaviours[i]!;
    const offset = b.implementations.length;
    const isLast = offset + i === allChildren.length - 1;
    renderBehaviourContext(
      sub,
      lines,
      `${childPrefix}  ${isLast ? '└─' : '├─'}`,
      `${childPrefix}  ${isLast ? '  ' : '│ '}`
    );
  }
}

function collectUnimplemented(report: CoverageReport): string[] {
  const paths: string[] = [];
  function walk(b: BehaviourSummary): void {
    if (b.implementations.length === 0 && b.subBehaviours.length === 0) {
      paths.push(b.path);
    }
    for (const sub of b.subBehaviours) walk(sub);
  }
  for (const intent of report.intents) {
    for (const b of intent.behaviours) walk(b);
  }
  return paths;
}

function collectInProgress(report: CoverageReport): string[] {
  const paths: string[] = [];
  function walkImpl(impl: ImplSummary): void {
    if (impl.state === 'in-progress') paths.push(impl.path);
  }
  function walk(b: BehaviourSummary): void {
    for (const impl of b.implementations) walkImpl(impl);
    for (const sub of b.subBehaviours) walk(sub);
  }
  for (const intent of report.intents) {
    for (const b of intent.behaviours) walk(b);
  }
  return paths;
}

function collectNoTests(report: CoverageReport): string[] {
  const paths: string[] = [];
  function walk(b: BehaviourSummary): void {
    for (const impl of b.implementations) {
      if (impl.testCount === 0 && impl.state === 'complete') paths.push(impl.path);
    }
    for (const sub of b.subBehaviours) walk(sub);
  }
  for (const intent of report.intents) {
    for (const b of intent.behaviours) walk(b);
  }
  return paths;
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item);
    const list = result[k] ?? [];
    list.push(item);
    result[k] = list;
  }
  return result;
}
