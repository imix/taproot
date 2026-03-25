import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { parseMarkdown } from '../../src/core/markdown-parser.js';
import { SKILL_FILES } from '../../src/commands/init.js';

const SKILLS_DIR = resolve(__dirname, '../../skills');

const REQUIRED_SECTIONS = ['description', 'inputs', 'steps', 'output', 'cli dependencies'];

describe('canonical skill files', () => {
  it('skills directory exists', () => {
    expect(existsSync(SKILLS_DIR)).toBe(true);
  });

  it('all expected skill files are present', () => {
    for (const filename of SKILL_FILES) {
      const path = join(SKILLS_DIR, filename);
      expect(existsSync(path), `Missing skill file: ${filename}`).toBe(true);
    }
  });

  for (const filename of SKILL_FILES) {
    describe(filename, () => {
      const path = join(SKILLS_DIR, filename);

      it('is readable and non-empty', () => {
        const content = readFileSync(path, 'utf-8');
        expect(content.trim().length).toBeGreaterThan(100);
      });

      it('has an # Skill: heading', () => {
        const content = readFileSync(path, 'utf-8');
        expect(content).toMatch(/^# Skill:/m);
      });

      it('has all required sections', () => {
        const content = readFileSync(path, 'utf-8');
        const doc = parseMarkdown(path, content);
        for (const section of REQUIRED_SECTIONS) {
          expect(
            doc.sections.has(section),
            `${filename} is missing "## ${section[0]!.toUpperCase() + section.slice(1)}" section`
          ).toBe(true);
        }
      });

      it('Steps section has numbered list items', () => {
        const content = readFileSync(path, 'utf-8');
        const doc = parseMarkdown(path, content);
        const steps = doc.sections.get('steps');
        expect(steps).toBeDefined();
        const hasNumberedItem = steps!.bodyLines.some(l => /^\d+\./.test(l.trim()));
        expect(hasNumberedItem, `${filename} Steps section has no numbered list items`).toBe(true);
      });

      it('CLI Dependencies section lists taproot commands or "None"', () => {
        const content = readFileSync(path, 'utf-8');
        const doc = parseMarkdown(path, content);
        const cliDeps = doc.sections.get('cli dependencies');
        expect(cliDeps).toBeDefined();
        const body = cliDeps!.rawBody.trim();
        const valid = body.toLowerCase().includes('none') ||
          body.includes('taproot ') ||
          body.includes('taproot\n');
        expect(valid, `${filename}: CLI Dependencies should list taproot commands or "None"`).toBe(true);
      });
    });
  }
});

// ─── AC-1/AC-2: status.md Parked section ──────────────────────────────────────

describe('status.md — Parked section (AC-1, AC-2)', () => {
  const statusPath = resolve(SKILLS_DIR, 'status.md');
  const content = readFileSync(statusPath, 'utf-8');

  it('AC-1: references deferredBehaviours and deferredImpls JSON fields', () => {
    expect(content).toContain('deferredBehaviours');
    expect(content).toContain('deferredImpls');
  });

  it('AC-1: report template contains a ## Parked section', () => {
    expect(content).toContain('## Parked');
  });

  it('AC-2: Parked section includes instruction to omit when zero deferred items', () => {
    expect(content).toMatch(/omit.*if 0|if.*zero|if both are zero/i);
  });
});

// ─── AC-1/AC-3/AC-4: implement.md commit-awareness ────────────────────────────

describe('implement.md — commit-awareness (AC-1, AC-3, AC-4)', () => {
  const implementPath = resolve(SKILLS_DIR, 'implement.md');
  const content = readFileSync(implementPath, 'utf-8');

  it('AC-1: references .taproot/settings.yaml for pre-commit context', () => {
    expect(content).toContain('settings.yaml');
  });

  it('AC-3: declaration commit step surfaces DoR awareness', () => {
    expect(content).toMatch(/declaration commit/i);
    expect(content).toMatch(/definitionOfReady|DoR/);
  });

  it('AC-4: implementation commit step instructs impl.md real-diff requirement', () => {
    expect(content).toMatch(/implementation commit/i);
    expect(content).toMatch(/real diff/i);
  });
});

// ─── AC-1/AC-2/AC-4: sweep.md confirmation gate and live progress ─────────────

describe('sweep.md — confirmation gate and live progress (AC-1, AC-2, AC-4)', () => {
  const sweepPath = resolve(SKILLS_DIR, 'sweep.md');
  const content = readFileSync(sweepPath, 'utf-8');

  it('AC-1: [x] progress marking present in step 4 output', () => {
    expect(content).toContain('[x]');
  });

  it('AC-2: Y/N confirmation gate present before processing', () => {
    expect(content).toMatch(/\[Y\].*Yes.*\[N\].*No/s);
  });

  it('AC-2: cancelled when developer declines', () => {
    expect(content).toMatch(/cancelled/i);
  });

  it('AC-4: [x] progress line includes taproot path', () => {
    expect(content).toMatch(/\[x\] taproot\//);
  });

  it('cross-item context warning redirects to /tr-review-all', () => {
    expect(content).toContain('cross-item context');
    expect(content).toContain('tr-review-all');
  });
});

// ─── AC-1/AC-2/AC-6/AC-7: pattern-hints step in all four skills ───────────────

describe('pattern-hints — AC-1/AC-2/AC-6/AC-7: pattern check step present in all four skills', () => {
  const skills = [
    { name: 'ineed.md',     path: resolve(SKILLS_DIR, 'ineed.md') },
    { name: 'behaviour.md', path: resolve(SKILLS_DIR, 'behaviour.md') },
    { name: 'implement.md', path: resolve(SKILLS_DIR, 'implement.md') },
    { name: 'refine.md',    path: resolve(SKILLS_DIR, 'refine.md') },
  ];

  for (const skill of skills) {
    describe(skill.name, () => {
      const content = readFileSync(skill.path, 'utf-8');

      it('AC-1: contains .taproot/docs/patterns.md scan step', () => {
        expect(content).toContain('.taproot/docs/patterns.md');
      });

      it('AC-1: check-if-affected-by listed as trigger signal', () => {
        expect(content).toContain('check-if-affected-by');
      });

      it('AC-2: [A] and [B] choice offered to user', () => {
        expect(content).toMatch(/\[A\]/);
        expect(content).toMatch(/\[B\]/);
      });
    });
  }

  it('AC-6: ineed.md skips gracefully when .taproot/docs/patterns.md absent', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'ineed.md'), 'utf-8');
    expect(content).toMatch(/absent.*skip silently|skip silently/i);
  });

  it('AC-7: ineed.md [A] does not add hierarchy entry', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'ineed.md'), 'utf-8');
    expect(content).toMatch(/Do not create a new hierarchy entry/i);
  });

  it('AC-7: behaviour.md [A] does not write a new usecase.md', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'behaviour.md'), 'utf-8');
    expect(content).toMatch(/Do not write a new.*usecase\.md/i);
  });

  it('AC-7: refine.md [A] does not modify usecase.md', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'refine.md'), 'utf-8');
    expect(content).toMatch(/Do not modify.*usecase\.md/i);
  });
});

// ─── commit.md ────────────────────────────────────────────────────────────────

describe('commit.md — commit procedure skill', () => {
  const commitPath = resolve(SKILLS_DIR, 'commit.md');
  const content = readFileSync(commitPath, 'utf-8');

  it('AC-1: references taproot dod --resolve for one-at-a-time condition resolution', () => {
    expect(content).toContain('taproot dod');
    expect(content).toContain('--resolve');
    expect(content).toMatch(/one condition per invocation|One condition per invocation/);
  });

  it('AC-2: conversational trigger — announces staged changes and asks for confirmation', () => {
    expect(content).toMatch(/Nothing staged yet/);
    expect(content).toMatch(/Should I stage/i);
  });

  it('AC-4: declaration commit — blocks when parent usecase is draft or proposed', () => {
    expect(content).toMatch(/draft.*proposed|proposed.*draft/i);
    expect(content).toMatch(/\/tr-refine/);
  });

  it('AC-5: plain commit — no taproot gate runs', () => {
    expect(content).toMatch(/Plain commit/i);
    expect(content).toMatch(/no taproot gate runs/i);
  });

  it('AC-7: mass commit — offers [A]/[B]/[C] choice when N > 3', () => {
    expect(content).toMatch(/N > 3/);
    expect(content).toMatch(/\[A\]/);
    expect(content).toMatch(/\[B\]/);
    expect(content).toMatch(/\[C\]/);
  });

  it('requirement commit — runs validate-format and validate-structure proactively', () => {
    expect(content).toContain('validate-format');
    expect(content).toContain('validate-structure');
  });

  it('requirement commit — verifies intent.md and usecase.md quality before staging', () => {
    expect(content).toMatch(/intent\.md/);
    expect(content).toMatch(/usecase\.md/);
    expect(content).toMatch(/starts with a verb|start.*verb/i);
    expect(content).toMatch(/Acceptance Criteria/);
  });

  it('declaration commit — writes DoR Resolutions without taproot dor CLI', () => {
    expect(content).toMatch(/DoR Resolutions/);
    expect(content).toMatch(/no taproot dor CLI|There is no `taproot dor` CLI/i);
  });
});

// ─── AC-1/AC-2/AC-3: record-decision-rationale — discussion.md in skills ──────

describe('record-decision-rationale — discussion.md in implement.md and behaviour.md', () => {
  const implementPath = resolve(SKILLS_DIR, 'implement.md');
  const behaviourPath = resolve(SKILLS_DIR, 'behaviour.md');
  const implementContent = readFileSync(implementPath, 'utf-8');
  const behaviourContent = readFileSync(behaviourPath, 'utf-8');

  // AC-1: implement.md writes discussion.md before declaration commit
  it('AC-1: implement.md contains discussion.md step before declaration commit', () => {
    // Step 5b must appear before the declaration commit step (step 6)
    const step5bIdx = implementContent.indexOf('discussion.md');
    const declarationIdx = implementContent.indexOf('Declaration commit');
    expect(step5bIdx).toBeGreaterThan(0);
    expect(step5bIdx).toBeLessThan(declarationIdx);
  });

  it('AC-1: implement.md discussion.md step includes all four required sections', () => {
    expect(implementContent).toContain('Pivotal Questions');
    expect(implementContent).toContain('Alternatives Considered');
    expect(implementContent).toContain('Decision');
    expect(implementContent).toContain('Open Questions');
  });

  it('AC-1: implement.md stages discussion.md alongside impl.md in declaration commit', () => {
    expect(implementContent).toMatch(/Stage.*discussion\.md.*alongside.*impl\.md|discussion\.md.*alongside.*impl\.md/i);
  });

  // AC-2: behaviour.md has optional discussion.md step
  it('AC-2: behaviour.md contains optional discussion.md step after writing usecase.md', () => {
    expect(behaviourContent).toContain('discussion.md');
    expect(behaviourContent).toMatch(/Optionally write.*discussion\.md|optional.*discussion\.md/i);
  });

  it('AC-2: behaviour.md discussion.md step references the same four-section template', () => {
    expect(behaviourContent).toMatch(/Pivotal Questions|four-section template/i);
  });

  // AC-3: trivial session exemption documented in implement.md
  it('AC-3: implement.md documents when to skip discussion.md for trivial sessions', () => {
    expect(implementContent).toMatch(/When to skip|trivial/i);
    expect(implementContent).toMatch(/typo|minor|no design choices|no.*alternatives/i);
  });
});

// ─── AC-1/AC-2/AC-3/AC-4/AC-5/AC-8: browse.md ────────────────────────────────

describe('browse.md — section-by-section navigation skill', () => {
  const browsePath = resolve(SKILLS_DIR, 'browse.md');
  const content = readFileSync(browsePath, 'utf-8');

  it('AC-1: presents [C] Continue option at each section', () => {
    expect(content).toMatch(/\[C\].*Continue/);
  });

  it('AC-1: presents [M] Modify option at each section', () => {
    expect(content).toMatch(/\[M\].*Modify/);
  });

  it('AC-1: presents [S] Skip to children option', () => {
    expect(content).toMatch(/\[S\].*Skip/i);
  });

  it('AC-3: lists children at end of browse session', () => {
    expect(content).toMatch(/child|children|implementations|behaviours/i);
    expect(content).toMatch(/leaf|no children/i);
  });

  it('AC-4/AC-7: includes discussion.md context with anchor rules', () => {
    expect(content).toContain('discussion.md');
    expect(content).toMatch(/How we got here/i);
    expect(content).toMatch(/Main Flow|Design Decisions|Goal/);
  });

  it('AC-5: handles path not found with error message', () => {
    expect(content).toMatch(/No file found|does not exist|not found/i);
    expect(content).toMatch(/No intent\.md.*usecase\.md.*impl\.md|No.*hierarchy document/i);
  });

  it('AC-8: handles [M] change-of-mind gracefully', () => {
    expect(content).toMatch(/never mind|No changes/i);
  });
});

// ─── AC-1/AC-2/AC-5/AC-6/AC-7: backlog.md ────────────────────────────────────

describe('backlog.md — capture and triage skill', () => {
  const backlogPath = resolve(SKILLS_DIR, 'backlog.md');
  const content = readFileSync(backlogPath, 'utf-8');

  it('AC-1: capture confirms in one line with no follow-up', () => {
    expect(content).toMatch(/✓ Captured/);
    expect(content).toMatch(/no follow-up|no prompts|No follow-up/i);
  });

  it('AC-2: triage shows numbered list with indexed commands', () => {
    expect(content).toMatch(/D <n>|D \d/i);
    expect(content).toMatch(/P <n>|P \d/i);
    expect(content).toMatch(/A <n>|A \d/i);
    expect(content).toMatch(/done/i);
  });

  it('AC-3: D <n> discards item by index with confirmation', () => {
    expect(content).toMatch(/Discarded #/i);
  });

  it('AC-5: P <n> promotes item and delegates to /tr-ineed', () => {
    expect(content).toContain('/tr-ineed');
    expect(content).toMatch(/promote to \/tr-ineed/i);
  });

  it('AC-6: reports empty backlog message', () => {
    expect(content).toMatch(/Backlog is empty/i);
  });

  it('AC-7: shows triage completion summary on done', () => {
    expect(content).toMatch(/Triage complete/i);
    expect(content).toMatch(/discarded.*promoted.*kept|kept.*promoted.*discarded/i);
  });

  it('AC-8: A <n> produces structured analysis with complexity, impact, and choices', () => {
    expect(content).toMatch(/simple.*moderate.*significant|simple\/moderate\/significant/i);
    expect(content).toMatch(/minor addition.*meaningful improvement.*major capability|minor addition\/meaningful improvement\/major capability/i);
    expect(content).toMatch(/\[P\].*Promote to \/tr-ineed.*\[K\].*Keep.*\[D\].*Discard/i);
  });
});
