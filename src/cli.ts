#!/usr/bin/env node
import { Command } from 'commander';
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

const program = new Command();

program
  .name('taproot')
  .description('Folder-based requirement hierarchy CLI')
  .version('0.1.0');

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

program.parse();
