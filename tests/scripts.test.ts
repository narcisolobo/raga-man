import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts as Record<string, string>;

describe('package scripts always generate the word data first', () => {
  for (const name of ['dev', 'build']) {
    it(`${name} runs build:data`, () => {
      expect(scripts[name]).toContain('build:data');
    });
  }
  it('deploy:cf runs the full build before publishing', () => {
    expect(scripts['deploy:cf']).toMatch(/^pnpm build && .*wrangler deploy/);
  });
});
