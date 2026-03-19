import type { ParsedMarkdown } from '../validators/types.js';
export interface ImplData {
    behaviourRef: string | null;
    sourceFiles: string[];
    commits: string[];
    testFiles: string[];
}
export declare function parseImplData(doc: ParsedMarkdown): ImplData;
