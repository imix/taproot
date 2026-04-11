import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync, cpSync, chmodSync, unlinkSync } from 'fs';
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

export function wrapperScript(): string {
  return [
    '#!/bin/sh',
    '# taproot binary resolver — maintained by taproot init/update, do not edit manually',
    '# Prefers globally installed/linked taproot binary; falls back to project-pinned version via npx.',
    'TAPROOT_SETTINGS="$(dirname "$0")/../../settings.yaml"',
    "TAPROOT_VERSION=$(grep '^taproot_version:' \"$TAPROOT_SETTINGS\" 2>/dev/null | awk '{print $2}' | tr -d \"'\\\"\")",
    'if command -v taproot >/dev/null 2>&1; then',
    '  exec taproot "$@"',
    'elif [ -n "$TAPROOT_VERSION" ]; then',
    '  exec npx --yes "@imix-js/taproot@$TAPROOT_VERSION" "$@"',
    'else',
    '  exec npx --yes "@imix-js/taproot" "$@"',
    'fi',
    '',
  ].join('\n');
}

export function hookScriptContent(): string {
  return `#!/bin/sh\nexec ./taproot/agent/bin/taproot commithook\n`;
}

export function buildSettingsYaml(
  pkgVersion: string,
  vocabulary?: Record<string, string>,
  language?: string,
): string {
  const vocabBlock = vocabulary && Object.keys(vocabulary).length > 0
    ? `\n# Domain vocabulary — overrides default taproot terms in skill instructions\nvocabulary:\n${Object.entries(vocabulary).map(([k, v]) => `  '${k}': '${v}'`).join('\n')}\n`
    : '';
  const langBlock = language ? `\nlanguage: '${language}'\n` : '';

  const availableModules = Object.keys(MODULE_SKILL_FILES).join(', ');
  return `taproot_version: '${pkgVersion}'
version: 1
root: taproot/specs/
cli: ./taproot/agent/bin/taproot

# Quality modules — optional skill packs installed by \`taproot update\`.
# Available: ${availableModules}
# modules:
#   - user-experience

# Agent adapters installed by \`taproot update\`. Remove any you don't use.
# Each adapter installs slash commands (e.g. /tr-implement) for that agent.
agents:
  - claude    # Claude Code → .claude/commands/tr-*.md
  - cursor    # Cursor → .cursor/rules/taproot.md
  - generic   # Any agent → AGENTS.md

commit_pattern: 'taproot\\(([^)]+)\\):'
commit_trailer: Taproot

validation:
  require_dates: true
  require_status: true
  allowed_intent_states: [draft, active, achieved, deprecated]
  allowed_behaviour_states: [proposed, specified, implemented, tested, deprecated]
  allowed_impl_states: [planned, in-progress, complete, needs-rework]

# naRules: auto-resolve DoD conditions as N/A when the implementation does not apply.
# 'prose-only'     = no source code files changed (documentation or spec commits)
# 'no-skill-files' = no skills/*.md files listed in the impl's Source Files
naRules:
  - condition: 'check-if-affected: package.json'
    when: prose-only
  - condition: 'check-if-affected: skills/guide.md'
    when: no-skill-files
  - condition: 'check-if-affected-by: skill-architecture/context-engineering'
    when: no-skill-files
  - condition: 'check-if-affected-by: human-integration/pause-and-confirm'
    when: no-skill-files
  - condition: 'check-if-affected-by: human-integration/contextual-next-steps'
    when: no-skill-files
  - condition: 'check-if-affected-by: agent-integration/agent-agnostic-language'
    when: no-skill-files
  - condition: 'check-if-affected-by: skill-architecture/commit-awareness'
    when: no-skill-files
${vocabBlock}${langBlock}
# ── definitionOfReady ─────────────────────────────────────────────────────────
# Conditions checked before a new impl.md can be declared (pre-implementation gate).
# Uncomment and customise:
#
# definitionOfReady:
#   - check-if-affected-by: your-cross-cutting-concern/usecase.md
#     # Reads the spec at that path; verifies this implementation complies.
#     # Path is relative to the hierarchy root (root: above) — omit the root prefix.

# ── definitionOfDone ──────────────────────────────────────────────────────────
# Conditions checked before an implementation commit is accepted (post-implementation gate).
#
# Condition types:
#   tests-passing                        — runs \`npm test\` (override with run: command)
#   document-current: <description>      — agent reads docs, compares to what changed, updates if stale
#   check-if-affected: <file-or-dir>     — agent checks if <file> needs updating; applies changes or records N/A
#   check-if-affected-by: <path>         — agent reads the behaviour spec at <path> and verifies compliance;
#                                          if the implementation is affected, agent corrects any violations
#   check: "<question>"                  — agent reasons about the question; if yes, takes the stated action
#
# Uncomment and customise:
#
# definitionOfDone:
#   - tests-passing
#   - document-current: README.md and docs/ accurately reflect all implemented features
#   - check-if-affected: docs/
#   - check-if-affected-by: your-architecture-rule/usecase.md
#   - check: "does this change affect the public API contract?"
`;
}

// Bundled skills directory — two levels up from src/commands/ → package root → skills/
const BUNDLED_SKILLS_DIR = resolve(__dirname, '..', '..', 'skills');

// Bundled docs directory — two levels up from src/commands/ → package root → docs/
const BUNDLED_DOCS_DIR = resolve(__dirname, '..', '..', 'docs');

// Bundled examples directory — two levels up from src/commands/ → package root → examples/
const BUNDLED_EXAMPLES_DIR = resolve(__dirname, '..', '..', 'examples');

export const AVAILABLE_TEMPLATES = ['webapp', 'cli-tool'] as const;
export type TemplateName = typeof AVAILABLE_TEMPLATES[number];

export const TEMPLATE_PROMPT_CHOICES: Array<{ name: string; value: string }> = [
  { name: 'No template — start with an empty hierarchy', value: '' },
  { name: 'webapp        — SaaS web application (user auth, profiles)', value: 'webapp' },
  { name: 'cli-tool      — Command-line tool or developer utility', value: 'cli-tool' },
];

export const DOMAIN_PRESETS: Record<string, { label: string; vocabulary: Record<string, string> }> = {
  coding: { label: 'Coding / software', vocabulary: {} },
  'technical-writing': {
    label: 'Technical writing',
    vocabulary: { 'source files': 'documents', tests: 'reviews', implementation: 'writing', build: 'publish' },
  },
};
export const AVAILABLE_PRESETS = Object.keys(DOMAIN_PRESETS);

const AVAILABLE_LANGUAGES: Array<{ name: string; value: string }> = [
  { name: 'No — English only', value: '' },
  { name: 'German', value: 'de' },
  { name: 'French', value: 'fr' },
  { name: 'Spanish', value: 'es' },
  { name: 'Japanese', value: 'ja' },
  { name: 'Portuguese', value: 'pt' },
];

export const SKILL_FILES = [
  'audit.md',
  'audit-all.md',
  'grill-me.md',
  'intent.md',
  'behaviour.md',
  'implement.md',
  'trace.md',
  'status.md',
  'refine.md',
  'promote.md',
  'next.md',
  'plan.md',
  'plan-execute.md',
  'plan-analyse.md',
  'guide.md',
  'discover.md',
  'discover-truths.md',
  'define-truth.md',
  'ineed.md',
  'research.md',
  'sweep.md',
  'commit.md',
  'bug.md',
  'browse.md',
  'backlog.md',
  'link.md',
  'explore.md',
];

/** Maps module name → skill filenames. Skills here are only installed when the module is declared. */
export const MODULE_SKILL_FILES: Record<string, string[]> = {
  'user-experience': [
    'ux-define.md',
    'ux-orientation.md',
    'ux-flow.md',
    'ux-feedback.md',
    'ux-input.md',
    'ux-presentation.md',
    'ux-language.md',
    'ux-accessibility.md',
    'ux-adaptation.md',
    'ux-consistency.md',
  ],
};

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
  if (existsSync(destTaprootDir) && !force) {
    throw new Error(`taproot/ already exists — use --force to overwrite or copy manually from examples/${templateName}/`);
  }
  if (existsSync(srcTaprootDir)) {
    cpSync(srcTaprootDir, destTaprootDir, { recursive: true });
    messages.push(`created  taproot/ (from ${templateName} template)`);
  }

  // Check new layout (taproot/settings.yaml) first, then fall back to old layout (.taproot/settings.yaml)
  const srcSettingsNew = join(templateDir, 'taproot', 'settings.yaml');
  const srcSettingsOld = join(templateDir, '.taproot', 'settings.yaml');
  const srcSettings = existsSync(srcSettingsNew) ? srcSettingsNew : srcSettingsOld;
  const destSettings = join(cwd, 'taproot', 'settings.yaml');
  if (existsSync(srcSettings)) {
    if (!existsSync(destSettings) || force) {
      mkdirSync(join(cwd, 'taproot'), { recursive: true });
      cpSync(srcSettings, destSettings);
      messages.push(`created  taproot/settings.yaml (from ${templateName} template)`);
    } else {
      messages.push(`exists   taproot/settings.yaml (kept — template settings not applied)`);
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
    .option('--preset <name>', `Apply a domain preset (${AVAILABLE_PRESETS.join('|')})`)
    .option('--force', 'Overwrite existing files when applying a template')
    .option('--path <path>', 'Directory to initialize in', process.cwd())
    .action(async (options: { withHooks?: boolean; withCi?: string; withSkills?: boolean; agent?: string; template?: string; preset?: string; force?: boolean; path: string }) => {
      // Fail early: check git repository before any user interaction (AC-13)
      if (!existsSync(join(options.path, '.git'))) {
        throw new Error('No git repository found. Run `git init` first, then re-run `taproot init`.');
      }

      // Template prompt — only when taproot/ doesn't exist yet (fresh init)
      let template: string | undefined = options.template;
      if (!template) {
        const taprootDir = resolve(options.path, DEFAULT_CONFIG.root);
        if (!existsSync(taprootDir)) {
          const chosen = await select<string>({
            message: 'Start from a template?',
            choices: TEMPLATE_PROMPT_CHOICES,
          });
          if (chosen) {
            template = chosen;
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

      // Domain preset prompt — skip if --preset flag given or vocabulary already exists
      let resolvedVocabulary: Record<string, string> | undefined;
      let resolvedLanguage: string | undefined;

      if (options.preset !== undefined) {
        // Non-interactive: validate and apply
        if (!AVAILABLE_PRESETS.includes(options.preset)) {
          throw new Error(`Unknown preset: '${options.preset}'. Available: ${AVAILABLE_PRESETS.join(', ')}`);
        }
        const presetDef = DOMAIN_PRESETS[options.preset];
        resolvedVocabulary = presetDef != null ? presetDef.vocabulary : {};
      } else {
        // Check if vocabulary already exists in settings.yaml (idempotent re-run)
        // Support both new layout (taproot/settings.yaml) and old layout (.taproot/settings.yaml)
        const newSettingsPath = join(options.path, 'taproot', 'settings.yaml');
        const configPath = existsSync(newSettingsPath)
          ? newSettingsPath
          : join(options.path, '.taproot', 'settings.yaml');
        const alreadyHasVocab = existsSync(configPath) && (() => {
          try {
            const existing = yaml.load(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
            return existing && typeof existing === 'object' && 'vocabulary' in existing;
          } catch { return false; }
        })();

        if (alreadyHasVocab) {
          process.stdout.write('exists   vocabulary settings (kept — not overwritten)\n');
        } else {
          // Interactive preset selection
          const presetChoice = await select({
            message: 'What kind of project is this? (Determines how taproot labels things like \'tests\' and \'source files\')',
            choices: [
              { name: 'Coding / software (default — no changes)', value: 'coding' },
              { name: 'Technical writing — source files → documents, tests → reviews', value: 'technical-writing' },
              { name: 'Skip — I\'ll configure manually later', value: 'skip' },
            ],
          });

          if (presetChoice !== 'coding' && presetChoice !== 'skip') {
            const preset = DOMAIN_PRESETS[presetChoice]!;
            const pairs = Object.entries(preset.vocabulary).map(([k, v]) => `${k}: ${v}`).join(' · ');
            process.stdout.write(`\nThis will add to taproot/settings.yaml:\n  ${pairs}\n\n`);
            const confirmed = await confirm({ message: 'Apply this vocabulary preset?', default: true });
            if (confirmed) {
              resolvedVocabulary = preset.vocabulary;
            } else {
              // Return to selection — simplest UX: just note it was skipped
              process.stdout.write('Vocabulary preset not applied. You can configure it manually in taproot/settings.yaml\n');
            }
          } else if (presetChoice === 'skip') {
            process.stdout.write('Vocabulary and language can be configured in taproot/settings.yaml — see taproot/agent/docs/configuration.md\n');
          }
        }

        // Language prompt (always shown unless vocabulary already existed)
        if (!alreadyHasVocab) {
          const langChoice = await select({
            message: 'Non-English project?',
            choices: AVAILABLE_LANGUAGES,
          });
          if (langChoice) {
            resolvedLanguage = langChoice;
          }
        }
      }

      let withHooks = options.withHooks;
      if (!withHooks) {
        withHooks = await confirm({
          message: 'Install the pre-commit hook? (Strongly recommended)',
          default: true,
        });
      }

      const created = runInit({
        cwd: options.path,
        withHooks,
        withCi: options.withCi,
        withSkills: options.withSkills,
        agent,
        vocabulary: resolvedVocabulary,
        language: resolvedLanguage,
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
  vocabulary?: Record<string, string>;
  language?: string;
  preset?: string;
}): string[] {
  const cwd = options.cwd ?? process.cwd();
  const messages: string[] = [];

  if (!existsSync(join(cwd, '.git'))) {
    throw new Error('No git repository found. Run `git init` first, then re-run `taproot init`.');
  }

  // Resolve preset → vocabulary (programmatic/non-interactive path)
  let resolvedVocabulary = options.vocabulary;
  const resolvedLanguage = options.language;
  if (options.preset !== undefined) {
    if (!AVAILABLE_PRESETS.includes(options.preset)) {
      throw new Error(`Unknown preset: '${options.preset}'. Available: ${AVAILABLE_PRESETS.join(', ')}`);
    }
    const presetDef = DOMAIN_PRESETS[options.preset];
    resolvedVocabulary = presetDef != null ? presetDef.vocabulary : {};
  }

  const taprootDir = resolve(cwd, 'taproot');
  const specsDir = join(taprootDir, 'specs');
  const agentDir = join(taprootDir, 'agent');
  const configPath = join(taprootDir, 'settings.yaml');
  const skillsDir = join(agentDir, 'skills');

  // Create taproot/ directory
  if (!existsSync(taprootDir)) {
    mkdirSync(taprootDir, { recursive: true });
    messages.push('created  taproot/');
  } else {
    messages.push('exists   taproot/');
  }

  // Create taproot/specs/ for the requirements hierarchy
  if (!existsSync(specsDir)) {
    mkdirSync(specsDir, { recursive: true });
    messages.push('created  taproot/specs/');
  } else {
    messages.push('exists   taproot/specs/');
  }

  // Create taproot/agent/ for skills and configuration
  if (!existsSync(agentDir)) {
    mkdirSync(agentDir, { recursive: true });
    messages.push('created  taproot/agent/');
  } else {
    messages.push('exists   taproot/agent/');
  }

  // Write taproot/settings.yaml
  const pkgVersion = (JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'package.json'), 'utf-8')) as { version: string }).version;
  if (!existsSync(configPath)) {
    writeFileSync(configPath, buildSettingsYaml(pkgVersion, resolvedVocabulary ?? undefined, resolvedLanguage ?? undefined));
    messages.push('created  taproot/settings.yaml');
  } else {
    // Append vocabulary/language to existing settings.yaml if not already present
    let existingConfig: Record<string, unknown> = {};
    try {
      existingConfig = (yaml.load(readFileSync(configPath, 'utf-8')) as Record<string, unknown>) ?? {};
    } catch { /* use empty object */ }

    let updated = false;
    if (resolvedVocabulary && Object.keys(resolvedVocabulary).length > 0 && !('vocabulary' in existingConfig)) {
      existingConfig.vocabulary = resolvedVocabulary;
      updated = true;
    }
    if (resolvedLanguage && !('language' in existingConfig)) {
      existingConfig.language = resolvedLanguage;
      updated = true;
    }
    if (updated) {
      writeFileSync(configPath, yaml.dump(existingConfig));
      messages.push('updated  taproot/settings.yaml (vocabulary/language added)');
    } else {
      messages.push('exists   taproot/settings.yaml');
    }
  }

  // Remind to run taproot update if vocabulary or language was applied
  const appliedPreset = resolvedVocabulary && Object.keys(resolvedVocabulary).length > 0;
  const appliedLanguage = !!resolvedLanguage;

  // Write CONVENTIONS.md
  const conventionsPath = join(taprootDir, 'CONVENTIONS.md');
  if (!existsSync(conventionsPath)) {
    writeFileSync(conventionsPath, buildConventionsDoc());
    messages.push('created  taproot/CONVENTIONS.md');
  }

  // Create global-truths/ with a hint README
  const globalTruthsDir = join(taprootDir, 'global-truths');
  const globalTruthsReadme = join(globalTruthsDir, 'README.md');
  if (!existsSync(globalTruthsDir)) {
    mkdirSync(globalTruthsDir, { recursive: true });
    writeFileSync(globalTruthsReadme, buildGlobalTruthsReadme());
    messages.push('created  taproot/global-truths/');
    messages.push('         Add shared truths here — domain terms, business rules, project conventions.');
    messages.push('         Scope by filename: glossary_intent.md · rules_behaviour.md · choices_impl.md');
  }

  // Install skill definitions — always enabled when an adapter that references taproot/agent/skills/ is requested
  const agentList = options.agent === 'all'
    ? ALL_AGENTS
    : Array.isArray(options.agent)
    ? options.agent
    : options.agent
    ? [options.agent]
    : [];
  const needsSkills = options.withSkills || agentList.includes('claude') || agentList.includes('gemini');
  if (needsSkills) {
    messages.push(...installSkills(skillsDir, false, null, null, 'taproot/agent/skills'));
    messages.push(...installDocs(join(agentDir, 'docs'), false, 'taproot/agent/docs'));
    // Install module skills based on modules: setting (if any)
    let configModules: string[] = [];
    try {
      const existing = (yaml.load(readFileSync(configPath, 'utf-8')) as Record<string, unknown>) ?? {};
      if (Array.isArray(existing['modules'])) {
        configModules = existing['modules'] as string[];
      }
    } catch { /* no config yet */ }
    messages.push(...installModuleSkills(skillsDir, configModules, false, null, null, 'taproot/agent/skills'));
  }

  // taproot/agent/bin/taproot wrapper script (always installed — hook and local dev depend on it)
  const binDir = join(agentDir, 'bin');
  const wrapperPath = join(binDir, 'taproot');
  if (!existsSync(binDir)) mkdirSync(binDir, { recursive: true });
  if (!existsSync(wrapperPath)) {
    writeFileSync(wrapperPath, wrapperScript(), { mode: 0o755 });
    messages.push('created  taproot/agent/bin/taproot');
  }

  // Git pre-commit hook
  if (options.withHooks) {
    const hookDir = join(cwd, '.git', 'hooks');
    const hookPath = join(hookDir, 'pre-commit');
    if (existsSync(join(cwd, '.git')) && !existsSync(hookPath)) {
      mkdirSync(hookDir, { recursive: true });
      writeFileSync(hookPath, hookScriptContent(), { mode: 0o755 });
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

  // Append .taproot/ to .gitignore (AC-16/17) — created once at init; taproot update does not touch it
  const gitignorePath = join(cwd, '.gitignore');
  const gitignoreEntry = '.taproot/';
  if (existsSync(gitignorePath)) {
    const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
    if (gitignoreContent.split('\n').some(line => line.trim() === gitignoreEntry)) {
      messages.push('exists   .gitignore (.taproot/ already ignored)');
    } else {
      const appended = gitignoreContent.endsWith('\n')
        ? gitignoreContent + gitignoreEntry + '\n'
        : gitignoreContent + '\n' + gitignoreEntry + '\n';
      writeFileSync(gitignorePath, appended);
      messages.push('updated  .gitignore (.taproot/ appended)');
    }
  } else {
    writeFileSync(gitignorePath, gitignoreEntry + '\n');
    messages.push('created  .gitignore');
  }

  messages.push('');
  messages.push('Taproot initialized. Run `taproot validate-structure` to verify.');
  if (appliedPreset || appliedLanguage) {
    messages.push('         Run `taproot update` to apply vocabulary/language substitutions to skill files.');
  }
  return messages;
}

export function installSkills(
  targetSkillsDir: string,
  force = false,
  pack?: LanguagePack | null,
  vocab?: Record<string, string> | null,
  displayDir?: string,
): string[] {
  const messages: string[] = [];
  const prefix = displayDir ?? '.taproot/skills';

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
      messages.push(`created  ${prefix}/${filename}`);
    } else if (force) {
      writeFileSync(dest, content);
      messages.push(`updated  ${prefix}/${filename}`);
    } else {
      messages.push(`exists   ${prefix}/${filename}`);
    }
  }

  return messages;
}

/**
 * Install skill files for declared modules; remove skill files for undeclared modules.
 * Reports unknown module names with the list of available modules.
 */
export function installModuleSkills(
  targetSkillsDir: string,
  declaredModules: string[],
  force = false,
  pack?: LanguagePack | null,
  vocab?: Record<string, string> | null,
  displayDir?: string,
): string[] {
  const messages: string[] = [];
  const prefix = displayDir ?? '.taproot/skills';

  const availableModules = Object.keys(MODULE_SKILL_FILES);

  // Validate declared module names
  const unknownModules = declaredModules.filter(m => !MODULE_SKILL_FILES[m]);
  for (const unknown of unknownModules) {
    messages.push(`warning  Unknown module '${unknown}' — available: ${availableModules.join(', ')}`);
  }

  const validModules = declaredModules.filter(m => !!MODULE_SKILL_FILES[m]);

  // Determine which skill files should be installed
  const filesToInstall = new Set<string>();
  for (const mod of validModules) {
    for (const f of MODULE_SKILL_FILES[mod]!) {
      filesToInstall.add(f);
    }
  }

  // All known module skill files (across all modules)
  const allModuleFiles = new Set<string>();
  for (const files of Object.values(MODULE_SKILL_FILES)) {
    for (const f of files) allModuleFiles.add(f);
  }

  mkdirSync(targetSkillsDir, { recursive: true });

  // Remove skill files for undeclared modules
  for (const filename of allModuleFiles) {
    if (!filesToInstall.has(filename)) {
      const dest = join(targetSkillsDir, filename);
      if (existsSync(dest)) {
        unlinkSync(dest);
        messages.push(`removed  ${prefix}/${filename}`);
      }
    }
  }

  // Install skill files for declared modules
  if (filesToInstall.size === 0) {
    if (validModules.length === 0 && declaredModules.length === 0) {
      messages.push('modules  none declared — no module skills installed');
    }
    return messages;
  }

  for (const filename of filesToInstall) {
    const src = join(BUNDLED_SKILLS_DIR, filename);
    const dest = join(targetSkillsDir, filename);
    if (!existsSync(src)) {
      messages.push(`warning  Module skill file not found: ${filename}`);
      continue;
    }
    let content = readFileSync(src, 'utf-8');
    if (pack) content = substituteTokens(content, pack);
    if (vocab && Object.keys(vocab).length > 0) {
      const structuralKeys = getStructuralKeys(pack ?? null);
      const { result, warnings } = applyVocabulary(content, vocab, structuralKeys);
      content = result;
      for (const w of warnings) messages.push(`warning  ${w}`);
    }
    if (!existsSync(dest)) {
      writeFileSync(dest, content);
      messages.push(`created  ${prefix}/${filename}`);
    } else if (force) {
      writeFileSync(dest, content);
      messages.push(`updated  ${prefix}/${filename}`);
    } else {
      messages.push(`exists   ${prefix}/${filename}`);
    }
  }

  return messages;
}

export function installDocs(targetDocsDir: string, force = false, displayDir?: string): string[] {
  const messages: string[] = [];
  const prefix = displayDir ?? '.taproot/docs';

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
      messages.push(`created  ${prefix}/${filename}`);
    } else if (force) {
      writeFileSync(dest, content);
      messages.push(`updated  ${prefix}/${filename}`);
    } else {
      messages.push(`exists   ${prefix}/${filename}`);
    }
  }

  return messages;
}

function buildGlobalTruthsReadme(): string {
  return `# Global Truths

> **Taproot-managed directory.** Do not add \`intent.md\`, \`usecase.md\`, or \`impl.md\` files here.
> This directory is provided by taproot as a truth store — it is not a hierarchy node.
> Truths are automatically checked at commit time for every commit level — no configuration needed.

Shared facts that apply across the \`taproot/\` hierarchy — domain concepts, business rules,
entity definitions, and project conventions. Add truth files here directly; no intent or behaviour
spec is needed.

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
- \`ux-principles_intent.md\` — design principles that every feature must respect
- \`business-rules_behaviour.md\` — rules that acceptance criteria must respect
- \`architecture_impl.md\` — conventions that apply only to implementation code

Truth content is free-form markdown — prose, tables, bullet lists, and headings are all valid.

Run \`/tr-define-truth\` to capture a new truth interactively.
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
      - run: npm audit --audit-level=high
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
