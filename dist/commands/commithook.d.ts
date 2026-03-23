import type { Command } from 'commander';
import { type LanguagePack } from '../core/language.js';
/** Walk all impl.md files on disk and build a map of source file path → impl.md path. */
export declare function buildSourceToImplMap(cwd: string): Map<string, string>;
export interface SpecFailure {
    file: string;
    message: string;
    hint: string;
}
export declare function checkUsecaseQuality(filePath: string, content: string, pack?: LanguagePack | null): SpecFailure[];
export declare function checkIntentQuality(filePath: string, content: string, pack?: LanguagePack | null): SpecFailure[];
export declare function runCommithook(options: {
    cwd: string;
}): Promise<number>;
export declare function registerCommithook(program: Command): void;
