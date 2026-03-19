import type { ParsedMarkdown, MarkerType, TaprootConfig, Violation } from './types.js';
export declare function checkRequiredSections(doc: ParsedMarkdown, markerType: MarkerType): Violation[];
export declare function checkStatusValue(doc: ParsedMarkdown, markerType: MarkerType, config: TaprootConfig): Violation[];
export declare function checkDateFormat(doc: ParsedMarkdown, config: TaprootConfig): Violation[];
export declare function checkBehaviourReference(doc: ParsedMarkdown, implFilePath: string): Violation[];
export declare function checkDiagramSection(doc: ParsedMarkdown): Violation[];
export declare function validateFormat(doc: ParsedMarkdown, markerType: MarkerType, config: TaprootConfig): Violation[];
