/** Read agent-check resolutions from impl.md's ## DoR Resolutions section. */
export declare function readDorResolutions(implMdPath: string, cwd: string): Set<string>;
export interface DorResult {
    name: string;
    passed: boolean;
    output: string;
    correction: string;
}
export interface DorReport {
    results: DorResult[];
    allPassed: boolean;
}
/** Resolve the parent usecase.md from an impl.md path.
 *  impl.md lives at taproot/<intent>/<behaviour>/<impl>/impl.md
 *  usecase.md lives at taproot/<intent>/<behaviour>/usecase.md
 */
export declare function resolveUsecasePath(implMdPath: string, cwd: string): string;
export declare function runDorChecks(implMdPath: string, cwd: string): DorReport;
