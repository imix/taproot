import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Returns the absolute path to the agent directory.
 * New layout: <cwd>/taproot/agent/ (if exists)
 * Old layout: <cwd>/.taproot/ (fallback)
 */
export function resolveAgentDir(cwd: string): string {
  const newAgent = join(cwd, 'taproot', 'agent');
  return existsSync(newAgent) ? newAgent : join(cwd, '.taproot');
}
