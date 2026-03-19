import type { Command } from 'commander';
import type { Violation } from '../validators/types.js';
export declare function registerValidateStructure(program: Command): void;
export declare function runValidateStructure(options: {
    path?: string;
    strict?: boolean;
    cwd?: string;
}): Promise<Violation[]>;
