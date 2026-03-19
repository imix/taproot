import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { walkHierarchy } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';
import type { FolderNode } from '../validators/types.js';

export type Classification = 'afk' | 'hitl';
export type PlanFormat = 'tree' | 'json';

export interface PlanCandidate {
  behaviourPath: string;
  behaviourName: string;
  intentName: string;
  intentGoal: string;
  specState: string;
  classification: Classification;
  classificationReason: string;
  inProgressImpls: number;
}

export interface PlanReport {
  candidates: PlanCandidate[];
  allImplemented: boolean;
}

// ─── State reading ────────────────────────────────────────────────────────────

function readState(filePath: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const doc = parseMarkdown(filePath, content);
    const match = /\*\*State:\*\*\s*(\S+)/.exec(doc.sections.get('status')?.rawBody ?? '');
    return match?.[1]?.trim() ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function readGoal(intentPath: string): string {
  try {
    const content = readFileSync(intentPath, 'utf-8');
    const doc = parseMarkdown(intentPath, content);
    const goalBody = doc.sections.get('goal')?.rawBody ?? '';
    return goalBody.replace(/<[^>]+>/g, '').split(/\.\s+/)[0]?.trim() ?? '';
  } catch {
    return '';
  }
}

// ─── Classification ───────────────────────────────────────────────────────────

function classify(specState: string, hasInProgressImpls: boolean): { classification: Classification; reason: string } {
  if (specState === 'specified') {
    return { classification: 'afk', reason: 'spec is complete and unambiguous' };
  }
  if (specState === 'implemented' && hasInProgressImpls) {
    return { classification: 'afk', reason: 'spec is done; existing implementation is in-progress' };
  }
  if (specState === 'proposed') {
    return { classification: 'hitl', reason: 'spec is only proposed — needs human review before implementing' };
  }
  return { classification: 'hitl', reason: `spec state "${specState}" — review before implementing` };
}

// ─── Hierarchy walk ───────────────────────────────────────────────────────────

function collectCandidates(node: FolderNode, intentName: string, intentGoal: string): PlanCandidate[] {
  const candidates: PlanCandidate[] = [];

  if (node.marker === 'intent') {
    const intentPath = join(node.absolutePath, 'intent.md');
    const name = node.name;
    const goal = readGoal(intentPath);
    for (const child of node.children) {
      candidates.push(...collectCandidates(child, name, goal));
    }
    return candidates;
  }

  if (node.marker === 'behaviour') {
    const implChildren = node.children.filter(c => c.marker === 'impl');
    const subBehaviours = node.children.filter(c => c.marker === 'behaviour');

    // Recurse into sub-behaviours
    for (const sub of subBehaviours) {
      candidates.push(...collectCandidates(sub, intentName, intentGoal));
    }

    // Check impl status
    const implStates = implChildren.map(c => readState(join(c.absolutePath, 'impl.md')));
    const allComplete = implStates.length > 0 && implStates.every(s => s === 'complete');
    const inProgressCount = implStates.filter(s => s === 'in-progress').length;

    // Skip if fully implemented
    if (allComplete) return candidates;

    const specState = readState(join(node.absolutePath, 'usecase.md'));
    const { classification, reason } = classify(specState, inProgressCount > 0);

    candidates.push({
      behaviourPath: node.relativePath,
      behaviourName: node.name,
      intentName,
      intentGoal,
      specState,
      classification,
      classificationReason: reason,
      inProgressImpls: inProgressCount,
    });

    return candidates;
  }

  // Root or unknown node — recurse
  for (const child of node.children) {
    candidates.push(...collectCandidates(child, intentName, intentGoal));
  }
  return candidates;
}

// ─── Core logic ───────────────────────────────────────────────────────────────

export async function runPlan(options: {
  path?: string;
  cwd?: string;
}): Promise<PlanReport> {
  const { config } = loadConfig(options.cwd);
  const rootPath = options.path ? resolve(options.path) : config.root;

  const tree = walkHierarchy(rootPath);
  const candidates = collectCandidates(tree, '', '');

  // Sort: AFK before HITL, then alphabetically by path
  candidates.sort((a, b) => {
    if (a.classification !== b.classification) {
      return a.classification === 'afk' ? -1 : 1;
    }
    return a.behaviourPath.localeCompare(b.behaviourPath);
  });

  return {
    candidates,
    allImplemented: candidates.length === 0,
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatPlan(report: PlanReport, format: PlanFormat): string {
  if (format === 'json') {
    return JSON.stringify(report, null, 2) + '\n';
  }
  return formatTree(report);
}

function formatTree(report: PlanReport): string {
  const lines: string[] = [];

  if (report.allImplemented) {
    lines.push('All behaviours are implemented. Consider running `taproot check-orphans` or `/tr-review-all`.');
    lines.push('');
    return lines.join('\n');
  }

  const afk = report.candidates.filter(c => c.classification === 'afk');
  const hitl = report.candidates.filter(c => c.classification === 'hitl');

  if (afk.length > 0) {
    lines.push('AFK — ready to implement:');
    for (const c of afk) {
      lines.push(`  ${c.behaviourPath} [${c.specState}]`);
      if (c.intentGoal) lines.push(`    Intent: ${c.intentGoal}`);
      if (c.inProgressImpls > 0) lines.push(`    (${c.inProgressImpls} impl${c.inProgressImpls > 1 ? 's' : ''} in progress)`);
      lines.push(`    ▸ /tr-implement ${c.behaviourPath}/`);
    }
    lines.push('');
  }

  if (hitl.length > 0) {
    lines.push('HITL — needs human input first:');
    for (const c of hitl) {
      lines.push(`  ${c.behaviourPath} [${c.specState}]`);
      if (c.intentGoal) lines.push(`    Intent: ${c.intentGoal}`);
      lines.push(`    Reason: ${c.classificationReason}`);
      lines.push(`    ▸ /tr-behaviour ${c.behaviourPath}/usecase.md`);
    }
    lines.push('');
  }

  const total = report.candidates.length;
  lines.push(`${total} candidate${total !== 1 ? 's' : ''} (${afk.length} AFK, ${hitl.length} HITL)`);
  lines.push('');

  return lines.join('\n');
}

// ─── CLI registration ─────────────────────────────────────────────────────────

export function registerPlan(program: Command): void {
  program
    .command('plan')
    .description('Show next implementable behaviours, classified as AFK or HITL')
    .option('--path <path>', 'Root path (overrides config)')
    .option('--format <format>', 'Output format: tree, json', 'tree')
    .action(async (options: { path?: string; format?: string }) => {
      const report = await runPlan({ path: options.path });
      process.stdout.write(formatPlan(report, (options.format ?? 'tree') as PlanFormat));
    });
}
