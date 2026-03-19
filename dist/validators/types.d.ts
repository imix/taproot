export type MarkerType = 'intent' | 'behaviour' | 'impl';
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
export interface TaprootConfig {
    version: number;
    root: string;
    commitPattern: string;
    commitTrailer: string;
    agents: string[];
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
}
