import type { Command } from 'commander';
export type Classification = 'afk' | 'hitl';
export type PlanFormat = 'tree' | 'json';
export interface PlanCandidate {
    behaviourPath: string;
    behaviourName: string;
    intentName: string;
    intentGoal: string;
    specState: string;
    classification: Classification;
    classificationReason: string;
    inProgressImpls: number;
}
export interface PlanReport {
    candidates: PlanCandidate[];
    allImplemented: boolean;
}
export declare function runPlan(options: {
    path?: string;
    cwd?: string;
}): Promise<PlanReport>;
export declare function formatPlan(report: PlanReport, format: PlanFormat): string;
export declare function registerPlan(program: Command): void;
