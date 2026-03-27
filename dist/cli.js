#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');
import { registerInit } from './commands/init.js';
import { registerValidateStructure } from './commands/validate-structure.js';
import { registerValidateFormat } from './commands/validate-format.js';
import { registerLinkCommits } from './commands/link-commits.js';
import { registerCheckOrphans } from './commands/check-orphans.js';
import { registerCoverage } from './commands/coverage.js';
import { registerSyncCheck } from './commands/sync-check.js';
import { registerUpdate } from './commands/update.js';
import { registerOverview } from './commands/overview.js';
import { registerPlan } from './commands/plan.js';
import { registerDod } from './commands/dod.js';
import { registerCommithook } from './commands/commithook.js';
import { registerAcceptanceCheck } from './commands/acceptance-check.js';
import { registerTruthSign } from './commands/truth-sign.js';
const program = new Command();
program
    .name('taproot')
    .description('Folder-based requirement hierarchy CLI')
    .version(version)
    .addHelpText('after', '\nConfiguration: edit taproot/settings.yaml — see taproot/agent/CONFIGURATION.md for all options');
registerInit(program);
registerValidateStructure(program);
registerValidateFormat(program);
registerLinkCommits(program);
registerCheckOrphans(program);
registerCoverage(program);
registerSyncCheck(program);
registerUpdate(program);
registerOverview(program);
registerPlan(program);
registerDod(program);
registerCommithook(program);
registerAcceptanceCheck(program);
registerTruthSign(program);
program.parseAsync().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`error: ${message}\n`);
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map