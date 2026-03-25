# Intent: Command Interface

## Goal
Allow users to invoke the tool's capabilities from a terminal with a consistent, discoverable, and script-friendly command interface.

## Stakeholders
- **CLI user**: needs commands that are predictable, well-documented, and produce useful output or clear errors
- **Script author**: needs stable exit codes and machine-readable output for use in pipelines and automation
- **New user**: needs a `--help` output that explains available commands and flags without reading external docs

## Success Criteria
- [ ] Every command is documented in `--help` output with a one-line description and usage example
- [ ] Commands exit with code 0 on success and a non-zero code on any failure
- [ ] Error messages identify the problem and suggest a fix where possible

## Behaviours <!-- taproot-managed -->
- [Dispatch Command](./dispatch-command/usecase.md)
- [Help Output](./help-output/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-25
