import type { Command } from 'commander';
import type { Violation } from '../validators/types.js';
export declare function registerCheckOrphans(program: Command): void;
export declare function runCheckOrphans(options: {
    path?: string;
    includeUnimplemented?: boolean;
    cwd?: string;
}): Promise<Violation[]>;
