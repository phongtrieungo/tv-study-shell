/**
 * Canvas EPG Surface — Visible Window virtualization (Story 2.1 / FR-4 / AD-5).
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
import { drawEpgGrid, viewportFromStage } from './render.js';

const TIME_STEP_MS = 30 * 60 * 1000; // 30 minutes
const MS_PER_HOUR = 60 * 60 * 1000;
const FALLBACK_STAGE_W = 640;
const FALLBACK_STAGE_H = 360;

const dayStartMs = Date.parse(fixtureMeta.dayStart);
const dayEndMs = dayStartMs + fixtureMeta.scheduleHoursPerChannel * MS_PER_HOUR;
const logicalCells = countLogicalProgramCells(fixtureMeta.programCount);

let hostEl: HTMLElement | null = null;
let stageEl: HTMLElement | null = null;
let canvasEl: HTMLCanvasElement | null = null;
let hudEl: HTMLElement | null = null;
let onKey: ((event: KeyboardEvent) => void) | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null;
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

function disposeSideEffects(): void {
  if (onKey) {
    // Must match addEventListener(..., true) or the capture listener leaks and steals menu arrows.
    window.removeEventListener('keydown', onKey, true);
    onKey = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
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

function updateHud(window: VisibleWindow, drawnCells: number, extra?: string): void {
  if (!hudEl) {
    return;
  }
  const base =
    `drawn ${drawnCells} ≪ logical ${logicalCells} · ` +
    `ch ${window.channelStart + 1}–${window.channelEnd} / ${channels.length} · ` +
    `time ${formatTime(window.timeStartMs)}–${formatTime(window.timeEndMs)} UTC · ` +
    `focus ch ${focusChannelIndex + 1} @ ${formatTime(focusTimeMs)}`;
  hudEl.textContent = extra ? `${base} · ${extra}` : base;
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

  const drawnCells = visiblePrograms.length;
  updateHud(window, drawnCells);

  const key = windowKey(window);
  if (key !== lastLoggedWindowKey) {
    lastLoggedWindowKey = key;
    console.info('[epg] visible window', {
      drawnCells,
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

function handleAction(action: 'up' | 'down' | 'left' | 'right'): void {
  if (action === 'up') {
    focusChannelIndex -= 1;
  } else if (action === 'down') {
    focusChannelIndex += 1;
  } else if (action === 'left') {
    focusTimeMs -= TIME_STEP_MS;
  } else if (action === 'right') {
    focusTimeMs += TIME_STEP_MS;
  }
  clampFocus();
  schedulePaint();
}

export function mount(
  host: HTMLElement,
  ctx?: { surfaceId?: string },
): void {
  disposeSideEffects();
  assertSchedule();

  hostEl = host;
  focusChannelIndex = 0;
  focusTimeMs = dayStartMs;
  lastLoggedWindowKey = '';

  const root = document.createElement('div');
  root.className = 'epg-canvas';
  root.dataset.testid = 'epg-canvas';

  const title = document.createElement('h2');
  title.textContent = 'EPG — Visible Window';

  const hint = document.createElement('p');
  hint.className = 'epg-canvas__hint';
  hint.textContent =
    'Arrows move focus (↑↓ channels, ←→ time). Only the Visible Window is drawn. Back returns to the menu.';

  const hud = document.createElement('p');
  hud.className = 'epg-canvas__hud';
  hud.dataset.testid = 'epg-hud';
  hud.setAttribute('role', 'status');
  hud.setAttribute('aria-live', 'polite');

  const stage = document.createElement('div');
  stage.className = 'epg-canvas__stage';
  stage.dataset.testid = 'epg-stage';

  const canvas = document.createElement('canvas');
  canvas.className = 'epg-canvas__grid';
  canvas.dataset.testid = 'epg-grid';
  canvas.setAttribute('aria-label', 'Electronic Program Guide grid');

  stage.append(canvas);
  root.append(title, hint, hud, stage);
  host.replaceChildren(root);

  stageEl = stage;
  canvasEl = canvas;
  hudEl = hud;

  onKey = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const action = getDpadAction(event);
    if (!action || action === 'back' || action === 'select') {
      // Shell owns Back; program detail is Story 2.2.
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    handleAction(action);
  };
  // Capture so we handle arrows before Shell's bubble listener no-ops them.
  window.addEventListener('keydown', onKey, true);

  resizeObserver = new ResizeObserver(() => {
    schedulePaint();
  });
  resizeObserver.observe(stage);

  schedulePaint();
  console.info('[epg] mount', { surfaceId: ctx?.surfaceId ?? null, logicalCells });
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
  lastLoggedWindowKey = '';
  console.info('[epg] unmount');
}

/** Smoke/console proof that AD-6 cleanup ran. */
export function hasActiveSideEffects(): boolean {
  return onKey != null || rafId != null || resizeObserver != null;
}
