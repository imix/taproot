import type { Command } from 'commander';
import type { DodReport, DodResult } from '../core/dod-runner.js';
export { DodReport, DodResult };
/** Return files with uncommitted changes that are not in the impl's ## Source Files list. */
export declare function getOutOfScopeChanges(implPath: string, cwd: string): string[];
export interface NaResolutionSummary {
    resolved: string[];
    skipped: string[];
    warnings: string[];
    wouldResolve?: string[];
}
/** Auto-resolve NA conditions based on naRules config. Returns summary. */
export declare function resolveAllNa(implPath: string, options: {
    dryRun?: boolean;
    cwd?: string;
}): Promise<NaResolutionSummary>;
export declare function registerDod(program: Command): void;
export declare function runDod(options: {
    implPath?: string;
    dryRun?: boolean;
    cwd?: string;
    rerunTests?: boolean;
}): Promise<DodReport>;
/** Advance parent usecase.md state from 'specified' → 'implemented' when impl is marked complete. */
export declare function cascadeUsecaseState(absImplPath: string): string | null;
/** Write an agent-check resolution to ## DoD Resolutions section in impl.md. */
export declare function writeResolution(implPath: string, condition: string, note: string, cwd: string): void;
