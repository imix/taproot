import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { generateAdapters, ALL_AGENTS, type AgentName } from '../../src/adapters/index.js';
import { SKILL_FILES } from '../../src/commands/init.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'taproot-adapters-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ─── Claude Code ──────────────────────────────────────────────────────────────

describe('claude adapter', () => {
  it('creates one command file per skill in .claude/commands/ with tr- prefix', () => {
    generateAdapters('claude', tmpDir);
    for (const filename of SKILL_FILES) {
      const path = join(tmpDir, '.claude', 'commands', `tr-${filename}`);
      expect(existsSync(path), `Missing: tr-${filename}`).toBe(true);
    }
  });

  it('each command file has YAML frontmatter with name and description', () => {
    generateAdapters('claude', tmpDir);
    const intentPath = join(tmpDir, '.claude', 'commands', 'tr-intent.md');
    const content = readFileSync(intentPath, 'utf-8');
    expect(content).toMatch(/^---\nname: 'tr-intent'/);
    expect(content).toContain("description: '");
    expect(content).toContain('---');
  });

  it('each command file is a thin launcher referencing the skill file path', () => {
    generateAdapters('claude', tmpDir);
    const planPath = join(tmpDir, '.claude', 'commands', 'tr-plan.md');
    const content = readFileSync(planPath, 'utf-8');
    expect(content).toContain('@{project-root}/.taproot/skills/plan.md');
    // Should not inline skill body content
    expect(content).not.toContain('## Description');
    expect(content).not.toContain('## Inputs');
  });

  it('each command file contains imperative execution framing', () => {
    generateAdapters('claude', tmpDir);
    const grillPath = join(tmpDir, '.claude', 'commands', 'tr-review.md');
    const content = readFileSync(grillPath, 'utf-8');
    expect(content).toContain('IT IS CRITICAL THAT YOU FOLLOW THESE STEPS EXACTLY');
    expect(content).toContain('<steps CRITICAL="TRUE">');
    expect(content).toContain('</steps>');
  });

  it('thin launcher instructs to use /tr- commands instead of /taproot:', () => {
    generateAdapters('claude', tmpDir);
    const grillPath = join(tmpDir, '.claude', 'commands', 'tr-review.md');
    const content = readFileSync(grillPath, 'utf-8');
    expect(content).toContain('/taproot:intent');
    expect(content).toContain('/tr-intent');
  });

  it('is idempotent — running twice produces same output', () => {
    generateAdapters('claude', tmpDir);
    const firstContent = readFileSync(
      join(tmpDir, '.claude', 'commands', 'tr-intent.md'), 'utf-8'
    );
    generateAdapters('claude', tmpDir);
    const secondContent = readFileSync(
      join(tmpDir, '.claude', 'commands', 'tr-intent.md'), 'utf-8'
    );
    expect(firstContent).toBe(secondContent);
  });
});

// ─── Cursor ───────────────────────────────────────────────────────────────────

describe('cursor adapter', () => {
  it('creates .cursor/rules/taproot.md', () => {
    generateAdapters('cursor', tmpDir);
    expect(existsSync(join(tmpDir, '.cursor', 'rules', 'taproot.md'))).toBe(true);
  });

  it('combined file contains all skill invocations', () => {
    generateAdapters('cursor', tmpDir);
    const content = readFileSync(join(tmpDir, '.cursor', 'rules', 'taproot.md'), 'utf-8');
    for (const filename of SKILL_FILES) {
      const name = filename.replace('.md', '');
      expect(content).toContain(`@taproot ${name}`);
    }
  });

  it('includes frontmatter', () => {
    generateAdapters('cursor', tmpDir);
    const content = readFileSync(join(tmpDir, '.cursor', 'rules', 'taproot.md'), 'utf-8');
    expect(content).toMatch(/^---/);
    expect(content).toContain('description:');
  });

  it('is updated (not duplicated) on second run', () => {
    generateAdapters('cursor', tmpDir);
    generateAdapters('cursor', tmpDir);
    const content = readFileSync(join(tmpDir, '.cursor', 'rules', 'taproot.md'), 'utf-8');
    // Should not contain duplicate skill sections
    const occurrences = (content.match(/@taproot intent/g) ?? []).length;
    expect(occurrences).toBe(2); // once in index, once in full definition
  });
});

// ─── Copilot ──────────────────────────────────────────────────────────────────

describe('copilot adapter', () => {
  it('creates .github/copilot-instructions.md', () => {
    generateAdapters('copilot', tmpDir);
    expect(existsSync(join(tmpDir, '.github', 'copilot-instructions.md'))).toBe(true);
  });

  it('file contains Taproot section markers', () => {
    generateAdapters('copilot', tmpDir);
    const content = readFileSync(join(tmpDir, '.github', 'copilot-instructions.md'), 'utf-8');
    expect(content).toContain('<!-- TAPROOT:START -->');
    expect(content).toContain('<!-- TAPROOT:END -->');
  });

  it('lists all skill invocations', () => {
    generateAdapters('copilot', tmpDir);
    const content = readFileSync(join(tmpDir, '.github', 'copilot-instructions.md'), 'utf-8');
    for (const filename of SKILL_FILES) {
      expect(content).toContain(`/taproot:${filename.replace('.md', '')}`);
    }
  });

  it('appends to existing copilot-instructions.md without destroying content', () => {
    const ghDir = join(tmpDir, '.github');
    mkdirSync(ghDir, { recursive: true });
    const existing = '# My Project\n\nExisting instructions here.\n';
    writeFileSync(join(ghDir, 'copilot-instructions.md'), existing);

    generateAdapters('copilot', tmpDir);
    const content = readFileSync(join(ghDir, 'copilot-instructions.md'), 'utf-8');
    expect(content).toContain('# My Project');
    expect(content).toContain('Existing instructions here.');
    expect(content).toContain('<!-- TAPROOT:START -->');
  });

  it('replaces Taproot section on second run without duplicating', () => {
    generateAdapters('copilot', tmpDir);
    generateAdapters('copilot', tmpDir);
    const content = readFileSync(join(tmpDir, '.github', 'copilot-instructions.md'), 'utf-8');
    const starts = (content.match(/<!-- TAPROOT:START -->/g) ?? []).length;
    expect(starts).toBe(1);
  });
});

// ─── Windsurf ─────────────────────────────────────────────────────────────────

describe('windsurf adapter', () => {
  it('creates .windsurfrules', () => {
    generateAdapters('windsurf', tmpDir);
    expect(existsSync(join(tmpDir, '.windsurfrules'))).toBe(true);
  });

  it('contains all skill invocations', () => {
    generateAdapters('windsurf', tmpDir);
    const content = readFileSync(join(tmpDir, '.windsurfrules'), 'utf-8');
    for (const filename of SKILL_FILES) {
      expect(content).toContain(`/taproot:${filename.replace('.md', '')}`);
    }
  });

  it('appends to existing .windsurfrules without destroying content', () => {
    writeFileSync(join(tmpDir, '.windsurfrules'), '# Existing rules\n\nSome rule here.\n');
    generateAdapters('windsurf', tmpDir);
    const content = readFileSync(join(tmpDir, '.windsurfrules'), 'utf-8');
    expect(content).toContain('# Existing rules');
    expect(content).toContain('Some rule here.');
    expect(content).toContain('<!-- TAPROOT:START -->');
  });

  it('replaces Taproot section on second run', () => {
    generateAdapters('windsurf', tmpDir);
    generateAdapters('windsurf', tmpDir);
    const content = readFileSync(join(tmpDir, '.windsurfrules'), 'utf-8');
    const starts = (content.match(/<!-- TAPROOT:START -->/g) ?? []).length;
    expect(starts).toBe(1);
  });
});

// ─── Gemini CLI ───────────────────────────────────────────────────────────────

describe('gemini adapter', () => {
  it('AC-14: creates one .toml file per skill in .gemini/commands/ with tr- prefix', () => {
    generateAdapters('gemini', tmpDir);
    for (const filename of SKILL_FILES) {
      const name = filename.replace('.md', '');
      const path = join(tmpDir, '.gemini', 'commands', `tr-${name}.toml`);
      expect(existsSync(path), `Missing: tr-${name}.toml`).toBe(true);
    }
  });

  it('each command file references the skill file path', () => {
    generateAdapters('gemini', tmpDir);
    const intentPath = join(tmpDir, '.gemini', 'commands', 'tr-intent.toml');
    const content = readFileSync(intentPath, 'utf-8');
    expect(content).toContain('.taproot/skills/intent.md');
  });

  it('each command file has name and description fields', () => {
    generateAdapters('gemini', tmpDir);
    const intentPath = join(tmpDir, '.gemini', 'commands', 'tr-intent.toml');
    const content = readFileSync(intentPath, 'utf-8');
    expect(content).toContain('name = "tr-intent"');
    expect(content).toContain('description = "');
  });

  it('each command file contains imperative execution framing', () => {
    generateAdapters('gemini', tmpDir);
    const reviewPath = join(tmpDir, '.gemini', 'commands', 'tr-review.toml');
    const content = readFileSync(reviewPath, 'utf-8');
    expect(content).toContain('IT IS CRITICAL THAT YOU FOLLOW THESE STEPS EXACTLY');
  });

  it('is idempotent — running twice produces same output', () => {
    generateAdapters('gemini', tmpDir);
    const first = readFileSync(join(tmpDir, '.gemini', 'commands', 'tr-intent.toml'), 'utf-8');
    generateAdapters('gemini', tmpDir);
    const second = readFileSync(join(tmpDir, '.gemini', 'commands', 'tr-intent.toml'), 'utf-8');
    expect(first).toBe(second);
  });
});

// ─── Generic ──────────────────────────────────────────────────────────────────

describe('generic adapter', () => {
  it('creates AGENTS.md', () => {
    generateAdapters('generic', tmpDir);
    expect(existsSync(join(tmpDir, 'AGENTS.md'))).toBe(true);
  });

  it('contains full skill definitions', () => {
    generateAdapters('generic', tmpDir);
    const content = readFileSync(join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('## Description');
    expect(content).toContain('## Steps');
    for (const filename of SKILL_FILES) {
      expect(content).toContain(`/taproot:${filename.replace('.md', '')}`);
    }
  });

  it('includes CLI command reference', () => {
    generateAdapters('generic', tmpDir);
    const content = readFileSync(join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('taproot validate-structure');
    expect(content).toContain('taproot coverage');
  });

  it('appends to existing AGENTS.md without destroying content', () => {
    writeFileSync(join(tmpDir, 'AGENTS.md'), '# My Project Agents\n\nExisting content.\n');
    generateAdapters('generic', tmpDir);
    const content = readFileSync(join(tmpDir, 'AGENTS.md'), 'utf-8');
    expect(content).toContain('# My Project Agents');
    expect(content).toContain('Existing content.');
  });
});

// ─── --agent all ──────────────────────────────────────────────────────────────

describe('--agent all', () => {
  it('generates all six adapters', () => {
    const results = generateAdapters('all', tmpDir);
    const agents = results.map(r => r.agent).sort();
    expect(agents).toEqual([...ALL_AGENTS].sort());
  });

  it('all expected files exist after --agent all', () => {
    generateAdapters('all', tmpDir);
    expect(existsSync(join(tmpDir, '.claude', 'commands', 'tr-intent.md'))).toBe(true);
    expect(existsSync(join(tmpDir, '.cursor', 'rules', 'taproot.md'))).toBe(true);
    expect(existsSync(join(tmpDir, '.github', 'copilot-instructions.md'))).toBe(true);
    expect(existsSync(join(tmpDir, '.windsurfrules'))).toBe(true);
    expect(existsSync(join(tmpDir, '.gemini', 'commands', 'tr-intent.toml'))).toBe(true);
    expect(existsSync(join(tmpDir, 'AGENTS.md'))).toBe(true);
  });
});

// ─── init --agent integration ─────────────────────────────────────────────────

describe('taproot init --agent', () => {
  it('runInit with agent option generates adapter files', async () => {
    const { runInit } = await import('../../src/commands/init.js');
    runInit({ cwd: tmpDir, agent: 'generic' });
    expect(existsSync(join(tmpDir, 'AGENTS.md'))).toBe(true);
  });

  it('runInit messages include generated file paths', async () => {
    const { runInit } = await import('../../src/commands/init.js');
    const messages = runInit({ cwd: tmpDir, agent: 'cursor' });
    expect(messages.some(m => m.includes('taproot.md') || m.includes('.cursor'))).toBe(true);
  });

  it('runInit with claude agent auto-installs skills into taproot/skills/', async () => {
    const { runInit } = await import('../../src/commands/init.js');
    runInit({ cwd: tmpDir, agent: 'claude' });
    expect(existsSync(join(tmpDir, '.taproot', 'skills', 'plan.md'))).toBe(true);
    expect(existsSync(join(tmpDir, '.taproot', 'skills', 'intent.md'))).toBe(true);
  });
});
