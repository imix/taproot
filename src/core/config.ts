import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import yaml from 'js-yaml';
import type { TaprootConfig } from '../validators/types.js';

export const DEFAULT_CONFIG: TaprootConfig = {
  version: 1,
  root: 'taproot/',
  commitPattern: 'taproot\\(([^)]+)\\):',
  commitTrailer: 'Taproot',
  agents: ['claude', 'cursor', 'generic'],
  validation: {
    requireDates: true,
    requireStatus: true,
    allowedIntentStates: ['draft', 'active', 'achieved', 'deprecated'],
    allowedBehaviourStates: ['proposed', 'specified', 'implemented', 'tested', 'deprecated'],
    allowedImplStates: ['planned', 'in-progress', 'complete', 'needs-rework'],
  },
  hooks: {
    preCommit: ['taproot validate-structure', 'taproot validate-format'],
  },
  ci: {
    onPr: [
      'taproot validate-structure',
      'taproot validate-format',
      'taproot check-orphans',
      'taproot sync-check',
    ],
    onMerge: [
      'taproot link-commits',
      'taproot coverage --format markdown >> pr-comment',
      'taproot coverage --format context',
    ],
  },
};

function findConfigFile(startDir: string): string | null {
  let current = resolve(startDir);
  while (true) {
    const candidate = join(current, '.taproot.yaml');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function deepMerge<T>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const override = overrides[key];
    const def = defaults[key];
    if (override !== undefined && override !== null) {
      if (
        typeof override === 'object' &&
        !Array.isArray(override) &&
        typeof def === 'object' &&
        !Array.isArray(def) &&
        def !== null
      ) {
        result[key] = deepMerge(def, override as Partial<typeof def>);
      } else {
        result[key] = override as T[keyof T];
      }
    }
  }
  return result;
}

export function loadConfig(cwd: string = process.cwd()): { config: TaprootConfig; configDir: string } {
  const configFile = findConfigFile(cwd);

  if (!configFile) {
    return {
      config: { ...DEFAULT_CONFIG, root: resolve(cwd, DEFAULT_CONFIG.root) },
      configDir: cwd,
    };
  }

  const configDir = dirname(configFile);
  let raw: unknown;
  try {
    raw = yaml.load(readFileSync(configFile, 'utf-8'));
  } catch (err) {
    throw new Error(`Failed to parse ${configFile}: ${(err as Error).message}`);
  }

  const merged = deepMerge(DEFAULT_CONFIG, (raw ?? {}) as Partial<TaprootConfig>);
  merged.root = resolve(configDir, merged.root);

  return { config: merged, configDir };
}
