# Behaviour: Discover Truths

## Actor
Developer with an existing `taproot/` hierarchy who wants to identify what project-wide facts, business rules, and conventions are implicit in their specs but not yet captured as global truths

## Preconditions
- `taproot/` hierarchy exists with at least 3 `intent.md` or `usecase.md` files (fewer provides insufficient signal for pattern detection)
- `taproot/global-truths/` exists (created by `taproot init`)

## Main Flow
1. Developer invokes truth discovery — either directly via `/tr-review-all` (as a final pass) or standalone
2. System scans all `intent.md` and `usecase.md` files in `taproot/`, excluding `taproot/global-truths/` itself; unreadable files are skipped with a warning
3. System identifies candidate truths across three categories:
   - **Recurring terms** — domain-specific nouns used in 2+ specs without a canonical definition
   - **Business rules** — constraints or invariants stated in acceptance criteria or main flows that appear across multiple specs
   - **Implicit conventions** — patterns using "always", "never", "must not", or similar that recur across specs without being declared
   - Proposed scope: `intent` if the term appears in any `intent.md`; `behaviour` if it appears only in `usecase.md` files; `impl` if it appears only in implementation-adjacent contexts; defaults to `intent` when mixed
4. System filters out terms and rules already defined in `taproot/global-truths/`
5. System presents candidates grouped by category (in batches of 5 if more than 10 found, with option to stop after each batch), with:
   - Proposed scope and the heuristic that produced it
   - Evidence: which specs reference the candidate and how
6. Developer reviews each candidate and chooses: **promote**, **skip**, **backlog**, or **dismiss**
   - **dismiss** — permanently resolved; recorded as "reviewed — not a truth: `<term>`" in `.taproot/backlog.md` and will not resurface on the next run
7. For each **promoted** candidate, system invokes `/tr-ineed` with the candidate as input — developer completes the `/tr-ineed` flow, which routes to `define-truth` to create the truth file; if `/tr-ineed` routes elsewhere, developer is offered the option to redirect to `define-truth` directly
8. System returns to the candidate list after each `/tr-ineed` flow completes (or after an abandoned flow, treating it as skipped) and presents the next unprocessed candidate
9. After all candidates are processed (or the developer ends the session), system reports: N promoted, N skipped, N backlogged, N dismissed, N remaining

## Alternate Flows

### No candidates found
- **Trigger:** All terms and rules in the hierarchy are already defined in `global-truths/`, or the hierarchy is too consistent to surface patterns
- **Steps:**
  1. System reports: "No new truth candidates found — the hierarchy appears consistent with existing global truths"
  2. Developer continues without action

### Developer skips a candidate
- **Trigger:** Developer decides a candidate is too project-specific, too obvious, or not worth formalising right now
- **Steps:**
  1. Developer selects "skip"
  2. System moves to the next candidate without recording anything
  3. Skipped candidate reappears on the next discovery run (use "dismiss" to prevent resurfacing)

### Developer backlogs a candidate
- **Trigger:** Candidate is worth capturing eventually, but not in this session
- **Steps:**
  1. Developer selects "backlog"
  2. System appends the candidate to `.taproot/backlog.md` with today's date and a note: "truth candidate: `<term>`"
  3. System moves to the next candidate

### Developer dismisses a candidate
- **Trigger:** Developer has considered the candidate and determined it is not a project-wide truth — permanently
- **Steps:**
  1. Developer selects "dismiss"
  2. System appends to `.taproot/backlog.md`: "reviewed — not a truth: `<term>`"
  3. On all future discovery runs, the candidate is suppressed (filtered out alongside already-defined truths)
  4. System moves to the next candidate

### Developer abandons `/tr-ineed` mid-flow
- **Trigger:** Developer closes the agent or exits `/tr-ineed` before completing the define-truth flow
- **Steps:**
  1. Candidate is treated as skipped for the current session — no truth file is created
  2. On the next discovery run, the candidate reappears as unprocessed
  3. Developer may re-promote it, or explicitly skip, backlog, or dismiss it

### Developer ends session before all candidates are processed
- **Trigger:** Developer selects "done" or closes the agent mid-session
- **Steps:**
  1. System summarises progress: N promoted, N skipped, N backlogged, N dismissed, N remaining
  2. Unprocessed candidates have no persistent record — they reappear on the next discovery run
  3. Developer can resume by re-invoking discovery

### Candidate already partially defined
- **Trigger:** A truth file exists in `global-truths/` for the term, but: (a) it contains fewer than 2 substantive statements, or (b) at least one spec uses the term in a way that contradicts or extends the current definition
- **Steps:**
  1. System flags the candidate as "refinement needed" rather than "new truth"
  2. System invokes `/tr-ineed` with the refinement context — routes to refining the existing truth file rather than creating a new one

### `/tr-ineed` routes to an unexpected location
- **Trigger:** `/tr-ineed` classifies the candidate as something other than a truth (e.g. a new intent or a quality-gates behaviour)
- **Steps:**
  1. System surfaces the routing decision: "This candidate was routed to `<location>`. [A] Accept routing  [B] Override — invoke define-truth directly"
  2. Developer chooses; system proceeds accordingly

### Developer runs discovery as part of `/tr-review-all`
- **Trigger:** `/tr-review-all` completes its spec quality review and triggers the truth discovery pass automatically
- **Steps:**
  1. Discovery runs on the full hierarchy (same scan as standalone)
  2. Candidates are appended to the review-all report under a `## Truth Candidates` section
  3. Developer chooses to process candidates now (inline, via `/tr-ineed`) or defer; if deferred, all unprocessed candidates are appended to `.taproot/backlog.md` as "truth candidate: `<term>`" entries

## Postconditions
- Each promoted candidate has a corresponding truth file in `taproot/global-truths/`
- Backlogged candidates are recorded in `.taproot/backlog.md` as "truth candidate: `<term>`"
- Dismissed candidates are recorded in `.taproot/backlog.md` as "reviewed — not a truth: `<term>`" and will not resurface on the next discovery run
- Skipped candidates have no persistent record (will resurface on next run)
- The system does not modify any `intent.md` or `usecase.md` files — discovery is read-only on the hierarchy

## Error Conditions
- **Hierarchy too small (fewer than 3 specs):** Insufficient signal — system warns "Too few specs to surface patterns reliably (found N). Run discovery again after adding more specs." and exits without scanning.
- **`global-truths/` not found:** System prompts: "taproot/global-truths/ does not exist. Run `taproot init` or create it manually." and exits.
- **Spec file unreadable (malformed, permissions, encoding error):** System skips the file, emits a warning listing all skipped paths, and continues scanning the remaining files. Discovery completes on readable files only.
- **All candidates already defined:** System reports clean state and exits — not an error, but surfaced explicitly so the developer knows the scan ran.

## Flow

```mermaid
flowchart TD
    A[Developer invokes discover-truths] --> B[Scan intent.md + usecase.md files]
    B --> C{Hierarchy large enough?}
    C -->|< 3 specs| Z[Warn: too few specs — exit]
    C -->|≥ 3 specs| D[Identify candidates: terms, rules, conventions]
    D --> E[Filter out already-defined + dismissed truths]
    E --> F{Any candidates?}
    F -->|None| G[Report: hierarchy consistent — exit]
    F -->|Some| H[Present batch of up to 5 candidates]
    H --> I{Developer choice}
    I -->|Promote| J[Invoke /tr-ineed → define-truth]
    J -->|Completed| K[Next candidate]
    J -->|Abandoned| K
    I -->|Skip| K
    I -->|Backlog| L[Append truth candidate to backlog.md]
    L --> K
    I -->|Dismiss| M[Append reviewed—not a truth to backlog.md]
    M --> K
    I -->|Done| N[Summarise progress — exit]
    K --> O{More candidates?}
    O -->|Yes| H
    O -->|No| P[Report: N promoted, N skipped, N backlogged, N dismissed]
```

## Related
- `taproot/global-truths/define-truth/usecase.md` — each promoted candidate flows into define-truth via /tr-ineed
- `taproot/global-truths/apply-truths-when-authoring/usecase.md` — truths discovered here are applied by agents when the next spec is authored
- `taproot/global-truths/enforce-truths-at-commit/usecase.md` — truths discovered here are enforced at commit time once defined
- `taproot/human-integration/hierarchy-sweep/usecase.md` — sweep applies a uniform task to filtered files; discover-truths uses a different lens (cross-spec pattern detection rather than per-file task application)

## Acceptance Criteria

**AC-1: Candidates surfaced from recurring terms**
- Given a hierarchy with a domain term used in 3 or more specs but not defined in `global-truths/`
- When the developer invokes truth discovery
- Then the term appears as a candidate with the specs that reference it listed as evidence

**AC-2: Candidates filtered by existing truths**
- Given a term already defined in `taproot/global-truths/`
- When discovery runs
- Then the term does not appear as a candidate

**AC-3: Promoted candidate routed through /tr-ineed**
- Given the developer selects "promote" on a candidate
- When /tr-ineed is invoked
- Then /tr-ineed is invoked with the candidate pre-populated as context; if /tr-ineed routes to a location other than define-truth, the developer is offered the option to redirect to define-truth directly

**AC-4: Backlogged candidate recorded**
- Given the developer selects "backlog" on a candidate
- When discovery moves to the next candidate
- Then `.taproot/backlog.md` contains a new entry: `[YYYY-MM-DD] truth candidate: <term>`

**AC-5: Skipped candidate leaves no record**
- Given the developer selects "skip" on a candidate
- When discovery completes
- Then no record of the skip exists — the candidate reappears on the next discovery run (use "dismiss" to permanently resolve without creating a truth)

**AC-6: Too-small hierarchy exits cleanly**
- Given a hierarchy with fewer than 3 intent.md or usecase.md files
- When discovery is invoked
- Then the system warns and exits without scanning

**AC-7: Discovery pass appended to /tr-review-all output**
- Given a developer running `/tr-review-all` on a hierarchy with undefined truth candidates
- When the review completes
- Then a `## Truth Candidates` section appears at the end of the report, and unprocessed candidates are appended to `.taproot/backlog.md` if the developer defers

**AC-8: Dismissed candidate suppressed from future runs**
- Given the developer selects "dismiss" on a candidate
- When discovery is run again
- Then the dismissed candidate does not reappear, and `.taproot/backlog.md` contains "reviewed — not a truth: `<term>`"

**AC-9: Abandoned /tr-ineed flow treated as skip**
- Given the developer promotes a candidate but abandons the /tr-ineed flow before completing it
- When discovery resumes
- Then no truth file was created, the candidate is treated as skipped for this session, and it reappears on the next discovery run

## Implementations <!-- taproot-managed -->
- [Skill](./skill/impl.md)

## Status
- **State:** implemented
- **Created:** 2026-03-26
- **Last reviewed:** 2026-03-26
