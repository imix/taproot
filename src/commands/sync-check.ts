import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';
import { parseImplData } from '../core/impl-reader.js';
import { fileLastCommitDate, fileMtime, isGitRepo, getRepoRoot } from '../core/git.js';
import { renderViolations, exitCode } from '../core/reporter.js';
import type { FolderNode, Violation } from '../validators/types.js';

export function registerSyncCheck(program: Command): void {
  program
    .command('sync-check')
    .description('Detect potential staleness between specs and code')
    .option('--path <path>', 'Root path (overrides config)')
    .option('--since <date>', 'Only consider changes after this date')
    .action(async (options: { path?: string; since?: string }) => {
      const violations = await runSyncCheck({ path: options.path, since: options.since });
      process.stdout.write(renderViolations(violations));
      process.exit(exitCode(violations));
    });
}

export async function runSyncCheck(options: {
  path?: string;
  since?: string;
  cwd?: string;
}): Promise<Violation[]> {
  const { config } = loadConfig(options.cwd);
  const rootPath = options.path ? resolve(options.path) : config.root;
  const cwd = options.cwd ?? process.cwd();

  const repoRoot = isGitRepo(cwd) ? (getRepoRoot(cwd) ?? cwd) : null;

  const tree = walkHierarchy(rootPath);
  const nodes = flattenTree(tree);
  const violations: Violation[] = [];

  for (const node of nodes) {
    if (node.marker === 'impl') {
      violations.push(...checkImplStaleness(node, repoRoot));
    }
    if (node.marker === 'behaviour') {
      violations.push(...checkBehaviourSpecDrift(node, repoRoot));
    }
  }

  return violations;
}

/**
 * If source files or test files in an impl.md changed more recently
 * than the impl.md itself, the implementation record may be stale.
 */
function checkImplStaleness(node: FolderNode, repoRoot: string | null): Violation[] {
  const filePath = join(node.absolutePath, 'impl.md');
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }

  const doc = parseMarkdown(filePath, content);
  const data = parseImplData(doc);
  const violations: Violation[] = [];

  // Get the last commit date for impl.md itself
  const implCommitDate = repoRoot ? fileLastCommitDate(filePath, repoRoot) : null;
  const implMtime = fileMtime(filePath);
  const implDate = implCommitDate ?? implMtime;

  if (!implDate) return [];

  const allTrackedFiles = [...data.sourceFiles, ...data.testFiles];

  for (const trackedFile of allTrackedFiles) {
    const resolved = repoRoot ? resolve(repoRoot, trackedFile) : null;
    if (!resolved || !existsSync(resolved)) continue;

    // Check if file was committed more recently than impl.md
    const fileCommitDate = repoRoot ? fileLastCommitDate(resolved, repoRoot) : null;
    const fileDate = fileCommitDate ?? fileMtime(resolved);
    if (!fileDate) continue;

    if (fileDate > implDate) {
      violations.push({
        type: 'warning',
        filePath,
        code: 'IMPL_STALE',
        message: `Source file "${trackedFile}" was modified after impl.md — implementation record may be stale`,
      });
    }
  }

  return violations;
}

/**
 * If a usecase.md was edited after its child impl.md files, the
 * implementations may not reflect the latest spec.
 */
function checkBehaviourSpecDrift(node: FolderNode, repoRoot: string | null): Violation[] {
  const usecasePath = join(node.absolutePath, 'usecase.md');
  if (!existsSync(usecasePath)) return [];

  const usecaseCommitDate = repoRoot ? fileLastCommitDate(usecasePath, repoRoot) : null;
  const usecaseMtime = fileMtime(usecasePath);
  const usecaseDate = usecaseCommitDate ?? usecaseMtime;

  if (!usecaseDate) return [];

  const violations: Violation[] = [];

  for (const child of node.children) {
    if (child.marker !== 'impl') continue;

    const implPath = join(child.absolutePath, 'impl.md');
    if (!existsSync(implPath)) continue;

    const implCommitDate = repoRoot ? fileLastCommitDate(implPath, repoRoot) : null;
    const implMtime = fileMtime(implPath);
    const implDate = implCommitDate ?? implMtime;
    if (!implDate) continue;

    if (usecaseDate > implDate) {
      violations.push({
        type: 'warning',
        filePath: implPath,
        code: 'SPEC_UPDATED',
        message: `usecase.md was updated after impl.md — review implementation against current spec`,
      });
    }
  }

  return violations;
}
