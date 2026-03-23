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
 * Substitute all language pack tokens in content.
 * Single-pass, sorted by key length descending (longer keys matched first).
 * Case-sensitive exact string replacement.
 */
export declare function substituteTokens(content: string, pack: LanguagePack): string;
/**
 * Return required section keys for a given marker type, localised via the pack.
 * impl.md sections are always English (excluded from localisation by design).
 */
export declare function getLocalizedRequiredSections(markerType: MarkerType, pack: LanguagePack | null): string[];
