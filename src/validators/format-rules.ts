import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import type { ParsedMarkdown, MarkerType, TaprootConfig, Violation, FolderNode } from './types.js';

const REQUIRED_SECTIONS: Record<MarkerType, string[]> = {
  intent: ['stakeholders', 'goal', 'success criteria', 'status'],
  behaviour: ['actor', 'preconditions', 'main flow', 'postconditions', 'status'],
  impl: ['behaviour', 'commits', 'tests', 'status'],
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATE_LINE = /^\s*[-*]?\s*\*\*State:\*\*\s*(.+)$/m;
const DATE_LINE = /^\s*[-*]?\s*\*\*(?:Created|Last reviewed|Last verified):\*\*\s*(.+)$/gm;

export function checkRequiredSections(
  doc: ParsedMarkdown,
  markerType: MarkerType
): Violation[] {
  const required = REQUIRED_SECTIONS[markerType];
  return required
    .filter(section => !doc.sections.has(section))
    .map(section => ({
      type: 'error' as const,
      filePath: doc.filePath,
      code: 'MISSING_SECTION',
      message: `Required section "## ${titleCase(section)}" is missing`,
    }));
}

export function checkStatusValue(
  doc: ParsedMarkdown,
  markerType: MarkerType,
  config: TaprootConfig
): Violation[] {
  if (!config.validation.requireStatus) return [];

  const statusSection = doc.sections.get('status');
  if (!statusSection) return []; // Caught by checkRequiredSections

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

  const allowed =
    markerType === 'intent' ? config.validation.allowedIntentStates :
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

export function checkDateFormat(
  doc: ParsedMarkdown,
  config: TaprootConfig
): Violation[] {
  if (!config.validation.requireDates) return [];

  const statusSection = doc.sections.get('status');
  if (!statusSection) return [];

  const violations: Violation[] = [];
  let match: RegExpExecArray | null;

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

export function checkBehaviourReference(
  doc: ParsedMarkdown,
  implFilePath: string
): Violation[] {
  const behaviourSection = doc.sections.get('behaviour');
  if (!behaviourSection) return []; // Caught by checkRequiredSections

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

export function checkDiagramSection(
  doc: ParsedMarkdown,
): Violation[] {
  const diagramSection = doc.sections.get('diagram');
  if (!diagramSection) return [];

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

export function checkLinkSection(
  doc: ParsedMarkdown,
  node: FolderNode,
): Violation[] {
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

function findSectionByPrefix(doc: ParsedMarkdown, prefix: string): import('./types.js').SectionContent | undefined {
  for (const [key, value] of doc.sections) {
    if (key === prefix || key.startsWith(prefix + ' ')) return value;
  }
  return undefined;
}

function checkManagedSection(
  doc: ParsedMarkdown,
  sectionKey: string,
  sectionTitle: string,
  hasChildren: boolean,
): Violation[] {
  const violations: Violation[] = [];
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

  if (!section) return [];

  const linkPattern = /\[.*?\]\((.+?)\)/g;
  let m: RegExpExecArray | null;
  while ((m = linkPattern.exec(section.rawBody)) !== null) {
    const linkTarget = m[1]!;
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

export function checkAcceptanceCriteria(
  doc: ParsedMarkdown,
  node: FolderNode,
): Violation[] {
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

  if (!criteriaSection) return [];

  const violations: Violation[] = [];
  const idPattern = /^\*\*(AC|NFR)-(\d+):/gm;
  const seen = new Set<string>();
  let m: RegExpExecArray | null;

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

export function validateFormat(
  doc: ParsedMarkdown,
  markerType: MarkerType,
  config: TaprootConfig,
  node?: FolderNode,
): Violation[] {
  const violations: Violation[] = [];
  violations.push(...checkRequiredSections(doc, markerType));
  violations.push(...checkStatusValue(doc, markerType, config));
  violations.push(...checkDateFormat(doc, config));
  if (markerType === 'impl') {
    violations.push(...checkBehaviourReference(doc, doc.filePath));
  }
  if (markerType === 'behaviour') {
    violations.push(...checkDiagramSection(doc));
    if (node) violations.push(...checkAcceptanceCriteria(doc, node));
  }
  if (node) {
    violations.push(...checkLinkSection(doc, node));
  }
  return violations;
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}
