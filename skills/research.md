# Skill: research

## Description

Research any domain or technical subject before writing a behaviour spec — by scanning local resources, searching the web, and drawing on expert knowledge.

## Inputs

- `topic` (required): The domain, technology, or subject to research. Can be a phrase or a few words — the skill will sharpen it if ambiguous.
- `context` (optional): Additional context from the calling skill (e.g. the raw requirement from `/tr-ineed`) that informs search queries and expert questions.

## Steps

1. **Announce the topic** and confirm scope: `"Researching: <topic>."` If the topic is a single word or lacks domain context (e.g. `"sort"`, `"auth"`), ask one clarifying question before proceeding: `"What domain or language context should I scope this to?"` Incorporate the answer into all subsequent steps.

2. **Scan local resources** in this order:
   - `research/` folder — any `.md` or `.pdf` files
   - `docs/` and project root — any `.pdf` files
   - Files linked from `taproot/OVERVIEW.md`

   Use the topic as a **semantic** query against file content — do not rely on filename matching alone. A file named `thermal-design.pdf` may be relevant to `"heat dissipation"`. For each relevant file found, note the path and a one-line summary of what it contributes.

3. **Check for prior research:** if `research/<topic-slug>.md` already exists, present it:
   > "Found existing research at `research/<topic-slug>.md` (last updated: `<date>`). [U]se it / [R]efresh it / [S]tart fresh?"
   - **[U]** — load the existing document as the synthesis; skip to step 7
   - **[R]** — run the full flow (steps 4–6); merge new findings with the existing document, updating citations and conclusions; preserve prior expert insights unless explicitly superseded
   - **[S]** — discard the existing document; run the full flow

4. **Multi-query web search** — issue several targeted queries rather than one literal search:
   - `"<topic> existing library OR package"`
   - `"<topic> algorithm OR implementation paper"`
   - `"<topic> production implementation OR best practice"`
   - Add domain-specific variants based on context (e.g. `"<topic> RFC"` for protocol topics, `"<topic> npm"` for JavaScript)

   For each result that looks substantive, read it and extract: name/title, URL or reference, what it solves, and any known limitations or trade-offs.

   If web search is unavailable, note: `"Web search unavailable — continuing with local sources and expert knowledge only."` and proceed to step 5.

   If no local resources were found in step 2, note this and continue — the web search is still valuable.

5. **Present a preliminary synthesis:**
   ```
   ## Preliminary findings: <topic>

   ### Local resources
   - <file path> — <one-line summary>
   (or: none found)

   ### Web findings
   - <name/title> (<URL or reference>) — <what it solves / key trade-offs>
   (or: none found / web unavailable)

   ### Key take-aways so far
   - <insight 1>
   - <insight 2>
   ```

6. **Mode selection** — ask: `"How should I use what I've found?"`
   - **[A] Extract my knowledge** → delegate to `/tr-grill-me` seeded with the preliminary synthesis as grilling material. Questions should reference specific findings — library names, paper conclusions, known trade-offs — not generic topic questions. Terminate when the developer says `[Done]` or after ≤3 rounds where no new information is surfacing. Incorporate the developer's answers into the synthesis.
   - **[B] Help me think through the design** → present the key trade-offs, open questions, and competing options surfaced by the research; engage the developer in a structured design discussion; capture agreed choices and rationale in a `## Design Decisions` section appended to the synthesis.
   - **[C] The synthesis is enough** → proceed with the gathered synthesis as-is.

7. **Present the final structured research summary:**
   ```
   ## Research summary: <topic>

   ### Local sources
   - <path> — <summary>

   ### Web sources
   - <name> (<URL>) — <summary>

   ### Expert insights
   - <insight from grilling> (or: none)

   ### Key conclusions
   - <conclusion 1>
   - <conclusion 2>

   ### Open questions
   - <question that research did not resolve>

   ### References
   - <full citation: title, URL or path, accessed/published date>
   ```

8. **Propose slug and output choice.** Derive a kebab-case slug from the topic:
   > `"I'll save this as research/<topic-slug>.md — is that right?"`

   Developer confirms or corrects the slug. Then ask:
   > **`[S] Save to research/<topic-slug>.md with citations`**
   > **`[F] Feed directly into a spec`**
   > **`[Q] Discard and stop`**

   - **[S]** — create `research/` directory if absent; write `research/<topic-slug>.md` using the final summary structure from step 7; present:

> 💡 If this session is getting long, consider running `/compact` or starting a fresh context before the next task.

     **What's next?**
     [A] `/tr-behaviour taproot/<intent>/` — write a spec informed by this research
     [B] `/tr-ineed "<topic>"` — route it as a requirement with research context attached
   - **[F]** — pass the final summary as input context to `/tr-behaviour`; no file written
   - **[Q]** — discard the synthesis; exit without writing any file or chaining to another skill

## Output

One of:
- A saved `research/<topic-slug>.md` document with full citations and structured findings
- The research synthesis passed as input context to a downstream skill (`/tr-behaviour` or `/tr-ineed`)
- Nothing (if the developer chose `[Q]`)

## CLI Dependencies

None — pure agent skill. Uses agent tools: file reading (local scan), web search (step 4).

## Notes

- **Auto-trigger mode:** when called from `/tr-ineed`, step 8 is skipped — the synthesis is always fed forward to the calling skill without prompting. The `context` input carries the original requirement to sharpen search queries.
- **Graceful degradation:** if both local resources and web search produce nothing, and no expert is available, announce: `"No research sources available."` Ask whether to proceed with the spec based on the stated requirement alone, or abort. Never silently produce an empty synthesis.
- **Slug derivation:** kebab-case the topic words, drop stop words, keep max 4 words. `"satellite tracking algorithm"` → `satellite-tracking-algorithm`. Confirm with the developer before writing.
- **Refresh merges, not overwrites:** when `[R]efresh` is chosen, append new citations to the References section, update Key conclusions, and add a `Last refreshed:` date — do not discard prior expert insights.
- **Knowledge extraction ([A]) is domain-aware:** the grill session is seeded with what was actually found, not generic questions. If the synthesis found `satellite.js`, ask about its limitations, alternatives, and when it breaks — not `"what do you know about satellite tracking?"`. Either an expert or a well-informed practitioner can choose [A] — it is about contributing knowledge, not claiming expertise.
- **Design assistance ([B]) uses the research as grounding:** trade-offs, competing options, and open questions come from the actual findings — not hypothetical concerns. The `## Design Decisions` section captures what was agreed and why.
- `/tr-research` is the Claude Code adapter command name for this skill.
