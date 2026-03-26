import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync, cpSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import type { Command } from 'commander';
import { DEFAULT_CONFIG } from '../core/config.js';
import { substituteTokens, applyVocabulary, getStructuralKeys, type LanguagePack } from '../core/language.js';
import { intentTemplate, behaviourTemplate, implTemplate } from '../templates/index.js';
import { generateAdapters, ALL_AGENTS, AGENT_TIERS, getTierLabel, type AgentName } from '../adapters/index.js';
import checkbox from '@inquirer/checkbox';
import confirm from '@inquirer/confirm';
import select from '@inquirer/select';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Bundled skills directory — two levels up from src/commands/ → package root → skills/
const BUNDLED_SKILLS_DIR = resolve(__dirname, '..', '..', 'skills');

// Bundled docs directory — two levels up from src/commands/ → package root → docs/
const BUNDLED_DOCS_DIR = resolve(__dirname, '..', '..', 'docs');

// Bundled examples directory — two levels up from src/commands/ → package root → examples/
const BUNDLED_EXAMPLES_DIR = resolve(__dirname, '..', '..', 'examples');

export const AVAILABLE_TEMPLATES = ['webapp', 'book-authoring', 'cli-tool'] as const;
export type TemplateName = typeof AVAILABLE_TEMPLATES[number];

export const SKILL_FILES = [
  'analyse-change.md',
  'review.md',
  'review-all.md',
  'grill-me.md',
  'intent.md',
  'behaviour.md',
  'implement.md',
  'trace.md',
  'status.md',
  'refine.md',
  'promote.md',
  'decompose.md',
  'plan.md',
  'guide.md',
  'discover.md',
  'ineed.md',
  'research.md',
  'sweep.md',
  'commit.md',
  'bug.md',
  'browse.md',
  'backlog.md',
];

export function applyTemplate(templateName: string, cwd: string, force = false): string[] {
  const messages: string[] = [];

  if (!(AVAILABLE_TEMPLATES as readonly string[]).includes(templateName)) {
    throw new Error(`Unknown template: '${templateName}'. Available: ${AVAILABLE_TEMPLATES.join(', ')}`);
  }

  const templateDir = join(BUNDLED_EXAMPLES_DIR, templateName);
  if (!existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  const srcTaprootDir = join(templateDir, 'taproot');
  const destTaprootDir = join(cwd, 'taproot');
  if (existsSync(srcTaprootDir)) {
    cpSync(srcTaprootDir, destTaprootDir, { recursive: true });
    messages.push(`created  taproot/ (from ${templateName} template)`);
  }

  const srcSettings = join(templateDir, '.taproot', 'settings.yaml');
  const destSettings = join(cwd, '.taproot', 'settings.yaml');
  if (existsSync(srcSettings)) {
    if (!existsSync(destSettings) || force) {
      mkdirSync(join(cwd, '.taproot'), { recursive: true });
      cpSync(srcSettings, destSettings);
      messages.push(`created  .taproot/settings.yaml (from ${templateName} template)`);
    } else {
      messages.push(`exists   .taproot/settings.yaml (kept — template settings not applied)`);
    }
  }

  return messages;
}

export function registerInit(program: Command): void {
  program
    .command('init')
    .description('Initialize Taproot in the current project')
    .option('--with-hooks', 'Install git pre-commit hooks')
    .option('--with-ci <provider>', 'Generate CI workflow (github|gitlab)')
    .option('--with-skills', 'Install canonical skill definitions into taproot/skills/')
    .option('--agent <name>', `Generate agent adapter (${[...ALL_AGENTS, 'all'].join('|')})`)
    .option('--template <type>', `Start from a template (${AVAILABLE_TEMPLATES.join('|')})`)
    .option('--force', 'Overwrite existing files when applying a template')
    .option('--path <path>', 'Directory to initialize in', process.cwd())
    .action(async (options: { withHooks?: boolean; withCi?: string; withSkills?: boolean; agent?: string; template?: string; force?: boolean; path: string }) => {
      // Template prompt — only when taproot/ doesn't exist yet (fresh init)
      let template: string | undefined = options.template;
      if (!template) {
        const taprootDir = resolve(options.path, DEFAULT_CONFIG.root);
        if (!existsSync(taprootDir)) {
          const wantsTemplate = await confirm({
            message: 'Start from a template?',
            default: false,
          });
          if (wantsTemplate) {
            template = await select({
              message: 'Choose a template:',
              choices: [
                { name: 'webapp        — User auth, profiles, common web app patterns', value: 'webapp' },
                { name: 'book-authoring — Manuscript, chapters, editorial review', value: 'book-authoring' },
                { name: 'cli-tool      — Command dispatch, help output, configuration', value: 'cli-tool' },
              ],
            });
          }
        }
      }

      if (template) {
        const templateMessages = applyTemplate(template, options.path, options.force ?? false);
        for (const msg of templateMessages) {
          process.stdout.write(msg + '\n');
        }
      }

      let agent: AgentName | AgentName[] | 'all' | undefined = options.agent as AgentName | 'all' | undefined;

      if (!agent) {
        const AGENT_BASE_LABELS: Record<AgentName, string> = {
          claude: 'Claude Code',
          cursor: 'Cursor',
          copilot: 'GitHub Copilot',
          windsurf: 'Windsurf',
          gemini: 'Gemini CLI',
          aider: 'Aider',
          generic: 'Generic (any AI agent)',
        };
        const selected = await checkbox({
          message: 'Which agent adapter(s) would you like to generate?',
          choices: ALL_AGENTS.map((a) => ({
            name: `${AGENT_BASE_LABELS[a]} (${getTierLabel(a)})`,
            value: a,
          })),
        });
        if (selected.length === ALL_AGENTS.length) {
          agent = 'all';
        } else if (selected.length > 0) {
          agent = selected as AgentName[];
        }
      }

      let withHooks = options.withHooks;
      if (!withHooks) {
        withHooks = await confirm({
          message: 'Install the pre-commit hook? (Strongly recommended — prevents implementation commits without traceability and requirement commits without quality checks)',
          default: true,
        });
      }

      const created = runInit({
        cwd: options.path,
        withHooks,
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

  if (!existsSync(join(cwd, '.git'))) {
    throw new Error('No git repository found. Run `git init` first, then re-run `taproot init`.');
  }

  const configPath = join(cwd, '.taproot', 'settings.yaml');
  const taprootDir = resolve(cwd, DEFAULT_CONFIG.root);
  const skillsDir = join(cwd, '.taproot', 'skills');

  // Create taproot/ directory
  if (!existsSync(taprootDir)) {
    mkdirSync(taprootDir, { recursive: true });
    messages.push(`created  ${DEFAULT_CONFIG.root}`);
  } else {
    messages.push(`exists   ${DEFAULT_CONFIG.root}`);
  }

  // Ensure .taproot/ directory exists
  mkdirSync(join(cwd, '.taproot'), { recursive: true });

  // Write .taproot/settings.yaml
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
    messages.push('created  .taproot/settings.yaml');
  } else {
    messages.push('exists   .taproot/settings.yaml');
  }

  // Write CONVENTIONS.md
  const conventionsPath = join(taprootDir, 'CONVENTIONS.md');
  if (!existsSync(conventionsPath)) {
    writeFileSync(conventionsPath, buildConventionsDoc());
    messages.push(`created  ${DEFAULT_CONFIG.root}CONVENTIONS.md`);
  }

  // Create global-truths/ with a hint README
  const globalTruthsDir = join(taprootDir, 'global-truths');
  const globalTruthsReadme = join(globalTruthsDir, 'README.md');
  if (!existsSync(globalTruthsDir)) {
    mkdirSync(globalTruthsDir, { recursive: true });
    writeFileSync(globalTruthsReadme, buildGlobalTruthsReadme());
    messages.push(`created  ${DEFAULT_CONFIG.root}global-truths/`);
    messages.push(`         Add shared truths here — domain terms, business rules, project conventions.`);
    messages.push(`         Scope by filename: glossary_intent.md · rules_behaviour.md · choices_impl.md`);
  }

  // Install skill definitions — always enabled when an adapter that references .taproot/skills/ is requested
  const agentList = options.agent === 'all'
    ? ALL_AGENTS
    : Array.isArray(options.agent)
    ? options.agent
    : options.agent
    ? [options.agent]
    : [];
  const needsSkills = options.withSkills || agentList.includes('claude') || agentList.includes('gemini');
  if (needsSkills) {
    messages.push(...installSkills(skillsDir));
    messages.push(...installDocs(join(cwd, '.taproot', 'docs')));
  }

  // Git pre-commit hook
  if (options.withHooks) {
    const hookDir = join(cwd, '.git', 'hooks');
    const hookPath = join(hookDir, 'pre-commit');
    if (existsSync(join(cwd, '.git')) && !existsSync(hookPath)) {
      mkdirSync(hookDir, { recursive: true });
      const pkgVersion = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'package.json'), 'utf-8')).version as string;
      writeFileSync(hookPath,
        `#!/bin/sh\nnpx @imix-js/taproot@${pkgVersion} commithook\n`,
        { mode: 0o755 }
      );
      messages.push('created  .git/hooks/pre-commit');
    }
  } else if (options.withHooks === false) {
    messages.push('skipped  .git/hooks/pre-commit — run `taproot init --with-hooks` to add it later');
  }

  // Agent adapters
  if (options.agent) {
    const results = generateAdapters(options.agent, cwd);
    for (const result of results) {
      if (result.error) {
        messages.push(`error    ${result.error}`);
        continue;
      }
      for (const file of result.files) {
        const rel = file.path.replace(cwd + '/', '').replace(cwd + '\\', '');
        const verb = file.status === 'created' ? 'created' : file.status === 'updated' ? 'updated' : 'exists ';
        messages.push(`${verb}  ${rel}`);
      }
      const tier = AGENT_TIERS[result.agent];
      messages.push(`         ${getTierLabel(result.agent)}`);
      if (tier === 3) {
        messages.push(`         Community-supported: adapter generated but not officially validated end-to-end. Feedback and fixes welcome.`);
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

export function installSkills(
  targetSkillsDir: string,
  force = false,
  pack?: LanguagePack | null,
  vocab?: Record<string, string> | null,
): string[] {
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
    let content = readFileSync(src, 'utf-8');
    if (pack) {
      content = substituteTokens(content, pack);
    }
    if (vocab && Object.keys(vocab).length > 0) {
      const structuralKeys = getStructuralKeys(pack ?? null);
      const { result, warnings } = applyVocabulary(content, vocab, structuralKeys);
      content = result;
      for (const w of warnings) {
        messages.push(`warning  ${w}`);
      }
    }
    if (!existsSync(dest)) {
      writeFileSync(dest, content);
      messages.push(`created  .taproot/skills/${filename}`);
    } else if (force) {
      writeFileSync(dest, content);
      messages.push(`updated  .taproot/skills/${filename}`);
    } else {
      messages.push(`exists   .taproot/skills/${filename}`);
    }
  }

  return messages;
}

export function installDocs(targetDocsDir: string, force = false): string[] {
  const messages: string[] = [];

  if (!existsSync(BUNDLED_DOCS_DIR)) {
    messages.push(`warning  Docs directory not found at ${BUNDLED_DOCS_DIR} — skipping`);
    return messages;
  }

  mkdirSync(targetDocsDir, { recursive: true });

  for (const filename of readdirSync(BUNDLED_DOCS_DIR).filter(f => f.endsWith('.md'))) {
    const src = join(BUNDLED_DOCS_DIR, filename);
    const dest = join(targetDocsDir, filename);
    const content = readFileSync(src, 'utf-8');
    if (!existsSync(dest)) {
      writeFileSync(dest, content);
      messages.push(`created  .taproot/docs/${filename}`);
    } else if (force) {
      writeFileSync(dest, content);
      messages.push(`updated  .taproot/docs/${filename}`);
    } else {
      messages.push(`exists   .taproot/docs/${filename}`);
    }
  }

  return messages;
}

function buildGlobalTruthsReadme(): string {
  return `# Global Truths

Shared facts that apply across the \`taproot/\` hierarchy — domain concepts, business rules,
entity definitions, and project conventions.

## How to add a truth

Create a \`.md\` file and name it to signal its scope:

| Scope | Applies to | Convention |
|-------|------------|------------|
| intent | All levels | \`name_intent.md\` or \`intent/name.md\` |
| behaviour | Behaviour + implementation | \`name_behaviour.md\` or \`behaviour/name.md\` |
| impl | Implementation only | \`name_impl.md\` or \`impl/name.md\` |

Files without a scope suffix default to intent scope (broadest).

## Examples

- \`glossary_intent.md\` — term definitions used across all specs
- \`business-rules_behaviour.md\` — rules that acceptance criteria must respect
- \`tech-choices_impl.md\` — conventions that apply only to implementation code

Truth content is free-form markdown — prose, tables, bullet lists, and headings are all valid.
`;
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
