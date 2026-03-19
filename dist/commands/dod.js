import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { loadConfig } from '../core/config.js';
import { runDodChecks } from '../core/dod-runner.js';
export function registerDod(program) {
    const dodCmd = program
        .command('dod [impl-path]')
        .description('Run Definition of Done checks; mark impl complete if all pass')
        .option('--dry-run', 'Run checks but do not update impl.md state')
        .option('--cwd <dir>', 'Working directory for running shell commands')
        .option('--resolve <condition>', 'Record agent resolution for a named condition')
        .option('--note <note>', 'Resolution note (used with --resolve)')
        .action(async (implPath, options) => {
        const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
        // --resolve mode: write resolution to impl.md
        if (options.resolve) {
            if (!implPath) {
                process.stderr.write('Error: --resolve requires an impl-path argument\n');
                process.exitCode = 1;
                return;
            }
            const note = options.note ?? '';
            writeResolution(implPath, options.resolve, note, cwd);
            process.stdout.write(`Recorded resolution for "${options.resolve}" in ${implPath}\n`);
            return;
        }
        const report = await runDod({ implPath, dryRun: options.dryRun ?? false, cwd });
        if (!report.configured) {
            process.stdout.write('No Definition of Done configured — skipping checks.\n');
            if (implPath && !options.dryRun) {
                markImplComplete(resolve(cwd, implPath));
                process.stdout.write(`Marked ${implPath} complete.\n`);
            }
            return;
        }
        printReport(report);
        if (report.allPassed) {
            if (implPath && !options.dryRun) {
                process.stdout.write(`\nAll checks passed. Marked ${implPath} complete.\n`);
            }
            else if (implPath && options.dryRun) {
                process.stdout.write('\nAll checks passed. (dry-run: impl.md not updated)\n');
            }
            else {
                process.stdout.write('\nAll checks passed.\n');
            }
        }
        else {
            process.stdout.write('\nDefinition of Done not met — impl not marked complete.\n');
            process.exitCode = 1;
        }
    });
    // Suppress the default help output for the option name clash with commander reserved word
    void dodCmd;
}
export async function runDod(options) {
    const cwd = options.cwd ?? process.cwd();
    const { config } = loadConfig(cwd);
    const report = runDodChecks(config.definitionOfDone, cwd, { implPath: options.implPath });
    if (options.implPath && !options.dryRun && report.allPassed) {
        markImplComplete(resolve(cwd, options.implPath));
    }
    return report;
}
function printReport(report) {
    const pass = '✓';
    const fail = '✗';
    for (const result of report.results) {
        const icon = result.passed ? pass : fail;
        process.stdout.write(`  ${icon} ${result.name}\n`);
        if (!result.passed) {
            if (result.output) {
                const indented = result.output.split('\n').map(l => `      ${l}`).join('\n');
                process.stdout.write(`${indented}\n`);
            }
            process.stdout.write(`    → ${result.correction}\n`);
        }
    }
}
function markImplComplete(absPath) {
    if (!existsSync(absPath)) {
        throw new Error(`impl.md not found at ${absPath}`);
    }
    const content = readFileSync(absPath, 'utf-8');
    const updated = content.replace(/(\*\*State:\*\*\s*)(planned|in-progress|needs-rework)/, '$1complete');
    if (updated === content)
        return; // already complete or pattern not found
    writeFileSync(absPath, updated, 'utf-8');
}
/** Write an agent-check resolution to ## DoD Resolutions section in impl.md. */
export function writeResolution(implPath, condition, note, cwd) {
    const absPath = resolve(cwd, implPath);
    if (!existsSync(absPath)) {
        throw new Error(`impl.md not found at ${absPath}`);
    }
    const timestamp = new Date().toISOString();
    const entry = `- condition: ${condition} | note: ${note} | resolved: ${timestamp}`;
    let content = readFileSync(absPath, 'utf-8');
    const resolutionHeader = '## DoD Resolutions';
    const hasResolutionSection = /^## DoD Resolutions$/m.test(content);
    if (hasResolutionSection) {
        // Append to existing section before the next ## heading or end of file
        content = content.replace(/(^## DoD Resolutions\n)([\s\S]*?)(\n^##\s|$)/m, (_, header, body, suffix) => {
            const trimmed = body.trimEnd();
            return `${header}${trimmed ? trimmed + '\n' : ''}${entry}\n${suffix}`;
        });
    }
    else {
        // Append new section at end of file
        content = content.trimEnd() + `\n\n${resolutionHeader}\n${entry}\n`;
    }
    writeFileSync(absPath, content, 'utf-8');
}
//# sourceMappingURL=dod.js.map