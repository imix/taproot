import type { Command } from 'commander';
import type { Violation } from '../validators/types.js';
export declare function registerSyncCheck(program: Command): void;
export declare function runSyncCheck(options: {
    path?: string;
    since?: string;
    cwd?: string;
}): Promise<Violation[]>;
