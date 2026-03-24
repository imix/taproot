import type { MarkerType } from '../validators/types.js';
export type LanguagePack = Record<string, string>;
/**
 * Load a language pack by code. Returns null if unsupported or file not found.
 * Falls back gracefully on missing keys — returns null only for wholly unknown codes.
 */
export declare function loadLanguagePack(code: string): LanguagePack | null;
/** Returns the list of supported language codes. */
export declare function supportedLanguages(): string[];
/**
 * Return the structural keyword keys for conflict detection.
 * Uses the provided pack, or falls back to the English pack.
 * Always returns a non-empty list so structural keywords are always protected.
 */
export declare function getStructuralKeys(pack: LanguagePack | null): string[];
/**
 * Substitute all language pack tokens in content.
 * Single-pass, sorted by key length descending (longer keys matched first).
 * Case-sensitive exact string replacement.
 */
export declare function substituteTokens(content: string, pack: LanguagePack): string;
/**
 * Apply domain vocabulary overrides to content.
 * Runs after the language pack substitution pass.
 *
 * - Declaration-order: keys processed in the order they appear in the map
 * - Single-pass via placeholder trick (same mechanism as substituteTokens)
 * - Structural keys (those present in the language pack) are excluded with a warning
 * - Returns the substituted content and any conflict warnings
 */
export declare function applyVocabulary(content: string, vocab: Record<string, string>, structuralKeys: string[]): {
    result: string;
    warnings: string[];
};
/**
 * Return required section keys for a given marker type, localised via the pack.
 * impl.md sections are always English (excluded from localisation by design).
 */
export declare function getLocalizedRequiredSections(markerType: MarkerType, pack: LanguagePack | null): string[];
