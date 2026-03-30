export type MarkerType = 'intent' | 'behaviour' | 'impl';
export interface NaRule {
    condition: string;
    when: string;
}
export interface FolderNode {
    absolutePath: string;
    relativePath: string;
    name: string;
    marker: MarkerType | null;
    markerFiles: string[];
    children: FolderNode[];
    parent: FolderNode | null;
    depth: number;
    hasDescendantWithMarker: boolean;
}
export interface SectionContent {
    heading: string;
    startLine: number;
    bodyLines: string[];
    rawBody: string;
}
export interface ParsedMarkdown {
    filePath: string;
    sections: Map<string, SectionContent>;
    rawLines: string[];
}
export interface Violation {
    type: 'error' | 'warning';
    filePath: string;
    line?: number;
    code: string;
    message: string;
}
export type WhenQualifier = {
    'source-matches': string;
};
export type DodConditionEntry = string | {
    run: string;
    name?: string;
    correction?: string;
    when?: WhenQualifier;
} | {
    'document-current': string;
    when?: WhenQualifier;
} | {
    'check-if-affected': string;
    when?: WhenQualifier;
} | {
    'check-if-affected-by': string;
    when?: WhenQualifier;
} | {
    'check': string;
    when?: WhenQualifier;
} | {
    'require-discussion-log': boolean;
    when?: WhenQualifier;
};
export interface TaprootConfig {
    version: number;
    root: string;
    commitPattern: string;
    commitTrailer: string;
    agents: string[];
    language?: string;
    vocabulary?: Record<string, string>;
    validation: {
        requireDates: boolean;
        requireStatus: boolean;
        allowedIntentStates: string[];
        allowedBehaviourStates: string[];
        allowedImplStates: string[];
    };
    hooks: {
        preCommit: string[];
    };
    ci: {
        onPr: string[];
        onMerge: string[];
    };
    definitionOfDone?: DodConditionEntry[];
    definitionOfReady?: DodConditionEntry[];
    naRules?: NaRule[];
    cli?: string;
    autonomous?: boolean;
    testsCommand?: string;
    testResultMaxAge?: number;
    testTimeout?: number;
}
