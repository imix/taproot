# Behaviour: Welcoming README

## Actor
Developer discovering taproot for the first time

## Preconditions
- `README.md` exists in the taproot repository root
- The README is rendered on the GitHub repository landing page
- A taproot logo asset exists (SVG format) suitable for display at the top of the README
- A terminal animation asset (SVG or GIF) exists showing the end-to-end taproot workflow

## Main Flow
1. Visitor lands on the taproot GitHub page and immediately sees the taproot logo, followed by a terminal animation playing the taproot workflow — `npx taproot init`, then `claude`, then `/tr-ineed I need…`, a spec being written, and a commit gated by `taproot dod` — before reading a single line of prose
2. Visitor reads the punchy headline beneath the animation and immediately understands what taproot does and why it matters
3. Visitor reads the pain point hook — a concrete statement of the problem AI-assisted coding creates (agents generate code fast, but six months later nobody knows *why* a module exists)
4. Visitor reads the one-line value proposition and the three design principles — filesystem-based, agent-agnostic, CLI-validated — and judges fit for their project
5. Visitor reads the Quick Start section and runs the install steps
6. Visitor runs `taproot init --agent <agent>` in their project and installs their agent adapter
7. Visitor runs `/tr-guide` in their agent for the onboarding walkthrough
8. Visitor sees a reference to taproot tracking itself (OVERVIEW.md) and follows it as a live example

## Alternate Flows

### Visitor is persuaded by the animation before reading prose
- **Trigger:** The animation communicates the value faster than the written copy
- **Steps:**
  1. Visitor watches the animation loop through the workflow
  2. Visitor understands "this is an AI-native requirements tool" from the animation alone
  3. Visitor skips directly to Quick Start without reading the Why section

### Evaluator skips to proof
- **Trigger:** Visitor is an engineering lead who wants evidence of maturity before reading further
- **Steps:**
  1. Visitor sees the "Taproot tracks itself" section and follows the OVERVIEW.md link
  2. Visitor sees 50+ implemented behaviours and recognises the tool is production-ready
  3. Visitor returns to the README and continues with the Quick Start

### Visitor wants to understand before installing
- **Trigger:** Visitor reads the Why section and wants more depth before committing to an install
- **Steps:**
  1. Visitor follows a link in the README to `docs/guide.md` or `docs/cli.md`
  2. Visitor returns to the README Quick Start when ready

### Visitor decides taproot is not a fit
- **Trigger:** Visitor reads the README and determines the workflow doesn't match their team
- **Steps:**
  1. README accurately represents what taproot is and is not — visitor leaves informed, not misled
  2. No false promises; constraints and scope boundaries are visible

## Postconditions
- Visitor can describe what taproot is and who it's for without reading any other document
- Visitor has either completed `taproot init` or made an informed decision not to
- The README accurately reflects taproot's actual capability (not just the minimal quick-start)
- The animation asset is maintained and reflects the current CLI and skill command names

## Error Conditions
- **README becomes stale after feature additions:** Mitigated by the `document-current` DoD condition already enforced on all implementations — README accuracy is a resolved cross-cutting concern
- **Quick Start steps break after a dependency change:** If the install instructions in the README no longer work, a first-time visitor is immediately blocked — this is a critical failure; install steps must be verified with each release
- **Animation shows outdated commands:** If `taproot init` syntax or skill names change, the animation becomes misleading — animation source must be updated alongside CLI changes

## Flow
```mermaid
flowchart TD
    A[Visitor lands on GitHub page] --> B[Sees terminal animation playing]
    B --> C{Animation persuasive enough?}
    C -- yes --> E[Skips to Quick Start]
    C -- wants more --> D[Reads pain point hook + value proposition]
    D --> F{Convinced enough to try?}
    F -- yes --> E
    F -- wants proof first --> G[Follows OVERVIEW.md link]
    G --> H[Sees 50+ implemented behaviours]
    H --> E
    F -- not a fit --> I[Leaves informed — README was accurate]
    E --> J[Runs taproot init --agent]
    J --> K[Runs /tr-guide in agent]
    K --> L[Visitor is onboarded]
```

## Related
- `taproot/requirements-hierarchy/initialise-hierarchy/usecase.md` — the Quick Start leads directly here; README must accurately reflect `taproot init` behaviour
- `taproot/agent-integration/generate-agent-adapter/usecase.md` — `taproot init --agent` is the key first-install action the README guides visitors toward
- `taproot/agent-integration/agent-support-tiers/usecase.md` — README should reflect agent tier labels (Tier 1/2/3) so visitors know Claude is fully supported

## Acceptance Criteria

**AC-1: Pain point visible without scrolling**
- Given a visitor on a standard laptop screen (1080p, default browser font)
- When they land on the taproot GitHub page
- Then the opening sentence names the specific problem taproot solves (AI coding loses track of *why* code exists) before any code block or feature list

**AC-2: Value proposition clear within first scroll**
- Given a visitor who has never heard of taproot
- When they read through the first visible section of the README
- Then they can explain in one sentence what taproot does and who it's for

**AC-3: Quick Start is complete and works end-to-end**
- Given a developer with Node.js installed and no prior taproot setup
- When they follow only the README Quick Start steps
- Then they have taproot installed, `taproot init` has run successfully, and their agent adapter is in place — without needing to consult any other document

**AC-4: Taproot's own usage is surfaced as proof**
- Given a visitor reading the README
- When they reach the "Taproot tracks itself" section
- Then they see a link to `taproot/OVERVIEW.md` and the current behaviour/implementation counts — demonstrating taproot is used on its own codebase

**AC-5: README does not make false claims**
- Given any feature described in the README
- When a developer attempts to use that feature after install
- Then the feature exists and behaves as described — no aspirational or placeholder content

**AC-6: Terminal animation present in first viewport**
- Given a visitor on the GitHub repository landing page
- When the page loads
- Then a terminal animation is visible without scrolling, showing the end-to-end taproot workflow: `npx taproot init` → agent launch → `/tr-ineed` → spec written → commit gated by `taproot dod`

**AC-7: Marketing copy conveys emotional benefit, not just capability**
- Given a visitor who skims rather than reads
- When they scan the headline and first two sections
- Then the copy conveys what it *feels like* to use taproot — requirements that survive the conversation, agents that remember why code exists — not just a feature list

**AC-8: Logo is displayed above the terminal animation**
- Given a visitor lands on the taproot GitHub page
- When the README renders
- Then the taproot logo appears as the first visual element, above the terminal animation and all prose

**NFR-1: README renders without broken syntax on GitHub**
- Given the README.md content pushed to the repository
- When GitHub renders it on the repository landing page
- Then all Markdown elements (code blocks, headers, lists, links) render correctly with no raw syntax visible

**NFR-2: Animation renders on GitHub without JavaScript**
- Given the animation asset embedded in README.md
- When GitHub renders the page
- Then the animation displays correctly as a native SVG animation or GIF — no iframe, no video tag, no JavaScript required

## Implementations <!-- taproot-managed -->
- [README Content](./content/impl.md)

## Status
- **State:** implemented
- **Created:** 2026-03-21
- **Last reviewed:** 2026-04-07

## Notes
- The README is the only document a first-time visitor reads before deciding whether to install — it carries more weight than any other doc in the project.
- Inspiration: GSD README (bold problem-first opening, punchy feature bullets with em-dashes, numbered CLI workflow steps) and OpenSpec README (stated design philosophy early, competitive positioning, conversational problem framing).
- The README should reflect the real maturity of the project: 50+ behaviours, agent tiers, DoD/DoR gates, acceptance criteria traceability — not just the minimal "here's a tree" quick-start.
- The "Taproot tracks itself" section is a key trust signal — it shows that the tool is used in production on its own codebase.
- Animation tooling options: VHS (generates SVG from a `.tape` script — preferred for maintainability), `svg-term-cli` (converts Asciinema recordings), or a hand-crafted animated SVG. VHS is recommended — the `.tape` source lives in the repo and can be re-rendered when CLI syntax changes.
- The animation should show the *feeling* of using taproot: fast, structured, AI-native — not a comprehensive feature demo.
