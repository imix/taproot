import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve, relative, basename } from 'path';
import { loadConfig } from '../core/config.js';
import { walkHierarchy } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';
import { parseImplData } from '../core/impl-reader.js';
import { parseLinkFile, loadReposYaml, resolveLinkTarget } from '../core/link-parser.js';
export function registerCoverage(program) {
    program
        .command('coverage')
        .description('Generate a completeness summary of the hierarchy')
        .option('--path <path>', 'Root path (overrides config)')
        .option('--format <format>', 'Output format: tree, json, markdown, context', 'tree')
        .option('--show-incomplete', 'List implementations that are not complete or deferred; exits non-zero if any found')
        .action(async (options) => {
        const { config, configDir } = loadConfig();
        const rootPath = options.path ? resolve(options.path) : config.root;
        const report = await runCoverage({ path: rootPath });
        if (options.showIncomplete) {
            const incomplete = collectIncomplete(report);
            if (incomplete.length === 0) {
                process.stdout.write(`${report.totals.completeImpls}/${report.totals.implementations} implementations complete\n`);
                process.exitCode = 0;
            }
            else {
                for (const { path, state } of incomplete) {
                    process.stdout.write(`${path}  (${state})\n`);
                }
                process.exitCode = 1;
            }
            return;
        }
        const format = (options.format ?? 'tree');
        if (format === 'context') {
            const contextPath = join(rootPath, 'CONTEXT.md');
            const content = formatContext(report, contextPath);
            writeFileSync(contextPath, content, 'utf-8');
            process.stdout.write(`CONTEXT.md updated at ${contextPath}\n`);
        }
        else {
            process.stdout.write(formatReport(report, format));
        }
    });
}
export async function runCoverage(options) {
    const { config, configDir } = loadConfig(options.cwd);
    const rootPath = options.path ? resolve(options.path) : config.root;
    const reposMap = loadReposYaml(configDir);
    const tree = walkHierarchy(rootPath);
    const intents = [];
    for (const child of tree.children) {
        if (child.marker === 'intent') {
            intents.push(buildIntentSummary(child, rootPath, reposMap));
        }
    }
    // Compute totals
    let behaviourCount = 0;
    let implCount = 0;
    let completeCount = 0;
    let testedCount = 0;
    let deferredBehaviourCount = 0;
    let deferredImplCount = 0;
    let linkedIntentCount = 0;
    function countBehaviour(b) {
        if (b.state === 'deferred') {
            deferredBehaviourCount++;
        }
        else {
            behaviourCount++;
        }
        for (const impl of b.implementations) {
            if (impl.state === 'deferred') {
                deferredImplCount++;
            }
            else {
                implCount++;
                if (impl.state === 'complete' || impl.state === 'delegated')
                    completeCount++;
                if (impl.testCount > 0)
                    testedCount++;
            }
        }
        // Count linked behaviour/truth items toward impl totals
        for (const linked of b.linkedItems) {
            if (linked.linkType === 'intent')
                continue;
            behaviourCount++;
            if (linked.implState !== 'gap') {
                implCount++;
                if (linked.implState === 'complete')
                    completeCount++;
            }
        }
        for (const sub of b.subBehaviours)
            countBehaviour(sub);
    }
    for (const intent of intents) {
        for (const b of intent.behaviours)
            countBehaviour(b);
        for (const linked of intent.linkedItems) {
            if (linked.linkType === 'intent')
                linkedIntentCount++;
        }
    }
    return {
        intents,
        totals: {
            intents: intents.length,
            behaviours: behaviourCount,
            implementations: implCount,
            completeImpls: completeCount,
            testedImpls: testedCount,
            deferredBehaviours: deferredBehaviourCount,
            deferredImpls: deferredImplCount,
            linkedIntents: linkedIntentCount,
        },
    };
}
function readState(node, markerFile) {
    try {
        const content = readFileSync(join(node.absolutePath, markerFile), 'utf-8');
        const doc = parseMarkdown(join(node.absolutePath, markerFile), content);
        const statusSection = doc.sections.get('status');
        if (!statusSection)
            return 'unknown';
        const match = /\*\*State:\*\*\s*(\S+)/.exec(statusSection.rawBody);
        return match?.[1]?.trim() ?? 'unknown';
    }
    catch {
        return 'unknown';
    }
}
function buildImplSummary(node) {
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
    }
    catch {
        // use defaults
    }
    return { name: node.name, path: node.relativePath, state, commitCount, testCount };
}
function findDirectLinkFiles(folderPath) {
    try {
        return readdirSync(folderPath)
            .filter(f => f === 'link.md' || f.endsWith('-link.md'))
            .map(f => join(folderPath, f));
    }
    catch {
        return [];
    }
}
function checkLinkImplState(linkFilePath, node) {
    const implNodes = node.children.filter(c => c.marker === 'impl');
    for (const implNode of implNodes) {
        const implFilePath = join(implNode.absolutePath, 'impl.md');
        try {
            const content = readFileSync(implFilePath, 'utf-8');
            const doc = parseMarkdown(implFilePath, content);
            const data = parseImplData(doc);
            const mentionsLink = data.sourceFiles.some(sf => {
                try {
                    return resolve(implNode.absolutePath, sf) === linkFilePath;
                }
                catch {
                    return false;
                }
            });
            if (mentionsLink) {
                const statusSection = doc.sections.get('status');
                const stateMatch = statusSection ? /\*\*State:\*\*\s*(\S+)/.exec(statusSection.rawBody) : null;
                const state = stateMatch?.[1]?.trim() ?? 'unknown';
                return state === 'complete' ? 'complete' : 'pending';
            }
        }
        catch {
            // ignore
        }
    }
    return 'gap';
}
function buildLinkedItems(node, rootPath, reposMap) {
    const linkFiles = findDirectLinkFiles(node.absolutePath);
    return linkFiles.map(linkFilePath => {
        let linkType = 'behaviour';
        let warnUnresolvable = false;
        try {
            const content = readFileSync(linkFilePath, 'utf-8');
            const parsed = parseLinkFile(content);
            linkType = parsed.type ?? 'behaviour';
            if (parsed.repo) {
                if (reposMap === null) {
                    warnUnresolvable = true;
                }
                else {
                    const resolved = resolveLinkTarget(parsed.repo, parsed.path ?? '', reposMap);
                    if (!resolved)
                        warnUnresolvable = true;
                }
            }
        }
        catch {
            // use defaults
        }
        const implState = checkLinkImplState(linkFilePath, node);
        return {
            linkFilePath: relative(rootPath, linkFilePath),
            linkType,
            implState,
            warnUnresolvable,
        };
    });
}
function buildBehaviourSummary(node, rootPath, reposMap) {
    const state = readState(node, 'usecase.md');
    const implementations = [];
    const subBehaviours = [];
    for (const child of node.children) {
        if (child.marker === 'impl') {
            implementations.push(buildImplSummary(child));
        }
        else if (child.marker === 'behaviour') {
            subBehaviours.push(buildBehaviourSummary(child, rootPath, reposMap));
        }
    }
    const linkedItems = buildLinkedItems(node, rootPath, reposMap);
    return { name: node.name, path: node.relativePath, state, implementations, subBehaviours, linkedItems };
}
function buildIntentSummary(node, rootPath, reposMap) {
    const state = readState(node, 'intent.md');
    const behaviours = [];
    for (const child of node.children) {
        if (child.marker === 'behaviour') {
            behaviours.push(buildBehaviourSummary(child, rootPath, reposMap));
        }
    }
    const linkedItems = buildLinkedItems(node, rootPath, reposMap);
    return { name: node.name, path: node.relativePath, state, behaviours, linkedItems };
}
// ─── Formatters ──────────────────────────────────────────────────────────────
export function formatReport(report, format) {
    switch (format) {
        case 'json': return JSON.stringify(report, null, 2) + '\n';
        case 'markdown': return formatMarkdown(report);
        default: return formatTree(report);
    }
}
function formatTree(report) {
    const lines = [];
    for (const intent of report.intents) {
        lines.push(`Intent: ${intent.name} [${intent.state}]`);
        const linkedIntent = intent.linkedItems.filter(l => l.linkType === 'intent');
        const bList = intent.behaviours;
        const allChildren = [...bList, ...linkedIntent];
        for (let bi = 0; bi < bList.length; bi++) {
            const isLast = bi === allChildren.length - 1;
            renderBehaviourTree(bList[bi], lines, isLast ? '└─' : '├─', isLast ? '  ' : '│  ');
        }
        for (let li = 0; li < linkedIntent.length; li++) {
            const linked = linkedIntent[li];
            const isLast = bList.length + li === allChildren.length - 1;
            const warn = linked.warnUnresolvable ? ' ⚠ unresolvable' : '';
            lines.push(`  ${isLast ? '└─' : '├─'} [linked intent] ${basename(linked.linkFilePath)}${warn}`);
        }
    }
    lines.push('');
    const t = report.totals;
    lines.push(`${t.intents} intent${t.intents !== 1 ? 's' : ''}, ${t.behaviours} behaviour${t.behaviours !== 1 ? 's' : ''}, ${t.implementations} implementation${t.implementations !== 1 ? 's' : ''}`);
    lines.push(`${t.completeImpls}/${t.implementations} complete, ${t.testedImpls}/${t.implementations} with tests`);
    if (t.linkedIntents > 0) {
        lines.push(`${t.linkedIntents} linked intent${t.linkedIntents !== 1 ? 's' : ''}`);
    }
    lines.push('');
    return lines.join('\n');
}
function renderBehaviourTree(b, lines, prefix, childPrefix) {
    const implTotal = countAllImpls(b);
    const completeImpls = countCompleteImpls(b);
    const bar = progressBar(completeImpls, implTotal);
    lines.push(`  ${prefix} ${b.name} [${b.state}] ${bar} ${completeImpls}/${implTotal} impl`);
    const linkedBehaviour = b.linkedItems.filter(l => l.linkType !== 'intent');
    const allChildren = [...b.implementations, ...b.subBehaviours, ...linkedBehaviour];
    for (let i = 0; i < b.implementations.length; i++) {
        const impl = b.implementations[i];
        const isLast = i === allChildren.length - 1;
        const testWarn = impl.testCount === 0 ? ' ⚠' : '';
        lines.push(`  ${childPrefix}  ${isLast ? '└─' : '├─'} ${impl.name} [${impl.state}, ${impl.commitCount} commit${impl.commitCount !== 1 ? 's' : ''}, ${impl.testCount} test${impl.testCount !== 1 ? 's' : ''}]${testWarn}`);
    }
    for (let i = 0; i < linkedBehaviour.length; i++) {
        const linked = linkedBehaviour[i];
        const offset = b.implementations.length;
        const isLast = offset + i === allChildren.length - 1;
        const warn = linked.warnUnresolvable ? ' ⚠ unresolvable' : '';
        lines.push(`  ${childPrefix}  ${isLast ? '└─' : '├─'} [linked] ${linked.implState} — ${basename(linked.linkFilePath)}${warn}`);
    }
    for (let i = 0; i < b.subBehaviours.length; i++) {
        const sub = b.subBehaviours[i];
        const offset = b.implementations.length + linkedBehaviour.length;
        const isLast = offset + i === allChildren.length - 1;
        renderBehaviourTree(sub, lines, `${childPrefix}  ${isLast ? '└─' : '├─'}`, `${childPrefix}  ${isLast ? '  ' : '│  '}`);
    }
}
function countAllImpls(b) {
    const linkedNonIntent = b.linkedItems.filter(l => l.linkType !== 'intent' && l.implState !== 'gap').length;
    return b.implementations.length + linkedNonIntent + b.subBehaviours.reduce((n, s) => n + countAllImpls(s), 0);
}
function countCompleteImpls(b) {
    const linkedComplete = b.linkedItems.filter(l => l.linkType !== 'intent' && l.implState === 'complete').length;
    return (b.implementations.filter(i => i.state === 'complete').length +
        linkedComplete +
        b.subBehaviours.reduce((n, s) => n + countCompleteImpls(s), 0));
}
function progressBar(done, total, width = 12) {
    if (total === 0)
        return '─'.repeat(width);
    const filled = Math.round((done / total) * width);
    return '█'.repeat(filled) + '─'.repeat(width - filled);
}
function formatMarkdown(report) {
    const lines = ['# Taproot Coverage Report', ''];
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
function renderBehaviourMarkdown(b, lines, heading) {
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
    const linkedBehaviour = b.linkedItems.filter(l => l.linkType !== 'intent');
    if (linkedBehaviour.length > 0) {
        for (const linked of linkedBehaviour) {
            const warn = linked.warnUnresolvable ? ' ⚠️ unresolvable' : '';
            lines.push(`- **[linked]** \`[${linked.implState}]\` — ${basename(linked.linkFilePath)}${warn}`);
        }
        lines.push('');
    }
    const nextHeading = heading.length < 6 ? heading + '#' : heading;
    for (const sub of b.subBehaviours) {
        renderBehaviourMarkdown(sub, lines, nextHeading);
    }
}
// ─── Context format ───────────────────────────────────────────────────────────
export function formatContext(report, outputPath) {
    const now = new Date().toISOString().slice(0, 10);
    const t = report.totals;
    const lines = [];
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
            const b = intent.behaviours[bi];
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
            for (const item of inProgress)
                lines.push(`- \`${item}\``);
            lines.push('');
        }
        if (unimplemented.length > 0) {
            lines.push('**Not yet implemented:**');
            for (const item of unimplemented)
                lines.push(`- \`${item}\``);
            lines.push('');
        }
        if (noTests.length > 0) {
            lines.push('**Missing tests:**');
            for (const item of noTests)
                lines.push(`- \`${item}\``);
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
function renderBehaviourContext(b, lines, prefix, childPrefix) {
    const implTotal = countAllImpls(b);
    const completeImpls = countCompleteImpls(b);
    lines.push(`${prefix} ${b.name}/ [${b.state}] ${completeImpls}/${implTotal} impl`);
    const allChildren = [...b.implementations, ...b.subBehaviours];
    for (let i = 0; i < b.implementations.length; i++) {
        const impl = b.implementations[i];
        const isLast = i === allChildren.length - 1;
        const warn = impl.testCount === 0 ? ' ⚠ no tests' : '';
        lines.push(`${childPrefix}  ${isLast ? '└─' : '├─'} ${impl.name} [${impl.state}]${warn}`);
    }
    for (let i = 0; i < b.subBehaviours.length; i++) {
        const sub = b.subBehaviours[i];
        const offset = b.implementations.length;
        const isLast = offset + i === allChildren.length - 1;
        renderBehaviourContext(sub, lines, `${childPrefix}  ${isLast ? '└─' : '├─'}`, `${childPrefix}  ${isLast ? '  ' : '│ '}`);
    }
}
export function collectIncomplete(report) {
    const items = [];
    function walk(b) {
        for (const impl of b.implementations) {
            if (impl.state !== 'complete' && impl.state !== 'deferred' && impl.state !== 'delegated') {
                items.push({ path: impl.path, state: impl.state });
            }
        }
        for (const sub of b.subBehaviours)
            walk(sub);
    }
    for (const intent of report.intents) {
        for (const b of intent.behaviours)
            walk(b);
    }
    return items;
}
function collectUnimplemented(report) {
    const paths = [];
    function walk(b) {
        if (b.state === 'deferred')
            return;
        if (b.implementations.length === 0 && b.subBehaviours.length === 0) {
            paths.push(b.path);
        }
        for (const sub of b.subBehaviours)
            walk(sub);
    }
    for (const intent of report.intents) {
        for (const b of intent.behaviours)
            walk(b);
    }
    return paths;
}
function collectInProgress(report) {
    const paths = [];
    function walkImpl(impl) {
        if (impl.state === 'in-progress')
            paths.push(impl.path);
    }
    function walk(b) {
        for (const impl of b.implementations)
            walkImpl(impl);
        for (const sub of b.subBehaviours)
            walk(sub);
    }
    for (const intent of report.intents) {
        for (const b of intent.behaviours)
            walk(b);
    }
    return paths;
}
function collectNoTests(report) {
    const paths = [];
    function walk(b) {
        for (const impl of b.implementations) {
            if (impl.testCount === 0 && impl.state === 'complete')
                paths.push(impl.path);
        }
        for (const sub of b.subBehaviours)
            walk(sub);
    }
    for (const intent of report.intents) {
        for (const b of intent.behaviours)
            walk(b);
    }
    return paths;
}
function groupBy(arr, key) {
    const result = {};
    for (const item of arr) {
        const k = key(item);
        const list = result[k] ?? [];
        list.push(item);
        result[k] = list;
    }
    return result;
}
//# sourceMappingURL=coverage.js.map