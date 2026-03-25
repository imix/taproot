# Intent: Configuration

## Goal
Allow users to configure the tool's behaviour through configuration files, environment variables, and command-line flags — without modifying the tool's source code.

## Stakeholders
- **CLI user**: needs a way to persist preferences (e.g. default output format, API endpoint) without repeating flags on every invocation
- **Script author / CI**: needs configuration that works non-interactively from environment variables
- **Team**: needs a project-level config file that can be committed to the repository

## Success Criteria
- [ ] The tool reads configuration from a file (e.g. `.mytoolrc` or `mytool.config.js`) when present
- [ ] Environment variables override file-based configuration
- [ ] Command-line flags override both environment variables and file-based configuration
- [ ] Invalid configuration produces a clear error message identifying the problematic key

## Behaviours <!-- taproot-managed -->
- [Load Configuration](./load-config/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-25
