import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import yaml from 'js-yaml';
export const DEFAULT_CONFIG = {
    version: 1,
    root: 'taproot/',
    commitPattern: 'taproot\\(([^)]+)\\):',
    commitTrailer: 'Taproot',
    agents: ['claude', 'cursor', 'generic'],
    validation: {
        requireDates: true,
        requireStatus: true,
        allowedIntentStates: ['draft', 'active', 'achieved', 'deprecated'],
        allowedBehaviourStates: ['proposed', 'specified', 'implemented', 'tested', 'deprecated', 'deferred'],
        allowedImplStates: ['planned', 'in-progress', 'complete', 'needs-rework', 'deferred'],
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
function findConfigFile(startDir) {
    let current = resolve(startDir);
    while (true) {
        // New layout: taproot/settings.yaml
        const newCandidate = join(current, 'taproot', 'settings.yaml');
        if (existsSync(newCandidate))
            return { configFile: newCandidate, projectRoot: current };
        // Old layout: .taproot/settings.yaml
        const oldCandidate = join(current, '.taproot', 'settings.yaml');
        if (existsSync(oldCandidate))
            return { configFile: oldCandidate, projectRoot: current };
        const parent = dirname(current);
        if (parent === current)
            return null;
        current = parent;
    }
}
function deepMerge(defaults, overrides) {
    const result = { ...defaults };
    for (const key of Object.keys(overrides)) {
        const override = overrides[key];
        const def = defaults[key];
        if (override !== undefined && override !== null) {
            if (typeof override === 'object' &&
                !Array.isArray(override) &&
                typeof def === 'object' &&
                !Array.isArray(def) &&
                def !== null) {
                result[key] = deepMerge(def, override);
            }
            else {
                result[key] = override;
            }
        }
    }
    return result;
}
export function loadConfig(cwd = process.cwd()) {
    const found = findConfigFile(cwd);
    if (!found) {
        return {
            config: { ...DEFAULT_CONFIG, root: resolve(cwd, DEFAULT_CONFIG.root) },
            configDir: cwd,
        };
    }
    const { configFile, projectRoot } = found;
    let raw;
    try {
        raw = yaml.load(readFileSync(configFile, 'utf-8'));
    }
    catch (err) {
        throw new Error(`Failed to parse ${configFile}: ${err.message}`);
    }
    const merged = deepMerge(DEFAULT_CONFIG, (raw ?? {}));
    merged.root = resolve(projectRoot, merged.root);
    return { config: merged, configDir: projectRoot };
}
//# sourceMappingURL=config.js.map