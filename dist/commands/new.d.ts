import type { Command } from 'commander';
export type ArtifactType = 'intent' | 'behaviour' | 'impl';
export interface RunNewOptions {
    type: ArtifactType;
    parent?: string;
    slug: string;
    cwd?: string;
}
export interface NewResult {
    path: string;
    message: string;
}
export declare function runNew(options: RunNewOptions): NewResult;
export declare function registerNew(program: Command): void;
