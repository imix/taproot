import chalk from 'chalk';
import type { Violation } from '../validators/types.js';

export function renderViolations(violations: Violation[]): string {
  if (violations.length === 0) {
    return chalk.green('✓ No violations found.\n');
  }

  const byFile = new Map<string, Violation[]>();
  for (const v of violations) {
    const list = byFile.get(v.filePath) ?? [];
    list.push(v);
    byFile.set(v.filePath, list);
  }

  const lines: string[] = [];
  for (const [filePath, fileViolations] of byFile) {
    lines.push('');
    lines.push(chalk.underline(filePath));
    for (const v of fileViolations) {
      const location = v.line !== undefined ? `:${v.line}` : '';
      const severity = v.type === 'error' ? chalk.red('error') : chalk.yellow('warning');
      lines.push(`  ${filePath}${location}  ${severity}  ${v.message}  ${chalk.gray(v.code)}`);
    }
  }

  const errors = violations.filter(v => v.type === 'error').length;
  const warnings = violations.filter(v => v.type === 'warning').length;
  lines.push('');
  const summary = `${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}`;
  lines.push(errors > 0 ? chalk.red(summary) : chalk.yellow(summary));
  lines.push('');

  return lines.join('\n');
}

export function exitCode(violations: Violation[]): number {
  return violations.some(v => v.type === 'error') ? 1 : 0;
}
