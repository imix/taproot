# Channel Folder Convention

All distribution channel artifacts live under `channels/<channel-name>/` at project root.

- **VS Code extension:** `channels/vscode/`
- Do not place channel-specific source files, manifests (`package.json`), or READMEs at project root
- When adding a new distribution channel, create `channels/<channel-name>/` and place all channel-specific files there
