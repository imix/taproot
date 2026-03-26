import { createHash } from 'crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, basename, relative } from 'path';

export type TruthScope = 'intent' | 'behaviour' | 'impl';
export type DocLevel = 'intent' | 'behaviour' | 'impl';

export interface TruthFile {
  relPath: string;     // relative to cwd
  scope: TruthScope;
  ambiguous: boolean;  // no explicit scope signal — defaults to intent
  unreadable: boolean;
  content: string;
}

const SCOPES = ['intent', 'behaviour', 'impl'] as const;

/**
 * Determine scope from a path relative to the global-truths directory.
 * Sub-folder takes precedence over suffix when they conflict (most restrictive wins).
 */
export function resolveTruthScope(relFromGT: string): { scope: TruthScope; ambiguous: boolean } {
  const normalised = relFromGT.replace(/\\/g, '/');
  const parts = normalised.split('/');
  const filename = parts[parts.length - 1]!;
  const topFolder = parts.length > 1 ? parts[0]! : null;

  const suffixMatch = filename.match(/_(intent|behaviour|impl)\.md$/);
  const suffixScope = suffixMatch?.[1] as TruthScope | undefined;

  const folderScope = topFolder && (SCOPES as readonly string[]).includes(topFolder)
    ? topFolder as TruthScope
    : null;

  // Conflicting signals: sub-folder wins (most restrictive)
  if (folderScope && suffixScope && folderScope !== suffixScope) {
    return { scope: folderScope, ambiguous: false };
  }
  if (folderScope) return { scope: folderScope, ambiguous: false };
  if (suffixScope) return { scope: suffixScope, ambiguous: false };

  // No scope signal — default to intent (broadest)
  return { scope: 'intent', ambiguous: true };
}

/** Does a truth at scope X apply to a document at level Y? */
export function scopeAppliesTo(truthScope: TruthScope, docLevel: DocLevel): boolean {
  if (truthScope === 'intent') return true;
  if (truthScope === 'behaviour') return docLevel === 'behaviour' || docLevel === 'impl';
  return docLevel === 'impl'; // impl scope — impl only
}

const GLOBAL_TRUTHS_SUBDIR = 'taproot/global-truths';

/** Returns the absolute path to global-truths/, or null if it doesn't exist. */
export function globalTruthsDir(cwd: string): string | null {
  const dir = join(cwd, GLOBAL_TRUTHS_SUBDIR);
  return existsSync(dir) ? dir : null;
}

/** Get hierarchy level of a file based on its filename. */
export function docLevelFromFilename(filename: string): DocLevel | null {
  const name = basename(filename);
  if (name === 'intent.md') return 'intent';
  if (name === 'usecase.md') return 'behaviour';
  if (name === 'impl.md') return 'impl';
  return null;
}

/** Collect all truth files applicable to the given document level. Skips README.md. */
export function collectApplicableTruths(cwd: string, docLevel: DocLevel): TruthFile[] {
  const dir = globalTruthsDir(cwd);
  if (!dir) return [];

  const results: TruthFile[] = [];

  function walk(currentDir: string, relFromGT: string): void {
    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      const childRel = relFromGT ? `${relFromGT}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        walk(fullPath, childRel);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
        const { scope, ambiguous } = resolveTruthScope(childRel);
        if (!scopeAppliesTo(scope, docLevel)) continue;

        let content = '';
        let unreadable = false;
        try {
          content = readFileSync(fullPath, 'utf-8');
        } catch {
          unreadable = true;
        }

        results.push({
          relPath: relative(cwd, fullPath).replace(/\\/g, '/'),
          scope,
          ambiguous,
          unreadable,
          content,
        });
      }
    }
  }

  walk(dir, '');
  return results;
}

// ─── Session management ────────────────────────────────────────────────────────

const SESSION_PATH = '.taproot/.truth-check-session';

interface TruthSession {
  hash: string;
  timestamp: string;
}

function computeHash(
  stagedDocs: Array<{ path: string; content: string }>,
  truths: TruthFile[],
): string {
  const h = createHash('sha256');
  for (const d of [...stagedDocs].sort((a, b) => a.path.localeCompare(b.path))) {
    h.update(`doc:${d.path}\x00${d.content}\x00`);
  }
  for (const t of [...truths].sort((a, b) => a.relPath.localeCompare(b.relPath))) {
    h.update(`truth:${t.relPath}\x00${t.content}\x00`);
  }
  return h.digest('hex');
}

/**
 * Write a truth-check session marker after the agent has approved the truth check.
 * Called by `taproot truth-sign`.
 */
export function writeTruthSession(
  cwd: string,
  stagedDocs: Array<{ path: string; content: string }>,
  truths: TruthFile[],
): void {
  const sessionFile = join(cwd, SESSION_PATH);
  mkdirSync(dirname(sessionFile), { recursive: true });
  const session: TruthSession = {
    hash: computeHash(stagedDocs, truths),
    timestamp: new Date().toISOString(),
  };
  writeFileSync(sessionFile, JSON.stringify(session, null, 2) + '\n');
}

export interface SessionValidation {
  valid: boolean;
  reason: string;
}

/**
 * Validate that a truth-check session exists and matches the current staging state.
 * Called by the pre-commit hook.
 */
export function validateTruthSession(
  cwd: string,
  stagedDocs: Array<{ path: string; content: string }>,
  truths: TruthFile[],
): SessionValidation {
  const sessionFile = join(cwd, SESSION_PATH);
  if (!existsSync(sessionFile)) {
    return {
      valid: false,
      reason: 'no truth-check session found — run /tr-commit to check truths before committing',
    };
  }
  let session: TruthSession;
  try {
    session = JSON.parse(readFileSync(sessionFile, 'utf-8')) as TruthSession;
  } catch {
    return { valid: false, reason: 'truth-check session file is malformed — re-run /tr-commit' };
  }
  if (session.hash !== computeHash(stagedDocs, truths)) {
    return {
      valid: false,
      reason: 'staged files or truths have changed since the last truth check — re-run /tr-commit',
    };
  }
  return { valid: true, reason: '' };
}
