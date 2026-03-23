import { describe, it, expect } from 'vitest';
import { loadLanguagePack, substituteTokens, getLocalizedRequiredSections, supportedLanguages } from '../../src/core/language.js';

describe('loadLanguagePack', () => {
  it('returns null for unknown language code', () => {
    expect(loadLanguagePack('xx')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(loadLanguagePack('')).toBeNull();
  });

  it('loads the German pack', () => {
    const pack = loadLanguagePack('de');
    expect(pack).not.toBeNull();
    expect(pack!['Actor']).toBe('Akteur');
    expect(pack!['Goal']).toBe('Ziel');
    expect(pack!['Main Flow']).toBe('Hauptablauf');
    expect(pack!['Given']).toBe('Gegeben');
    expect(pack!['When']).toBe('Wenn');
    expect(pack!['Then']).toBe('Dann');
    expect(pack!['specified']).toBe('spezifiziert');
    expect(pack!['complete']).toBe('vollständig');
  });

  it('loads the French pack', () => {
    const pack = loadLanguagePack('fr');
    expect(pack).not.toBeNull();
    expect(pack!['Actor']).toBe('Acteur');
    expect(pack!['Goal']).toBe('Objectif');
  });

  it('loads the Spanish pack', () => {
    const pack = loadLanguagePack('es');
    expect(pack).not.toBeNull();
    expect(pack!['Actor']).toBe('Actor');
    expect(pack!['Goal']).toBe('Objetivo');
  });

  it('loads the Japanese pack', () => {
    const pack = loadLanguagePack('ja');
    expect(pack).not.toBeNull();
    expect(pack!['Actor']).toBe('アクター');
  });

  it('loads the Portuguese pack', () => {
    const pack = loadLanguagePack('pt');
    expect(pack).not.toBeNull();
    expect(pack!['Actor']).toBe('Ator');
  });

  it('loads the English pack as identity', () => {
    const pack = loadLanguagePack('en');
    expect(pack).not.toBeNull();
    expect(pack!['Actor']).toBe('Actor');
    expect(pack!['Goal']).toBe('Goal');
  });

  it('returns all 5 supported non-English codes', () => {
    const supported = supportedLanguages();
    for (const code of ['de', 'fr', 'es', 'ja', 'pt']) {
      expect(supported).toContain(code);
      expect(loadLanguagePack(code)).not.toBeNull();
    }
  });
});

describe('substituteTokens', () => {
  const dePack = loadLanguagePack('de')!;

  it('substitutes section headers', () => {
    const content = '## Actor\nsome text\n## Goal\nother text';
    const result = substituteTokens(content, dePack);
    expect(result).toContain('## Akteur');
    expect(result).toContain('## Ziel');
    expect(result).not.toContain('## Actor\n');
    expect(result).not.toContain('## Goal\n');
  });

  it('substitutes Gherkin keywords', () => {
    const content = '- Given the user is logged in\n- When they click submit\n- Then the form is saved';
    const result = substituteTokens(content, dePack);
    expect(result).toContain('Gegeben');
    expect(result).toContain('Wenn');
    expect(result).toContain('Dann');
  });

  it('substitutes state values', () => {
    const content = '- **State:** specified\n- **State:** complete';
    const result = substituteTokens(content, dePack);
    expect(result).toContain('spezifiziert');
    expect(result).toContain('vollständig');
  });

  it('is single-pass — does not double-substitute', () => {
    // If 'Wenn' were re-scanned, 'When' → 'Wenn' and then some hypothetical second pass
    // In the German pack, values don't overlap with keys, but this tests the mechanism
    const content = 'When then When';
    const result = substituteTokens(content, dePack);
    // 'When' → 'Wenn', result should be 'Wenn then Wenn' — not further mangled
    expect(result).toBe('Wenn then Wenn');
  });

  it('matches longer keys before shorter keys', () => {
    // 'Main Flow' should be substituted as a unit, not 'Main' and 'Flow' separately
    const content = '## Main Flow\nsteps here';
    const result = substituteTokens(content, dePack);
    expect(result).toContain('## Hauptablauf');
    expect(result).not.toContain('Main Flow');
  });

  it('returns content unchanged for English pack', () => {
    const enPack = loadLanguagePack('en')!;
    const content = '## Actor\n## Goal\nGiven something';
    expect(substituteTokens(content, enPack)).toBe(content);
  });

  it('returns content unchanged for null pack', () => {
    const content = '## Actor\n## Goal';
    expect(substituteTokens(content, {})).toBe(content);
  });
});

describe('getLocalizedRequiredSections', () => {
  const dePack = loadLanguagePack('de')!;

  it('returns localised sections for intent', () => {
    const sections = getLocalizedRequiredSections('intent', dePack);
    expect(sections).toContain('stakeholder'); // Stakeholder lowercased
    expect(sections).toContain('ziel');
    expect(sections).toContain('erfolgskriterien');
    expect(sections).toContain('status'); // 'Status' → 'Status' in German
  });

  it('returns localised sections for behaviour', () => {
    const sections = getLocalizedRequiredSections('behaviour', dePack);
    expect(sections).toContain('akteur');
    expect(sections).toContain('vorbedingungen');
    expect(sections).toContain('hauptablauf');
    expect(sections).toContain('nachbedingungen');
  });

  it('returns English sections for impl (impl excluded from localisation)', () => {
    const sections = getLocalizedRequiredSections('impl', dePack);
    expect(sections).toContain('behaviour');
    expect(sections).toContain('commits');
    expect(sections).toContain('tests');
    expect(sections).toContain('status');
  });

  it('returns English sections when no pack provided', () => {
    const sections = getLocalizedRequiredSections('behaviour', null);
    expect(sections).toContain('actor');
    expect(sections).toContain('preconditions');
    expect(sections).toContain('main flow');
    expect(sections).toContain('postconditions');
  });
});
