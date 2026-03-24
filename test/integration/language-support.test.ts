import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runUpdate } from '../../src/commands/update.js';
import { runInit } from '../../src/commands/init.js';
import { runValidateFormat } from '../../src/commands/validate-format.js';
import { checkUsecaseQuality, checkIntentQuality } from '../../src/commands/commithook.js';
import { runDorChecks } from '../../src/core/dor-runner.js';
import { checkAcceptanceCriteria } from '../../src/validators/format-rules.js';
import { loadLanguagePack } from '../../src/core/language.js';
import { parseMarkdown } from '../../src/core/markdown-parser.js';
import type { FolderNode } from '../../src/validators/types.js';

function writeSettings(dir: string, extra: Record<string, unknown> = {}): void {
  const base = { version: 1, root: 'taproot/', ...extra };
  mkdirSync(join(dir, '.taproot'), { recursive: true });
  writeFileSync(join(dir, '.taproot', 'settings.yaml'),
    Object.entries(base).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')
  );
}

function writeGermanUsecase(dir: string, path: string): void {
  mkdirSync(join(dir, ...path.split('/').slice(0, -1)), { recursive: true });
  writeFileSync(join(dir, path), `# Behaviour: Test

## Akteur
Entwickler

## Vorbedingungen
- Angemeldet

## Hauptablauf
1. Schritt

## Nachbedingungen
- Erledigt

## Akzeptanzkriterien

**AC-1: Test**
- Gegeben die Bedingung
- Wenn die Aktion
- Dann das Ergebnis

## Status
- **State:** spezifiziert
- **Created:** 2026-03-23
- **Last reviewed:** 2026-03-23
`);
}

describe('language-support integration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-lang-test-'));
    mkdirSync(join(tmpDir, '.git'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // AC-1: taproot update with language: de produces German skill files
  it('AC-1: taproot update applies German language pack to skill files', async () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    writeSettings(tmpDir, { language: 'de' });

    const messages = await runUpdate({ cwd: tmpDir });
    expect(messages.some(m => m.startsWith('error'))).toBe(false);
    expect(messages.some(m => m.includes('de ('))).toBe(true); // language pack message

    // Check a skill file has German tokens
    const skillPath = join(tmpDir, '.taproot', 'skills', 'implement.md');
    if (existsSync(skillPath)) {
      const content = readFileSync(skillPath, 'utf-8');
      // 'Actor' should be replaced with 'Akteur' somewhere
      expect(content).toContain('Akteur');
    }
  });

  // AC-2: validate-format accepts German-header documents when language: de
  it('AC-2: validate-format accepts German section headers when language: de is configured', async () => {
    runInit({ cwd: tmpDir });
    writeSettings(tmpDir, { language: 'de' });
    writeGermanUsecase(tmpDir, 'taproot/my-intent/my-behaviour/usecase.md');

    // Also need intent.md
    mkdirSync(join(tmpDir, 'taproot', 'my-intent'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), `# Intent: Test

## Stakeholder
- User: needs the thing

## Ziel
Enable teams to do the thing.

## Erfolgskriterien
- [ ] criterion one

## Status
- **State:** aktiv
- **Created:** 2026-03-23
- **Last reviewed:** 2026-03-23
`);

    const violations = await runValidateFormat({ path: join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), cwd: tmpDir });
    const errors = violations.filter(v => v.type === 'error' && v.code === 'MISSING_SECTION');
    expect(errors).toHaveLength(0);
  });

  // AC-3: checkUsecaseQuality accepts German headers when pack is provided
  it('AC-3: checkUsecaseQuality passes for German usecase with German pack', () => {
    const pack = loadLanguagePack('de')!;
    const content = `# Behaviour: Test

## Akteur
Entwickler

## Akzeptanzkriterien

**AC-1: Test**
- Gegeben die Bedingung
- Wenn die Aktion
- Dann das Ergebnis

## Nachbedingungen
- Erledigt
`;
    const failures = checkUsecaseQuality('test/usecase.md', content, pack);
    expect(failures).toHaveLength(0);
  });

  it('AC-3: checkUsecaseQuality fails for German usecase without pack (English headers expected)', () => {
    const content = `# Behaviour: Test

## Akteur
Entwickler

## Akzeptanzkriterien

**AC-1: Test**
- Gegeben

## Nachbedingungen
- Erledigt
`;
    // Without pack, expects English 'Acceptance Criteria' — should fail
    const failures = checkUsecaseQuality('test/usecase.md', content, null);
    expect(failures.some(f => f.message.includes('Acceptance Criteria'))).toBe(true);
  });

  it('AC-3: checkIntentQuality passes for German intent with German pack', () => {
    const pack = loadLanguagePack('de')!;
    const content = `# Intent: Test

## Stakeholder
- Nutzer: braucht das

## Ziel
Befähige Teams, die Sache zu erledigen.

## Erfolgskriterien
- [ ] criterion one
`;
    const failures = checkIntentQuality('test/intent.md', content, pack);
    expect(failures).toHaveLength(0);
  });

  it('AC-3: checkIntentQuality skips verb check for non-English goal when pack is active', () => {
    const pack = loadLanguagePack('de')!;
    const content = `# Intent: Test

## Stakeholder
- Nutzer: braucht das

## Ziel
Begleite Entwickler durch den Prozess.

## Erfolgskriterien
- [ ] criterion one
`;
    // German verb "Begleite" does not match VERB_STARTS — must pass when pack is active
    const failures = checkIntentQuality('test/intent.md', content, pack);
    expect(failures.some(f => f.message.includes('does not start with a verb'))).toBe(false);
  });

  it('AC-3: checkIntentQuality still fails verb check without pack', () => {
    const content = `# Intent: Test

## Stakeholders
- Developer: needs it

## Goal
Begleite teams through the process.

## Success Criteria
- [ ] criterion one
`;
    // Without pack, German verb must fail English VERB_STARTS
    const failures = checkIntentQuality('test/intent.md', content, null);
    expect(failures.some(f => f.message.includes('does not start with a verb'))).toBe(true);
  });

  // AC-4: unknown language code aborts, no files modified
  it('AC-4: taproot update with unknown language code aborts and returns error', async () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    writeSettings(tmpDir, { language: 'xx' });

    // Note the skill timestamps before
    const skillPath = join(tmpDir, '.taproot', 'skills', 'implement.md');
    const beforeContent = existsSync(skillPath) ? readFileSync(skillPath, 'utf-8') : null;

    const messages = await runUpdate({ cwd: tmpDir });
    expect(messages.some(m => m.startsWith('error'))).toBe(true);
    expect(messages.some(m => m.includes('xx'))).toBe(true);
    expect(messages.some(m => m.includes('Supported:'))).toBe(true);

    // Skills must not be modified
    if (beforeContent !== null) {
      const afterContent = existsSync(skillPath) ? readFileSync(skillPath, 'utf-8') : null;
      expect(afterContent).toBe(beforeContent);
    }
  });

  // AC-5: all five language packs load and produce substitution in skill files
  it('AC-5: all five language packs load and apply at least one substitution', async () => {
    for (const code of ['de', 'fr', 'es', 'ja', 'pt']) {
      const freshDir = mkdtempSync(join(tmpdir(), `taproot-lang-${code}-`));
      try {
        mkdirSync(join(freshDir, '.git'));
        runInit({ cwd: freshDir, agent: 'claude' });
        writeSettings(freshDir, { language: code });

        const messages = await runUpdate({ cwd: freshDir });
        expect(messages.some(m => m.startsWith('error')), `${code}: should not error`).toBe(false);

        const skillPath = join(freshDir, '.taproot', 'skills', 'implement.md');
        if (existsSync(skillPath)) {
          const content = readFileSync(skillPath, 'utf-8');
          // At minimum, 'Actor' should be replaced (it appears in all skill files)
          // English 'Actor' should not remain in the substituted positions for non-English packs
          const pack = loadLanguagePack(code)!;
          const localActor = pack['Actor']!;
          if (localActor !== 'Actor') {
            expect(content, `${code}: skill file should contain localised 'Actor' term`).toContain(localActor);
          }
        }
      } finally {
        rmSync(freshDir, { recursive: true, force: true });
      }
    }
  });

  // AC-3 regression: dor-runner accepts German usecase section headers when language: de
  it('AC-3: runDorChecks passes for German usecase when language: de is configured', () => {
    writeSettings(tmpDir, { language: 'de' });

    // Set up minimal hierarchy
    const intentDir = join(tmpDir, 'taproot', 'my-intent');
    const behaviourDir = join(intentDir, 'my-behaviour');
    const implDir = join(behaviourDir, 'my-impl');
    mkdirSync(implDir, { recursive: true });

    writeFileSync(join(behaviourDir, 'usecase.md'), `# Behaviour: Test

## Akteur
Entwickler

## Vorbedingungen
- Angemeldet

## Hauptablauf
1. Schritt

## Nachbedingungen
- Erledigt

## Akzeptanzkriterien

**AC-1: Test**
- Gegeben die Bedingung
- Wenn die Aktion
- Dann das Ergebnis

## Zugehörige

## Ablauf
\`\`\`mermaid
flowchart TD
    A --> B
\`\`\`

## Status
- **State:** specified
- **Created:** 2026-03-24
- **Last reviewed:** 2026-03-24
`);

    writeFileSync(join(implDir, 'impl.md'), `# Implementation: Test

## Behaviour
../usecase.md

## Status
- **State:** in-progress
- **Created:** 2026-03-24
`);

    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    const sectionFailures = report.results.filter(r =>
      r.name.startsWith('section-') && !r.passed
    );
    expect(sectionFailures).toHaveLength(0);
  });

  // AC-3 regression: checkAcceptanceCriteria accepts German AC heading with pack
  it('AC-3: checkAcceptanceCriteria passes for ## Akzeptanzkriterien when German pack is active', () => {
    const pack = loadLanguagePack('de')!;
    const content = `# Behaviour: Test

## Akzeptanzkriterien

**AC-1: Test**
- Gegeben die Bedingung
- Wenn die Aktion
- Dann das Ergebnis
`;
    const doc = parseMarkdown('test/usecase.md', content);
    const implChild = { name: 'my-impl', absolutePath: '/tmp/my-impl', relativePath: 'my-impl', marker: 'impl' as const, markerFiles: ['impl.md'], children: [], parent: null, depth: 3, hasDescendantWithMarker: false };
    const node = { name: 'my-behaviour', absolutePath: '/tmp/my-behaviour', relativePath: 'my-behaviour', marker: 'behaviour' as const, markerFiles: ['usecase.md'], children: [implChild], parent: null, depth: 2, hasDescendantWithMarker: true };
    const violations = checkAcceptanceCriteria(doc, node, pack);
    expect(violations.some(v => v.code === 'MISSING_ACCEPTANCE_CRITERIA')).toBe(false);
  });

  it('AC-3: checkAcceptanceCriteria reports missing AC for German doc without pack', () => {
    const content = `# Behaviour: Test

## Akzeptanzkriterien

**AC-1: Test**
- Gegeben die Bedingung
`;
    const doc = parseMarkdown('test/usecase.md', content);
    const implChild = { name: 'my-impl', absolutePath: '/tmp/my-impl', relativePath: 'my-impl', marker: 'impl' as const, markerFiles: ['impl.md'], children: [], parent: null, depth: 3, hasDescendantWithMarker: false };
    const node = { name: 'my-behaviour', absolutePath: '/tmp/my-behaviour', relativePath: 'my-behaviour', marker: 'behaviour' as const, markerFiles: ['usecase.md'], children: [implChild], parent: null, depth: 2, hasDescendantWithMarker: true };
    // Without pack, expects English 'acceptance criteria' key — German heading not found
    const violations = checkAcceptanceCriteria(doc, node, null);
    expect(violations.some(v => v.code === 'MISSING_ACCEPTANCE_CRITERIA')).toBe(true);
  });
});
