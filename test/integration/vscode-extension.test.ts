import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const manifestPath = join(process.cwd(), 'vscode-extension', 'package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

describe('VS Code extension manifest', () => {
  // AC-6: Built .vsix declares the initialize command
  describe('command contribution', () => {
    it('declares taproot.init command', () => {
      const commands: Array<{ command: string; title: string }> =
        manifest.contributes?.commands ?? [];
      const initCmd = commands.find((c) => c.command === 'taproot.init');
      expect(initCmd).toBeDefined();
    });

    it('taproot.init command has title "Taproot: Initialize project"', () => {
      const commands: Array<{ command: string; title: string }> =
        manifest.contributes?.commands ?? [];
      const initCmd = commands.find((c) => c.command === 'taproot.init');
      expect(initCmd?.title).toBe('Taproot: Initialize project');
    });
  });

  // AC-7: Built .vsix declares a Get Started walkthrough
  describe('walkthrough', () => {
    it('declares at least one walkthrough', () => {
      const walkthroughs: unknown[] = manifest.contributes?.walkthroughs ?? [];
      expect(walkthroughs.length).toBeGreaterThan(0);
    });

    it('walkthrough has at least one step', () => {
      const walkthroughs: Array<{ steps?: unknown[] }> =
        manifest.contributes?.walkthroughs ?? [];
      const steps = walkthroughs[0]?.steps ?? [];
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  // Manifest completeness
  describe('manifest fields', () => {
    it('has a resolved publisher (not a placeholder empty string)', () => {
      expect(typeof manifest.publisher).toBe('string');
      expect(manifest.publisher.length).toBeGreaterThan(0);
    });

    it('includes discoverability keywords', () => {
      const keywords: string[] = manifest.keywords ?? [];
      expect(keywords).toContain('taproot');
      expect(keywords).toContain('AI');
      expect(keywords).toContain('requirements');
      expect(keywords).toContain('BDD');
      expect(keywords).toContain('spec');
      expect(keywords).toContain('traceability');
    });

    it('specifies a main entry point', () => {
      expect(typeof manifest.main).toBe('string');
      expect(manifest.main.length).toBeGreaterThan(0);
    });
  });
});
