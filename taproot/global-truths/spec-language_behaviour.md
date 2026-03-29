# Spec Language

Behaviour specs use actor-visible language throughout.

HTTP codes, token counts, implementation details, and technical error codes or names belong in `impl.md`, implementation-level global truths, or NFR criteria — not in `## Main Flow`, `## Alternate Flows`, or `## Error Conditions`.

**Correct:**
- "The item is not found" (not "API returns 404")
- "The request exceeds the maximum size the system accepts" (not "token limit exceeded")
- "Service is unavailable" (not "HTTP 503")
- "An item with that name already exists" (not "duplicate key constraint violation")

**Where technical details belong:**
- `## Error Conditions` may name the actor-visible outcome but not the underlying technical cause
- NFR criteria (`**NFR-N:**`) may reference measurable thresholds (response times, error rates)
- `impl.md` `## Design Decisions` is the right place for HTTP codes, database errors, and implementation-specific error handling
