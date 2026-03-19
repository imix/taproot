import type { Command } from 'commander';
import { type AgentName } from '../adapters/index.js';
export declare const SKILL_FILES: string[];
export declare function registerInit(program: Command): void;
export declare function runInit(options: {
    cwd?: string;
    withHooks?: boolean;
    withCi?: string;
    withSkills?: boolean;
    agent?: AgentName | AgentName[] | 'all';
}): string[];
export declare function installSkills(targetSkillsDir: string): string[];
