import { trackTexture, type GpuRegistry } from './gl.js';

/** Atlas edge length in cells (4×4 = 16 solid colors). */
export const ATLAS_CELLS = 4;
export const ATLAS_PX = 64;
const CELL_PX = ATLAS_PX / ATLAS_CELLS;

/** Stable hash → atlas cell index for a program id (no fixture images). */
export function atlasCellForId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % (ATLAS_CELLS * ATLAS_CELLS);
}

/** UV rect for one atlas cell (inset slightly to avoid bleeding). */
export function atlasUv(cell: number): { u0: number; v0: number; u1: number; v1: number } {
  const col = cell % ATLAS_CELLS;
  const row = Math.floor(cell / ATLAS_CELLS);
  const inset = 1 / ATLAS_PX;
  const u0 = col / ATLAS_CELLS + inset;
  const v0 = row / ATLAS_CELLS + inset;
  const u1 = (col + 1) / ATLAS_CELLS - inset;
  const v1 = (row + 1) / ATLAS_CELLS - inset;
  return { u0, v0, u1, v1 };
}

function cellRgb(cell: number): [number, number, number] {
  // Distinct teaching palette — not photographic posters (fixtures have no URLs).
  const hues: Array<[number, number, number]> = [
    [45, 90, 160],
    [50, 120, 100],
    [140, 70, 90],
    [90, 80, 140],
    [160, 100, 50],
    [40, 130, 140],
    [120, 60, 120],
    [70, 110, 70],
    [150, 80, 60],
    [60, 90, 150],
    [100, 120, 50],
    [80, 70, 130],
    [130, 95, 70],
    [55, 105, 115],
    [110, 75, 100],
    [75, 115, 85],
  ];
  return hues[cell % hues.length] ?? [80, 90, 110];
}

/** Upload a solid-color atlas via texImage2D — real GPU texture work for FR-15. */
export function createColorAtlas(reg: GpuRegistry): WebGLTexture {
  const { gl } = reg;
  const pixels = new Uint8Array(ATLAS_PX * ATLAS_PX * 4);

  for (let cell = 0; cell < ATLAS_CELLS * ATLAS_CELLS; cell += 1) {
    const col = cell % ATLAS_CELLS;
    const row = Math.floor(cell / ATLAS_CELLS);
    const [r, g, b] = cellRgb(cell);
    for (let y = 0; y < CELL_PX; y += 1) {
      for (let x = 0; x < CELL_PX; x += 1) {
        const px = (row * CELL_PX + y) * ATLAS_PX + (col * CELL_PX + x);
        const i = px * 4;
        // Soft border so tiles read as separate cells in the atlas.
        const edge =
          x === 0 || y === 0 || x === CELL_PX - 1 || y === CELL_PX - 1;
        pixels[i] = edge ? Math.max(0, r - 30) : r;
        pixels[i + 1] = edge ? Math.max(0, g - 30) : g;
        pixels[i + 2] = edge ? Math.max(0, b - 30) : b;
        pixels[i + 3] = 255;
      }
    }
  }

  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('[webgl] createTexture failed');
  }
  trackTexture(reg, texture);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    ATLAS_PX,
    ATLAS_PX,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels,
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}
