import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { getLocalizedRequiredSections } from '../core/language.js';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATE_LINE = /^\s*[-*]?\s*\*\*State:\*\*\s*(.+)$/m;
const DATE_LINE = /^\s*[-*]?\s*\*\*(?:Created|Last reviewed|Last verified):\*\*\s*(.+)$/gm;
export function checkRequiredSections(doc, markerType, pack) {
    const required = getLocalizedRequiredSections(markerType, pack ?? null);
    return required
        .filter(section => !doc.sections.has(section))
        .map(section => ({
        type: 'error',
        filePath: doc.filePath,
        code: 'MISSING_SECTION',
        message: `Required section "## ${titleCase(section)}" is missing`,
    }));
}
export function checkStatusValue(doc, markerType, config) {
    if (!config.validation.requireStatus)
        return [];
    const statusSection = doc.sections.get('status');
    if (!statusSection)
        return []; // Caught by checkRequiredSections
    const match = STATE_LINE.exec(statusSection.rawBody);
    if (!match) {
        return [{
                type: 'error',
                filePath: doc.filePath,
                line: statusSection.startLine,
                code: 'MISSING_STATE_LINE',
                message: 'Status section is missing the "**State:**" line',
            }];
    }
    const value = (match[1] ?? '').trim();
    if (markerType === 'intent' && value === 'deferred') {
        const bodyLines = statusSection.bodyLines;
        const stateLine = bodyLines.findIndex(l => /\*\*State:\*\*/.test(l));
        const lineNumber = statusSection.startLine + (stateLine >= 0 ? stateLine + 1 : 0);
        return [{
                type: 'error',
                filePath: doc.filePath,
                line: lineNumber,
                code: 'INVALID_STATUS_VALUE',
                message: 'deferred is not a valid state for intent.md — use deprecated instead',
            }];
    }
    const allowed = markerType === 'intent' ? config.validation.allowedIntentStates :
        markerType === 'behaviour' ? config.validation.allowedBehaviourStates :
            config.validation.allowedImplStates;
    if (!allowed.includes(value)) {
        const bodyLines = statusSection.bodyLines;
        const stateLine = bodyLines.findIndex(l => /\*\*State:\*\*/.test(l));
        const lineNumber = statusSection.startLine + (stateLine >= 0 ? stateLine + 1 : 0);
        return [{
                type: 'error',
                filePath: doc.filePath,
                line: lineNumber,
                code: 'INVALID_STATUS_VALUE',
                message: `Invalid state "${value}" for ${markerType}. Allowed: ${allowed.join(', ')}`,
            }];
    }
    return [];
}
export function checkDateFormat(doc, config) {
    if (!config.validation.requireDates)
        return [];
    const statusSection = doc.sections.get('status');
    if (!statusSection)
        return [];
    const violations = [];
    let match;
    const regex = new RegExp(DATE_LINE.source, 'gm');
    while ((match = regex.exec(statusSection.rawBody)) !== null) {
        const value = (match[1] ?? '').trim();
        if (!ISO_DATE.test(value)) {
            const matchLine = statusSection.rawBody
                .substring(0, match.index)
                .split('\n').length;
            violations.push({
                type: 'error',
                filePath: doc.filePath,
                line: statusSection.startLine + matchLine,
                code: 'INVALID_DATE_FORMAT',
                message: `Date "${value}" is not in ISO 8601 format (YYYY-MM-DD)`,
            });
        }
    }
    return violations;
}
export function checkBehaviourReference(doc, implFilePath) {
    const behaviourSection = doc.sections.get('behaviour');
    if (!behaviourSection)
        return []; // Caught by checkRequiredSections
    const refLine = behaviourSection.bodyLines.find(l => l.trim().length > 0);
    if (!refLine) {
        return [{
                type: 'error',
                filePath: doc.filePath,
                line: behaviourSection.startLine + 1,
                code: 'MISSING_BEHAVIOUR_REFERENCE',
                message: 'Behaviour section is empty — expected a relative path to usecase.md',
            }];
    }
    const ref = refLine.trim();
    const resolvedPath = resolve(dirname(implFilePath), ref);
    if (!existsSync(resolvedPath)) {
        const lineNumber = behaviourSection.startLine +
            behaviourSection.bodyLines.indexOf(refLine) + 1;
        return [{
                type: 'error',
                filePath: doc.filePath,
                line: lineNumber,
                code: 'INVALID_BEHAVIOUR_REFERENCE',
                message: `Behaviour reference "${ref}" does not resolve to an existing file`,
            }];
    }
    return [];
}
export function checkDiagramSection(doc) {
    const diagramSection = doc.sections.get('diagram');
    if (!diagramSection)
        return [];
    const hasMermaidFence = /```mermaid/i.test(diagramSection.rawBody);
    if (!hasMermaidFence) {
        return [{
                type: 'warning',
                filePath: doc.filePath,
                line: diagramSection.startLine,
                code: 'DIAGRAM_MISSING_MERMAID_FENCE',
                message: 'Diagram section exists but contains no mermaid code fence (```mermaid)',
            }];
    }
    return [];
}
export function checkLinkSection(doc, node) {
    if (node.marker === 'intent') {
        const hasBehaviourChildren = node.children.some(c => c.marker === 'behaviour');
        return checkManagedSection(doc, 'behaviours', 'Behaviours', hasBehaviourChildren);
    }
    if (node.marker === 'behaviour') {
        const hasImplChildren = node.children.some(c => c.marker === 'impl');
        return checkManagedSection(doc, 'implementations', 'Implementations', hasImplChildren);
    }
    return [];
}
function findSectionByPrefix(doc, prefix) {
    for (const [key, value] of doc.sections) {
        if (key === prefix || key.startsWith(prefix + ' '))
            return value;
    }
    return undefined;
}
function checkManagedSection(doc, sectionKey, sectionTitle, hasChildren) {
    const violations = [];
    const section = findSectionByPrefix(doc, sectionKey);
    if (hasChildren && !section) {
        violations.push({
            type: 'error',
            filePath: doc.filePath,
            code: 'MISSING_LINK_SECTION',
            message: `Missing "## ${sectionTitle}" section — run \`taproot update\` to generate it`,
        });
        return violations;
    }
    if (!section)
        return [];
    const linkPattern = /\[.*?\]\((.+?)\)/g;
    let m;
    while ((m = linkPattern.exec(section.rawBody)) !== null) {
        const linkTarget = m[1];
        const resolved = resolve(dirname(doc.filePath), linkTarget);
        if (!existsSync(resolved)) {
            violations.push({
                type: 'error',
                filePath: doc.filePath,
                code: 'STALE_LINK',
                message: `STALE_LINK — link in ## ${sectionTitle} points to non-existent file: ${linkTarget}`,
            });
        }
    }
    return violations;
}
export function checkAcceptanceCriteria(doc, node) {
    const hasImplChildren = node.children.some(c => c.marker === 'impl');
    const criteriaSection = doc.sections.get('acceptance criteria');
    if (hasImplChildren && !criteriaSection) {
        return [{
                type: 'warning',
                filePath: doc.filePath,
                code: 'MISSING_ACCEPTANCE_CRITERIA',
                message: 'usecase.md has implementations but no "## Acceptance Criteria" section',
            }];
    }
    if (!criteriaSection)
        return [];
    const violations = [];
    const idPattern = /^\*\*(AC|NFR)-(\d+):/gm;
    const seen = new Set();
    let m;
    while ((m = idPattern.exec(criteriaSection.rawBody)) !== null) {
        const id = `${m[1]}-${m[2]}`;
        if (seen.has(id)) {
            const linesBefore = criteriaSection.rawBody.substring(0, m.index).split('\n').length;
            violations.push({
                type: 'error',
                filePath: doc.filePath,
                line: criteriaSection.startLine + linesBefore,
                code: 'DUPLICATE_CRITERION_ID',
                message: `Duplicate acceptance criterion ID "${id}" — each AC-N / NFR-N must be unique within the file`,
            });
        }
        seen.add(id);
    }
    return violations;
}
export function validateFormat(doc, markerType, config, node, pack) {
    const violations = [];
    violations.push(...checkRequiredSections(doc, markerType, pack));
    violations.push(...checkStatusValue(doc, markerType, config));
    violations.push(...checkDateFormat(doc, config));
    if (markerType === 'impl') {
        violations.push(...checkBehaviourReference(doc, doc.filePath));
    }
    if (markerType === 'behaviour') {
        violations.push(...checkDiagramSection(doc));
        if (node)
            violations.push(...checkAcceptanceCriteria(doc, node));
    }
    if (node) {
        violations.push(...checkLinkSection(doc, node));
    }
    return violations;
}
function titleCase(s) {
    return s.replace(/\b\w/g, c => c.toUpperCase());
}
//# sourceMappingURL=format-rules.js.map