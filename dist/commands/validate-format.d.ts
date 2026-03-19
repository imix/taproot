import type { Command } from 'commander';
import type { Violation } from '../validators/types.js';
export declare function registerValidateFormat(program: Command): void;
export declare function runValidateFormat(options: {
    path?: string;
    fix?: boolean;
    cwd?: string;
}): Promise<Violation[]>;
