export function parseMarkdown(filePath, content) {
    const rawLines = content.split('\n');
    const sections = new Map();
    let currentHeading = null;
    let currentStart = 0;
    let currentBody = [];
    const flushSection = (endIndex) => {
        if (currentHeading === null)
            return;
        const rawBody = currentBody.join('\n').trim();
        sections.set(currentHeading.toLowerCase(), {
            heading: currentHeading,
            startLine: currentStart,
            bodyLines: currentBody,
            rawBody,
        });
    };
    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i] ?? '';
        const match = line.match(/^##\s+(.+)$/);
        if (match) {
            flushSection(i);
            currentHeading = (match[1] ?? '').trim();
            currentStart = i + 1; // 1-indexed line number of the heading itself
            currentBody = [];
        }
        else if (currentHeading !== null) {
            currentBody.push(line);
        }
    }
    flushSection(rawLines.length);
    return { filePath, sections, rawLines };
}
export function getSectionLine(doc, sectionKey) {
    return doc.sections.get(sectionKey.toLowerCase())?.startLine;
}
//# sourceMappingURL=markdown-parser.js.map