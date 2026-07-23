import type { Channel, Program, VisibleWindow } from '@tvshell/shared';
import { trackBuffer, type GlContext, type GpuRegistry } from './gl.js';
import type { ShaderProgram } from './shaders.js';
import { atlasCellForId, atlasUv } from './texture.js';

export const GUTTER_PX = 112;
export const ROW_H = 36;
export const PX_PER_HOUR = 160;
export const MS_PER_HOUR = 60 * 60 * 1000;

/** Interleaved: x, y, u, v, focus (5 floats × 6 verts per quad). */
const FLOATS_PER_VERT = 5;
const VERTS_PER_QUAD = 6;

export type LabLayout = {
  gutterPx: number;
  rowH: number;
  pxPerHour: number;
  canvasW: number;
  canvasH: number;
};

export function viewportFromStage(stageW: number, stageH: number): {
  viewportChannelCount: number;
  viewportDurationMs: number;
  layout: LabLayout;
} {
  const canvasW = Math.max(GUTTER_PX + PX_PER_HOUR, Math.floor(stageW));
  const canvasH = Math.max(ROW_H, Math.floor(stageH));
  const viewportChannelCount = Math.max(1, Math.floor(canvasH / ROW_H));
  const hours = Math.max(1, (canvasW - GUTTER_PX) / PX_PER_HOUR);
  const viewportDurationMs = Math.floor(hours * MS_PER_HOUR);
  const layoutH = viewportChannelCount * ROW_H;

  return {
    viewportChannelCount,
    viewportDurationMs,
    layout: {
      gutterPx: GUTTER_PX,
      rowH: ROW_H,
      pxPerHour: PX_PER_HOUR,
      canvasW,
      canvasH: layoutH,
    },
  };
}

export type DrawLabArgs = {
  gl: GlContext;
  reg: GpuRegistry;
  shader: ShaderProgram;
  vbo: WebGLBuffer;
  texture: WebGLTexture;
  channels: readonly Channel[];
  visiblePrograms: readonly Program[];
  window: VisibleWindow;
  focusChannelIndex: number;
  focusTimeMs: number;
  layout: LabLayout;
};

function pushQuad(
  out: number[],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  focus: number,
): void {
  // Two triangles: (0,1,2) (0,2,3)
  const corners: Array<[number, number, number, number]> = [
    [x0, y0, u0, v0],
    [x1, y0, u1, v0],
    [x1, y1, u1, v1],
    [x0, y0, u0, v0],
    [x1, y1, u1, v1],
    [x0, y1, u0, v1],
  ];
  for (const [x, y, u, v] of corners) {
    out.push(x, y, u, v, focus);
  }
}

/** Build Visible Window geometry + one batched drawArrays (TRIANGLES). */
export function drawVisibleWindow(args: DrawLabArgs): number {
  const {
    gl,
    shader,
    vbo,
    texture,
    channels,
    visiblePrograms,
    window,
    focusChannelIndex,
    focusTimeMs,
    layout,
  } = args;
  const { gutterPx, rowH, pxPerHour, canvasW, canvasH } = layout;

  gl.viewport(0, 0, canvasW, canvasH);
  gl.clearColor(0.07, 0.08, 0.11, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const visibleChannels = channels.slice(window.channelStart, window.channelEnd);
  const channelRowById = new Map(
    visibleChannels.map((channel, row) => [channel.channelId, row] as const),
  );

  const verts: number[] = [];

  // Channel gutter tiles (atlas cell 0) — not counted as program draws.
  for (let row = 0; row < visibleChannels.length; row += 1) {
    const y0 = row * rowH;
    const y1 = y0 + rowH;
    const uv = atlasUv(0);
    pushQuad(verts, 0, y0, gutterPx, y1, uv.u0, uv.v0, uv.u1, uv.v1, 0);
  }

  let drawnPrograms = 0;

  for (const program of visiblePrograms) {
    const row = channelRowById.get(program.channelId);
    if (row === undefined) {
      continue;
    }
    const startMs = Date.parse(program.start);
    const endMs = Date.parse(program.end);
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || !(endMs > startMs)) {
      continue;
    }

    const channelIndex = window.channelStart + row;
    const clippedStart = Math.max(startMs, window.timeStartMs);
    const clippedEnd = Math.min(endMs, window.timeEndMs);
    const x0 =
      gutterPx + ((clippedStart - window.timeStartMs) / MS_PER_HOUR) * pxPerHour;
    const x1 = Math.max(
      x0 + 2,
      gutterPx + ((clippedEnd - window.timeStartMs) / MS_PER_HOUR) * pxPerHour,
    );
    const y0 = row * rowH + 2;
    const y1 = y0 + rowH - 4;

    const isFocus =
      channelIndex === focusChannelIndex &&
      focusTimeMs >= startMs &&
      focusTimeMs < endMs;

    const uv = atlasUv(atlasCellForId(program.programId));
    pushQuad(verts, x0, y0, x1, y1, uv.u0, uv.v0, uv.u1, uv.v1, isFocus ? 1 : 0);
    drawnPrograms += 1;
  }

  // Focus time cursor as a thin quad
  const focusX =
    gutterPx + ((focusTimeMs - window.timeStartMs) / MS_PER_HOUR) * pxPerHour;
  if (focusX >= gutterPx && focusX <= canvasW) {
    const uv = atlasUv(15);
    pushQuad(verts, focusX - 1, 0, focusX + 1, canvasH, uv.u0, uv.v0, uv.u1, uv.v1, 1);
  }

  const vertexCount = verts.length / FLOATS_PER_VERT;
  if (vertexCount === 0) {
    return 0;
  }

  gl.useProgram(shader.program);
  gl.uniform2f(shader.locResolution, canvasW, canvasH);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(shader.locTex, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);

  const stride = FLOATS_PER_VERT * 4;
  gl.enableVertexAttribArray(shader.locPos);
  gl.vertexAttribPointer(shader.locPos, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(shader.locUv);
  gl.vertexAttribPointer(shader.locUv, 2, gl.FLOAT, false, stride, 8);
  gl.enableVertexAttribArray(shader.locFocus);
  gl.vertexAttribPointer(shader.locFocus, 1, gl.FLOAT, false, stride, 16);

  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

  gl.disableVertexAttribArray(shader.locPos);
  gl.disableVertexAttribArray(shader.locUv);
  gl.disableVertexAttribArray(shader.locFocus);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.useProgram(null);

  return drawnPrograms;
}

export function createVbo(reg: GpuRegistry): WebGLBuffer {
  const buffer = reg.gl.createBuffer();
  if (!buffer) {
    throw new Error('[webgl] createBuffer failed');
  }
  return trackBuffer(reg, buffer);
}

/** Silence unused-import lint for VERTS_PER_QUAD documentation constant. */
export const QUAD_VERT_COUNT = VERTS_PER_QUAD;
