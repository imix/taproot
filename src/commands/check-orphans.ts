import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import type { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';
import { parseImplData } from '../core/impl-reader.js';
import { commitExists, isGitRepo, getRepoRoot } from '../core/git.js';
import { renderViolations, exitCode } from '../core/reporter.js';
import type { FolderNode, Violation } from '../validators/types.js';

export function registerCheckOrphans(program: Command): void {
  program
    .command('check-orphans')
    .description('Find disconnected nodes and broken references in the hierarchy')
    .option('--path <path>', 'Root path (overrides config)')
    .option('--include-unimplemented', 'Also report behaviours with no implementations')
    .action(async (options: { path?: string; includeUnimplemented?: boolean }) => {
      const violations = await runCheckOrphans({
        path: options.path,
        includeUnimplemented: options.includeUnimplemented ?? false,
      });
      process.stdout.write(renderViolations(violations));
      process.exit(exitCode(violations));
    });
}

export async function runCheckOrphans(options: {
  path?: string;
  includeUnimplemented?: boolean;
  cwd?: string;
}): Promise<Violation[]> {
  const { config, configDir } = loadConfig(options.cwd);
  const rootPath = options.path ? resolve(options.path) : config.root;
  const cwd = options.cwd ?? process.cwd();

  const repoRoot = isGitRepo(cwd) ? (getRepoRoot(cwd) ?? cwd) : null;

  const tree = walkHierarchy(rootPath);
  const nodes = flattenTree(tree);
  const violations: Violation[] = [];

  for (const node of nodes) {
    if (node.marker === 'impl') {
      violations.push(...checkImplReferences(node, repoRoot));
    }
    if (node.marker === 'behaviour' && options.includeUnimplemented) {
      violations.push(...checkUnimplementedBehaviour(node));
    }
  }

  return violations;
}

function checkImplReferences(node: FolderNode, repoRoot: string | null): Violation[] {
  const filePath = join(node.absolutePath, 'impl.md');
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return [{
      type: 'error',
      filePath,
      code: 'UNREADABLE_IMPL',
      message: `Could not read impl.md`,
    }];
  }

  const doc = parseMarkdown(filePath, content);
  const data = parseImplData(doc);
  const violations: Violation[] = [];

  // Skip all reference checks for deferred impls
  const statusSection = doc.sections.get('status');
  const stateMatch = statusSection ? /\*\*State:\*\*\s*(\S+)/.exec(statusSection.rawBody) : null;
  if (stateMatch?.[1]?.trim() === 'deferred') return [];

  // Check behaviour reference
  if (data.behaviourRef) {
    const resolvedRef = resolve(dirname(filePath), data.behaviourRef);
    if (!existsSync(resolvedRef)) {
      const behaviourSection = doc.sections.get('behaviour');
      violations.push({
        type: 'error',
        filePath,
        line: behaviourSection?.startLine,
        code: 'BROKEN_BEHAVIOUR_REF',
        message: `Behaviour reference "${data.behaviourRef}" does not exist`,
      });
    }
  }

  // Check source files exist
  for (const srcFile of data.sourceFiles) {
    const resolved = resolveProjectPath(srcFile, repoRoot, node.absolutePath);
    if (resolved && !existsSync(resolved)) {
      violations.push({
        type: 'error',
        filePath,
        code: 'MISSING_SOURCE_FILE',
        message: `Source file "${srcFile}" does not exist on disk`,
      });
    }
  }

  // Check test files exist
  for (const testFile of data.testFiles) {
    const resolved = resolveProjectPath(testFile, repoRoot, node.absolutePath);
    if (resolved && !existsSync(resolved)) {
      violations.push({
        type: 'warning',
        filePath,
        code: 'MISSING_TEST_FILE',
        message: `Test file "${testFile}" does not exist on disk`,
      });
    }
  }

  // Check commit hashes exist in git history
  if (repoRoot) {
    for (const hash of data.commits) {
      if (!commitExists(hash, repoRoot)) {
        violations.push({
          type: 'warning',
          filePath,
          code: 'COMMIT_NOT_FOUND',
          message: `Commit "${hash}" does not exist in git history`,
        });
      }
    }
  }

  return violations;
}

function readBehaviourState(node: FolderNode): string {
  try {
    const content = readFileSync(join(node.absolutePath, 'usecase.md'), 'utf-8');
    const doc = parseMarkdown(join(node.absolutePath, 'usecase.md'), content);
    const match = /\*\*State:\*\*\s*(\S+)/.exec(doc.sections.get('status')?.rawBody ?? '');
    return match?.[1]?.trim() ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function checkUnimplementedBehaviour(node: FolderNode): Violation[] {
  const hasImplChild = node.children.some(c => c.marker === 'impl');
  if (hasImplChild) return [];
  if (readBehaviourState(node) === 'deferred') return [];
  return [{
    type: 'warning',
    filePath: join(node.absolutePath, 'usecase.md'),
    code: 'UNIMPLEMENTED_BEHAVIOUR',
    message: `Behaviour "${node.name}" has no implementation folders`,
  }];
}

/**
 * Try to resolve a project-relative path.
 * Paths starting with src/, test/, etc. are resolved from repo root.
 * Relative paths (../foo) are resolved from the impl folder.
 */
/**
 * Try to resolve a project-relative path.
 * Relative paths (../foo, ./foo) resolve from the impl folder.
 * Other paths (src/foo.ts) resolve from repo root, falling back to cwd.
 */
function resolveProjectPath(
  filePath: string,
  repoRoot: string | null,
  implDir: string
): string | null {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return resolve(implDir, filePath);
  }
  return resolve(repoRoot ?? process.cwd(), filePath);
}
