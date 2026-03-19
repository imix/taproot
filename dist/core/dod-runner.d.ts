import type { DodConditionEntry } from '../validators/types.js';
export interface DodResult {
    name: string;
    passed: boolean;
    output: string;
    correction: string;
}
export interface DodReport {
    configured: boolean;
    results: DodResult[];
    allPassed: boolean;
}
/** Read agent-check resolutions recorded in impl.md's ## DoD Resolutions section. */
export declare function readResolutions(implPath: string, cwd: string): Set<string>;
export declare function runDodChecks(conditions: DodConditionEntry[] | undefined, cwd: string, options?: {
    implPath?: string;
}): DodReport;
