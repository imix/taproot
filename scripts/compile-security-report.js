#!/usr/bin/env node
/**
 * Compile a security scan report from semgrep and grype JSON outputs.
 * Applies a severity threshold and exits 1 if findings are detected.
 *
 * Usage:
 *   node scripts/compile-security-report.js [threshold] [semgrep.json] [grype.json] [output.md]
 *
 * Threshold: critical | high | medium | low  (default: high)
 * Exit codes: 0 = clean, 1 = findings detected, 2 = invalid threshold
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { fileURLToPath } from 'url';

export const SEVERITY_RANK = /** @type {Record<string,number>} */ ({
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
});

// semgrep uses ERROR / WARNING / INFO; map to the same 1-3 scale
export const SEMGREP_SEVERITY_RANK = /** @type {Record<string,number>} */ ({
  error: 3,
  warning: 2,
  info: 1,
});

export const VALID_THRESHOLDS = ['critical', 'high', 'medium', 'low'];

/**
 * Filter semgrep findings at or above the given threshold rank.
 * @param {unknown[]} results - semgrep JSON `results` array
 * @param {number} thresholdRank
 */
export function filterSemgrepFindings(results, thresholdRank) {
  return (results ?? []).filter(r => {
    const sev = (/** @type {any} */ (r)?.extra?.severity ?? 'INFO').toLowerCase();
    return (SEMGREP_SEVERITY_RANK[sev] ?? 1) >= thresholdRank;
  });
}

/**
 * Filter grype matches at or above the given threshold rank.
 * @param {unknown[]} matches - grype JSON `matches` array
 * @param {number} thresholdRank
 */
export function filterGrypeFindings(matches, thresholdRank) {
  return (matches ?? []).filter(m => {
    const sev = (/** @type {any} */ (m)?.vulnerability?.severity ?? 'low').toLowerCase();
    return (SEVERITY_RANK[sev] ?? 1) >= thresholdRank;
  });
}

/**
 * Build a markdown report from filtered findings.
 * @param {string} threshold
 * @param {unknown[]} semgrepFindings
 * @param {unknown[]} grypeFindings
 * @returns {{ report: string; total: number }}
 */
export function buildReport(threshold, semgrepFindings, grypeFindings) {
  const total = semgrepFindings.length + grypeFindings.length;

  const lines = [
    '# Security Scan Report',
    '',
    `- **Date:** ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`,
    `- **Severity threshold:** ${threshold}`,
    '- **Tools:** semgrep (p/typescript + p/owasp-top-ten), syft, grype',
    '',
    '## Summary',
    '',
    `| Tool | Findings ≥ ${threshold} |`,
    '|------|------|',
    `| semgrep (SAST) | ${semgrepFindings.length} |`,
    `| grype (CVE) | ${grypeFindings.length} |`,
    `| **Total** | **${total}** |`,
    '',
  ];

  if (total > 0) {
    lines.push('**Result: FINDINGS DETECTED** — review and remediate before release.');
    lines.push('');
    lines.push('## Findings');
    lines.push('');

    for (const f of semgrepFindings) {
      const ff = /** @type {any} */ (f);
      const sev = (ff.extra?.severity ?? 'UNKNOWN').toUpperCase();
      const filePath = ff.path ?? 'unknown';
      const line = ff.start?.line ?? '?';
      const msg = ff.extra?.message ?? ff.check_id ?? 'no message';
      const fix = ff.extra?.fix_regex?.fix ?? ff.extra?.metadata?.fix ?? '';
      lines.push(`### semgrep · ${sev} · \`${filePath}:${line}\``);
      lines.push(`- **Rule:** ${ff.check_id ?? 'unknown'}`);
      lines.push(`- **Message:** ${msg}`);
      if (fix) lines.push(`- **Remediation:** ${fix}`);
      lines.push('');
    }

    for (const m of grypeFindings) {
      const mm = /** @type {any} */ (m);
      const v = mm.vulnerability ?? {};
      const pkg = mm.artifact?.name ?? 'unknown';
      const ver = mm.artifact?.version ?? 'unknown';
      const sev = (v.severity ?? 'UNKNOWN').toUpperCase();
      const cve = v.id ?? 'unknown';
      const fixVersions = v.fix?.versions?.join(', ') ?? 'none available';
      const desc = v.description ?? '';
      lines.push(`### grype · ${sev} · \`${pkg}@${ver}\``);
      lines.push(`- **CVE:** ${cve}`);
      if (desc) lines.push(`- **Description:** ${desc.slice(0, 200)}`);
      lines.push(`- **Remediation:** upgrade to ${fixVersions}`);
      lines.push('');
    }
  } else {
    lines.push(`**Result: CLEAN** — no findings at or above \`${threshold}\` severity.`);
  }

  return { report: lines.join('\n'), total };
}

// ── CLI entry point ────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , threshold = 'high', semgrepPath = 'semgrep-results.json', grypePath = 'grype-results.json', outputPath = 'security-scan-report.md'] = process.argv;

  if (!VALID_THRESHOLDS.includes(threshold)) {
    console.error(`unrecognised severity threshold '${threshold}' — expected one of: ${VALID_THRESHOLDS.join(', ')}`);
    process.exit(2);
  }

  const thresholdRank = SEVERITY_RANK[threshold] ?? 3;

  /** @type {unknown[]} */
  let semgrepResults = [];
  if (existsSync(semgrepPath)) {
    try {
      semgrepResults = JSON.parse(readFileSync(semgrepPath, 'utf8')).results ?? [];
    } catch (e) {
      console.warn(`Warning: could not parse semgrep results at ${semgrepPath}: ${/** @type {Error} */ (e).message}`);
    }
  }

  /** @type {unknown[]} */
  let grypeMatches = [];
  if (existsSync(grypePath)) {
    try {
      grypeMatches = JSON.parse(readFileSync(grypePath, 'utf8')).matches ?? [];
    } catch (e) {
      console.warn(`Warning: could not parse grype results at ${grypePath}: ${/** @type {Error} */ (e).message}`);
    }
  }

  const semgrepFindings = filterSemgrepFindings(semgrepResults, thresholdRank);
  const grypeFindings = filterGrypeFindings(grypeMatches, thresholdRank);
  const { report, total } = buildReport(threshold, semgrepFindings, grypeFindings);

  writeFileSync(outputPath, report);
  console.log(report);

  // Write GitHub Actions step outputs if running in CI
  const githubOutput = process.env['GITHUB_OUTPUT'];
  if (githubOutput) {
    appendFileSync(githubOutput, `total_findings=${total}\n`);
    appendFileSync(githubOutput, `result=${total > 0 ? 'findings' : 'clean'}\n`);
  }

  if (total > 0) {
    console.error(`\nSecurity scan FAILED: ${total} finding(s) at or above '${threshold}' severity.`);
    process.exit(1);
  }
}
