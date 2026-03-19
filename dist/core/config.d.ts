import type { TaprootConfig } from '../validators/types.js';
export declare const DEFAULT_CONFIG: TaprootConfig;
export declare function loadConfig(cwd?: string): {
    config: TaprootConfig;
    configDir: string;
};
