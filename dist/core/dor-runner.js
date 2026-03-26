import { existsSync, readFileSync } from 'fs';
import { join, dirname, resolve, relative, normalize } from 'path';
import { spawnSync } from 'child_process';
import { parseMarkdown } from './markdown-parser.js';
import { loadConfig } from './config.js';
import { loadLanguagePack } from './language.js';
/** Resolve an English section key to its localised lowercase equivalent via the pack. */
function localizedSectionKey(englishKey, pack) {
    if (!pack)
        return englishKey;
    const packKey = Object.keys(pack).find(k => k.toLowerCase() === englishKey);
    if (!packKey)
        return englishKey;
    return pack[packKey].toLowerCase();
}
/** Read agent-check resolutions from impl.md's ## DoR Resolutions section. */
export function readDorResolutions(implMdPath, cwd) {
    const absPath = resolve(cwd, implMdPath);
    if (!existsSync(absPath))
        return new Set();
    const content = readFileSync(absPath, 'utf-8');
    const parsed = parseMarkdown(absPath, content);
    const section = parsed.sections.get('dor resolutions');
    if (!section)
        return new Set();
    const conditions = new Set();
    for (const line of section.rawBody.split('\n')) {
        const m = line.match(/^-\s+condition:\s+(.+?)\s+\|/);
        if (m)
            conditions.add(m[1].trim());
    }
    return conditions;
}
/** Resolve the parent usecase.md from an impl.md path.
 *  impl.md lives at taproot/<intent>/<behaviour>/<impl>/impl.md
 *  usecase.md lives at taproot/<intent>/<behaviour>/usecase.md
 */
export function resolveUsecasePath(implMdPath, cwd) {
    const absImpl = resolve(cwd, implMdPath);
    const implDir = dirname(absImpl); // <impl>/
    const behaviourDir = dirname(implDir); // <behaviour>/
    return join(behaviourDir, 'usecase.md');
}
// ─── Impl ordering check (depends-on) ────────────────────────────────────────
function readImplDependsOn(implMdPath, cwd) {
    const absPath = resolve(cwd, implMdPath);
    if (!existsSync(absPath))
        return { paths: [] };
    let content;
    try {
        content = readFileSync(absPath, 'utf-8');
    }
    catch {
        return { paths: [] };
    }
    const parsed = parseMarkdown(absPath, content);
    const section = parsed.sections.get('depends on');
    if (!section)
        return { paths: [] };
    const rawPaths = section.bodyLines
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => (l.startsWith('- ') ? l.slice(2).trim() : l))
        .filter(l => l.length > 0);
    if (rawPaths.length === 0)
        return { paths: [] };
    const invalid = rawPaths.filter(p => !p.includes('/') && !p.endsWith('.md'));
    if (invalid.length > 0) {
        return {
            error: `depends-on must be a string path or list of string paths — got: ${invalid.join(', ')}`,
        };
    }
    return { paths: rawPaths.map(p => normalize(p)) };
}
function detectDependsOnCycle(startImplPath, cwd) {
    const normStart = normalize(startImplPath);
    const stack = [[normStart, [normStart]]];
    while (stack.length > 0) {
        const [current, trace] = stack.pop();
        const depsResult = readImplDependsOn(current, cwd);
        if ('error' in depsResult || depsResult.paths.length === 0)
            continue;
        for (const dep of depsResult.paths) {
            if (trace.includes(dep)) {
                const cycleStart = trace.indexOf(dep);
                const cycle = [...trace.slice(cycleStart), dep];
                return `circular dependency: ${cycle.join(' → ')}`;
            }
            stack.push([dep, [...trace, dep]]);
        }
    }
    return null;
}
function checkImplOrdering(implMdPath, cwd) {
    const depsResult = readImplDependsOn(implMdPath, cwd);
    if ('error' in depsResult) {
        return [{
                name: 'ordering-depends-on',
                passed: false,
                output: depsResult.error,
                correction: 'Fix the depends-on field: use a valid project-root-relative path (e.g. taproot/intent/behaviour/impl/impl.md)',
            }];
    }
    if (depsResult.paths.length === 0)
        return [];
    const cycleError = detectDependsOnCycle(implMdPath, cwd);
    if (cycleError) {
        return [{
                name: 'ordering-depends-on',
                passed: false,
                output: cycleError,
                correction: 'Remove the circular dependency before declaring this implementation',
            }];
    }
    const failures = [];
    for (const depPath of depsResult.paths) {
        const absDepPath = resolve(cwd, depPath);
        if (!existsSync(absDepPath)) {
            failures.push(`depends-on: ${depPath} does not exist. Check the path relative to the project root`);
            continue;
        }
        let depContent;
        try {
            depContent = readFileSync(absDepPath, 'utf-8');
        }
        catch {
            failures.push(`depends-on: ${depPath} could not be read`);
            continue;
        }
        const stateMatch = depContent.match(/\*\*State:\*\*\s*(\S+)/);
        if (!stateMatch) {
            failures.push(`depends-on: ${depPath} has no state field. The referenced impl.md is incomplete — add a state: field before declaring this dependency`);
            continue;
        }
        const depState = stateMatch[1];
        if (depState !== 'complete') {
            failures.push(`depends-on: ${depPath} has state: ${depState}. That implementation must be complete before this one can be declared`);
        }
    }
    if (failures.length === 0) {
        return [{
                name: 'ordering-depends-on',
                passed: true,
                output: '',
                correction: '',
            }];
    }
    return [{
            name: 'ordering-depends-on',
            passed: false,
            output: failures.join('\n'),
            correction: 'Complete all declared dependencies before making this declaration commit',
        }];
}
export function runDorChecks(implMdPath, cwd) {
    const results = [];
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
        correction: "Bring the spec to 'specified' (run /tr-review then /tr-refine) before starting implementation",
    });
    // 3. Required sections (localised via language pack)
    const { config } = loadConfig(cwd);
    const pack = config.language ? loadLanguagePack(config.language) : null;
    const required = [
        ['actor', 'Actor'],
        ['preconditions', 'Preconditions'],
        ['main flow', 'Main Flow'],
        ['postconditions', 'Postconditions'],
    ];
    for (const [englishKey, label] of required) {
        const key = localizedSectionKey(englishKey, pack);
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
    // 6. Impl ordering constraints (depends-on)
    const orderingResults = checkImplOrdering(implMdPath, cwd);
    results.push(...orderingResults);
    // 7. Configured definitionOfReady conditions
    const dorConditions = config.definitionOfReady;
    if (dorConditions && dorConditions.length > 0) {
        const resolvedChecks = readDorResolutions(implMdPath, cwd);
        for (const entry of dorConditions) {
            if (typeof entry === 'object' && 'check' in entry) {
                const question = entry['check'];
                const name = `check: ${question}`;
                const isResolved = resolvedChecks.has(name);
                results.push({
                    name,
                    passed: isResolved,
                    output: isResolved ? '' : `Agent check required: ${question}`,
                    correction: `Reason about the question and record a resolution in impl.md under ## DoR Resolutions: "- condition: ${name} | note: <reasoning> | resolved: <ISO-timestamp>"`,
                });
            }
            else if (typeof entry === 'object' && ('document-current' in entry || 'check-if-affected' in entry || 'check-if-affected-by' in entry)) {
                // Other agent-check types — treat as unresolvable shell-side, report as agent check
                const key = 'document-current' in entry ? 'document-current' : 'check-if-affected' in entry ? 'check-if-affected' : 'check-if-affected-by';
                const value = entry[key];
                const name = `${key}: ${value}`;
                const isResolved = resolvedChecks.has(name);
                results.push({
                    name,
                    passed: isResolved,
                    output: isResolved ? '' : `Agent check required: ${value}`,
                    correction: `Resolve this agent check and record it in impl.md under ## DoR Resolutions.`,
                });
            }
            else if (typeof entry === 'object' && 'require-discussion-log' in entry && entry['require-discussion-log'] === true) {
                const implDir = dirname(resolve(cwd, implMdPath));
                const discussionPath = join(implDir, 'discussion.md');
                const exists = existsSync(discussionPath);
                results.push({
                    name: 'require-discussion-log',
                    passed: exists,
                    output: exists ? '' : `discussion.md missing in ${relative(cwd, implDir)}/`,
                    correction: 'Record the session rationale before declaring this implementation. See skills/implement.md step 5b.',
                });
            }
            else if (typeof entry === 'string') {
                const r = spawnSync(entry, { shell: true, cwd, encoding: 'utf-8', timeout: 30_000 });
                results.push({
                    name: entry,
                    passed: r.status === 0,
                    output: [r.stdout, r.stderr].filter(Boolean).join('\n').trim(),
                    correction: 'Fix the issue reported above, then re-commit',
                });
            }
            else if ('run' in entry) {
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
//# sourceMappingURL=dor-runner.js.map