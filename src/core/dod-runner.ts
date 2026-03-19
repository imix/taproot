import { spawnSync } from 'child_process';
import type { DodConditionEntry } from '../validators/types.js';

export interface DodResult {
  name: string;
  passed: boolean;
  output: string;
  correction: string;
}

export interface DodReport {
  configured: boolean;
  results: DodResult[];
  allPassed: boolean;
}

const BUILTINS: Record<string, { run: string; correction: string }> = {
  'tests-passing': {
    run: 'npm test',
    correction: 'Fix failing tests and re-run.',
  },
  'linter-clean': {
    run: 'npm run lint',
    correction: 'Fix lint errors reported above and re-run.',
  },
  'commit-conventions': {
    run: 'npm run check:commits',
    correction: 'Ensure your commits follow the project commit convention.',
  },
};

const TIMEOUT_MS = 30_000;

interface ResolvedCondition {
  name: string;
  run?: string;
  correction: string;
  manualCheck?: boolean;
  description?: string;
}

function resolveCondition(entry: DodConditionEntry): ResolvedCondition {
  if (typeof entry === 'object' && 'document-current' in entry) {
    const description = entry['document-current'];
    return {
      name: 'document-current',
      correction: description,
      manualCheck: true,
      description,
    };
  }
  if (typeof entry === 'string') {
    const builtin = BUILTINS[entry];
    if (!builtin) {
      return {
        name: entry,
        run: entry,
        correction: `Unknown built-in condition "${entry}". Use a known built-in or specify a "run:" command.`,
      };
    }
    return { name: entry, run: builtin.run, correction: builtin.correction };
  }
  return {
    name: entry.name ?? entry.run,
    run: entry.run,
    correction: entry.correction ?? 'Fix the issue reported above, then re-run.',
  };
}

function runCondition(name: string, command: string, cwd: string, correction: string): DodResult {
  let result: ReturnType<typeof spawnSync>;
  try {
    result = spawnSync(command, {
      shell: true,
      cwd,
      encoding: 'utf-8',
      timeout: TIMEOUT_MS,
    });
  } catch (err) {
    return {
      name,
      passed: false,
      output: (err as Error).message,
      correction: 'Ensure the command exists and is executable from the project root.',
    };
  }

  if (result.error) {
    const isTimeout = result.error.message.includes('ETIMEDOUT') || result.error.message.includes('timeout');
    return {
      name,
      passed: false,
      output: result.error.message,
      correction: isTimeout
        ? 'Check for hanging processes or increase the timeout.'
        : 'Ensure the command exists and is executable from the project root.',
    };
  }

  const output = [result.stdout ?? '', result.stderr ?? ''].filter(Boolean).join('\n').trim();
  const passed = result.status === 0;

  // Exit code 127 = shell "command not found"
  if (result.status === 127) {
    return {
      name,
      passed: false,
      output,
      correction: 'Ensure the command exists and is executable from the project root.',
    };
  }

  return { name, passed, output, correction: passed ? '' : correction };
}

export function runDodChecks(
  conditions: DodConditionEntry[] | undefined,
  cwd: string
): DodReport {
  if (!conditions || conditions.length === 0) {
    return { configured: false, results: [], allPassed: true };
  }

  const results: DodResult[] = [];
  for (const entry of conditions) {
    const resolved = resolveCondition(entry);
    if (resolved.manualCheck) {
      results.push({
        name: resolved.name,
        passed: false,
        output: `Manual check required: ${resolved.description}`,
        correction: resolved.correction,
      });
    } else {
      results.push(runCondition(resolved.name, resolved.run!, cwd, resolved.correction));
    }
  }

  return {
    configured: true,
    results,
    allPassed: results.every(r => r.passed),
  };
}
