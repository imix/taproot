import type { Command } from 'commander';
interface CriterionRef {
    id: string;
    usecasePath: string;
}
interface TestRef {
    id: string;
    file: string;
    line: number;
}
export interface AcceptanceReport {
    specCriteria: CriterionRef[];
    covered: string[];
    uncovered: CriterionRef[];
    orphaned: TestRef[];
    missingSections: string[];
}
export declare function registerAcceptanceCheck(program: Command): void;
export declare function runAcceptanceCheck(rootPath: string, testDirs: string[]): AcceptanceReport;
/** Walk the hierarchy and extract AC-N IDs from ## Acceptance Criteria sections. */
export declare function collectCriteria(rootPath: string): CriterionRef[];
/** Collect usecase.md files that have impl children but no ## Acceptance Criteria section. */
export declare function collectMissingSections(rootPath: string): string[];
/** Walk test directories and collect all AC-N references with file+line. */
export declare function scanTestFiles(testDirs: string[]): TestRef[];
export {};
