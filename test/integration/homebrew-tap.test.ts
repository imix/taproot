import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const releaseYml = readFileSync(
  resolve(__dirname, '../../.github/workflows/release.yml'),
  'utf-8'
);

describe('homebrew-tap CI job — structural checks', () => {
  it('update-homebrew-tap job is present in release.yml', () => {
    expect(releaseYml).toContain('update-homebrew-tap:');
  });

  it('job depends on publish (AC-1: runs after npm publish)', () => {
    const jobSection = releaseYml.slice(releaseYml.indexOf('update-homebrew-tap:'));
    expect(jobSection).toMatch(/needs:\s*publish/);
  });

  it('job uses continue-on-error: true (AC-2: non-blocking)', () => {
    const jobSection = releaseYml.slice(releaseYml.indexOf('update-homebrew-tap:'));
    expect(jobSection).toMatch(/continue-on-error:\s*true/);
  });

  it('job has token check step with clear error message (AC-3)', () => {
    const jobSection = releaseYml.slice(releaseYml.indexOf('update-homebrew-tap:'));
    expect(jobSection).toContain('HOMEBREW_TAP_TOKEN');
    expect(jobSection).toContain("HOMEBREW_TAP_TOKEN not set or invalid");
  });

  it('job downloads tarball and computes sha256 (AC-4)', () => {
    const jobSection = releaseYml.slice(releaseYml.indexOf('update-homebrew-tap:'));
    expect(jobSection).toContain('sha256sum');
    expect(jobSection).toContain('imix-js/taproot/archive/refs/tags/');
  });

  it('job handles 404 tarball with descriptive error', () => {
    const jobSection = releaseYml.slice(releaseYml.indexOf('update-homebrew-tap:'));
    expect(jobSection).toContain('GitHub release tarball not found');
  });

  it('job updates Formula/taproot.rb in imix/homebrew-tap', () => {
    const jobSection = releaseYml.slice(releaseYml.indexOf('update-homebrew-tap:'));
    expect(jobSection).toContain('imix/homebrew-tap');
    expect(jobSection).toContain('Formula/taproot.rb');
  });

  it('job reports manual retry command on push failure (AC-2)', () => {
    const jobSection = releaseYml.slice(releaseYml.indexOf('update-homebrew-tap:'));
    expect(jobSection).toContain('Retry manually');
    expect(jobSection).toContain('imix/homebrew-tap');
  });

  it('job runs in release environment to access HOMEBREW_TAP_TOKEN', () => {
    const jobSection = releaseYml.slice(releaseYml.indexOf('update-homebrew-tap:'));
    expect(jobSection).toMatch(/environment:\s*release/);
  });
});
