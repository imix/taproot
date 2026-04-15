import type { Command } from 'commander';
import { type LanguagePack } from '../core/language.js';
import { type AgentName } from '../adapters/index.js';
export declare function wrapperScript(): string;
export declare function hookScriptContent(): string;
export declare function buildSettingsYaml(pkgVersion: string, vocabulary?: Record<string, string>, language?: string, modules?: string[]): string;
export declare const AVAILABLE_TEMPLATES: readonly ["webapp", "cli-tool"];
export type TemplateName = typeof AVAILABLE_TEMPLATES[number];
export declare const TEMPLATE_PROMPT_CHOICES: Array<{
    name: string;
    value: string;
}>;
export declare const DOMAIN_PRESETS: Record<string, {
    label: string;
    vocabulary: Record<string, string>;
}>;
export declare const AVAILABLE_PRESETS: string[];
export declare const SKILL_FILES: string[];
/** Maps module name → skill filenames. Skills here are only installed when the module is declared. */
export declare const MODULE_SKILL_FILES: Record<string, string[]>;
export declare function applyTemplate(templateName: string, cwd: string, force?: boolean): string[];
export declare function registerInit(program: Command): void;
export declare function runInit(options: {
    cwd?: string;
    withHooks?: boolean;
    withCi?: string;
    withSkills?: boolean;
    agent?: AgentName | AgentName[] | 'all';
    vocabulary?: Record<string, string>;
    language?: string;
    preset?: string;
    modules?: string[];
}): string[];
export declare function installSkills(targetSkillsDir: string, force?: boolean, pack?: LanguagePack | null, vocab?: Record<string, string> | null, displayDir?: string): string[];
/**
 * Install skill files for declared modules; remove skill files for undeclared modules.
 * Reports unknown module names with the list of available modules.
 */
export declare function installModuleSkills(targetSkillsDir: string, declaredModules: string[], force?: boolean, pack?: LanguagePack | null, vocab?: Record<string, string> | null, displayDir?: string): string[];
export declare function installDocs(targetDocsDir: string, force?: boolean, displayDir?: string): string[];
