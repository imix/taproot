import { readResolutions } from './dod-runner.js';
export interface TestResult {
    timestamp: string;
    command: string;
    exitCode: number;
    summary: string;
}
/** Derive the cache path from an impl.md path.
 *  Strips 'taproot/' prefix and '/impl.md' suffix, maps into .taproot/.test-results/.
 *  Handles both absolute and relative implPath inputs. */
export declare function deriveCachePath(implPath: string, cwd: string): string;
/** Read a cached test result. Returns null if absent or malformed. */
export declare function readCache(cachePath: string): TestResult | null;
/** Returns true if the cached result is malformed JSON (exists but unparseable). */
export declare function isCacheCorrupt(cachePath: string): boolean;
/** Check whether a cached result is stale.
 *  Stale if: any tracked source file is newer than the cache timestamp,
 *  or (if no source files listed) the cache is older than testResultMaxAge. */
export declare function isCacheStale(cache: TestResult, implPath: string, cwd: string, testResultMaxAgeMs?: number): boolean;
/** Write a test result to the cache file, creating parent dirs as needed. */
export declare function writeCache(cachePath: string, result: TestResult): void;
/** Execute testsCommand, streaming output to the terminal while also capturing it.
 *  Returns the TestResult with the last N lines as summary. */
export declare function executeTestCommand(command: string, cwd: string, timeoutMs?: number): Promise<TestResult>;
/** Full evidence-backed tests-passing check.
 *  Returns { passed, output, correction, warnNoCache } */
export declare function runTestsPassingWithCache(options: {
    implPath: string;
    cwd: string;
    testsCommand: string;
    testResultMaxAgeMs?: number;
    testTimeoutMs?: number;
    rerunTests?: boolean;
}): Promise<{
    passed: boolean;
    output: string;
    correction: string;
}>;
export { readResolutions };
