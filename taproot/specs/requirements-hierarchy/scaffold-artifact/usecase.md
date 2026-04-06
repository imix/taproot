# Behaviour: Scaffold Hierarchy Artifact

## Actor
Developer or AI agent adding a new node to the requirement hierarchy

## Preconditions
- `taproot` is installed and `taproot/settings.yaml` exists in the project root
- For `behaviour` and `impl` types: the parent path exists and contains the appropriate parent document (`intent.md` or `usecase.md`)

## Main Flow
1. Actor runs `taproot new <type> [parent-path] <slug>` where `<type>` is `intent`, `behaviour`, or `impl`
2. System validates that all required arguments are present; for any that are missing, system prompts for each in turn
3. System validates that the parent path exists and contains the right parent document for the requested type
4. System validates that the target path does not already exist
5. System creates the directory at the resolved target path
6. System writes a template file (`intent.md`, `usecase.md`, or `impl.md`) populated with labelled placeholder sections and the correct initial state value
7. System reports the created path

## Alternate Flows

### Missing arguments — interactive prompt
- **Trigger:** Actor runs `taproot new` with fewer arguments than required
- **Steps:**
  1. System prompts for each missing value in order: type, then parent path (if applicable for the type), then slug
  2. Actor provides each value
  3. System continues from step 3 of the main flow

### Sub-behaviour scaffold
- **Trigger:** Actor passes a parent path that contains `usecase.md` rather than `intent.md` for a `behaviour` type
- **Steps:**
  1. System recognises the parent is a behaviour directory and creates the sub-behaviour under it
  2. System proceeds from step 4 of the main flow — no separate confirmation needed

### Intent scaffold (no parent path)
- **Trigger:** Actor runs `taproot new intent <slug>` with no parent path
- **Steps:**
  1. System resolves the parent as the configured hierarchy root (default: `taproot/specs/`)
  2. System proceeds from step 3 of the main flow

## Postconditions
- The target directory exists under the hierarchy root
- A template file is present with placeholder section content and the correct initial state: `draft` for intents, `proposed` for behaviours, `planned` for implementations
- The file passes structural validation — all required sections are present as empty placeholders
- No existing file has been overwritten

## Error Conditions
- **Target path already exists**: system reports "Already exists: `<path>` — open the file to edit it, or use `/tr-behaviour` / `/tr-intent` to refine it" and exits without writing files
- **Parent path not found** (for `behaviour` and `impl`): system reports "Parent not found: `<path>` — create the parent intent or behaviour first" and exits without writing files
- **Wrong parent type for `impl`**: actor passes a parent that contains only `intent.md` and not `usecase.md`; system reports "Type mismatch: `impl` must be placed under a behaviour — `<path>` contains an intent, not a behaviour" and exits
- **Unrecognised type argument**: system lists the valid types (`intent`, `behaviour`, `impl`) and exits

## Flow
```mermaid
sequenceDiagram
    participant Actor as Developer / Agent
    participant CLI as taproot CLI
    participant FS as Filesystem

    Actor->>CLI: taproot new <type> [parent] <slug>
    alt missing arguments
        CLI-->>Actor: prompt for each missing value
        Actor->>CLI: provides values
    end
    CLI->>FS: check parent exists and has correct document type
    alt parent not found or wrong type
        CLI-->>Actor: error — parent not found / type mismatch
    else
        CLI->>FS: check target path does not exist
        alt already exists
            CLI-->>Actor: "Already exists: <path>"
        else
            CLI->>FS: mkdir <target> + write template file
            CLI-->>Actor: "Created: <path>"
        end
    end
```

## Related
- `./initialise-hierarchy/usecase.md` — creates the root `taproot/` structure that scaffold-artifact adds nodes into; must precede first use of `taproot new`
- `./configure-hierarchy/usecase.md` — `root:` in `settings.yaml` governs where `taproot new intent` resolves the hierarchy root

## Acceptance Criteria

**AC-1: Creates intent stub at hierarchy root**
- Given `taproot init` has been run and `taproot/specs/` exists
- When the developer runs `taproot new intent user-authentication`
- Then `taproot/specs/user-authentication/intent.md` is created with placeholder content and state `draft`

**AC-2: Creates behaviour stub under an existing intent**
- Given `taproot/specs/user-authentication/intent.md` exists
- When the developer runs `taproot new behaviour taproot/specs/user-authentication password-login`
- Then `taproot/specs/user-authentication/password-login/usecase.md` is created with placeholder content and state `proposed`

**AC-3: Creates impl stub under an existing behaviour**
- Given `taproot/specs/user-authentication/password-login/usecase.md` exists
- When the developer runs `taproot new impl taproot/specs/user-authentication/password-login cli-command`
- Then `taproot/specs/user-authentication/password-login/cli-command/impl.md` is created with placeholder content and state `planned`

**AC-4: Creates sub-behaviour stub under an existing behaviour**
- Given `taproot/specs/user-authentication/password-login/usecase.md` exists
- When the developer runs `taproot new behaviour taproot/specs/user-authentication/password-login credential-validation`
- Then `taproot/specs/user-authentication/password-login/credential-validation/usecase.md` is created with placeholder content and state `proposed`

**AC-5: Prompts for missing arguments interactively**
- Given the developer runs `taproot new` with no arguments
- When the command executes
- Then the system prompts for type, then parent path (if applicable), then slug before creating any file

**AC-6: Reports error when target already exists**
- Given `taproot/specs/user-authentication/intent.md` already exists
- When the developer runs `taproot new intent user-authentication`
- Then no file is overwritten and the output reports that the path already exists

**AC-7: Reports error when parent path not found**
- Given `taproot/specs/nonexistent/` does not exist
- When the developer runs `taproot new behaviour taproot/specs/nonexistent my-behaviour`
- Then no directory is created and the output reports the parent was not found

**AC-8: Reports error for wrong parent type for impl**
- Given `taproot/specs/user-authentication/intent.md` exists but no `usecase.md` is present under it
- When the developer runs `taproot new impl taproot/specs/user-authentication cli-command`
- Then no directory is created and the output reports that `impl` must be placed under a behaviour

**AC-9: Template file passes structural validation immediately after creation**
- Given a new project with no hierarchy entries
- When the developer runs `taproot new intent my-intent`
- Then `taproot validate-format --path taproot/specs/my-intent/` exits without errors

## Implementations <!-- taproot-managed -->
- [CLI Command — taproot new](./cli-command/impl.md)

## Status
- **State:** implemented
- **Created:** 2026-04-05
- **Last reviewed:** 2026-04-06
