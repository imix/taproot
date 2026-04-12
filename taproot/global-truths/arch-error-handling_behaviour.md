## Error handling conventions

### Responsibility split
- **Commands layer** is responsible for translating thrown errors into user-facing output and exit codes. Catch at the command action boundary, write to `process.stderr`, and set the exit code.
- **Core and validators** throw with context-enriched messages. They do not write to stderr or set exit codes — that is the command's responsibility.

### Error types
No custom Error subclasses. Use `new Error(message)` with a descriptive, actionable message that tells the user what went wrong and (where relevant) how to fix it.

```typescript
// Good
throw new Error('No git repository found. Run `git init` first, then re-run `taproot init`.');

// Avoid — unhelpful
throw new Error('git error');
```

### Context enrichment in core
When catching and re-throwing in core, add file/context information:

```typescript
try {
  raw = yaml.load(readFileSync(configFile, 'utf-8'));
} catch (err) {
  throw new Error(`Failed to parse ${configFile}: ${(err as Error).message}`);
}
```

### Exit code convention
In async command handlers, set `process.exitCode = 1` rather than calling `process.exit(1)`. This allows pending async cleanup to complete before the process ends.

```typescript
// Preferred in async handlers
process.exitCode = 1;
return;

// Only acceptable in synchronous, terminal paths
process.exit(1);
```

### Catching unknown
Cast to `Error` when accessing `.message` on a caught `unknown`:

```typescript
catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`error: ${message}\n`);
}
```

### Last-resort backstop
`cli.ts` catches any unhandled top-level rejections from `program.parseAsync()`. Do not rely on this — commands must handle their own errors.

## Agent checklist

Before implementing error handling in any command or core function:
- [ ] Is this a command? If yes — catch at the action boundary, write to stderr, set exit code.
- [ ] Is this core/validators? If yes — throw with a context-enriched message; do not touch stderr or exit codes.
- [ ] Is a custom Error class necessary? (Almost never — use `new Error(message)` instead.)
- [ ] Is the error message descriptive and actionable?
- [ ] In an async handler: using `process.exitCode = 1` rather than `process.exit(1)`?
- [ ] Catching `unknown`: using `err instanceof Error ? err.message : String(err)`?
