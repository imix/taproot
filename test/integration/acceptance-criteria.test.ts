import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runValidateFormat } from '../../src/commands/validate-format.js';

const VALID_USECASE = `# Behaviour: Request Password Reset

## Actor
Registered user

## Preconditions
- User has an account

## Main Flow
1. User submits their email

## Alternate Flows

### Email not registered
- **Trigger:** Email not found
- **Steps:**
  1. System shows same confirmation

## Postconditions
- Reset token exists or no-op

## Error Conditions
- **Email service down:** Show inline error

## Flow
\`\`\`mermaid
flowchart TD
    A[User submits email] --> B[System responds]
\`\`\`

## Related
- \`../validate-token/usecase.md\` — follows this flow

## Acceptance Criteria

**AC-1: Reset email sent**
- Given the user has a registered account
- When they submit their email
- Then the system sends a reset email

**AC-2: Unregistered email**
- Given the email is not registered
- When submitted
- Then same confirmation shown

## Implementations <!-- taproot-managed -->
- [Email Trigger](./email-trigger/impl.md)

## Status
- **State:** implemented
- **Created:** 2024-01-20
- **Last reviewed:** 2024-03-01
`;

const USECASE_WITHOUT_CRITERIA = `# Behaviour: Request Password Reset

## Actor
Registered user

## Preconditions
- User has an account

## Main Flow
1. User submits their email

## Alternate Flows

### Email not registered
- **Trigger:** Email not found
- **Steps:**
  1. System shows same confirmation

## Postconditions
- Reset token exists or no-op

## Error Conditions
- **Email service down:** Show inline error

## Flow
\`\`\`mermaid
flowchart TD
    A[User submits email] --> B[System responds]
\`\`\`

## Related
- \`../validate-token/usecase.md\` — follows this flow

## Implementations <!-- taproot-managed -->
- [Email Trigger](./email-trigger/impl.md)

## Status
- **State:** implemented
- **Created:** 2024-01-20
- **Last reviewed:** 2024-03-01
`;

const USECASE_DUPLICATE_IDS = `# Behaviour: Request Password Reset

## Actor
Registered user

## Preconditions
- User has an account

## Main Flow
1. User submits their email

## Alternate Flows

### Email not registered
- **Trigger:** Email not found
- **Steps:**
  1. System shows same confirmation

## Postconditions
- Reset token exists or no-op

## Error Conditions
- **Email service down:** Show inline error

## Flow
\`\`\`mermaid
flowchart TD
    A[User submits email] --> B[System responds]
\`\`\`

## Related
- \`../validate-token/usecase.md\` — follows this flow

## Acceptance Criteria

**AC-1: Reset email sent**
- Given the user has a registered account
- When they submit their email
- Then the system sends a reset email

**AC-1: Duplicate scenario**
- Given something
- When triggered
- Then response

## Implementations <!-- taproot-managed -->
- [Email Trigger](./email-trigger/impl.md)

## Status
- **State:** implemented
- **Created:** 2024-01-20
- **Last reviewed:** 2024-03-01
`;

const VALID_IMPL = `# Implementation: Email Trigger

## Behaviour
../usecase.md

## Design Decisions
- Generic response to prevent enumeration

## Source Files
- src/auth/reset.ts

## Commits
- abc123 initial implementation

## Tests
- test/auth/reset.test.ts

## Status
- **State:** complete
- **Created:** 2024-02-01
- **Last verified:** 2024-03-01
`;

const VALID_INTENT = `# Intent: Password Reset

## Goal
Allow users to reset their password.

## Stakeholders
- Product: reduce support load

## Success Criteria
- [ ] Users can reset passwords

## Behaviours <!-- taproot-managed -->
- [Request Password Reset](./request-reset/usecase.md)

## Status
- **State:** active
- **Created:** 2024-01-15
`;

function makeHierarchy(tmpDir: string, usecaseContent: string) {
  mkdirSync(join(tmpDir, 'password-reset', 'request-reset', 'email-trigger'), { recursive: true });
  writeFileSync(join(tmpDir, 'password-reset', 'intent.md'), VALID_INTENT);
  writeFileSync(join(tmpDir, 'password-reset', 'request-reset', 'usecase.md'), usecaseContent);
  writeFileSync(join(tmpDir, 'password-reset', 'request-reset', 'email-trigger', 'impl.md'), VALID_IMPL);
}

describe('validate-format — acceptance criteria', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-ac-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('no warning when ## Acceptance Criteria is present with impl children', async () => {
    makeHierarchy(tmpDir, VALID_USECASE);
    const violations = await runValidateFormat({ path: tmpDir });
    const ac = violations.filter(v => v.code === 'MISSING_ACCEPTANCE_CRITERIA');
    expect(ac).toHaveLength(0);
  });

  it('warns MISSING_ACCEPTANCE_CRITERIA when impl exists but section absent', async () => {
    makeHierarchy(tmpDir, USECASE_WITHOUT_CRITERIA);
    const violations = await runValidateFormat({ path: tmpDir });
    const ac = violations.filter(v => v.code === 'MISSING_ACCEPTANCE_CRITERIA');
    expect(ac).toHaveLength(1);
    expect(ac[0]!.type).toBe('warning');
    expect(ac[0]!.message).toContain('## Acceptance Criteria');
  });

  it('no warning for usecase with no impl children (not yet implemented)', async () => {
    mkdirSync(join(tmpDir, 'password-reset', 'request-reset'), { recursive: true });
    writeFileSync(join(tmpDir, 'password-reset', 'intent.md'), VALID_INTENT);
    writeFileSync(join(tmpDir, 'password-reset', 'request-reset', 'usecase.md'), USECASE_WITHOUT_CRITERIA);
    const violations = await runValidateFormat({ path: tmpDir });
    const ac = violations.filter(v => v.code === 'MISSING_ACCEPTANCE_CRITERIA');
    expect(ac).toHaveLength(0);
  });

  it('errors DUPLICATE_CRITERION_ID when same AC-N appears twice', async () => {
    makeHierarchy(tmpDir, USECASE_DUPLICATE_IDS);
    const violations = await runValidateFormat({ path: tmpDir });
    const dups = violations.filter(v => v.code === 'DUPLICATE_CRITERION_ID');
    expect(dups).toHaveLength(1);
    expect(dups[0]!.type).toBe('error');
    expect(dups[0]!.message).toContain('AC-1');
  });
});
