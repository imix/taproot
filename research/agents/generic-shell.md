# Agent Research: Generic / Shell Scripting Approach

- **Last updated:** 2026-03-20
- **Version researched:** N/A — pattern-based

## Isolation mechanism

- **Primary mechanism:** Fresh OS process per item — each `agent-cli -p "..."` invocation is a new process with no shared state
- **Scope of isolation:** Full — separate process, separate context window, separate memory
- **Known limitations:** Sequential by default (parallelism requires `xargs -P` or `&`); no IDE integration

## Sub-agent / parallel execution

- **Supported:** Yes — via shell parallelism (`xargs -P N`, `&`, `parallel`)
- **How invoked:** Shell loop or `xargs`
- **Max parallelism:** Limited by API rate limits and local resources
- **Context channel:** CLI argument / stdin
- **Result channel:** stdout / exit code / output file

### Example: sequential sweep
```bash
while IFS= read -r item_path; do
  task=$(cat .taproot/sweep-task.txt)
  content=$(cat "$item_path")
  result=$(claude -p "$task\n\n---\n$content")
  echo "{\"item\": \"$item_path\", \"result\": \"$result\"}" >> .taproot/sweep-results.jsonl
done < .taproot/sweep-items.txt
```

### Example: parallel sweep (N=4)
```bash
cat .taproot/sweep-items.txt | xargs -P 4 -I{} sh -c '
  result=$(claude -p "$(cat .taproot/sweep-task.txt)\n\n$(cat {})")
  echo "{\"item\": \"{}\", \"result\": \"$result\"}"
' >> .taproot/sweep-results.jsonl
```

## Headless / scripting interface

This approach IS the headless interface. Any agent with a `-p` or `--print` flag works:

| Agent | Command |
|---|---|
| Claude Code | `claude -p "<prompt>"` |
| Gemini CLI | `gemini -p "<prompt>"` |
| GitHub Copilot | `gh copilot suggest "<prompt>"` |
| llm (Simon Willison) | `llm "<prompt>"` |
| Ollama (local) | `ollama run <model> "<prompt>"` |

## Context limits

Depends on the underlying model. For file-content sweeps, keep items under ~50K tokens to leave room for task prompt and response.

## Token cost model

- Pay-per-token for cloud agents; free for local models (Ollama)
- Sequential processing avoids rate limit issues
- `--dry-run` manifests (no actual agent calls) cost nothing

## Taproot sweep compatibility notes

- **This is the universal fallback** — any agent with a CLI can use this approach
- **Manifest reading:** `taproot sweep` writes `sweep-items.txt` (one path per line) and `sweep-task.txt`; shell script reads both
- **Per-item execution:** One CLI call per item — maximum isolation
- **Result writing:** Append JSON lines to `sweep-results.jsonl`; `taproot sweep --report` reads it
- **Recommended for:** CI pipelines, agents without IDE integration, automation scripts
- **Key advantage:** Zero platform dependency — works with any LLM that has a CLI

## References

- llm-bp. "CLI tool for batch processing files with LLM prompts." https://github.com/ianva/llm-bp (accessed 2026-03-20)
- Simon Willison. "llm CLI tool." https://llm.datasette.io (not searched — known tool)
