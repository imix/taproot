import type { Command } from 'commander';
export interface LinkResult {
    implPath: string;
    addedHashes: string[];
}
export declare function registerLinkCommits(program: Command): void;
export declare function runLinkCommits(options: {
    since?: string;
    dryRun?: boolean;
    path?: string;
    cwd?: string;
}): Promise<LinkResult[]>;
