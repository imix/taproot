import { existsSync, readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { spawnSync } from 'child_process';
import { parseMarkdown } from './markdown-parser.js';
import { loadConfig } from './config.js';
import type { DodConditionEntry } from '../validators/types.js';

export interface DorResult {
  name: string;
  passed: boolean;
  output: string;
  correction: string;
}

export interface DorReport {
  results: DorResult[];
  allPassed: boolean;
}

/** Resolve the parent usecase.md from an impl.md path.
 *  impl.md lives at taproot/<intent>/<behaviour>/<impl>/impl.md
 *  usecase.md lives at taproot/<intent>/<behaviour>/usecase.md
 */
export function resolveUsecasePath(implMdPath: string, cwd: string): string {
  const absImpl = resolve(cwd, implMdPath);
  const implDir = dirname(absImpl);       // <impl>/
  const behaviourDir = dirname(implDir);  // <behaviour>/
  return join(behaviourDir, 'usecase.md');
}

export function runDorChecks(implMdPath: string, cwd: string): DorReport {
  const results: DorResult[] = [];
  const usecasePath = resolveUsecasePath(implMdPath, cwd);

  // 1. usecase.md exists
  if (!existsSync(usecasePath)) {
    results.push({
      name: 'usecase-exists',
      passed: false,
      output: `No usecase.md found at ${usecasePath}`,
      correction: 'Create a behaviour spec with /tr-behaviour before committing an impl.md',
    });
    return { results, allPassed: false };
  }

  const content = readFileSync(usecasePath, 'utf-8');
  const parsed = parseMarkdown(usecasePath, content);

  // 2. state: specified
  const statusSection = parsed.sections.get('status');
  const stateMatch = statusSection?.rawBody.match(/\*\*State:\*\*\s*(\S+)/);
  const state = stateMatch?.[1] ?? 'unknown';
  const isSpecified = state === 'specified';
  results.push({
    name: 'state-specified',
    passed: isSpecified,
    output: isSpecified ? '' : `usecase.md state is '${state}'`,
    correction: "Bring the spec to 'specified' (run /tr-grill then /tr-refine) before starting implementation",
  });

  // 3. Required sections
  const required: Array<[string, string]> = [
    ['actor', 'Actor'],
    ['preconditions', 'Preconditions'],
    ['main flow', 'Main Flow'],
    ['postconditions', 'Postconditions'],
  ];
  for (const [key, label] of required) {
    const present = parsed.sections.has(key);
    results.push({
      name: `section-${key.replace(' ', '-')}`,
      passed: present,
      output: present ? '' : `Missing ## ${label} section`,
      correction: `Add a ## ${label} section to usecase.md`,
    });
  }

  // 4. Flow (Mermaid diagram)
  const hasFlow = parsed.sections.has('flow');
  results.push({
    name: 'flow-diagram',
    passed: hasFlow,
    output: hasFlow ? '' : 'Missing ## Flow section with Mermaid diagram',
    correction: 'Add a ## Flow section with a mermaid diagram to usecase.md',
  });

  // 5. Related behaviours
  const hasRelated = parsed.sections.has('related');
  results.push({
    name: 'related-behaviours',
    passed: hasRelated,
    output: hasRelated ? '' : 'Missing ## Related section',
    correction: 'Add a ## Related section documenting related behaviours to usecase.md',
  });

  // 6. Configured definitionOfReady conditions
  const { config } = loadConfig(cwd);
  const dorConditions = config.definitionOfReady;
  if (dorConditions && dorConditions.length > 0) {
    for (const entry of dorConditions) {
      if (typeof entry === 'string') {
        const r = spawnSync(entry, { shell: true, cwd, encoding: 'utf-8', timeout: 30_000 });
        results.push({
          name: entry,
          passed: r.status === 0,
          output: [r.stdout, r.stderr].filter(Boolean).join('\n').trim(),
          correction: 'Fix the issue reported above, then re-commit',
        });
      } else if ('run' in entry) {
        const r = spawnSync(entry.run, { shell: true, cwd, encoding: 'utf-8', timeout: 30_000 });
        results.push({
          name: entry.name ?? entry.run,
          passed: r.status === 0,
          output: [r.stdout, r.stderr].filter(Boolean).join('\n').trim(),
          correction: entry.correction ?? 'Fix the issue reported above, then re-commit',
        });
      }
    }
  }

  return { results, allPassed: results.every(r => r.passed) };
}
