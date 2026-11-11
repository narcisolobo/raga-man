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

/**
 * A pencil lying along +x with its point at the origin: the sharpened cone and the
 * painted body as one shape, then two cuts in the tile colour where the paint meets
 * the bare wood and at the ferrule.
 */
function pencil(length: number, halfWidth: number, cone: number): Shape[] {
  const band = (from: number, to: number) => `M${from} ${-halfWidth}L${to} ${-halfWidth}L${to} ${halfWidth}L${from} ${halfWidth}Z`;
  return [
    { role: 'accent', d: `M0 0L${cone} ${-halfWidth}L${length} ${-halfWidth}L${length} ${halfWidth}L${cone} ${halfWidth}Z` },
    { role: 'tile', d: band(cone - 4, cone + 6) + band(length - 60, length - 52) },
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
  {
    // The suite's index: an "s" with a pencil whose point rests on the top terminal,
    // as if it had just written the letter.
    app: 'home',
    shapes: [
      { role: 'letter', d: pathData(outline('s')) },
      { transform: 'translate(392 430) rotate(62)', shapes: pencil(290, 34, 96) },
    ],
    bounds: [58, -12, 558, 702],
  },
];
