import type { Command } from 'commander';
import { type LanguagePack } from '../core/language.js';
import { type AgentName } from '../adapters/index.js';
export declare const AVAILABLE_TEMPLATES: readonly ["webapp", "book-authoring", "cli-tool"];
export type TemplateName = typeof AVAILABLE_TEMPLATES[number];
export declare const SKILL_FILES: string[];
export declare function applyTemplate(templateName: string, cwd: string, force?: boolean): string[];
export declare function registerInit(program: Command): void;
export declare function runInit(options: {
    cwd?: string;
    withHooks?: boolean;
    withCi?: string;
    withSkills?: boolean;
    agent?: AgentName | AgentName[] | 'all';
}): string[];
export declare function installSkills(targetSkillsDir: string, force?: boolean, pack?: LanguagePack | null, vocab?: Record<string, string> | null): string[];
export declare function installDocs(targetDocsDir: string, force?: boolean): string[];
