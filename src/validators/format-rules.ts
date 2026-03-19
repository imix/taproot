import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import type { ParsedMarkdown, MarkerType, TaprootConfig, Violation } from './types.js';

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

export function validateFormat(
  doc: ParsedMarkdown,
  markerType: MarkerType,
  config: TaprootConfig
): Violation[] {
  const violations: Violation[] = [];
  violations.push(...checkRequiredSections(doc, markerType));
  violations.push(...checkStatusValue(doc, markerType, config));
  violations.push(...checkDateFormat(doc, config));
  if (markerType === 'impl') {
    violations.push(...checkBehaviourReference(doc, doc.filePath));
  }
  return violations;
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}
