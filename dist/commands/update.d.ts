import type { Command } from 'commander';
export declare function runUpdate(options: {
    cwd?: string;
}): Promise<string[]>;
export declare function registerUpdate(program: Command): void;
