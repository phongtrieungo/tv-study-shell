import type { Channel, Program, VisibleWindow } from '@tvshell/shared';

export const GUTTER_PX = 112;
export const ROW_H = 36;
export const PX_PER_HOUR = 160;
export const MS_PER_HOUR = 60 * 60 * 1000;

export type EpgLayout = {
  gutterPx: number;
  rowH: number;
  pxPerHour: number;
  canvasW: number;
  canvasH: number;
};

/** Derive Visible Window viewport + canvas layout from the host stage box. */
export function viewportFromStage(
  stageW: number,
  stageH: number,
): {
  viewportChannelCount: number;
  viewportDurationMs: number;
  layout: EpgLayout;
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

export type DrawEpgArgs = {
  ctx: CanvasRenderingContext2D;
  channels: readonly Channel[];
  /** Programs already filtered to the Visible Window (shared helper). */
  visiblePrograms: readonly Program[];
  window: VisibleWindow;
  focusChannelIndex: number;
  focusTimeMs: number;
  layout: EpgLayout;
};

function round(n: number): number {
  return Math.round(n);
}

export function drawEpgGrid(args: DrawEpgArgs): void {
  const {
    ctx,
    channels,
    visiblePrograms,
    window,
    focusChannelIndex,
    focusTimeMs,
    layout,
  } = args;
  const { gutterPx, rowH, pxPerHour, canvasW, canvasH } = layout;

  ctx.save();
  ctx.fillStyle = '#12151c';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Channel gutter
  ctx.fillStyle = '#1a1f2b';
  ctx.fillRect(0, 0, gutterPx, canvasH);
  ctx.strokeStyle = '#2a3140';
  ctx.beginPath();
  ctx.moveTo(gutterPx + 0.5, 0);
  ctx.lineTo(gutterPx + 0.5, canvasH);
  ctx.stroke();

  const visibleChannels = channels.slice(window.channelStart, window.channelEnd);
  const channelRowById = new Map(
    visibleChannels.map((channel, row) => [channel.channelId, row] as const),
  );

  // Row backgrounds + labels
  ctx.font = '600 13px "Segoe UI", system-ui, sans-serif';
  visibleChannels.forEach((channel, row) => {
    const y = row * rowH;
    if (row % 2 === 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(gutterPx, y, canvasW - gutterPx, rowH);
    }
    ctx.fillStyle = '#e8ecf3';
    ctx.fillText(channel.name, 10, y + rowH / 2 + 4);
    ctx.strokeStyle = '#2a3140';
    ctx.beginPath();
    ctx.moveTo(0, y + rowH + 0.5);
    ctx.lineTo(canvasW, y + rowH + 0.5);
    ctx.stroke();
  });

  // Program cells — already window-filtered by shared math
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
    const x =
      gutterPx + ((clippedStart - window.timeStartMs) / MS_PER_HOUR) * pxPerHour;
    const w = Math.max(2, ((clippedEnd - clippedStart) / MS_PER_HOUR) * pxPerHour);
    const y = row * rowH + 2;
    const h = rowH - 4;

    const isFocus =
      channelIndex === focusChannelIndex &&
      focusTimeMs >= startMs &&
      focusTimeMs < endMs;

    ctx.fillStyle = isFocus ? '#3b4a63' : '#243044';
    ctx.fillRect(round(x), round(y), round(w), round(h));
    ctx.strokeStyle = isFocus ? '#fbbf24' : '#3d4f6a';
    ctx.lineWidth = isFocus ? 2 : 1;
    ctx.strokeRect(round(x) + 0.5, round(y) + 0.5, round(w) - 1, round(h) - 1);

    ctx.fillStyle = '#e8ecf3';
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    const label = program.title;
    if (w - 10 > 24) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(round(x) + 4, round(y), round(w) - 8, round(h));
      ctx.clip();
      ctx.fillText(label, round(x) + 6, round(y) + h / 2 + 4);
      ctx.restore();
    }
  }

  // Focus time cursor — same ms→px scale as program cells
  const focusX =
    gutterPx + ((focusTimeMs - window.timeStartMs) / MS_PER_HOUR) * pxPerHour;
  if (focusX >= gutterPx && focusX <= canvasW) {
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(round(focusX) + 0.5, 0);
    ctx.lineTo(round(focusX) + 0.5, canvasH);
    ctx.stroke();
  }

  ctx.restore();
}
