# Taproot Webapp Starter

A ready-to-use taproot hierarchy for a standard SaaS web application. Copy this into your project and run `npx @imix-js/taproot init` to get started immediately.

## What's included

| Intent | Behaviours |
|--------|-----------|
| `user-auth` — users can identify themselves | sign-up, login, password-reset |
| `user-profile` — users can manage their identity | view-profile, edit-profile |

All specs are in `specified` state — ready to implement.

## How to use

1. **Copy** the `taproot/` and `.taproot/` folders into your project root
2. **Edit** `.taproot/settings.yaml` — set your agents and adjust the DoD `run:` commands for your stack
3. **Run** `npx @imix-js/taproot init` to generate agent adapters
4. **Add your product intents** — the auth and profile intents cover every webapp; your product's core features go alongside them:
   ```
   taproot/
     user-auth/        ← included
     user-profile/     ← included
     [your-feature]/   ← add yours here
   ```
5. **Start implementing** with `/tr-implement taproot/user-auth/sign-up/`

## Customising the DoD

The included `.taproot/settings.yaml` uses `npm test` and `npm run lint`. Change these to match your stack:

- **Vitest:** `npx vitest run`
- **Jest:** `jest --ci`
- **ESLint:** `npx eslint src/`
- **TypeScript:** `npx tsc --noEmit`

## Adding more intents

Common additions for a SaaS webapp:

```
taproot/
  notifications/      — email, push, in-app alerts
  billing/            — subscriptions, upgrades, invoices
  admin/              — user management, audit log
  search/             — full-text search, filters
  file-uploads/       — avatars, attachments, media
```

Run `/tr-intent taproot/ "Allow users to manage their subscription"` to create a new intent with the right format.
