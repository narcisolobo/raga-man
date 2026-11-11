// opentype.js ships no types; this covers the little the icon script uses.
declare module 'opentype.js/dist/opentype.mjs' {
  export type PathCommand =
    | { type: 'M' | 'L'; x: number; y: number }
    | { type: 'Q'; x1: number; y1: number; x: number; y: number }
    | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
    | { type: 'Z' };

  export interface Font {
    unitsPerEm: number;
    charToGlyph(char: string): { path: { commands: PathCommand[] } };
  }

  export function parse(buffer: ArrayBuffer | Uint8Array): Font;
}
