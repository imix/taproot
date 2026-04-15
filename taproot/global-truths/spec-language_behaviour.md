## Spec language

Behaviour specs use actor-visible language throughout. Technical details (HTTP codes, database errors, token counts, API names) belong in `impl.md` or NFR criteria — not in Main Flow, Alternate Flows, Error Conditions, or Postconditions. When an actor's description uses technical vocabulary (REST verbs, HTTP status codes, database operations, internal service names), translate to actor-visible equivalents before drafting — do not echo technical terms from the input.
