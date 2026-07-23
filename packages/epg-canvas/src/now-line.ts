/**
 * Demo now-line math — remap wall time into the fixture schedule day,
 * then project ms → px with the same scale as program cells (Story 2.3 / FR-6).
 */

export type NowLineWindow = {
  timeStartMs: number;
  timeEndMs: number;
};

/**
 * Map wall clock into `[dayStartMs, dayStartMs + scheduleMs)`.
 *
 * Fixtures are locked to a frozen UTC day (`fixtureMeta.dayStart`). Raw
 * `Date.now()` is almost always outside that day, so the line would never
 * appear. We keep the wall clock's position within a repeating schedule
 * length (`wallMs % scheduleMs`) and offset it onto the fixture day.
 *
 * Teaching tick (1s) still calls this — production EPGs typically update
 * every 30–60s / minute-aligned; see study HTML honesty bounds.
 */
export function demoNowMs(
  dayStartMs: number,
  scheduleMs: number,
  wallMs = Date.now(),
): number {
  if (!(scheduleMs > 0) || !Number.isFinite(dayStartMs) || !Number.isFinite(wallMs)) {
    return dayStartMs;
  }
  // Normalize negative remainders (unlikely for Date.now, but keep pure).
  const offset = ((wallMs % scheduleMs) + scheduleMs) % scheduleMs;
  return dayStartMs + offset;
}

/**
 * Canvas X for the now-line, or `null` when `nowMs` is outside the Visible
 * Window time range (caller should hide the chrome — no auto-scroll).
 */
export function nowXPx(
  nowMs: number,
  window: NowLineWindow,
  gutterPx: number,
  pxPerHour: number,
  msPerHour: number,
): number | null {
  if (!(msPerHour > 0) || !(pxPerHour > 0)) {
    return null;
  }
  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(window.timeStartMs) ||
    !Number.isFinite(window.timeEndMs) ||
    !Number.isFinite(gutterPx)
  ) {
    return null;
  }
  if (nowMs < window.timeStartMs || nowMs >= window.timeEndMs) {
    return null;
  }
  return gutterPx + ((nowMs - window.timeStartMs) / msPerHour) * pxPerHour;
}
