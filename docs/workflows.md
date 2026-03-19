# Workflows

## New feature (top-down)

```
/tr-intent "Users need to reset their password without contacting support"
/tr-review taproot/password-reset/intent.md
/tr-decompose taproot/password-reset/
/tr-implement taproot/password-reset/request-reset/
taproot coverage --path taproot/password-reset/
```

## Bug fix (bottom-up)

```
/tr-trace src/auth/password-reset.ts
/tr-refine taproot/password-reset/request-reset/ "missing rate limit allows spam"
/tr-implement taproot/password-reset/request-reset/
```

## Health check

```
/tr-status
```

Or via CLI:
```bash
taproot coverage && taproot check-orphans && taproot sync-check
```

## Onboard an existing codebase

```
/tr-discover
```

The skill reads your codebase, proposes intents and behaviours, and asks you to confirm each one before writing.

## Don't know where to start?

```
/tr-ineed <requirement in plain language>
```

The agent routes it to the right place in the hierarchy and calls the appropriate skill.
