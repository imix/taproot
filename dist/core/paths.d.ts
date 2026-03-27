/**
 * Returns the absolute path to the agent directory.
 * New layout: <cwd>/taproot/agent/ (if exists)
 * Old layout: <cwd>/.taproot/ (fallback)
 */
export declare function resolveAgentDir(cwd: string): string;
