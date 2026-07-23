/** Inclusive channel index / exclusive channel end; time range in UTC ms. */
export type VisibleWindow = {
  channelStart: number;
  channelEnd: number;
  timeStartMs: number;
  timeEndMs: number;
};

export type VisibleWindowInput = {
  focusChannelIndex: number;
  focusTimeMs: number;
  viewportChannelCount: number;
  viewportDurationMs: number;
  totalChannels: number;
  dayStartMs: number;
  dayEndMs: number;
  /** Keep focus near start of window or centered (TV-friendly default). */
  anchor?: 'start' | 'center';
};

export type ProgramLike = {
  channelId: string;
  start: string;
  end: string;
};

export type ChannelLike = {
  channelId: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Compute the Visible Window from focus + viewport size, clamped to the grid.
 * Pure — safe for Vitest (Story 7.1) and WebGL Lab reuse (AD-9).
 */
export function computeVisibleWindow(input: VisibleWindowInput): VisibleWindow {
  const totalChannels = Math.max(0, Math.floor(input.totalChannels));
  const viewportChannels = Math.max(1, Math.floor(input.viewportChannelCount));
  const viewportDurationMs = Math.max(1, Math.floor(input.viewportDurationMs));
  const dayStartMs = input.dayStartMs;
  const dayEndMs = Math.max(dayStartMs + 1, input.dayEndMs);
  const scheduleMs = dayEndMs - dayStartMs;
  const visibleChannels = Math.min(viewportChannels, Math.max(totalChannels, 1));
  const visibleDurationMs = Math.min(viewportDurationMs, scheduleMs);
  const anchor = input.anchor ?? 'center';

  let channelStart: number;
  if (totalChannels <= 0) {
    channelStart = 0;
  } else if (anchor === 'start') {
    channelStart = Math.floor(input.focusChannelIndex);
  } else {
    channelStart = Math.floor(input.focusChannelIndex - (visibleChannels - 1) / 2);
  }
  channelStart = clamp(channelStart, 0, Math.max(0, totalChannels - visibleChannels));
  const channelEnd = totalChannels <= 0 ? 0 : channelStart + Math.min(visibleChannels, totalChannels);

  let timeStartMs: number;
  if (anchor === 'start') {
    timeStartMs = Math.floor(input.focusTimeMs);
  } else {
    timeStartMs = Math.floor(input.focusTimeMs - visibleDurationMs / 2);
  }
  timeStartMs = clamp(timeStartMs, dayStartMs, dayEndMs - visibleDurationMs);
  const timeEndMs = timeStartMs + visibleDurationMs;

  return {
    channelStart,
    channelEnd,
    timeStartMs,
    timeEndMs,
  };
}

/** Logical cell count for HUD / Perf Notes — typically `fixtureMeta.programCount`. */
export function countLogicalProgramCells(programCount: number): number {
  return Math.max(0, Math.floor(programCount));
}

/** True when [start, end) intersects the Visible Window time range. */
export function rangesIntersect(
  startMs: number,
  endMs: number,
  windowStartMs: number,
  windowEndMs: number,
): boolean {
  return startMs < windowEndMs && endMs > windowStartMs;
}

/**
 * Programs whose channel is in the window and whose time range intersects it.
 * Used for draw lists and drawn-cell accounting (FR-4).
 */
export function programsInVisibleWindow(
  channels: readonly ChannelLike[],
  programs: readonly ProgramLike[],
  window: VisibleWindow,
): ProgramLike[] {
  if (window.channelEnd <= window.channelStart) {
    return [];
  }

  const channelIds = new Set(
    channels.slice(window.channelStart, window.channelEnd).map((channel) => channel.channelId),
  );

  return programs.filter((program) => {
    if (!channelIds.has(program.channelId)) {
      return false;
    }
    const startMs = Date.parse(program.start);
    const endMs = Date.parse(program.end);
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      return false;
    }
    return rangesIntersect(startMs, endMs, window.timeStartMs, window.timeEndMs);
  });
}

export function countProgramsInVisibleWindow(
  channels: readonly ChannelLike[],
  programs: readonly ProgramLike[],
  window: VisibleWindow,
): number {
  return programsInVisibleWindow(channels, programs, window).length;
}
