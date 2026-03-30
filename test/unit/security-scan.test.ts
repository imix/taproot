import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
const WORKFLOW_PATH = resolve(ROOT, '.github/workflows/security-scan.yml');
const RELEASE_WORKFLOW_PATH = resolve(ROOT, '.github/workflows/release.yml');
const SCRIPT_PATH = resolve(ROOT, 'scripts/compile-security-report.js');

// ── Workflow structure ──────────────────────────────────────────────────────

describe('security-scan workflow (.github/workflows/security-scan.yml)', () => {
  it('exists', () => {
    expect(existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it('has nightly schedule trigger (AC-3)', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('schedule:');
    expect(content).toMatch(/cron:/);
  });

  it('has workflow_dispatch trigger for manual runs (AC-6)', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('workflow_dispatch:');
  });

  it('has workflow_call trigger for pre-release gate (AC-4, AC-5)', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('workflow_call:');
  });

  it('severity_threshold input defaults to high', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toMatch(/default:\s*high/);
  });

  it('severity_threshold accepts critical, high, medium, low', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('critical');
    expect(content).toContain('high');
    expect(content).toContain('medium');
    expect(content).toContain('low');
  });

  it('validates threshold and fails with a named error message', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain("unrecognised severity threshold");
    expect(content).toContain('exit 1');
  });

  it('installs semgrep and verifies its presence', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('semgrep');
    expect(content).toMatch(/semgrep.*not found/);
  });

  it('installs syft and verifies its presence', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('syft');
    expect(content).toMatch(/syft.*not found/);
  });

  it('installs grype and verifies its presence', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('grype');
    expect(content).toMatch(/grype.*not found/);
  });

  it('runs semgrep with p/typescript ruleset', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('p/typescript');
  });

  it('runs semgrep with p/owasp-top-ten ruleset', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('p/owasp-top-ten');
  });

  it('generates SBOM with syft', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('sbom.syft.json');
    expect(content).toContain('syft-json');
  });

  it('scans SBOM with grype', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('grype sbom:sbom.syft.json');
  });

  it('fails with named message when SBOM generation fails', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('Failed to generate SBOM');
  });

  it('warns when grype database may be stale', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('vulnerability database may be stale');
  });

  it('fails with named message when no vulnerability database is available', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('no vulnerability database available');
  });

  it('calls compile-security-report.js to apply threshold and generate report', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('compile-security-report.js');
  });

  it('uploads scan artefacts with 90-day retention (AC-7)', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('upload-artifact');
    expect(content).toContain('retention-days: 90');
  });

  it('uploads artefact even when scan fails (always)', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toMatch(/if:\s*always\(\)/);
  });

  it('uploads the scan report markdown file (AC-7)', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('security-scan-report.md');
  });
});

// ── Release workflow — pre-release gate ────────────────────────────────────

describe('release workflow pre-release security gate', () => {
  it('has a security-scan job that calls security-scan.yml (AC-4, AC-5)', () => {
    const content = readFileSync(RELEASE_WORKFLOW_PATH, 'utf-8');
    expect(content).toMatch(/security-scan:/m);
    expect(content).toContain('.github/workflows/security-scan.yml');
  });

  it('security-scan job only runs on tag push (pre-release gate)', () => {
    const content = readFileSync(RELEASE_WORKFLOW_PATH, 'utf-8');
    // Both the security-scan job and the tag condition must appear in the file
    expect(content).toMatch(/security-scan:/m);
    expect(content).toContain("startsWith(github.ref, 'refs/tags/v')");
  });

  it('publish job depends on security-scan (AC-4: blocks publish on findings)', () => {
    const content = readFileSync(RELEASE_WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('needs: [ci, security-scan]');
  });
});

// ── compile-security-report.js — structure check ───────────────────────────

describe('compile-security-report.js', () => {
  it('exists at scripts/compile-security-report.js', () => {
    expect(existsSync(SCRIPT_PATH)).toBe(true);
  });

  it('exports filterSemgrepFindings', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('export function filterSemgrepFindings');
  });

  it('exports filterGrypeFindings', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('export function filterGrypeFindings');
  });

  it('exports buildReport', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('export function buildReport');
  });

  it('exports VALID_THRESHOLDS containing all four levels', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain("'critical'");
    expect(content).toContain("'high'");
    expect(content).toContain("'medium'");
    expect(content).toContain("'low'");
  });

  it('exits 2 on invalid threshold', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('process.exit(2)');
    expect(content).toContain("unrecognised severity threshold");
  });

  it('exits 1 when findings are detected', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('process.exit(1)');
    expect(content).toContain('FINDINGS DETECTED');
  });

  it('writes GITHUB_OUTPUT when running in CI', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('GITHUB_OUTPUT');
    expect(content).toContain('total_findings=');
  });

  it('produces a CLEAN result when no findings are present', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('Result: CLEAN');
  });

  it('includes tool names in report header', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('semgrep');
    expect(content).toContain('syft');
    expect(content).toContain('grype');
  });

  it('reports finding details: tool, severity, location, remediation', () => {
    const content = readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('Remediation');
    expect(content).toContain('CVE');
    expect(content).toContain('Rule');
  });
});
