/**
 * Canvas EPG Surface — Visible Window, D-pad focus / detail, now-line chrome
 * (Stories 2.1–2.3 / FR-4–FR-6 / AD-4–AD-6).
 * Mount context shape matches Shell `SurfaceMountContext` structurally.
 */

import {
  channels,
  computeVisibleWindow,
  countLogicalProgramCells,
  fixtureMeta,
  getDpadAction,
  programs,
  programsInVisibleWindow,
  type Program,
  type VisibleWindow,
} from '@tvshell/shared';
import { createDetailPanel, type DetailPanel } from './detail.js';
import { adjacentProgramFocusTime, findProgramAt } from './focus.js';
import { demoNowMs, nowXPx } from './now-line.js';
import { drawEpgGrid, MS_PER_HOUR, viewportFromStage, type EpgLayout } from './render.js';

const FALLBACK_STAGE_W = 640;
const FALLBACK_STAGE_H = 360;
/** Teaching tick — production EPGs often use 30–60s / minute-aligned updates. */
const NOW_LINE_TICK_MS = 1000;
/** Schedule ms advanced per teaching tick (~60× realtime) so the line visibly drifts. */
const DEMO_SCHEDULE_MS_PER_TICK = 60 * 1000;

const dayStartMs = Date.parse(fixtureMeta.dayStart);
const scheduleMs = fixtureMeta.scheduleHoursPerChannel * MS_PER_HOUR;
const dayEndMs = dayStartMs + scheduleMs;
const logicalCells = countLogicalProgramCells(fixtureMeta.programCount);

let hostEl: HTMLElement | null = null;
let stageEl: HTMLElement | null = null;
let canvasEl: HTMLCanvasElement | null = null;
let hudEl: HTMLElement | null = null;
let nowLineEl: HTMLElement | null = null;
let detailPanel: DetailPanel | null = null;
let detailOpen = false;
/** After Back dismisses detail, swallow Back repeats until keyup (AD-4). */
let ignoreBackUntilKeyup = false;
/** One-shot HUD cue when Enter finds no program under focus. */
let noProgramFlash = false;
let onKey: ((event: KeyboardEvent) => void) | null = null;
let onKeyUp: ((event: KeyboardEvent) => void) | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null;
let nowTimer: ReturnType<typeof setInterval> | null = null;
let demoNow = dayStartMs;
let nowTickCount = 0;
let lastDrawnCells = 0;
let loggedFirstVisibleNow = false;
let focusChannelIndex = 0;
let focusTimeMs = dayStartMs;
let lastLoggedWindowKey = '';
let viewportChannelCount = 10;
let viewportDurationMs = 4 * MS_PER_HOUR;

function assertSchedule(): void {
  if (!Number.isFinite(dayStartMs) || !Number.isFinite(dayEndMs) || dayEndMs <= dayStartMs) {
    throw new Error('[epg] invalid fixture dayStart/schedule');
  }
}

function focusedChannelId(): string | null {
  return channels[focusChannelIndex]?.channelId ?? null;
}

function focusedProgram(): Program | null {
  const channelId = focusedChannelId();
  if (!channelId) {
    return null;
  }
  return findProgramAt(channelId, focusTimeMs, programs);
}

function closeDetail(): void {
  detailOpen = false;
  detailPanel?.clear();
  schedulePaint();
}

function openDetail(program: Program): void {
  if (!detailPanel) {
    return;
  }
  noProgramFlash = false;
  detailPanel.setProgram(program);
  detailOpen = true;
  schedulePaint();
  console.info('[epg] program detail', {
    programId: program.programId,
    title: program.title,
    start: program.start,
    end: program.end,
  });
}

function clearNowTimer(): void {
  if (nowTimer != null) {
    clearInterval(nowTimer);
    nowTimer = null;
  }
}

function disposeSideEffects(): void {
  if (onKey) {
    // Must match addEventListener(..., true) or the capture listener leaks and steals menu arrows.
    window.removeEventListener('keydown', onKey, true);
    onKey = null;
  }
  if (onKeyUp) {
    window.removeEventListener('keyup', onKeyUp);
    onKeyUp = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  clearNowTimer();
  detailOpen = false;
  ignoreBackUntilKeyup = false;
  noProgramFlash = false;
  detailPanel?.clear();
}

function windowKey(window: VisibleWindow): string {
  return `${window.channelStart}:${window.channelEnd}:${window.timeStartMs}:${window.timeEndMs}`;
}

function measureStage(): { w: number; h: number } {
  const w = stageEl?.clientWidth ?? 0;
  const h = stageEl?.clientHeight ?? 0;
  return {
    w: w > 0 ? w : FALLBACK_STAGE_W,
    h: h > 0 ? h : FALLBACK_STAGE_H,
  };
}

function syncViewportFromStage(): void {
  const { w, h } = measureStage();
  const measured = viewportFromStage(w, h);
  viewportChannelCount = measured.viewportChannelCount;
  viewportDurationMs = measured.viewportDurationMs;
}

function currentWindow(): VisibleWindow {
  return computeVisibleWindow({
    focusChannelIndex,
    focusTimeMs,
    viewportChannelCount,
    viewportDurationMs,
    totalChannels: channels.length,
    dayStartMs,
    dayEndMs,
    anchor: 'center',
  });
}

function formatTime(ms: number): string {
  return new Date(ms).toISOString().slice(11, 16);
}

function updateHud(window: VisibleWindow, drawnCells: number): void {
  if (!hudEl) {
    return;
  }
  const focused = focusedProgram();
  const focusLabel = focused
    ? `focused: ${focused.title}`
    : `focus ch ${focusChannelIndex + 1} @ ${formatTime(focusTimeMs)}`;
  const detailLabel = detailOpen ? ' · detail open' : '';
  const flashLabel = noProgramFlash ? ' · no program at focus' : '';
  const nowLabel = `now ${formatTime(demoNow)} UTC · ticks ${nowTickCount} · model stable`;
  hudEl.textContent =
    `drawn ${drawnCells} ≪ logical ${logicalCells} · ` +
    `ch ${window.channelStart + 1}–${window.channelEnd} / ${channels.length} · ` +
    `time ${formatTime(window.timeStartMs)}–${formatTime(window.timeEndMs)} UTC · ` +
    `${focusLabel}${detailLabel}${flashLabel} · ${nowLabel}`;
}

/**
 * Reposition DOM now-line chrome from current demo time + Visible Window.
 * Clock ticks call this without `programsInVisibleWindow` / grid rebuild.
 */
function positionNowLineOverlay(window: VisibleWindow, layout: EpgLayout): void {
  if (!nowLineEl) {
    return;
  }

  const x = nowXPx(
    demoNow,
    window,
    layout.gutterPx,
    layout.pxPerHour,
    MS_PER_HOUR,
  );

  if (x == null || !Number.isFinite(x) || layout.canvasW <= 0 || x < layout.gutterPx || x > layout.canvasW) {
    nowLineEl.hidden = true;
    return;
  }

  nowLineEl.hidden = false;
  // Position against the canvas box (not raw stage %) so border/stretch stay aligned with cells.
  const canvas = canvasEl;
  if (canvas && canvas.clientWidth > 0) {
    const leftPx = (x / layout.canvasW) * canvas.clientWidth + canvas.offsetLeft;
    nowLineEl.style.left = `${leftPx}px`;
    nowLineEl.style.top = `${canvas.offsetTop}px`;
    nowLineEl.style.height = `${canvas.clientHeight}px`;
  } else {
    const pct = (x / layout.canvasW) * 100;
    nowLineEl.style.left = `${pct}%`;
    nowLineEl.style.top = '0';
    nowLineEl.style.height = '100%';
  }

  if (!loggedFirstVisibleNow) {
    loggedFirstVisibleNow = true;
    console.info('[epg] now-line visible', {
      demoNowMs: demoNow,
      demoNowUtc: new Date(demoNow).toISOString(),
      nowX: x,
      timeStartMs: window.timeStartMs,
      timeEndMs: window.timeEndMs,
    });
  }
}

/** Layout + window math only — no fixture rebuild, no Visible Window program filter. */
function syncNowLineChrome(): void {
  syncViewportFromStage();
  const { w, h } = measureStage();
  const { layout } = viewportFromStage(w, h);
  const window = currentWindow();
  positionNowLineOverlay(window, layout);
  updateHud(window, lastDrawnCells);
}

function tickNowLine(): void {
  // Accelerate schedule time so learners see drift; honesty bounds document vs wall/production.
  const offset = ((demoNow - dayStartMs + DEMO_SCHEDULE_MS_PER_TICK) % scheduleMs + scheduleMs) % scheduleMs;
  demoNow = dayStartMs + offset;
  nowTickCount += 1;
  // Position overlay only — do not schedulePaint / rebuild logical model (AC #2).
  syncNowLineChrome();
}

function startNowLineTimer(): void {
  clearNowTimer();
  demoNow = demoNowMs(dayStartMs, scheduleMs);
  nowTickCount = 0;
  loggedFirstVisibleNow = false;
  nowTimer = setInterval(tickNowLine, NOW_LINE_TICK_MS);
}

function paint(): void {
  rafId = null;
  if (!canvasEl) {
    return;
  }

  syncViewportFromStage();
  const { w, h } = measureStage();
  const { layout } = viewportFromStage(w, h);

  if (canvasEl.width !== layout.canvasW || canvasEl.height !== layout.canvasH) {
    canvasEl.width = layout.canvasW;
    canvasEl.height = layout.canvasH;
  }

  const ctx = canvasEl.getContext('2d', { alpha: false });
  if (!ctx) {
    console.error('[epg] CanvasRenderingContext2D unavailable');
    if (hudEl) {
      hudEl.textContent =
        'Canvas 2D context unavailable — cannot draw Visible Window (drawn unknown ≪ logical ' +
        `${logicalCells}).`;
    }
    return;
  }

  const window = currentWindow();
  const visiblePrograms = programsInVisibleWindow(
    channels,
    programs,
    window,
  ) as Program[];

  drawEpgGrid({
    ctx,
    channels,
    visiblePrograms,
    window,
    focusChannelIndex,
    focusTimeMs,
    layout,
  });

  lastDrawnCells = visiblePrograms.length;
  positionNowLineOverlay(window, layout);
  updateHud(window, lastDrawnCells);

  const key = windowKey(window);
  if (key !== lastLoggedWindowKey) {
    lastLoggedWindowKey = key;
    console.info('[epg] visible window', {
      drawnCells: lastDrawnCells,
      logicalCells,
      channelStart: window.channelStart,
      channelEnd: window.channelEnd,
      timeStartMs: window.timeStartMs,
      timeEndMs: window.timeEndMs,
      focusChannelIndex,
      focusTimeMs,
      viewportChannelCount,
      viewportDurationMs,
      canvasW: canvasEl.width,
      canvasH: canvasEl.height,
    });
  }
}

function schedulePaint(): void {
  if (rafId != null) {
    return;
  }
  rafId = requestAnimationFrame(paint);
}

function clampFocus(): void {
  focusChannelIndex = Math.min(
    Math.max(0, focusChannelIndex),
    Math.max(0, channels.length - 1),
  );
  focusTimeMs = Math.min(Math.max(focusTimeMs, dayStartMs), dayEndMs - 1);
}

/** ↑↓ channels (column affinity); ←→ adjacent program on the focused channel. */
function handleAction(action: 'up' | 'down' | 'left' | 'right'): void {
  noProgramFlash = false;
  if (action === 'up') {
    focusChannelIndex -= 1;
  } else if (action === 'down') {
    focusChannelIndex += 1;
  } else {
    const channelId = focusedChannelId();
    if (channelId) {
      const nextTime = adjacentProgramFocusTime(
        channelId,
        focusTimeMs,
        programs,
        action,
      );
      if (nextTime != null) {
        focusTimeMs = nextTime;
      }
    }
  }
  clampFocus();
  schedulePaint();
}

function handleSelect(): void {
  const program = focusedProgram();
  if (!program) {
    noProgramFlash = true;
    schedulePaint();
    return;
  }
  openDetail(program);
}

export function mount(
  host: HTMLElement,
  ctx?: { surfaceId?: string },
): void {
  disposeSideEffects();
  assertSchedule();

  hostEl = host;
  focusChannelIndex = 0;
  // Seed focus near demo-now so the line is visible on mount (demo convenience — not a jump-to-now control).
  demoNow = demoNowMs(dayStartMs, scheduleMs);
  focusTimeMs = demoNow;
  clampFocus();
  lastLoggedWindowKey = '';
  lastDrawnCells = 0;
  detailOpen = false;
  ignoreBackUntilKeyup = false;
  noProgramFlash = false;

  const root = document.createElement('div');
  root.className = 'epg-canvas';
  root.dataset.testid = 'epg-canvas';

  const title = document.createElement('h2');
  title.textContent = 'EPG — Focus, Select & Now-line';

  const hint = document.createElement('p');
  hint.className = 'epg-canvas__hint';
  hint.textContent =
    'Red NOW line = accelerated demo clock (fixture-day remap; ~60× so it drifts) · focus opens near demo-now (not jump-to-now) · ↑↓ channels · ←→ programs · Enter detail · Back closes detail, then menu. Grid redraws on focus/resize — ticks move chrome only.';

  const hud = document.createElement('p');
  hud.className = 'epg-canvas__hud';
  hud.dataset.testid = 'epg-hud';
  hud.setAttribute('role', 'status');
  // No aria-live: 1s ticks would spam assistive tech; status is for sighted HUD / future Playwright.

  const stage = document.createElement('div');
  stage.className = 'epg-canvas__stage';
  stage.dataset.testid = 'epg-stage';

  const canvas = document.createElement('canvas');
  canvas.className = 'epg-canvas__grid';
  canvas.dataset.testid = 'epg-grid';
  canvas.setAttribute('aria-label', 'Electronic Program Guide grid');

  const nowLine = document.createElement('div');
  nowLine.className = 'epg-canvas__now-line';
  nowLine.dataset.testid = 'epg-now-line';
  nowLine.setAttribute('aria-hidden', 'true');
  nowLine.hidden = true;
  const nowLabel = document.createElement('span');
  nowLabel.className = 'epg-canvas__now-line-label';
  nowLabel.textContent = 'NOW';
  nowLine.append(nowLabel);

  const detail = createDetailPanel();

  // Canvas + now-line chrome + detail overlay; now-line ticks do not shrink/redraw the grid.
  stage.append(canvas, nowLine, detail.root);
  root.append(title, hint, hud, stage);
  host.replaceChildren(root);

  stageEl = stage;
  canvasEl = canvas;
  hudEl = hud;
  nowLineEl = nowLine;
  detailPanel = detail;

  onKeyUp = () => {
    ignoreBackUntilKeyup = false;
  };
  window.addEventListener('keyup', onKeyUp);

  onKey = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const action = getDpadAction(event);
    if (!action) {
      return;
    }

    // Hold-Back after dismiss must not bubble to Shell leave.
    if (action === 'back' && ignoreBackUntilKeyup) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Nested Back: dismiss detail without leaving the Surface (AD-4).
    if (detailOpen) {
      if (action === 'back') {
        event.preventDefault();
        event.stopPropagation();
        closeDetail();
        ignoreBackUntilKeyup = true;
        return;
      }
      // Modal step: ignore arrows / select while detail is open.
      if (action === 'select' || action === 'up' || action === 'down' || action === 'left' || action === 'right') {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }

    // Surface root Back stays with Shell (bubble leave).
    if (action === 'back') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (action === 'select') {
      handleSelect();
      return;
    }

    handleAction(action);
  };
  // Capture so we handle arrows/select before Shell's bubble listener.
  window.addEventListener('keydown', onKey, true);

  resizeObserver = new ResizeObserver(() => {
    schedulePaint();
  });
  resizeObserver.observe(stage);

  startNowLineTimer();
  schedulePaint();
  console.info('[epg] mount', {
    surfaceId: ctx?.surfaceId ?? null,
    logicalCells,
    nowLineTickMs: NOW_LINE_TICK_MS,
    demoAccelScheduleMsPerTick: DEMO_SCHEDULE_MS_PER_TICK,
    demoClock: 'seed dayStart+(wall%schedule); ticks advance schedule ~60×',
  });
}

export function unmount(): void {
  disposeSideEffects();
  if (hostEl) {
    hostEl.replaceChildren();
  }
  hostEl = null;
  stageEl = null;
  canvasEl = null;
  hudEl = null;
  nowLineEl = null;
  detailPanel = null;
  detailOpen = false;
  lastLoggedWindowKey = '';
  lastDrawnCells = 0;
  nowTickCount = 0;
  loggedFirstVisibleNow = false;
  console.info('[epg] unmount');
}

/** Smoke/console proof that AD-6 cleanup ran (listeners, RAF, ResizeObserver, now-line timer). */
export function hasActiveSideEffects(): boolean {
  return (
    onKey != null ||
    onKeyUp != null ||
    rafId != null ||
    resizeObserver != null ||
    nowTimer != null
  );
}
