import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join, relative } from 'path';
import { spawnSync } from 'child_process';
import { loadConfig } from '../core/config.js';
import { runDodChecks, readImplSourceFiles } from '../core/dod-runner.js';
/** Return files with uncommitted changes that are not in the impl's ## Source Files list. */
export function getOutOfScopeChanges(implPath, cwd) {
    const sourceFiles = readImplSourceFiles(implPath, cwd);
    if (sourceFiles === null)
        return []; // no Source Files section — skip check
    const gitResult = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd, encoding: 'utf-8' });
    if (gitResult.error || gitResult.status !== 0)
        return []; // not a git repo or git error
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
        if (implFileSet.has(norm))
            return false;
        if (norm === relImpl || norm === implPath)
            return false;
        return true;
    });
}
// ── NA resolution helpers ─────────────────────────────────────────────────────
/** Conditions that are never auto-resolved regardless of naRules. */
function isProtectedCondition(name) {
    return (name === 'document-current' ||
        name === 'tests-passing' ||
        name.startsWith('baseline-') ||
        /^check:\s/.test(name) // "check: <free-form>" but not "check-if-affected:"
    );
}
/** Evaluate a `when` predicate against the impl's source file list. */
function evaluateNaWhen(when, sourceFiles) {
    if (when === 'prose-only') {
        return { matches: sourceFiles.every(f => f.endsWith('.md')), unknown: false };
    }
    if (when === 'no-skill-files') {
        return { matches: !sourceFiles.some(f => /skills\/.*\.md$/.test(f)), unknown: false };
    }
    return { matches: false, unknown: true };
}
/** Auto-resolve NA conditions based on naRules config. Returns summary. */
export async function resolveAllNa(implPath, options) {
    const cwd = options.cwd ?? process.cwd();
    const { config } = loadConfig(cwd);
    const summary = { resolved: [], skipped: [], warnings: [], wouldResolve: [] };
    if (!config.naRules || config.naRules.length === 0) {
        return summary; // no naRules configured
    }
    // Read Source Files from impl.md (required for predicate evaluation)
    const sourceFiles = readImplSourceFiles(implPath, cwd);
    if (sourceFiles === null) {
        throw new Error(`Cannot determine impl type — ## Source Files section is missing or empty in ${implPath}`);
    }
    // Dry-run DoD to find currently unresolved agent-check conditions
    const report = await runDodChecks(config.definitionOfDone, cwd, { implPath, config });
    const unresolvedAgentChecks = report.results.filter(r => !r.passed && r.output.startsWith('Agent check required:'));
    for (const result of unresolvedAgentChecks) {
        const conditionName = result.name;
        if (isProtectedCondition(conditionName)) {
            summary.skipped.push(conditionName);
            continue;
        }
        // Find a matching naRule
        const matchingRule = config.naRules.find(rule => rule.condition === conditionName);
        if (!matchingRule) {
            summary.skipped.push(conditionName);
            continue;
        }
        const { matches, unknown } = evaluateNaWhen(matchingRule.when, sourceFiles);
        if (unknown) {
            summary.warnings.push(`Unknown 'when' value '${matchingRule.when}' in naRules entry for '${conditionName}' — skipping.`);
            summary.skipped.push(conditionName);
            continue;
        }
        if (!matches) {
            summary.skipped.push(conditionName);
            continue;
        }
        // Condition qualifies for auto-resolution
        const note = buildNaNote(matchingRule, sourceFiles);
        if (options.dryRun) {
            summary.wouldResolve.push(conditionName);
        }
        else {
            writeResolution(implPath, conditionName, note, cwd);
            summary.resolved.push(conditionName);
        }
    }
    return summary;
}
function buildNaNote(rule, sourceFiles) {
    if (rule.when === 'prose-only') {
        return `not applicable — prose-only impl (Source Files: ${sourceFiles.join(', ')}); no TypeScript or other non-markdown files; auto-resolved by naRules[when:prose-only]`;
    }
    if (rule.when === 'no-skill-files') {
        return `not applicable — no skills/*.md files in Source Files (${sourceFiles.join(', ')}); auto-resolved by naRules[when:no-skill-files]`;
    }
    return `not applicable — auto-resolved by naRules[when:${rule.when}]`;
}
// ─────────────────────────────────────────────────────────────────────────────
export function registerDod(program) {
    const dodCmd = program
        .command('dod [impl-path]')
        .description('Run Definition of Done checks; mark impl complete if all pass')
        .option('--dry-run', 'Run checks but do not update impl.md state')
        .option('--cwd <dir>', 'Working directory for running shell commands')
        .option('--resolve <condition>', 'Record agent resolution for a named condition (repeatable)', (v, a) => [...a, v], [])
        .option('--note <note>', 'Resolution note (used with --resolve, repeatable)', (v, a) => [...a, v], [])
        .option('--rerun-tests', 'Ignore cached test result and re-execute testsCommand')
        .option('--stash', 'Auto-stash uncommitted out-of-scope changes before running checks')
        .option('--ignore-dirty', 'Skip the uncommitted changes pre-check')
        .option('--resolve-all-na', 'Auto-resolve clearly not-applicable conditions based on naRules in settings.yaml')
        .action(async (implPath, options) => {
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
                    process.stderr.write('Error: tests-passing cannot be resolved by assertion when testsCommand is configured. ' +
                        `Run taproot dod ${implPath} to execute tests and record evidence.\n`);
                    process.exitCode = 1;
                    return;
                }
            }
            const notes = options.note ?? [];
            for (let i = 0; i < options.resolve.length; i++) {
                const condition = options.resolve[i];
                const note = notes[i] ?? '';
                writeResolution(implPath, condition, note, cwd);
                process.stdout.write(`Recorded resolution for "${condition}" in ${implPath}\n`);
            }
            return;
        }
        // --resolve-all-na mode: auto-resolve NA conditions from naRules
        if (options.resolveAllNa) {
            if (!implPath) {
                process.stderr.write('Error: --resolve-all-na requires an impl-path argument\n');
                process.exitCode = 1;
                return;
            }
            const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
            const { config } = loadConfig(cwd);
            if (!config.naRules || config.naRules.length === 0) {
                process.stdout.write('No naRules configured in taproot/settings.yaml — nothing to auto-resolve.\n');
                return;
            }
            let summary;
            try {
                summary = await resolveAllNa(implPath, { dryRun: options.dryRun, cwd });
            }
            catch (err) {
                process.stderr.write(`Error: ${err.message}\n`);
                process.exitCode = 1;
                return;
            }
            // Report warnings
            for (const w of summary.warnings) {
                process.stdout.write(`⚠  ${w}\n`);
            }
            if (options.dryRun) {
                if (summary.wouldResolve.length === 0) {
                    process.stdout.write('No conditions qualify for auto-resolution.\n');
                }
                else {
                    process.stdout.write(`Would auto-resolve ${summary.wouldResolve.length} condition(s) as not applicable:\n`);
                    for (const c of summary.wouldResolve) {
                        process.stdout.write(`  ✓ ${c}\n`);
                    }
                    if (summary.skipped.length > 0) {
                        process.stdout.write(`${summary.skipped.length} condition(s) require manual resolution.\n`);
                    }
                }
                return;
            }
            if (summary.resolved.length === 0) {
                process.stdout.write('No conditions qualify for auto-resolution.\n');
            }
            else {
                process.stdout.write(`Auto-resolved ${summary.resolved.length} condition(s) as not applicable:\n`);
                for (const c of summary.resolved) {
                    process.stdout.write(`  ✓ ${c}\n`);
                }
            }
            if (summary.skipped.length > 0) {
                process.stdout.write(`${summary.skipped.length} condition(s) still require manual resolution.\n`);
            }
            // Re-run DoD and show updated state
            process.stdout.write('\n');
            const report = await runDod({ implPath, dryRun: options.dryRun ?? false, cwd });
            if (!report.configured) {
                process.stdout.write('No Definition of Done configured.\n');
                return;
            }
            printReport(report);
            if (report.allPassed) {
                if (report.usecaseCascade)
                    process.stdout.write(`Advanced parent usecase state: ${report.usecaseCascade}\n`);
                process.stdout.write(`\nAll checks passed. Marked ${implPath} complete.\n`);
            }
            else {
                process.stdout.write('\nDefinition of Done not met — manual resolution required for remaining conditions.\n');
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
            }
            else {
                const outOfScope = getOutOfScopeChanges(implPath, cwd);
                if (outOfScope.length > 0) {
                    process.stderr.write(`Uncommitted changes detected outside this impl's scope:\n` +
                        outOfScope.map(f => `  • ${f}`).join('\n') + '\n\n' +
                        `These may pollute the implementation commit.\n` +
                        `  [S] git stash, then re-run:  taproot dod ${implPath} (or --stash to auto-stash)\n` +
                        `  [I] ignore and continue:     taproot dod ${implPath} --ignore-dirty\n` +
                        `  [A] abort and review changes manually\n`);
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
                if (cascade)
                    process.stdout.write(`Advanced parent usecase state: ${cascade}\n`);
                process.stdout.write(`Marked ${implPath} complete.\n`);
            }
            return;
        }
        printReport(report);
        if (report.allPassed) {
            if (implPath && !options.dryRun) {
                if (report.usecaseCascade)
                    process.stdout.write(`Advanced parent usecase state: ${report.usecaseCascade}\n`);
                process.stdout.write(`\nAll checks passed. Marked ${implPath} complete.\n`);
            }
            else if (implPath && options.dryRun) {
                process.stdout.write('\nAll checks passed. (dry-run: impl.md not updated)\n');
            }
            else {
                process.stdout.write('\nAll checks passed.\n');
            }
        }
        else {
            process.stdout.write('\nDefinition of Done not met — impl not marked complete.\n');
            process.exitCode = 1;
        }
    });
    // Suppress the default help output for the option name clash with commander reserved word
    void dodCmd;
}
export async function runDod(options) {
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
function printReport(report) {
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
export function cascadeUsecaseState(absImplPath) {
    const usecasePath = join(dirname(dirname(absImplPath)), 'usecase.md');
    if (!existsSync(usecasePath))
        return null;
    const content = readFileSync(usecasePath, 'utf-8');
    if (!/\*\*State:\*\*\s*specified/.test(content))
        return null;
    const today = new Date().toISOString().slice(0, 10);
    const updated = content
        .replace(/(\*\*State:\*\*\s*)specified/, '$1implemented')
        .replace(/(\*\*Last reviewed:\*\*\s*)\d{4}-\d{2}-\d{2}/, `$1${today}`);
    writeFileSync(usecasePath, updated, 'utf-8');
    return 'specified → implemented';
}
function markImplComplete(absPath) {
    if (!existsSync(absPath)) {
        throw new Error(`impl.md not found at ${absPath}`);
    }
    const content = readFileSync(absPath, 'utf-8');
    const updated = content.replace(/(\*\*State:\*\*\s*)(planned|in-progress|needs-rework)/, '$1complete');
    if (updated === content)
        return; // already complete or pattern not found
    writeFileSync(absPath, updated, 'utf-8');
}
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/** Write an agent-check resolution to ## DoD Resolutions section in impl.md. */
export function writeResolution(implPath, condition, note, cwd) {
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
        // Scope both check and replacement to the ## DoD Resolutions section only,
        // preventing false matches against identically-named entries in ## DoR Resolutions
        const conditionPattern = new RegExp(`^- condition: ${escapeRegex(condition)} \\|.*$`, 'm');
        content = content.replace(/(^## DoD Resolutions\n)([\s\S]*?)(\n^##\s|$)/m, (_, header, body, suffix) => {
            if (conditionPattern.test(body)) {
                return `${header}${body.replace(conditionPattern, entry)}${suffix}`;
            }
            const trimmed = body.trimEnd();
            return `${header}${trimmed ? trimmed + '\n' : ''}${entry}\n${suffix}`;
        });
    }
    else {
        // Append new section at end of file
        content = content.trimEnd() + `\n\n${resolutionHeader}\n${entry}\n`;
    }
    writeFileSync(absPath, content, 'utf-8');
}
//# sourceMappingURL=dod.js.map