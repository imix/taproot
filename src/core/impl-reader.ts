import type { ParsedMarkdown } from '../validators/types.js';

export interface ImplData {
  behaviourRef: string | null;
  sourceFiles: string[];   // file paths extracted from Source Files section
  commits: string[];       // commit hashes extracted from Commits section
  testFiles: string[];     // file paths extracted from Tests section
}

/** Extract a backtick-quoted value from a list item line: `- \`value\` — ...` */
function extractBacktickValues(lines: string[]): string[] {
  const result: string[] = [];
  for (const line of lines) {
    const match = /`([^`]+)`/.exec(line);
    if (match?.[1]) result.push(match[1]);
  }
  return result;
}

/** Extract commit hashes — 6-64 hex chars from backtick-quoted items */
function extractCommitHashes(lines: string[]): string[] {
  return extractBacktickValues(lines).filter(v => /^[0-9a-f]{6,64}$/i.test(v));
}

export function parseImplData(doc: ParsedMarkdown): ImplData {
  const behaviourSection = doc.sections.get('behaviour');
  const sourceSection = doc.sections.get('source files');
  const commitsSection = doc.sections.get('commits');
  const testsSection = doc.sections.get('tests');

  // Behaviour ref: first non-empty line of the Behaviour section
  const behaviourRef = behaviourSection?.bodyLines
    .map(l => l.trim())
    .find(l => l.length > 0) ?? null;

  return {
    behaviourRef,
    sourceFiles: extractBacktickValues(sourceSection?.bodyLines ?? []),
    commits: extractCommitHashes(commitsSection?.bodyLines ?? []),
    testFiles: extractBacktickValues(testsSection?.bodyLines ?? []),
  };
}
