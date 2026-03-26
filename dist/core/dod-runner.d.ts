import type { DodConditionEntry, TaprootConfig } from '../validators/types.js';
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
    usecaseCascade?: string;
}
/** Read agent-check resolutions recorded in impl.md's ## DoD Resolutions section.
 *  Returns an empty set if impl.md has been modified after the resolutions were written
 *  (indicating more implementation work happened since the agent resolved the checks). */
export declare function readResolutions(implPath: string, cwd: string): Set<string>;
export declare function runDodChecks(conditions: DodConditionEntry[] | undefined, cwd: string, options?: {
    implPath?: string;
    config?: TaprootConfig;
    rerunTests?: boolean;
}): Promise<DodReport>;
