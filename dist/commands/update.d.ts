import type { Command } from 'commander';
export declare function runUpdate(options: {
    cwd?: string;
    withHooks?: boolean;
}): Promise<string[]>;
export declare function registerUpdate(program: Command): void;
