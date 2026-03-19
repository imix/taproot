import { resolve, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import type { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';
import { validateFormat } from '../validators/format-rules.js';
import { renderViolations, exitCode } from '../core/reporter.js';
import { SECTION_PLACEHOLDERS } from '../templates/index.js';
import type { FolderNode, MarkerType, Violation } from '../validators/types.js';

const MARKER_FILE: Record<MarkerType, string> = {
  intent: 'intent.md',
  behaviour: 'usecase.md',
  impl: 'impl.md',
};

export function registerValidateFormat(program: Command): void {
  program
    .command('validate-format')
    .description('Validate marker file contents against their schemas')
    .option('--path <path>', 'Root path to validate (overrides config)')
    .option('--fix', 'Add missing section headers with placeholder content')
    .action(async (options: { path?: string; fix?: boolean }) => {
      const violations = await runValidateFormat({
        path: options.path,
        fix: options.fix ?? false,
      });
      process.stdout.write(renderViolations(violations));
      process.exit(exitCode(violations));
    });
}

export async function runValidateFormat(options: {
  path?: string;
  fix?: boolean;
  cwd?: string;
}): Promise<Violation[]> {
  const { config, configDir } = loadConfig(options.cwd);
  const rootPath = options.path
    ? resolve(options.path)
    : config.root.startsWith('/') ? config.root : resolve(configDir, config.root);

  const tree = walkHierarchy(rootPath);
  const nodes = flattenTree(tree).filter((n): n is FolderNode & { marker: MarkerType } => n.marker !== null);

  const violations: Violation[] = [];

  for (const node of nodes) {
    const markerFile = MARKER_FILE[node.marker];
    const filePath = join(node.absolutePath, markerFile);
    let content: string;
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch {
      violations.push({
        type: 'error',
        filePath,
        code: 'UNREADABLE_FILE',
        message: `Could not read file: ${filePath}`,
      });
      continue;
    }

    const parsed = parseMarkdown(filePath, content);
    const nodeViolations = validateFormat(parsed, node.marker, config);

    if (options.fix && nodeViolations.some(v => v.code === 'MISSING_SECTION')) {
      const fixed = applyFix(content, parsed, node.marker);
      writeFileSync(filePath, fixed, 'utf-8');
      // Re-parse and re-validate after fix
      const reparsed = parseMarkdown(filePath, fixed);
      violations.push(...validateFormat(reparsed, node.marker, config));
    } else {
      violations.push(...nodeViolations);
    }
  }

  return violations;
}

function applyFix(content: string, parsed: ReturnType<typeof parseMarkdown>, markerType: MarkerType): string {
  const placeholders = SECTION_PLACEHOLDERS[markerType] ?? {};
  const required =
    markerType === 'intent' ? ['stakeholders', 'goal', 'success criteria', 'status'] :
    markerType === 'behaviour' ? ['actor', 'preconditions', 'main flow', 'postconditions', 'status'] :
    ['behaviour', 'commits', 'tests', 'status'];

  const missing = required.filter(s => !parsed.sections.has(s));
  if (missing.length === 0) return content;

  const additions = missing.map(section => {
    const placeholder = placeholders[section] ?? '<placeholder>';
    const heading = section.replace(/\b\w/g, c => c.toUpperCase());
    return `\n## ${heading}\n${placeholder}\n`;
  });

  return content.trimEnd() + '\n' + additions.join('');
}
