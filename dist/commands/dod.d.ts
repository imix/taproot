import type { Command } from 'commander';
import type { DodReport, DodResult } from '../core/dod-runner.js';
export { DodReport, DodResult };
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
