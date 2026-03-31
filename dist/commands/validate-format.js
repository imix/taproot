import { resolve, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { loadConfig } from '../core/config.js';
import { loadLanguagePack, supportedLanguages } from '../core/language.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';
import { validateFormat } from '../validators/format-rules.js';
import { renderViolations, exitCode } from '../core/reporter.js';
import { SECTION_PLACEHOLDERS } from '../templates/index.js';
import { findLinkFiles, parseLinkFile } from '../core/link-parser.js';
const VALID_LINK_TYPES = new Set(['intent', 'behaviour', 'truth']);
const MARKER_FILE = {
    intent: 'intent.md',
    behaviour: 'usecase.md',
    impl: 'impl.md',
};
export function registerValidateFormat(program) {
    program
        .command('validate-format')
        .description('Validate marker file contents against their schemas')
        .option('--path <path>', 'Root path to validate (overrides config)')
        .option('--fix', 'Add missing section headers with placeholder content')
        .action(async (options) => {
        const violations = await runValidateFormat({
            path: options.path,
            fix: options.fix ?? false,
        });
        process.stdout.write(renderViolations(violations));
        process.exit(exitCode(violations));
    });
}
export async function runValidateFormat(options) {
    const { config, configDir } = loadConfig(options.cwd);
    const rootPath = options.path
        ? resolve(options.path)
        : config.root.startsWith('/') ? config.root : resolve(configDir, config.root);
    // Load language pack if configured
    let pack = null;
    if (config.language) {
        pack = loadLanguagePack(config.language);
        if (!pack) {
            process.stderr.write(`Warning: Language pack '${config.language}' could not be loaded — falling back to English. ` +
                `Supported: ${supportedLanguages().join(', ')}. Check your taproot installation.\n`);
        }
    }
    const tree = walkHierarchy(rootPath);
    const nodes = flattenTree(tree).filter((n) => n.marker !== null);
    const violations = [];
    for (const node of nodes) {
        const markerFile = MARKER_FILE[node.marker];
        const filePath = join(node.absolutePath, markerFile);
        let content;
        try {
            content = readFileSync(filePath, 'utf-8');
        }
        catch {
            violations.push({
                type: 'error',
                filePath,
                code: 'UNREADABLE_FILE',
                message: `Could not read file: ${filePath}`,
            });
            continue;
        }
        const parsed = parseMarkdown(filePath, content);
        const nodeViolations = validateFormat(parsed, node.marker, config, node, pack);
        if (options.fix && nodeViolations.some(v => v.code === 'MISSING_SECTION')) {
            const fixed = applyFix(content, parsed, node.marker);
            writeFileSync(filePath, fixed, 'utf-8');
            // Re-parse and re-validate after fix
            const reparsed = parseMarkdown(filePath, fixed);
            violations.push(...validateFormat(reparsed, node.marker, config, node));
        }
        else {
            violations.push(...nodeViolations);
        }
    }
    // Link file format validation
    violations.push(...validateLinkFiles(rootPath));
    return violations;
}
function validateLinkFiles(rootPath) {
    const violations = [];
    const linkFiles = findLinkFiles(rootPath);
    for (const filePath of linkFiles) {
        let content;
        try {
            content = readFileSync(filePath, 'utf-8');
        }
        catch {
            violations.push({ type: 'error', filePath, code: 'UNREADABLE_FILE', message: 'Could not read link file' });
            continue;
        }
        const parsed = parseLinkFile(content);
        const missingFields = [];
        if (!parsed.repo)
            missingFields.push('Repo');
        if (!parsed.path)
            missingFields.push('Path');
        if (!parsed.type)
            missingFields.push('Type');
        if (missingFields.length > 0) {
            violations.push({
                type: 'error',
                filePath,
                code: 'LINK_MISSING_FIELD',
                message: `Link file missing required field(s): ${missingFields.join(', ')}. Required: **Repo:**, **Path:**, **Type:**`,
            });
        }
        else if (!VALID_LINK_TYPES.has(parsed.type)) {
            violations.push({
                type: 'error',
                filePath,
                code: 'LINK_INVALID_TYPE',
                message: `Invalid **Type:** value "${parsed.type}" — must be one of: intent, behaviour, truth`,
            });
        }
    }
    return violations;
}
function applyFix(content, parsed, markerType) {
    const placeholders = SECTION_PLACEHOLDERS[markerType] ?? {};
    const required = markerType === 'intent' ? ['stakeholders', 'goal', 'success criteria', 'status'] :
        markerType === 'behaviour' ? ['actor', 'preconditions', 'main flow', 'postconditions', 'status'] :
            ['behaviour', 'commits', 'tests', 'status'];
    const missing = required.filter(s => !parsed.sections.has(s));
    if (missing.length === 0)
        return content;
    const additions = missing.map(section => {
        const placeholder = placeholders[section] ?? '<placeholder>';
        const heading = section.replace(/\b\w/g, c => c.toUpperCase());
        return `\n## ${heading}\n${placeholder}\n`;
    });
    return content.trimEnd() + '\n' + additions.join('');
}
//# sourceMappingURL=validate-format.js.map