import type { Command } from 'commander';
export type CoverageFormat = 'tree' | 'json' | 'markdown' | 'context';
export interface LinkedItemSummary {
    linkFilePath: string;
    linkType: string;
    implState: 'complete' | 'pending' | 'gap';
    warnUnresolvable: boolean;
}
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
    linkedItems: LinkedItemSummary[];
}
export interface IntentSummary {
    name: string;
    path: string;
    state: string;
    behaviours: BehaviourSummary[];
    linkedItems: LinkedItemSummary[];
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
        linkedIntents: number;
    };
}
export declare function registerCoverage(program: Command): void;
export declare function runCoverage(options: {
    path?: string;
    cwd?: string;
}): Promise<CoverageReport>;
export declare function formatReport(report: CoverageReport, format: CoverageFormat): string;
export declare function formatContext(report: CoverageReport, outputPath: string): string;
export declare function collectIncomplete(report: CoverageReport): {
    path: string;
    state: string;
}[];
