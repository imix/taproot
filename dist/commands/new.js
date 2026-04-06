import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { loadConfig } from '../core/config.js';
import { intentTemplate, behaviourTemplate, implTemplate } from '../templates/index.js';
const VALID_TYPES = ['intent', 'behaviour', 'impl'];
function slugToTitle(slug) {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function today() {
    return new Date().toISOString().slice(0, 10);
}
function templateForType(type, slug, parentRelPath) {
    const title = slugToTitle(slug);
    const date = today();
    switch (type) {
        case 'intent':
            return { filename: 'intent.md', content: intentTemplate(date).replace('# Intent: <Title>', `# Intent: ${title}`) };
        case 'behaviour':
            return { filename: 'usecase.md', content: behaviourTemplate(date).replace('# Behaviour: <Title>', `# Behaviour: ${title}`) };
        case 'impl': {
            const ref = parentRelPath ?? '../usecase.md';
            return { filename: 'impl.md', content: implTemplate(date, ref).replace('# Implementation: <Title>', `# Implementation: ${title}`) };
        }
    }
}
export function runNew(options) {
    const { type, slug, cwd = process.cwd() } = options;
    const { config, configDir } = loadConfig(cwd);
    const hierarchyRoot = config.root.startsWith('/')
        ? config.root
        : resolve(configDir, config.root);
    // Validate parent for behaviour and impl
    if (type === 'behaviour' || type === 'impl') {
        if (!options.parent) {
            throw new Error(`Parent path is required for type '${type}'. Run: taproot new ${type} <parent-path> <slug>`);
        }
        const parentPath = resolve(options.parent);
        if (!existsSync(parentPath)) {
            throw new Error(`Parent not found: \`${options.parent}\` — create the parent intent or behaviour first`);
        }
        if (type === 'impl') {
            const hasUsecase = existsSync(join(parentPath, 'usecase.md'));
            const hasIntent = existsSync(join(parentPath, 'intent.md'));
            if (!hasUsecase) {
                if (hasIntent) {
                    throw new Error(`Type mismatch: \`impl\` must be placed under a behaviour — \`${options.parent}\` contains an intent, not a behaviour`);
                }
                throw new Error(`Parent not found: \`${options.parent}\` does not contain a usecase.md — create the behaviour first`);
            }
        }
        if (type === 'behaviour') {
            const hasIntent = existsSync(join(parentPath, 'intent.md'));
            const hasUsecase = existsSync(join(parentPath, 'usecase.md'));
            if (!hasIntent && !hasUsecase) {
                throw new Error(`Parent not found: \`${options.parent}\` does not contain intent.md or usecase.md`);
            }
        }
    }
    // Resolve target directory
    let targetDir;
    if (type === 'intent') {
        targetDir = join(hierarchyRoot, slug);
    }
    else {
        targetDir = join(resolve(options.parent), slug);
    }
    const { filename, content } = templateForType(type, slug);
    const targetFile = join(targetDir, filename);
    if (existsSync(targetFile)) {
        throw new Error(`Already exists: \`${targetFile}\` — open the file to edit it, or use /tr-behaviour or /tr-intent to refine it`);
    }
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(targetFile, content, 'utf-8');
    return { path: targetFile, message: `created  ${targetFile}` };
}
export function registerNew(program) {
    program
        .command('new <type> [args...]')
        .description('Scaffold a new hierarchy artifact from a template (intent, behaviour, or impl)')
        .action(async (type, args) => {
        // Validate type early for a helpful error before any prompting
        if (!VALID_TYPES.includes(type)) {
            process.stderr.write(`error: unknown type '${type}'. Valid types: ${VALID_TYPES.join(', ')}\n`);
            process.exit(1);
        }
        const artifactType = type;
        let parent;
        let slug;
        if (artifactType === 'intent') {
            slug = args[0];
            if (!slug) {
                const { default: input } = await import('@inquirer/input');
                slug = await input({ message: 'Slug for the new intent?' });
            }
        }
        else {
            // behaviour or impl: expect [parent, slug] or [slug] missing parent
            if (args.length >= 2) {
                parent = args[0];
                slug = args[1];
            }
            else if (args.length === 1) {
                parent = args[0];
                const { default: input } = await import('@inquirer/input');
                slug = await input({ message: `Slug for the new ${artifactType}?` });
            }
            else {
                const { default: input } = await import('@inquirer/input');
                parent = await input({ message: `Parent path for the new ${artifactType}?` });
                slug = await input({ message: `Slug for the new ${artifactType}?` });
            }
        }
        try {
            const result = runNew({ type: artifactType, parent, slug: slug });
            process.stdout.write(`${result.message}\n`);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            process.stderr.write(`error: ${message}\n`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=new.js.map