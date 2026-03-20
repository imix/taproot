import type { Command } from 'commander';
/** Walk all impl.md files on disk and build a map of source file path → impl.md path. */
export declare function buildSourceToImplMap(cwd: string): Map<string, string>;
export declare function runCommithook(options: {
    cwd: string;
}): Promise<number>;
export declare function registerCommithook(program: Command): void;
