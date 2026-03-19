import type { Command } from 'commander';
export declare function runCommithook(options: {
    cwd: string;
}): Promise<number>;
export declare function registerCommithook(program: Command): void;
