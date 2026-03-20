import type { Command } from 'commander';
export interface ApplyResult {
    path: string;
    status: 'modified' | 'skipped' | 'error';
    reason?: string;
}
export declare function runApply(options: {
    filelistPath: string;
    promptPath: string;
    cwd?: string;
    agentCli?: string;
}): ApplyResult[];
export declare function registerApply(program: Command): void;
