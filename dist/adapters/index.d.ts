/**
 * Agent adapter generators.
 *
 * Each generator reads the canonical skill definitions from the bundled
 * skills/ directory and produces agent-specific wrapper files. Adapters
 * are derived — regenerating them is always safe and idempotent.
 */
export type AgentName = 'claude' | 'cursor' | 'copilot' | 'windsurf' | 'gemini' | 'generic' | 'aider';
export declare const ALL_AGENTS: AgentName[];
export type AgentTier = 1 | 2 | 3;
export declare const AGENT_TIERS: Record<AgentName, AgentTier>;
export declare function getTierLabel(agent: AgentName): string;
export interface AdapterResult {
    agent: AgentName;
    files: Array<{
        path: string;
        status: 'created' | 'updated' | 'exists';
    }>;
    error?: string;
}
export declare function generateAdapters(agents: AgentName | AgentName[] | 'all', projectRoot: string): AdapterResult[];
interface SkillDef {
    filename: string;
    name: string;
    content: string;
    description: string;
    invocation: string;
}
export declare function generateAiderAdapter(skills: SkillDef[], projectRoot: string): AdapterResult;
export declare function buildInvocationBlock(cli?: string): string;
export {};
