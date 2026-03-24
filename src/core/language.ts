import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { MarkerType } from '../validators/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Packs live at src/languages/ → compiled to dist/languages/ (two levels up from dist/core/)
const LANGUAGES_DIR = resolve(__dirname, '..', '..', 'languages');

export type LanguagePack = Record<string, string>;

const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es', 'ja', 'pt'];

/** English required section keys per marker type (lowercase, as stored in ParsedMarkdown.sections). */
const ENGLISH_REQUIRED_SECTIONS: Record<MarkerType, string[]> = {
  intent: ['stakeholders', 'goal', 'success criteria', 'status'],
  behaviour: ['actor', 'preconditions', 'main flow', 'postconditions', 'status'],
  impl: ['behaviour', 'commits', 'tests', 'status'],
};

/**
 * Load a language pack by code. Returns null if unsupported or file not found.
 * Falls back gracefully on missing keys — returns null only for wholly unknown codes.
 */
export function loadLanguagePack(code: string): LanguagePack | null {
  if (!SUPPORTED_LANGUAGES.includes(code)) return null;
  if (code === 'en') return buildEnglishPack();

  const packPath = resolve(LANGUAGES_DIR, `${code}.json`);
  if (!existsSync(packPath)) return null;

  try {
    const raw = JSON.parse(readFileSync(packPath, 'utf-8')) as LanguagePack;
    // Fill missing keys from English defaults with a warning
    const english = buildEnglishPack();
    const result: LanguagePack = { ...english };
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === 'string' && value.length > 0) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return null;
  }
}

/** Returns the list of supported language codes. */
export function supportedLanguages(): string[] {
  return [...SUPPORTED_LANGUAGES];
}

/**
 * Return the structural keyword keys for conflict detection.
 * Uses the provided pack, or falls back to the English pack.
 * Always returns a non-empty list so structural keywords are always protected.
 */
export function getStructuralKeys(pack: LanguagePack | null): string[] {
  if (pack) return Object.keys(pack);
  const english = buildEnglishPack();
  return Object.keys(english);
}

/**
 * Substitute all language pack tokens in content.
 * Single-pass, sorted by key length descending (longer keys matched first).
 * Case-sensitive exact string replacement.
 */
export function substituteTokens(content: string, pack: LanguagePack): string {
  if (!pack || Object.keys(pack).length === 0) return content;

  // Sort entries by key length descending so "Main Flow" is matched before "Flow"
  const entries = Object.entries(pack).sort((a, b) => b[0].length - a[0].length);

  // Single-pass: replace each key with a placeholder, then swap placeholders for values
  // This prevents double-substitution when a value contains another key
  const placeholders: Array<[string, string]> = [];
  let result = content;

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i]!;
    if (key === value) continue; // English pack — no-op
    const placeholder = `\x00TAPROOT_LANG_${i}\x00`;
    placeholders.push([placeholder, value]);
    result = result.split(key).join(placeholder);
  }

  for (const [placeholder, value] of placeholders) {
    result = result.split(placeholder).join(value);
  }

  return result;
}

/**
 * Apply domain vocabulary overrides to content.
 * Runs after the language pack substitution pass.
 *
 * - Declaration-order: keys processed in the order they appear in the map
 * - Single-pass via placeholder trick (same mechanism as substituteTokens)
 * - Structural keys (those present in the language pack) are excluded with a warning
 * - Returns the substituted content and any conflict warnings
 */
export function applyVocabulary(
  content: string,
  vocab: Record<string, string>,
  structuralKeys: string[],
): { result: string; warnings: string[] } {
  const warnings: string[] = [];
  const structuralLower = new Set(structuralKeys.map(k => k.toLowerCase()));

  // Filter entries: skip structural conflicts
  const entries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(vocab)) {
    if (structuralLower.has(key.toLowerCase())) {
      warnings.push(
        `Vocabulary override '${key}' conflicts with a structural keyword — structural keywords take precedence; override ignored`
      );
    } else {
      entries.push([key, value]);
    }
  }

  if (entries.length === 0) return { result: content, warnings };

  // Single-pass substitution in declaration order using placeholders
  const placeholders: Array<[string, string]> = [];
  let result = content;

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i]!;
    const placeholder = `\x00TAPROOT_VOCAB_${i}\x00`;
    placeholders.push([placeholder, value]);
    result = result.split(key).join(placeholder);
  }

  for (const [placeholder, value] of placeholders) {
    result = result.split(placeholder).join(value);
  }

  return { result, warnings };
}

/**
 * Return required section keys for a given marker type, localised via the pack.
 * impl.md sections are always English (excluded from localisation by design).
 */
export function getLocalizedRequiredSections(markerType: MarkerType, pack: LanguagePack | null): string[] {
  const english = ENGLISH_REQUIRED_SECTIONS[markerType];
  if (!pack || markerType === 'impl') return english;

  return english.map(key => {
    // Find the matching pack entry: pack keys are Title Case, section keys are lowercase
    const packKey = Object.keys(pack).find(k => k.toLowerCase() === key);
    if (!packKey) return key; // fallback to English
    return pack[packKey]!.toLowerCase();
  });
}

function buildEnglishPack(): LanguagePack {
  const packPath = resolve(LANGUAGES_DIR, 'en.json');
  if (existsSync(packPath)) {
    try {
      return JSON.parse(readFileSync(packPath, 'utf-8')) as LanguagePack;
    } catch {
      // fall through to hardcoded defaults
    }
  }
  // Hardcoded fallback if en.json not found (should never happen in a valid install)
  return {
    Goal: 'Goal', Actor: 'Actor', Preconditions: 'Preconditions',
    'Main Flow': 'Main Flow', 'Alternate Flows': 'Alternate Flows',
    Postconditions: 'Postconditions', 'Error Conditions': 'Error Conditions',
    'Acceptance Criteria': 'Acceptance Criteria', Status: 'Status',
    Stakeholders: 'Stakeholders', 'Success Criteria': 'Success Criteria',
    Given: 'Given', When: 'When', Then: 'Then',
    specified: 'specified', implemented: 'implemented', complete: 'complete', active: 'active',
  };
}
