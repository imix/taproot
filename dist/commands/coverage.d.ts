import type { Command } from 'commander';
export type CoverageFormat = 'tree' | 'json' | 'markdown' | 'context';
export interface ImplSummary {
    name: string;
    path: string;
    state: string;
    commitCount: number;
    testCount: number;
}
export interface BehaviourSummary {
    name: string;
    path: string;
    state: string;
    implementations: ImplSummary[];
    subBehaviours: BehaviourSummary[];
}
export interface IntentSummary {
    name: string;
    path: string;
    state: string;
    behaviours: BehaviourSummary[];
}
export interface CoverageReport {
    intents: IntentSummary[];
    totals: {
        intents: number;
        behaviours: number;
        implementations: number;
        completeImpls: number;
        testedImpls: number;
        deferredBehaviours: number;
        deferredImpls: number;
    };
}
export declare function registerCoverage(program: Command): void;
export declare function runCoverage(options: {
    path?: string;
    cwd?: string;
}): Promise<CoverageReport>;
export declare function formatReport(report: CoverageReport, format: CoverageFormat): string;
export declare function formatContext(report: CoverageReport, outputPath: string): string;
