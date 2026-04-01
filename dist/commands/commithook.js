import { spawnSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join, relative, basename } from 'path';
import { parseMarkdown } from '../core/markdown-parser.js';
import { loadConfig } from '../core/config.js';
import { loadLanguagePack, supportedLanguages } from '../core/language.js';
import { runDorChecks } from '../core/dor-runner.js';
import { runDod } from './dod.js';
import { runValidateStructure } from './validate-structure.js';
import { runValidateFormat } from './validate-format.js';
import { checkLinkTargets } from './check-orphans.js';
import { renderViolations } from '../core/reporter.js';
import { globalTruthsDir, collectApplicableTruths, docLevelFromFilename, validateTruthSession, } from '../core/truth-checker.js';
// ─── File classification ───────────────────────────────────────────────────────
function isImplMd(f) {
    return /^taproot[/\\].+[/\\]impl\.md$/.test(f);
}
function isGlobalTruth(f) {
    return f.startsWith('taproot/global-truths/') || f.startsWith('taproot\\global-truths\\');
}
function isHierarchyFile(f) {
    if (f.startsWith('taproot/agent/') || f.startsWith('taproot\\agent\\'))
        return false;
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
function getNewlyAddedFiles(cwd) {
    const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=A'], {
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
/** Resolve the localised heading for a given English key from the pack. */
function localizedHeading(englishKey, pack) {
    if (!pack)
        return englishKey;
    return pack[englishKey] ?? englishKey;
}
/** Walk up from a staged usecase.md path to find the nearest ancestor intent.md within taproot/. */
export function findParentIntentPath(usecasePath, cwd) {
    const normalized = usecasePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    // Remove the filename (usecase.md)
    parts.pop();
    while (parts.length > 0 && parts[0] === 'taproot') {
        const candidate = [...parts, 'intent.md'].join('/');
        if (existsSync(join(cwd, candidate)))
            return candidate;
        parts.pop();
    }
    return null;
}
export function checkBehaviourIntentAlignment(usecasePath, intentPath, intentContent, pack = null) {
    const failures = [];
    if (intentPath === null) {
        failures.push({
            file: usecasePath,
            message: 'No parent `intent.md` found',
            hint: `No parent \`intent.md\` found for \`${usecasePath}\` — place this behaviour under an intent folder or create the intent first`,
        });
        return failures;
    }
    if (intentContent === null) {
        // Intent found on disk but unreadable — skip rather than false-block
        return failures;
    }
    const goalHeading = localizedHeading('Goal', pack);
    const goalBody = getSection(intentContent, goalHeading);
    if (goalBody === null) {
        failures.push({
            file: usecasePath,
            message: `Parent intent at \`${intentPath}\` is missing a \`## ${goalHeading}\` section`,
            hint: `Add a \`## ${goalHeading}\` section to \`${intentPath}\` before committing a behaviour under it`,
        });
    }
    else if (goalBody.trim().length === 0) {
        failures.push({
            file: usecasePath,
            message: `Parent intent at \`${intentPath}\` has an empty \`## ${goalHeading}\``,
            hint: `Fill in the \`## ${goalHeading}\` section in \`${intentPath}\` before committing a behaviour under it`,
        });
    }
    return failures;
}
export function checkUsecaseQuality(filePath, content, pack = null) {
    const failures = [];
    const acHeading = localizedHeading('Acceptance Criteria', pack);
    const actorHeading = localizedHeading('Actor', pack);
    const postHeading = localizedHeading('Postconditions', pack);
    // AC section present with AC-N: entry
    const acPattern = new RegExp(`^## ${acHeading}`, 'm');
    if (!acPattern.test(content)) {
        failures.push({
            file: filePath,
            message: `Missing \`## ${acHeading}\` section`,
            hint: `Add an \`## ${acHeading}\` section with at least one \`AC-1:\` Gherkin scenario before committing`,
        });
    }
    else if (!/\*\*AC-\d+:/m.test(content)) {
        failures.push({
            file: filePath,
            message: `\`## ${acHeading}\` section has no AC-N: entries`,
            hint: "Add at least one `**AC-1:**` entry with a Given/When/Then scenario",
        });
    }
    // Actor section: must not describe an implementation mechanism
    const actorBody = getSection(content, actorHeading);
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
    const postBody = getSection(content, postHeading);
    if (postBody === null || postBody.trim().length === 0) {
        failures.push({
            file: filePath,
            message: `Missing or empty \`## ${postHeading}\` section`,
            hint: `Add a \`## ${postHeading}\` section describing what is true after the flow succeeds`,
        });
    }
    // Main Flow: must not contain implementation terms (SQL, HTTP, REST, endpoint, etc.)
    const mainFlowHeading = localizedHeading('Main Flow', pack);
    const mainFlowBody = getSection(content, mainFlowHeading);
    if (mainFlowBody !== null && !pack) {
        const lines = mainFlowBody.split('\n').filter(l => /^\s*\d+\./.test(l));
        for (const line of lines) {
            if (TECH_KEYWORDS.test(line)) {
                const match = line.match(TECH_KEYWORDS)?.[0] ?? '';
                failures.push({
                    file: filePath,
                    message: `Main Flow step contains implementation term: "${match}" — use actor-visible language instead`,
                    hint: "Main Flow steps describe what the actor sees or the system produces — not internal mechanisms. Move SQL, HTTP, endpoint, and service-layer terms to impl.md.",
                });
                break; // one failure is enough to communicate the issue
            }
        }
    }
    return failures;
}
export function checkIntentQuality(filePath, content, pack = null) {
    const failures = [];
    const goalHeading = localizedHeading('Goal', pack);
    const stakeHeading = localizedHeading('Stakeholders', pack);
    const scHeading = localizedHeading('Success Criteria', pack);
    // Goal section: present, starts with a verb
    const goalBody = getSection(content, goalHeading);
    if (goalBody === null || goalBody.trim().length === 0) {
        failures.push({
            file: filePath,
            message: `Missing or empty \`## ${goalHeading}\` section`,
            hint: `Add a \`## ${goalHeading}\` section starting with a verb describing a business outcome — e.g. 'Enable users to...', 'Allow operators to...'`,
        });
    }
    else {
        const firstLine = goalBody.trim().split('\n')[0].trim();
        if (!pack && !VERB_STARTS.test(firstLine)) {
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
    const stakeBody = getSection(content, stakeHeading);
    if (stakeBody === null || stakeBody.trim().length === 0) {
        failures.push({
            file: filePath,
            message: `Missing or empty \`## ${stakeHeading}\` section`,
            hint: `Add a \`## ${stakeHeading}\` section with at least one stakeholder and their perspective`,
        });
    }
    // Success Criteria section: present and non-empty
    const scBody = getSection(content, scHeading);
    if (scBody === null || scBody.trim().length === 0) {
        failures.push({
            file: filePath,
            message: `Missing or empty \`## ${scHeading}\` section`,
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
// ─── Impl state helpers ───────────────────────────────────────────────────────
/** Read the **State:** value from an impl.md file on disk. Returns empty string if unreadable. */
function getImplState(implFullPath) {
    try {
        const content = readFileSync(implFullPath, 'utf-8');
        const match = content.match(/\*\*State:\*\*\s*(\S+)/);
        return match?.[1] ?? '';
    }
    catch {
        return '';
    }
}
// ─── Status-only change check ─────────────────────────────────────────────────
function checkStatusOnly(implRelPath, cwd) {
    // New file in HEAD? (skip check if it's a rename — R status in diff)
    const head = spawnSync('git', ['show', `HEAD:${implRelPath}`], { cwd, encoding: 'utf-8' });
    if (head.status !== 0) {
        const diffStatus = spawnSync('git', ['diff', '--cached', '--name-status'], { cwd, encoding: 'utf-8' });
        const isRename = diffStatus.stdout.split('\n').some(line => /^R\d*\t.*\t/.test(line) && line.endsWith(`\t${implRelPath}`));
        if (isRename)
            return { passed: true, message: '' };
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
    // Load language pack if configured
    const { config } = loadConfig(cwd);
    let pack = null;
    if (config.language) {
        pack = loadLanguagePack(config.language);
        if (!pack) {
            process.stderr.write(`Warning: Language pack '${config.language}' could not be loaded — falling back to English. ` +
                `Supported: ${supportedLanguages().join(', ')}. Check your taproot installation.\n`);
        }
    }
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
        // Proposed-state gate: block newly added usecase.md files in 'proposed' state
        const newlyAdded = getNewlyAddedFiles(cwd);
        for (const f of newlyAdded) {
            if (!f.endsWith('usecase.md') || !isHierarchyFile(f))
                continue;
            const content = getStagedContent(f, cwd);
            if (!content)
                continue;
            if (/\*\*State:\*\*\s*proposed/.test(content)) {
                process.stdout.write(`taproot commithook — Spec confirmation required: ${f} is in 'proposed' state\n` +
                    `  → Show the spec to the developer and wait for [Y] before committing.\n` +
                    `    On confirmation, change **State:** from 'proposed' to 'specified' in the ## Status section.\n`);
                failed = true;
            }
        }
        // Spec quality checks for usecase.md and intent.md files
        const specFailures = [];
        for (const f of staged) {
            if (!isHierarchyFile(f) || isGlobalTruth(f))
                continue;
            const content = getStagedContent(f, cwd);
            if (!content)
                continue;
            if (f.endsWith('usecase.md')) {
                specFailures.push(...checkUsecaseQuality(f, content, pack));
                const intentPath = findParentIntentPath(f, cwd);
                let intentContent = null;
                if (intentPath !== null) {
                    intentContent = getStagedContent(intentPath, cwd);
                    if (intentContent === null) {
                        try {
                            intentContent = readFileSync(join(cwd, intentPath), 'utf-8');
                        }
                        catch { /* unreadable */ }
                    }
                }
                specFailures.push(...checkBehaviourIntentAlignment(f, intentPath, intentContent, pack));
            }
            else if (f.endsWith('intent.md')) {
                specFailures.push(...checkIntentQuality(f, content, pack));
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
            // If impl.md is not staged, only require co-staging for non-complete, non-deferred impls
            if (!staged.includes(implFile)) {
                const implState = getImplState(join(cwd, implFile));
                if (implState === 'complete' || implState === 'deferred')
                    continue;
                process.stdout.write(`taproot commithook — Implementation commit: Stage \`${implFile}\` alongside your source files. No implementation commit should proceed without its traceability record.\n`);
                failed = true;
                continue;
            }
            // Deferred impls: skip DoD — they are intentionally punted
            if (getImplState(join(cwd, implFile)) === 'deferred')
                continue;
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
    // ─── Unified truth session check (all commit levels) ───────────────────────
    // Runs once after all tier checks, covering hierarchy docs AND impl-level files.
    // truth-sign produces one session hash for the same set — this validation matches it.
    if (globalTruthsDir(cwd)) {
        const allTruths = new Map();
        const allDocContents = [];
        const unreadableWarnings = [];
        // Hierarchy docs: intent.md, usecase.md — collect truths by their level
        for (const f of staged) {
            if (!isHierarchyFile(f) || isImplMd(f) || isGlobalTruth(f))
                continue;
            const level = docLevelFromFilename(basename(f));
            if (!level)
                continue;
            const content = getStagedContent(f, cwd) ?? '';
            allDocContents.push({ path: f, content });
            for (const t of collectApplicableTruths(cwd, level)) {
                if (t.unreadable) {
                    if (!unreadableWarnings.includes(t.relPath))
                        unreadableWarnings.push(t.relPath);
                }
                else {
                    allTruths.set(t.relPath, t);
                }
            }
        }
        // Impl-level: staged impl.md files + staged source files (non-taproot)
        const stagedImplMds = staged.filter(f => isHierarchyFile(f) && isImplMd(f) && !isGlobalTruth(f));
        const stagedSourceFiles = staged.filter(f => !f.startsWith('taproot/') && !f.startsWith('.taproot/'));
        if (stagedImplMds.length > 0 || stagedSourceFiles.length > 0) {
            for (const f of stagedImplMds) {
                const content = getStagedContent(f, cwd) ?? '';
                allDocContents.push({ path: f, content });
            }
            if (stagedSourceFiles.length > 0) {
                // Use sorted path list as identity anchor — content changes don't retrigger signing
                allDocContents.push({
                    path: '__impl_sources__',
                    content: [...stagedSourceFiles].sort().join('\n'),
                });
            }
            for (const t of collectApplicableTruths(cwd, 'impl')) {
                if (t.unreadable) {
                    if (!unreadableWarnings.includes(t.relPath))
                        unreadableWarnings.push(t.relPath);
                }
                else {
                    allTruths.set(t.relPath, t);
                }
            }
        }
        for (const relPath of unreadableWarnings) {
            process.stdout.write(`  ⚠ ${relPath} could not be read — truth check skipped for this file.\n`);
        }
        if (allDocContents.length > 0 && allTruths.size > 0) {
            const validation = validateTruthSession(cwd, allDocContents, [...allTruths.values()]);
            if (!validation.valid) {
                process.stdout.write(`taproot commithook — Truth check: ${validation.reason}\n`);
                failed = true;
            }
        }
    }
    // Link validation — runs on every commit that touches taproot/ or link files
    const { config: linkConfig } = loadConfig(cwd);
    const linkWarnOnly = linkConfig['linkValidation'] === 'warn-only';
    const linkViolations = checkLinkTargets(resolve(cwd, linkConfig.root ?? 'taproot/specs/'), cwd);
    const linkErrors = linkViolations.filter(v => v.type === 'error' && v.code !== 'LINK_VALIDATION_SKIPPED');
    if (linkErrors.length > 0) {
        process.stdout.write('taproot commithook — Link validation:\n');
        process.stdout.write(renderViolations(linkErrors));
        if (!linkWarnOnly) {
            failed = true;
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