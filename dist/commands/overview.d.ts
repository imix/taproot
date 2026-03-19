import type { Command } from 'commander';
export declare function runOverview(options: {
    taprootDir: string;
    cwd?: string;
}): Promise<string[]>;
export declare function registerOverview(program: Command): void;
