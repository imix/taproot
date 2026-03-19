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
export declare function runDodChecks(conditions: DodConditionEntry[] | undefined, cwd: string): DodReport;
