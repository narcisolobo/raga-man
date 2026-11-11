import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { parse, type PathCommand } from 'opentype.js/dist/opentype.mjs';

/** The masthead face. Icons start from its real outlines so they match the title lettering. */
const require = createRequire(import.meta.url);
const font = parse(readFileSync(require.resolve('@fontsource/old-standard-tt/files/old-standard-tt-latin-700-normal.woff')));

export type Point = [x: number, y: number];

/** A glyph's outline in font units (1000 per em), y pointing up. */
export function outline(char: string): PathCommand[] {
  return font.charToGlyph(char).path.commands;
}

const ends = (command: PathCommand, [x, y]: Point): boolean => 'x' in command && command.x === x && command.y === y;

/**
 * Cut out the run of commands between two on-curve points of the outline and join
 * them with a straight line, e.g. to remove the ball-ended ear of a "g".
 */
export function cut(commands: PathCommand[], from: Point, to: Point): PathCommand[] {
  const start = commands.findIndex((command) => ends(command, from));
  const end = commands.findIndex((command, index) => index > start && ends(command, to));
  if (start < 0 || end < 0) throw new Error(`No outline points at ${from} and ${to}; has the font changed?`);
  return [...commands.slice(0, start + 1), { type: 'L', x: to[0], y: to[1] }, ...commands.slice(end + 1)];
}

const n = (value: number): string => String(Math.round(value * 100) / 100);

export function pathData(commands: PathCommand[]): string {
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${n(c.x)} ${n(c.y)}`;
        case 'Q':
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case 'C':
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        case 'Z':
          return 'Z';
      }
    })
    .join('');
}
