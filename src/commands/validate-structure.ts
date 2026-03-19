import { resolve } from 'path';
import type { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { walkHierarchy } from '../core/fs-walker.js';
import { validateStructure } from '../validators/structure-rules.js';
import { renderViolations, exitCode } from '../core/reporter.js';
import type { Violation } from '../validators/types.js';

export function registerValidateStructure(program: Command): void {
  program
    .command('validate-structure')
    .description('Validate folder hierarchy nesting rules')
    .option('--path <path>', 'Root path to validate (overrides config)')
    .option('--strict', 'Also warn on empty folders and missing optional fields')
    .action(async (options: { path?: string; strict?: boolean }) => {
      const violations = await runValidateStructure({
        path: options.path,
        strict: options.strict ?? false,
      });
      process.stdout.write(renderViolations(violations));
      process.exit(exitCode(violations));
    });
}

export async function runValidateStructure(options: {
  path?: string;
  strict?: boolean;
  cwd?: string;
}): Promise<Violation[]> {
  const { config, configDir } = loadConfig(options.cwd);
  const rootPath = options.path
    ? resolve(options.path)
    : config.root.startsWith('/') ? config.root : resolve(configDir, config.root);

  const tree = walkHierarchy(rootPath);
  return validateStructure(tree, { strict: options.strict ?? false });
}
