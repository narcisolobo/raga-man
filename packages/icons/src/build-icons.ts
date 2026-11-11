/**
 * Writes each app's favicon.svg, favicon.ico and apple-touch-icon.png from the specs
 * in apps.ts. Run with `pnpm icons` from the repo root.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { ICONS, type IconSpec, type Role, type Shape } from './apps';
import { ico } from './ico';

// Values from packages/ui/src/styles/global.css. The ink tile takes the dark-surface
// tokens, as the site does on any dark surface; the paper tile takes the light ones.
const INK = { tile: '#121413', letter: '#e3e5e2', accent: '#9db3f2' }; // ink, on-ink, pencil-dark
const PAPER = { tile: '#e3e5e2', letter: '#121413', accent: '#2748a8' }; // paper, ink, pencil

const CLASS: Record<Role, string> = { tile: 't', letter: 'l', accent: 'a' };
const BOX = 100;
const ART = { top: 13, bottom: 87, maxWidth: 76 };

function draw(shapes: Shape[], fill?: Record<Role, string>): string {
  return shapes
    .map((shape) =>
      'transform' in shape
        ? `<g transform="${shape.transform}">${draw(shape.shapes, fill)}</g>`
        : fill
          ? `<path style="fill:${fill[shape.role]}" d="${shape.d}"/>`
          : `<path class="${CLASS[shape.role]}" d="${shape.d}"/>`,
    )
    .join('');
}

const colours = (c: typeof INK): string => `.t{fill:${c.tile}}.l{fill:${c.letter}}.a{fill:${c.accent}}`;

/** Fills for icons inlined into a page: the page's own tokens, so they follow its theme toggle. */
const TOKENS: Record<Role, string> = { tile: 'var(--ink)', letter: 'var(--on-ink)', accent: 'var(--pencil-on-ink)' };

/** Where the art sits on the tile: centred, with the font's upward y flipped. */
function placement({ bounds: [x0, y0, x1, y1] }: IconSpec): string {
  const scale = Math.min((ART.bottom - ART.top) / (y1 - y0), ART.maxWidth / (x1 - x0));
  const x = (BOX - (x1 - x0) * scale) / 2 - x0 * scale;
  const y = (ART.top + ART.bottom + (y1 - y0) * scale) / 2 + y0 * scale;
  return `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(5)} ${(-scale).toFixed(5)})`;
}

/** The icon as SVG. `adaptive` swaps to the paper tile under prefers-color-scheme: dark. */
function svg(spec: IconSpec, adaptive: boolean): string {
  const style = colours(INK) + (adaptive ? `@media (prefers-color-scheme: dark){${colours(PAPER)}}` : '');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">\n` +
    `  <style>${style}</style>\n` +
    `  <rect class="t" width="${BOX}" height="${BOX}"/>\n` +
    `  <g transform="${placement(spec)}">${draw(spec.shapes)}</g>\n` +
    `</svg>\n`
  );
}

/**
 * The icon for inlining into a page, coloured by the page's tokens. No <style> and no
 * classes, so several can share a page without their rules colliding.
 */
function inlineSvg(spec: IconSpec): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}" aria-hidden="true" focusable="false">` +
    `<rect style="fill:${TOKENS.tile}" width="${BOX}" height="${BOX}"/>` +
    `<g transform="${placement(spec)}">${draw(spec.shapes, TOKENS)}</g>` +
    `</svg>\n`
  );
}

const browser = await chromium.launch();

/** Render the ink-tile SVG at exactly `size` pixels. */
async function png(source: string, size: number): Promise<Buffer> {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const src = `data:image/svg+xml;base64,${Buffer.from(source).toString('base64')}`;
  await page.setContent(`<style>html,body{margin:0}img{display:block;width:${size}px;height:${size}px}</style><img src="${src}">`);
  await page.locator('img').evaluate((img: HTMLImageElement) => img.decode());
  const image = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  return image;
}

try {
  for (const spec of ICONS) {
    const out = new URL(`../../../apps/${spec.app}/public/`, import.meta.url);
    mkdirSync(out, { recursive: true });
    writeFileSync(new URL('favicon.svg', out), svg(spec, true));
    const ink = svg(spec, false);
    const small = await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await png(ink, size) })));
    writeFileSync(new URL('favicon.ico', out), ico(small));
    // Square and opaque: iOS rounds the corners itself.
    writeFileSync(new URL('apple-touch-icon.png', out), await png(ink, 180));
    console.log(`${spec.app}: favicon.svg, favicon.ico (16, 32, 48), apple-touch-icon.png`);
    // The index page lists every solver with its icon, drawn in the page's own colours.
    if (spec.app !== 'home') {
      const inline = new URL(`../../../apps/home/src/icons/`, import.meta.url);
      mkdirSync(inline, { recursive: true });
      writeFileSync(new URL(`${spec.app}.svg`, inline), inlineSvg(spec));
      console.log(`home: src/icons/${spec.app}.svg`);
    }
  }
} finally {
  await browser.close();
}
