import type { ParsedMarkdown } from '../validators/types.js';
export declare function parseMarkdown(filePath: string, content: string): ParsedMarkdown;
export declare function getSectionLine(doc: ParsedMarkdown, sectionKey: string): number | undefined;
