import { existsSync, readFileSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { spawnSync } from 'child_process';
import { parseMarkdown } from './markdown-parser.js';
import { validateFormat } from '../validators/format-rules.js';
import { loadConfig } from './config.js';
import { runTestsPassingWithCache } from './test-cache.js';
const BUILTINS = {
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
function resolveCondition(entry) {
    if (typeof entry === 'object' && 'document-current' in entry) {
        const description = entry['document-current'];
        return {
            name: 'document-current',
            correction: description,
            agentCheck: true,
            description,
        };
    }
    if (typeof entry === 'object' && 'check-if-affected' in entry) {
        const target = entry['check-if-affected'];
        return {
            name: `check-if-affected: ${target}`,
            agentCheck: true,
            description: target,
            correction: `Review whether this change requires updating ${target} and apply updates if needed.`,
        };
    }
    if (typeof entry === 'object' && 'check-if-affected-by' in entry) {
        const behaviourPath = entry['check-if-affected-by'];
        return {
            name: `check-if-affected-by: ${behaviourPath}`,
            agentCheck: true,
            description: behaviourPath,
            correction: `Read the behaviour spec at ${behaviourPath}/usecase.md. Determine whether it applies to this implementation and verify compliance. If it applies, ensure this implementation satisfies it; if not, record why it does not apply.`,
        };
    }
    if (typeof entry === 'object' && 'check' in entry) {
        const question = entry['check'];
        return {
            name: `check: ${question}`,
            agentCheck: true,
            description: question,
            correction: question,
        };
    }
    if (typeof entry === 'object' && 'require-discussion-log' in entry) {
        return {
            name: 'require-discussion-log',
            agentCheck: true,
            description: 'discussion.md required at declaration commit time (enforced by DoR hook, not DoD)',
            correction: 'This condition is enforced at declaration commit time, not DoD time.',
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
function runCondition(name, command, cwd, correction) {
    let result;
    try {
        result = spawnSync(command, {
            shell: true,
            cwd,
            encoding: 'utf-8',
            timeout: TIMEOUT_MS,
        });
    }
    catch (err) {
        return {
            name,
            passed: false,
            output: err.message,
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
/** Run the always-on DoD baseline: usecase.md exists, state=specified, format-valid. */
function runDodBaseline(implPath, cwd) {
    const absImpl = resolve(cwd, implPath);
    const behaviourDir = dirname(dirname(absImpl));
    const usecasePath = join(behaviourDir, 'usecase.md');
    const results = [];
    if (!existsSync(usecasePath)) {
        results.push({
            name: 'baseline-usecase-exists',
            passed: false,
            output: `No usecase.md at ${usecasePath}`,
            correction: 'The behaviour spec this implementation references is missing. Restore it before marking complete.',
        });
        return results; // cannot check further without usecase
    }
    const content = readFileSync(usecasePath, 'utf-8');
    const parsed = parseMarkdown(usecasePath, content);
    // state: specified or more advanced (implemented/tested) — must not have regressed to proposed/deprecated
    const statusSection = parsed.sections.get('status');
    const stateMatch = statusSection?.rawBody.match(/\*\*State:\*\*\s*(\S+)/);
    const state = stateMatch?.[1] ?? 'unknown';
    const acceptedStates = new Set(['specified', 'implemented', 'tested']);
    const isReady = acceptedStates.has(state);
    results.push({
        name: 'baseline-state-specified',
        passed: isReady,
        output: isReady ? '' : `usecase.md state is '${state}'`,
        correction: "Restore usecase.md to 'specified' (or more advanced) before marking implementation complete.",
    });
    // validate-format
    const { config } = loadConfig(cwd);
    const violations = validateFormat(parsed, 'behaviour', config).filter(v => v.type === 'error');
    const formatPassed = violations.length === 0;
    results.push({
        name: 'baseline-validate-format',
        passed: formatPassed,
        output: formatPassed ? '' : violations.map(v => v.message).join('\n'),
        correction: 'Fix format violations in usecase.md and re-run.',
    });
    return results;
}
// Buffer to account for the time between Date.now() and the writeFileSync mtime.
// Resolutions written within this window of impl.md's mtime are considered current.
const RESOLUTION_STALE_BUFFER_MS = 2_000;
/** Read agent-check resolutions recorded in impl.md's ## DoD Resolutions section.
 *  Returns an empty set if impl.md has been modified after the resolutions were written
 *  (indicating more implementation work happened since the agent resolved the checks). */
export function readResolutions(implPath, cwd) {
    const absPath = resolve(cwd, implPath);
    if (!existsSync(absPath))
        return new Set();
    const content = readFileSync(absPath, 'utf-8');
    const parsed = parseMarkdown(absPath, content);
    const section = parsed.sections.get('dod resolutions');
    if (!section)
        return new Set();
    const entries = [];
    for (const line of section.rawBody.split('\n')) {
        const m = line.match(/^-\s+condition:\s+(.+?)\s+\|.*\|\s+resolved:\s+(.+)$/);
        if (m) {
            const ts = Date.parse(m[2].trim());
            if (!isNaN(ts))
                entries.push({ condition: m[1].trim(), timestampMs: ts });
        }
    }
    if (entries.length === 0)
        return new Set();
    // If impl.md is already complete, resolutions are always valid — DoD already passed.
    // Only check staleness for in-progress impls, where the developer may have changed
    // implementation code after the agent recorded resolutions.
    const isComplete = /\*\*State:\*\*\s*complete/.test(content);
    if (!isComplete) {
        const implMtimeMs = statSync(absPath).mtimeMs;
        const latestResolutionMs = Math.max(...entries.map(e => e.timestampMs));
        if (implMtimeMs > latestResolutionMs + RESOLUTION_STALE_BUFFER_MS) {
            return new Set(); // stale — impl.md changed after resolutions were recorded
        }
    }
    return new Set(entries.map(e => e.condition));
}
export async function runDodChecks(conditions, cwd, options) {
    const results = [];
    // Always run baseline when implPath is provided
    if (options?.implPath) {
        results.push(...runDodBaseline(options.implPath, cwd));
    }
    if (!conditions || conditions.length === 0) {
        const configured = results.length > 0;
        return { configured, results, allPassed: results.every(r => r.passed) };
    }
    // Read any agent-check resolutions recorded in impl.md
    const resolvedChecks = options?.implPath
        ? readResolutions(options.implPath, cwd)
        : new Set();
    const cfg = options?.config;
    for (const entry of conditions) {
        const resolved = resolveCondition(entry);
        // Evidence-backed tests-passing: intercept when testsCommand is configured
        if (resolved.name === 'tests-passing' && cfg?.testsCommand) {
            if (!options?.implPath) {
                // No implPath — fall back to builtin shell run (standalone mode)
                results.push(runCondition(resolved.name, cfg.testsCommand, cwd, resolved.correction));
                continue;
            }
            const testResult = await runTestsPassingWithCache({
                implPath: options.implPath,
                cwd,
                testsCommand: cfg.testsCommand,
                testResultMaxAgeMs: cfg.testResultMaxAge !== undefined
                    ? cfg.testResultMaxAge * 60 * 1000
                    : undefined,
                testTimeoutMs: cfg.testTimeout !== undefined
                    ? cfg.testTimeout * 1000
                    : undefined,
                rerunTests: options?.rerunTests,
            });
            results.push({
                name: resolved.name,
                passed: testResult.passed,
                output: testResult.output,
                correction: testResult.correction,
            });
            continue;
        }
        if (resolved.agentCheck) {
            const isResolved = resolvedChecks.has(resolved.name);
            results.push({
                name: resolved.name,
                passed: isResolved,
                output: isResolved ? '' : `Agent check required: ${resolved.description}`,
                correction: resolved.correction,
            });
        }
        else {
            results.push(runCondition(resolved.name, resolved.run, cwd, resolved.correction));
        }
    }
    return {
        configured: true,
        results,
        allPassed: results.every(r => r.passed),
    };
}
//# sourceMappingURL=dod-runner.js.map