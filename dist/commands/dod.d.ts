import type { Command } from 'commander';
import type { DodReport, DodResult } from '../core/dod-runner.js';
export { DodReport, DodResult };
export declare function registerDod(program: Command): void;
export declare function runDod(options: {
    implPath?: string;
    dryRun?: boolean;
    cwd?: string;
}): Promise<DodReport>;
