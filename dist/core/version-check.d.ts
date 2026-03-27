/**
 * Compares the installed taproot version against the project's pinned taproot_version
 * in taproot/settings.yaml. Emits a warning to stderr when they diverge.
 *
 * Skipped silently when:
 *  - taproot/settings.yaml does not exist (not a taproot project)
 *  - taproot_version key is absent (project pre-dates version pinning)
 */
export declare function checkProjectVersion(cwd: string): void;
