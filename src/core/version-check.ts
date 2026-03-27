import { existsSync, readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function parseSemver(v: string): [number, number, number] {
  const parts = v.replace(/^v/, '').split('.').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/**
 * Compares the installed taproot version against the project's pinned taproot_version
 * in taproot/settings.yaml. Emits a warning to stderr when they diverge.
 *
 * Skipped silently when:
 *  - taproot/settings.yaml does not exist (not a taproot project)
 *  - taproot_version key is absent (project pre-dates version pinning)
 */
export function checkProjectVersion(cwd: string): void {
  const settingsPath = join(cwd, 'taproot', 'settings.yaml');
  if (!existsSync(settingsPath)) return;

  const content = readFileSync(settingsPath, 'utf-8');
  const match = content.match(/^taproot_version:\s*['"]?(\d[\d.]*\d)['"]?\s*$/m);
  if (!match) return;

  const projectVersion = match[1]!;
  const { version: installed } = require(resolve(__dirname, '..', '..', 'package.json')) as { version: string };

  const [instMaj, instMin] = parseSemver(installed);
  const [projMaj, projMin] = parseSemver(projectVersion);

  if (instMaj < projMaj || (instMaj === projMaj && instMin < projMin)) {
    process.stderr.write(
      `taproot: project requires ${projectVersion}, installed is ${installed}\n` +
      `  → run: npm install -g @imix-js/taproot@${projectVersion}\n`,
    );
  } else if (instMaj > projMaj) {
    process.stderr.write(
      `taproot: installed ${installed} is a major version ahead of this project (pinned at ${projectVersion})\n` +
      `  → run: taproot update  — to sync skills and record the new version\n`,
    );
  } else if (instMin > projMin) {
    process.stderr.write(
      `taproot: installed ${installed}, project at ${projectVersion} — run: taproot update\n`,
    );
  }
}
