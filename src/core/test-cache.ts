import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'fs';
import { join, resolve, relative, dirname } from 'path';
import { spawn } from 'child_process';
import { readResolutions } from './dod-runner.js';

export interface TestResult {
  timestamp: string;
  command: string;
  exitCode: number;
  summary: string;
}

const DEFAULT_TEST_TIMEOUT_MS = 300_000; // 300 seconds
const DEFAULT_MAX_AGE_MS = 60 * 60 * 1000; // 60 minutes

/** Derive the cache path from an impl.md path.
 *  Strips 'taproot/' prefix and '/impl.md' suffix, maps into .taproot/.test-results/.
 *  Handles both absolute and relative implPath inputs. */
export function deriveCachePath(implPath: string, cwd: string): string {
  const absImpl = resolve(cwd, implPath);
  const relImpl = relative(cwd, absImpl).replace(/\\/g, '/');

  // Strip leading 'taproot/' segment
  const withoutRoot = relImpl.startsWith('taproot/')
    ? relImpl.slice('taproot/'.length)
    : relImpl;

  // Strip trailing '/impl.md'
  const key = withoutRoot.endsWith('/impl.md')
    ? withoutRoot.slice(0, -'/impl.md'.length)
    : withoutRoot;

  return join(cwd, '.taproot', '.test-results', `${key}.json`);
}

/** Read a cached test result. Returns null if absent or malformed. */
export function readCache(cachePath: string): TestResult | null {
  if (!existsSync(cachePath)) return null;
  try {
    const raw = readFileSync(cachePath, 'utf-8');
    const parsed = JSON.parse(raw) as TestResult;
    if (typeof parsed.exitCode !== 'number' || !parsed.timestamp) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Returns true if the cached result is malformed JSON (exists but unparseable). */
export function isCacheCorrupt(cachePath: string): boolean {
  if (!existsSync(cachePath)) return false;
  try {
    JSON.parse(readFileSync(cachePath, 'utf-8'));
    return false;
  } catch {
    return true;
  }
}

/** Check whether a cached result is stale.
 *  Stale if: any tracked source file is newer than the cache timestamp,
 *  or (if no source files listed) the cache is older than testResultMaxAge. */
export function isCacheStale(
  cache: TestResult,
  implPath: string,
  cwd: string,
  testResultMaxAgeMs: number = DEFAULT_MAX_AGE_MS
): boolean {
  const absImpl = resolve(cwd, implPath);
  const cacheTs = Date.parse(cache.timestamp);
  if (isNaN(cacheTs)) return true;

  // Read source files from impl.md
  const sourceFiles = readSourceFiles(absImpl, cwd);

  if (sourceFiles.length === 0) {
    // Fall back to max-age check
    return Date.now() - cacheTs > testResultMaxAgeMs;
  }

  // Stale if any source file is newer than the cache
  for (const src of sourceFiles) {
    const absSrc = resolve(cwd, src);
    if (!existsSync(absSrc)) continue;
    try {
      const mtime = statSync(absSrc).mtimeMs;
      if (mtime > cacheTs) return true;
    } catch {
      // ignore stat errors
    }
  }

  return false;
}

function readSourceFiles(absImplPath: string, cwd: string): string[] {
  try {
    const content = readFileSync(absImplPath, 'utf-8');
    const match = content.match(/^## Source Files\s*\n([\s\S]*?)(?=\n## |\n$|$)/m);
    if (!match) return [];
    const sources: string[] = [];
    for (const m of match[1]!.matchAll(/`([^`]+)`/g)) {
      sources.push(m[1]!);
    }
    return sources;
  } catch {
    return [];
  }
}

/** Write a test result to the cache file, creating parent dirs as needed. */
export function writeCache(cachePath: string, result: TestResult): void {
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, JSON.stringify(result, null, 2), 'utf-8');
}

/** Execute testsCommand, streaming output to the terminal while also capturing it.
 *  Returns the TestResult with the last N lines as summary. */
export async function executeTestCommand(
  command: string,
  cwd: string,
  timeoutMs: number = DEFAULT_TEST_TIMEOUT_MS
): Promise<TestResult> {
  return new Promise((resolvePromise) => {
    const timestamp = new Date().toISOString();
    const lines: string[] = [];

    const child = spawn(command, { shell: true, cwd });

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    function handleData(chunk: Buffer, stream: NodeJS.WriteStream): void {
      const text = chunk.toString();
      stream.write(text);
      lines.push(...text.split('\n'));
    }

    child.stdout?.on('data', (chunk: Buffer) => handleData(chunk, process.stdout));
    child.stderr?.on('data', (chunk: Buffer) => handleData(chunk, process.stderr));

    child.on('close', (code) => {
      clearTimeout(timer);
      const exitCode = timedOut ? -1 : (code ?? 1);
      const timeoutSecs = Math.round(timeoutMs / 1000);
      const summaryLines = timedOut
        ? [`timed out after ${timeoutSecs}s`]
        : lines.filter(l => l.trim()).slice(-20);

      resolvePromise({
        timestamp,
        command,
        exitCode,
        summary: summaryLines.join('\n'),
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolvePromise({
        timestamp,
        command,
        exitCode: 127,
        summary: err.message,
      });
    });
  });
}

/** Full evidence-backed tests-passing check.
 *  Returns { passed, output, correction, warnNoCache } */
export async function runTestsPassingWithCache(options: {
  implPath: string;
  cwd: string;
  testsCommand: string;
  testResultMaxAgeMs?: number;
  testTimeoutMs?: number;
  rerunTests?: boolean;
}): Promise<{ passed: boolean; output: string; correction: string }> {
  const { implPath, cwd, testsCommand, rerunTests } = options;
  const testResultMaxAgeMs = options.testResultMaxAgeMs ?? DEFAULT_MAX_AGE_MS;
  const testTimeoutMs = options.testTimeoutMs ?? DEFAULT_TEST_TIMEOUT_MS;
  const cachePath = deriveCachePath(implPath, cwd);

  // Warn and re-run if cache is corrupt
  if (isCacheCorrupt(cachePath)) {
    process.stderr.write(
      `Warning: Ignoring malformed cache at ${cachePath} — re-running tests.\n`
    );
  }

  let result: TestResult | null = null;

  if (!rerunTests) {
    result = readCache(cachePath);
    if (result && isCacheStale(result, implPath, cwd, testResultMaxAgeMs)) {
      result = null; // stale — will re-execute
    }
  }

  // Execute if no fresh cache
  if (!result) {
    result = await executeTestCommand(testsCommand, cwd, testTimeoutMs);
    writeCache(cachePath, result);
  }

  if (result.exitCode === 0) {
    return { passed: true, output: '', correction: '' };
  }

  if (result.exitCode === -1) {
    const timeoutSecs = Math.round(testTimeoutMs / 1000);
    return {
      passed: false,
      output: result.summary,
      correction: `tests-passing blocked: test command timed out after ${timeoutSecs}s. Increase testTimeout in .taproot/settings.yaml if needed.`,
    };
  }

  return {
    passed: false,
    output: result.summary,
    correction: 'tests-passing blocked: Fix failing tests and re-run taproot dod.',
  };
}

// Re-export for use in commithook staleness check
export { readResolutions };
