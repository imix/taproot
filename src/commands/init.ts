import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import type { Command } from 'commander';
import { DEFAULT_CONFIG } from '../core/config.js';
import { intentTemplate, behaviourTemplate, implTemplate } from '../templates/index.js';
import { generateAdapters, ALL_AGENTS, type AgentName } from '../adapters/index.js';
import checkbox from '@inquirer/checkbox';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Bundled skills directory — two levels up from src/commands/ → package root → skills/
const BUNDLED_SKILLS_DIR = resolve(__dirname, '..', '..', 'skills');

export const SKILL_FILES = [
  'brainstorm.md',
  'grill.md',
  'grill-all.md',
  'intent.md',
  'behaviour.md',
  'implement.md',
  'trace.md',
  'status.md',
  'refine.md',
  'promote.md',
  'decompose.md',
  'guide.md',
];

export function registerInit(program: Command): void {
  program
    .command('init')
    .description('Initialize Taproot in the current project')
    .option('--with-hooks', 'Install git pre-commit hooks')
    .option('--with-ci <provider>', 'Generate CI workflow (github|gitlab)')
    .option('--with-skills', 'Install canonical skill definitions into taproot/skills/')
    .option('--agent <name>', `Generate agent adapter (${[...ALL_AGENTS, 'all'].join('|')})`)
    .option('--path <path>', 'Directory to initialize in', process.cwd())
    .action(async (options: { withHooks?: boolean; withCi?: string; withSkills?: boolean; agent?: string; path: string }) => {
      let agent: AgentName | AgentName[] | 'all' | undefined = options.agent as AgentName | 'all' | undefined;

      if (!agent) {
        const AGENT_LABELS: Record<AgentName, string> = {
          claude: 'Claude Code',
          cursor: 'Cursor',
          copilot: 'GitHub Copilot',
          windsurf: 'Windsurf',
          generic: 'Generic (any AI agent)',
        };
        const selected = await checkbox({
          message: 'Which agent adapter(s) would you like to generate?',
          choices: ALL_AGENTS.map((a) => ({ name: AGENT_LABELS[a], value: a })),
        });
        if (selected.length === ALL_AGENTS.length) {
          agent = 'all';
        } else if (selected.length > 0) {
          agent = selected as AgentName[];
        }
      }

      const created = runInit({
        cwd: options.path,
        withHooks: options.withHooks,
        withCi: options.withCi,
        withSkills: options.withSkills,
        agent,
      });
      for (const msg of created) {
        process.stdout.write(msg + '\n');
      }
    });
}

export function runInit(options: {
  cwd?: string;
  withHooks?: boolean;
  withCi?: string;
  withSkills?: boolean;
  agent?: AgentName | AgentName[] | 'all';
}): string[] {
  const cwd = options.cwd ?? process.cwd();
  const messages: string[] = [];

  const configPath = join(cwd, '.taproot.yaml');
  const taprootDir = resolve(cwd, DEFAULT_CONFIG.root);
  const skillsDir = join(taprootDir, 'skills');
  const brainDir = join(taprootDir, '_brainstorms');

  // Create taproot/ directory
  if (!existsSync(taprootDir)) {
    mkdirSync(taprootDir, { recursive: true });
    messages.push(`created  ${DEFAULT_CONFIG.root}`);
  } else {
    messages.push(`exists   ${DEFAULT_CONFIG.root}`);
  }

  if (!existsSync(skillsDir)) {
    mkdirSync(skillsDir, { recursive: true });
    messages.push(`created  ${DEFAULT_CONFIG.root}skills/`);
  }

  if (!existsSync(brainDir)) {
    mkdirSync(brainDir, { recursive: true });
    messages.push(`created  ${DEFAULT_CONFIG.root}_brainstorms/`);
  }

  // Write .taproot.yaml
  if (!existsSync(configPath)) {
    const configForYaml = {
      version: DEFAULT_CONFIG.version,
      root: DEFAULT_CONFIG.root,
      commit_pattern: DEFAULT_CONFIG.commitPattern,
      commit_trailer: DEFAULT_CONFIG.commitTrailer,
      agents: DEFAULT_CONFIG.agents,
      validation: {
        require_dates: DEFAULT_CONFIG.validation.requireDates,
        require_status: DEFAULT_CONFIG.validation.requireStatus,
        allowed_intent_states: DEFAULT_CONFIG.validation.allowedIntentStates,
        allowed_behaviour_states: DEFAULT_CONFIG.validation.allowedBehaviourStates,
        allowed_impl_states: DEFAULT_CONFIG.validation.allowedImplStates,
      },
    };
    writeFileSync(configPath, yaml.dump(configForYaml));
    messages.push('created  .taproot.yaml');
  } else {
    messages.push('exists   .taproot.yaml');
  }

  // Write CONVENTIONS.md
  const conventionsPath = join(taprootDir, 'CONVENTIONS.md');
  if (!existsSync(conventionsPath)) {
    writeFileSync(conventionsPath, buildConventionsDoc());
    messages.push(`created  ${DEFAULT_CONFIG.root}CONVENTIONS.md`);
  }

  // Install skill definitions — always enabled when claude adapter is requested
  const agentList = options.agent === 'all'
    ? ALL_AGENTS
    : Array.isArray(options.agent)
    ? options.agent
    : options.agent
    ? [options.agent]
    : [];
  const needsSkills = options.withSkills || agentList.includes('claude');
  if (needsSkills) {
    messages.push(...installSkills(skillsDir));
  }

  // Git pre-commit hook
  if (options.withHooks) {
    const hookDir = join(cwd, '.git', 'hooks');
    const hookPath = join(hookDir, 'pre-commit');
    if (existsSync(join(cwd, '.git')) && !existsSync(hookPath)) {
      mkdirSync(hookDir, { recursive: true });
      writeFileSync(hookPath,
        '#!/bin/sh\ntaproot validate-structure\ntaproot validate-format\n',
        { mode: 0o755 }
      );
      messages.push('created  .git/hooks/pre-commit');
    }
  }

  // Agent adapters
  if (options.agent) {
    const results = generateAdapters(options.agent, cwd);
    for (const result of results) {
      for (const file of result.files) {
        const rel = file.path.replace(cwd + '/', '').replace(cwd + '\\', '');
        const verb = file.status === 'created' ? 'created' : file.status === 'updated' ? 'updated' : 'exists ';
        messages.push(`${verb}  ${rel}`);
      }
    }
  }

  // CI workflow
  if (options.withCi === 'github') {
    const workflowDir = join(cwd, '.github', 'workflows');
    const workflowPath = join(workflowDir, 'taproot.yml');
    if (!existsSync(workflowPath)) {
      mkdirSync(workflowDir, { recursive: true });
      writeFileSync(workflowPath, buildGithubWorkflow());
      messages.push('created  .github/workflows/taproot.yml');
    } else {
      messages.push('exists   .github/workflows/taproot.yml');
    }
  }

  if (options.withCi === 'gitlab') {
    const ciPath = join(cwd, '.gitlab-ci.yml');
    if (!existsSync(ciPath)) {
      writeFileSync(ciPath, buildGitlabCi());
      messages.push('created  .gitlab-ci.yml');
    } else {
      // Append taproot job if not already present
      const existing = readFileSync(ciPath, 'utf-8');
      if (!existing.includes('taproot-validate')) {
        writeFileSync(ciPath, existing.trimEnd() + '\n\n' + buildGitlabCiJob());
        messages.push('updated  .gitlab-ci.yml (appended taproot-validate job)');
      } else {
        messages.push('exists   .gitlab-ci.yml');
      }
    }
  }

  messages.push('');
  messages.push('Taproot initialized. Run `taproot validate-structure` to verify.');
  return messages;
}

export function installSkills(targetSkillsDir: string): string[] {
  const messages: string[] = [];

  if (!existsSync(BUNDLED_SKILLS_DIR)) {
    messages.push(`warning  Skills directory not found at ${BUNDLED_SKILLS_DIR} — skipping`);
    return messages;
  }

  mkdirSync(targetSkillsDir, { recursive: true });

  for (const filename of SKILL_FILES) {
    const src = join(BUNDLED_SKILLS_DIR, filename);
    const dest = join(targetSkillsDir, filename);
    if (!existsSync(src)) {
      messages.push(`warning  Skill file not found: ${filename}`);
      continue;
    }
    const content = readFileSync(src, 'utf-8');
    if (!existsSync(dest)) {
      writeFileSync(dest, content);
      messages.push(`created  taproot/skills/${filename}`);
    } else {
      messages.push(`exists   taproot/skills/${filename}`);
    }
  }

  return messages;
}

function buildConventionsDoc(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `# Taproot Conventions

Auto-generated reference for document formats and commit conventions.

## Document Formats

### intent.md — Business Intent

\`\`\`markdown
${intentTemplate(date)}\`\`\`

### usecase.md — Behaviour (UseCase)

\`\`\`markdown
${behaviourTemplate(date)}\`\`\`

### impl.md — Implementation

\`\`\`markdown
${implTemplate(date)}\`\`\`

## Folder Naming

- Lowercase kebab-case: \`^[a-z0-9]+(-[a-z0-9]+)*\$\`
- Each folder is exactly one type (intent, behaviour, or implementation)
- Identified by its marker file: \`intent.md\`, \`usecase.md\`, or \`impl.md\`

## Commit Convention

Link commits to implementations using the conventional tag format:

\`\`\`
taproot(<intent>/<behaviour>/<impl>): <message>
\`\`\`

Or use a commit trailer:

\`\`\`
Taproot: <intent>/<behaviour>/<impl>
\`\`\`

## Folder Structure

\`\`\`
taproot/
├── <intent-slug>/
│   ├── intent.md
│   └── <behaviour-slug>/
│       ├── usecase.md
│       └── <implementation-slug>/
│           └── impl.md
\`\`\`
`;
}

function buildGithubWorkflow(): string {
  return `name: Taproot Validation

on:
  pull_request:
  push:
    branches: [main, master]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g taproot
      - run: taproot validate-structure
      - run: taproot validate-format
      - run: taproot check-orphans
`;
}

function buildGitlabCiJob(): string {
  return `taproot-validate:
  stage: test
  image: node:20-alpine
  script:
    - npm install -g taproot
    - taproot validate-structure
    - taproot validate-format
    - taproot check-orphans
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH`;
}

function buildGitlabCi(): string {
  return `stages:
  - test

${buildGitlabCiJob()}
`;
}
