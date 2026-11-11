import { cut, outline, pathData } from './glyphs';

/**
 * Each solver's icon: its lowercase initial plus one pencil-blue object that plays
 * on the app's name. Shapes are in font units (1000 per em, y up), so they line up
 * with the glyph. See "App icons" in docs/design-system.md.
 */

export type Role = 'tile' | 'letter' | 'accent';
export type Shape =
  | { role: Role; d: string }
  | { transform: string; shapes: Shape[] };

export interface IconSpec {
  /** Folder under apps/. */
  app: string;
  shapes: Shape[];
  /** Bounds of everything drawn, [x0, y0, x1, y1], used to centre the art on the tile. */
  bounds: [number, number, number, number];
}

/** A bowler hat: a curved brim with a domed crown on top. */
function bowler(role: Role, cx: number, base: number, brim: number, crown: number, height: number): Shape[] {
  return [
    {
      role,
      d:
        `M${cx - brim} ${base + 6}Q${cx - brim} ${base - 6} ${cx - brim + 14} ${base - 4}` +
        `Q${cx} ${base + 8} ${cx + brim - 14} ${base - 4}Q${cx + brim} ${base - 6} ${cx + brim} ${base + 6}` +
        `L${cx + brim - 4} ${base + 20}Q${cx} ${base + 6} ${cx - brim + 4} ${base + 20}Z`,
    },
    { role, d: `M${cx - crown} ${base + 12}C${cx - crown} ${base + height + 12} ${cx + crown} ${base + height + 12} ${cx + crown} ${base + 12}Z` },
  ];
}

export const ICONS: IconSpec[] = [
  {
    // An "r" with a bowler hat floating above the stem, tipped as if in greeting.
    app: 'raga-man',
    shapes: [
      { role: 'letter', d: pathData(outline('r')) },
      { transform: 'rotate(-16 152 580)', shapes: bowler('accent', 152, 528, 112, 76, 136) },
    ],
    bounds: [40, 0, 408, 690],
  },
  {
    // A "g" whose ball-ended ear has become a leaf, so the letter sprouts.
    app: 'letter-garden',
    shapes: [
      { role: 'letter', d: pathData(cut(outline('g'), [393, 434], [406, 419])) },
      { role: 'accent', d: 'M392 428Q430 548 580 556Q560 430 412 414Z' },
      // The leaf's midrib, cut in the tile colour.
      { role: 'tile', d: 'M410 432Q470 500 560 540L556 546Q462 508 402 440Z' },
    ],
    bounds: [42, -238, 580, 556],
  },
];
