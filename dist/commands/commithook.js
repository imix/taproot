import { spawnSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join, relative } from 'path';
import { parseMarkdown } from '../core/markdown-parser.js';
import { runDorChecks } from '../core/dor-runner.js';
import { runDod } from './dod.js';
import { runValidateStructure } from './validate-structure.js';
import { runValidateFormat } from './validate-format.js';
import { renderViolations } from '../core/reporter.js';
// ─── File classification ───────────────────────────────────────────────────────
function isImplMd(f) {
    return /^taproot[/\\].+[/\\]impl\.md$/.test(f);
}
function isHierarchyFile(f) {
    return f.startsWith('taproot/') || f.startsWith('taproot\\');
}
function getStagedFiles(cwd) {
    const result = spawnSync('git', ['diff', '--cached', '--name-only'], {
        cwd,
        encoding: 'utf-8',
    });
    if (result.status !== 0)
        return [];
    return result.stdout.split('\n').filter(Boolean);
}
/** Walk all impl.md files on disk and build a map of source file path → impl.md path. */
export function buildSourceToImplMap(cwd) {
    const map = new Map();
    const taprootDir = join(cwd, 'taproot');
    if (!existsSync(taprootDir))
        return map;
    function walkDir(dir) {
        let entries;
        try {
            entries = readdirSync(dir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                walkDir(fullPath);
            }
            else if (entry.isFile() && entry.name === 'impl.md') {
                const relImpl = relative(cwd, fullPath).replace(/\\/g, '/');
                let content;
                try {
                    content = readFileSync(fullPath, 'utf-8');
                }
                catch {
                    continue;
                }
                const parsed = parseMarkdown(relImpl, content);
                const sourceSection = parsed.sections.get('source files');
                if (sourceSection) {
                    for (const m of sourceSection.rawBody.matchAll(/`([^`]+)`/g)) {
                        map.set(m[1], relImpl);
                    }
                }
            }
        }
    }
    walkDir(taprootDir);
    return map;
}
function classifyCommit(files, sourceToImpl) {
    const hasImplMd = files.some(isImplMd);
    const hasHierarchy = files.some(f => isHierarchyFile(f) && !isImplMd(f));
    const hasTrackedSource = files.some(f => sourceToImpl.has(f));
    if (!hasImplMd && !hasHierarchy && !hasTrackedSource)
        return ['plain'];
    const tiers = [];
    if (hasHierarchy)
        tiers.push('requirement');
    if (hasTrackedSource)
        tiers.push('implementation');
    else if (hasImplMd)
        tiers.push('declaration');
    return tiers;
}
const TECH_KEYWORDS = /\b(REST|GraphQL|API|SQL|PostgreSQL|MySQL|Redis|HTTP|gRPC|JSON|XML|YAML|endpoint|database|query|table|schema|microservice|lambda|function|webhook)\b/i;
const VERB_STARTS = /^(Enable|Allow|Provide|Ensure|Support|Let|Give|Help|Make|Prevent|Reduce|Increase|Improve|Create|Manage|Track|Monitor|Enforce|Detect|Generate|Expose|Send|Receive|Process|Handle|Validate|Notify|Authorize|Authenticate|Store|Retrieve|Display|Show|List|Search|Filter|Export|Import|Sync|Deploy|Configure|Schedule|Audit|Report|Analyse|Analyze)\b/i;
const IMPL_MECHANISM_ACTORS = /\b(endpoint|REST|API route|database|query|table|function|lambda|microservice|webhook|handler|controller|service|repository|middleware)\b/i;
/** Extract the body text of a named `## Section` from markdown content. */
function getSection(content, name) {
    const parts = content.split(/\n(?=## )/);
    const section = parts.find(p => p.startsWith(`## ${name}`));
    if (!section)
        return null;
    return section.replace(/^## [^\n]*\n/, '');
}
export function checkUsecaseQuality(filePath, content) {
    const failures = [];
    // AC section present with AC-N: entry
    if (!/^## Acceptance Criteria/m.test(content)) {
        failures.push({
            file: filePath,
            message: 'Missing `## Acceptance Criteria` section',
            hint: "Add an `## Acceptance Criteria` section with at least one `AC-1:` Gherkin scenario before committing",
        });
    }
    else if (!/\*\*AC-\d+:/m.test(content)) {
        failures.push({
            file: filePath,
            message: '`## Acceptance Criteria` section has no AC-N: entries',
            hint: "Add at least one `**AC-1:**` entry with a Given/When/Then scenario",
        });
    }
    // Actor section: must not describe an implementation mechanism
    const actorBody = getSection(content, 'Actor');
    if (actorBody !== null) {
        const firstLine = actorBody.trim().split('\n')[0] ?? '';
        if (IMPL_MECHANISM_ACTORS.test(firstLine)) {
            failures.push({
                file: filePath,
                message: `Actor describes an implementation mechanism: "${firstLine}"`,
                hint: "Actor should be a human, system, or external service — not an implementation detail (e.g. 'Developer', 'External payment service')",
            });
        }
    }
    // Postconditions section present and non-empty
    const postBody = getSection(content, 'Postconditions');
    if (postBody === null || postBody.trim().length === 0) {
        failures.push({
            file: filePath,
            message: 'Missing or empty `## Postconditions` section',
            hint: "Add a `## Postconditions` section describing what is true after the flow succeeds",
        });
    }
    return failures;
}
export function checkIntentQuality(filePath, content) {
    const failures = [];
    // Goal section: present, starts with a verb
    const goalBody = getSection(content, 'Goal');
    if (goalBody === null || goalBody.trim().length === 0) {
        failures.push({
            file: filePath,
            message: 'Missing or empty `## Goal` section',
            hint: "Add a `## Goal` section starting with a verb describing a business outcome — e.g. 'Enable users to...', 'Allow operators to...'",
        });
    }
    else {
        const firstLine = goalBody.trim().split('\n')[0].trim();
        if (!VERB_STARTS.test(firstLine)) {
            failures.push({
                file: filePath,
                message: `Goal does not start with a verb: "${firstLine}"`,
                hint: "Goal must start with a verb describing a business outcome — e.g. 'Enable users to...', 'Allow operators to...', 'Ensure teams can...'",
            });
        }
        if (TECH_KEYWORDS.test(firstLine)) {
            failures.push({
                file: filePath,
                message: `Goal describes implementation technology: "${firstLine}"`,
                hint: "Goal should describe the business outcome, not the technical approach. Remove references to implementation technology (REST, SQL, etc.)",
            });
        }
    }
    // Stakeholders section: present and non-empty
    const stakeBody = getSection(content, 'Stakeholders');
    if (stakeBody === null || stakeBody.trim().length === 0) {
        failures.push({
            file: filePath,
            message: 'Missing or empty `## Stakeholders` section',
            hint: "Add a `## Stakeholders` section with at least one stakeholder and their perspective",
        });
    }
    // Success Criteria section: present and non-empty
    const scBody = getSection(content, 'Success Criteria');
    if (scBody === null || scBody.trim().length === 0) {
        failures.push({
            file: filePath,
            message: 'Missing or empty `## Success Criteria` section',
            hint: "Add at least one measurable success criterion that is observable and distinct from the goal statement",
        });
    }
    return failures;
}
function getStagedContent(filePath, cwd) {
    const result = spawnSync('git', ['show', `:${filePath}`], { cwd, encoding: 'utf-8' });
    if (result.status !== 0)
        return null;
    return result.stdout;
}
// ─── Status-only change check ─────────────────────────────────────────────────
function checkStatusOnly(implRelPath, cwd) {
    // New file in HEAD?
    const head = spawnSync('git', ['show', `HEAD:${implRelPath}`], { cwd, encoding: 'utf-8' });
    if (head.status !== 0) {
        return {
            passed: false,
            message: `${implRelPath} is new — commit impl.md alone first (declaration commit) before committing source code`,
        };
    }
    const staged = spawnSync('git', ['show', `:${implRelPath}`], { cwd, encoding: 'utf-8' });
    if (staged.status !== 0)
        return { passed: true, message: '' }; // unstaged, skip
    const headParsed = parseMarkdown(implRelPath, head.stdout);
    const stagedParsed = parseMarkdown(implRelPath, staged.stdout);
    const allSections = new Set([...headParsed.sections.keys(), ...stagedParsed.sections.keys()]);
    const changedSections = [];
    for (const section of allSections) {
        const headBody = headParsed.sections.get(section)?.rawBody ?? '';
        const stagedBody = stagedParsed.sections.get(section)?.rawBody ?? '';
        if (headBody !== stagedBody)
            changedSections.push(section);
    }
    const ALLOWED_IMPL_SECTIONS = new Set(['status', 'dod resolutions', 'dor resolutions']);
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
function printDorReport(report) {
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
export async function runCommithook(options) {
    const { cwd } = options;
    const staged = getStagedFiles(cwd);
    const sourceToImpl = buildSourceToImplMap(cwd);
    const tiers = classifyCommit(staged, sourceToImpl);
    if (tiers.includes('plain'))
        return 0;
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
        // Spec quality checks for usecase.md and intent.md files
        const specFailures = [];
        for (const f of staged) {
            if (!isHierarchyFile(f))
                continue;
            const content = getStagedContent(f, cwd);
            if (!content)
                continue;
            if (f.endsWith('usecase.md')) {
                specFailures.push(...checkUsecaseQuality(f, content));
            }
            else if (f.endsWith('intent.md')) {
                specFailures.push(...checkIntentQuality(f, content));
            }
        }
        if (specFailures.length > 0) {
            process.stdout.write('taproot commithook — Requirement commit: spec quality issues found\n');
            for (const failure of specFailures) {
                process.stdout.write(`  ✗ ${failure.file}: ${failure.message}\n`);
                process.stdout.write(`    → ${failure.hint}\n`);
            }
            failed = true;
        }
    }
    // Declaration tier: DoR check on the behaviour spec
    if (tiers.includes('declaration')) {
        for (const implFile of staged.filter(isImplMd)) {
            // Skip DoR for modifications to already-committed impl files — only gate first declarations
            const headCheck = spawnSync('git', ['show', `HEAD:${implFile}`], { cwd, encoding: 'utf-8' });
            if (headCheck.status === 0)
                continue;
            const report = runDorChecks(implFile, cwd);
            if (!report.allPassed) {
                process.stdout.write(`taproot commithook — Declaration commit: DoR failed for ${implFile}\n`);
                printDorReport(report);
                failed = true;
            }
        }
    }
    // Implementation tier: reverse-lookup which impl.md(s) are implicated, then Status-only + DoD
    if (tiers.includes('implementation')) {
        // Group staged source files by the impl.md that tracks them
        const implToSources = new Map();
        for (const f of staged) {
            const implPath = sourceToImpl.get(f);
            if (implPath) {
                if (!implToSources.has(implPath))
                    implToSources.set(implPath, []);
                implToSources.get(implPath).push(f);
            }
        }
        for (const [implFile] of implToSources) {
            // FAIL if the matching impl.md is not staged
            if (!staged.includes(implFile)) {
                process.stdout.write(`taproot commithook — Implementation commit: Stage \`${implFile}\` alongside your source files. No implementation commit should proceed without its traceability record.\n`);
                failed = true;
                continue;
            }
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
                        if (r.output)
                            process.stdout.write(`      ${r.output}\n`);
                        process.stdout.write(`    → ${r.correction}\n`);
                    }
                }
                failed = true;
            }
        }
    }
    return failed ? 1 : 0;
}
export function registerCommithook(program) {
    program
        .command('commithook')
        .description('Pre-commit hook: classify staged files and run appropriate quality gates')
        .option('--cwd <dir>', 'Working directory')
        .action(async (options) => {
        const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
        const code = await runCommithook({ cwd });
        process.exitCode = code;
    });
}
//# sourceMappingURL=commithook.js.map