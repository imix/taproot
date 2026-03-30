import type { Command } from 'commander';
export declare function runCommit(options: {
    message?: string;
    all?: boolean;
    dryRun?: boolean;
    cwd: string;
}): number;
export declare function registerCommit(program: Command): void;
