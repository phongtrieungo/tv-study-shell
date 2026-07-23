/**
 * WebGL Lab Surface — textured Visible Window (Story 3.1 / FR-15 / AD-9).
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
import {
  acquireContext,
  createRegistry,
  disposeGpu,
  type GpuRegistry,
} from './gl.js';
import {
  createVbo,
  drawVisibleWindow,
  MS_PER_HOUR,
  viewportFromStage,
} from './render.js';
import { createShaderProgram, type ShaderProgram } from './shaders.js';
import { createColorAtlas } from './texture.js';

const FALLBACK_STAGE_W = 640;
const FALLBACK_STAGE_H = 360;
/** Time step for ←→ when no adjacent-program helper (simple offset). */
const TIME_STEP_MS = 2 * MS_PER_HOUR;

const dayStartMs = Date.parse(fixtureMeta.dayStart);
const scheduleMs = fixtureMeta.scheduleHoursPerChannel * MS_PER_HOUR;
const dayEndMs = dayStartMs + scheduleMs;
const logicalCells = countLogicalProgramCells(fixtureMeta.programCount);

let hostEl: HTMLElement | null = null;
let stageEl: HTMLElement | null = null;
let canvasEl: HTMLCanvasElement | null = null;
let hudEl: HTMLElement | null = null;
let onKey: ((event: KeyboardEvent) => void) | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null;
let gpu: GpuRegistry | null = null;
let shader: ShaderProgram | null = null;
let vbo: WebGLBuffer | null = null;
let atlas: WebGLTexture | null = null;
let focusChannelIndex = 0;
let focusTimeMs = dayStartMs;
let lastLoggedWindowKey = '';
let viewportChannelCount = 10;
let viewportDurationMs = 4 * MS_PER_HOUR;
let contextApi: 'webgl2' | 'webgl' | null = null;

function assertSchedule(): void {
  if (!Number.isFinite(dayStartMs) || !Number.isFinite(dayEndMs) || dayEndMs <= dayStartMs) {
    throw new Error('[webgl] invalid fixture dayStart/schedule');
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

function updateHud(window: VisibleWindow, drawnCells: number): void {
  if (!hudEl) {
    return;
  }
  const apiLabel = contextApi ?? 'none';
  hudEl.textContent =
    `drawn ${drawnCells} ≪ logical ${logicalCells} · ` +
    `ch ${window.channelStart + 1}–${window.channelEnd} / ${channels.length} · ` +
    `time ${formatTime(window.timeStartMs)}–${formatTime(window.timeEndMs)} UTC · ` +
    `focus ch ${focusChannelIndex + 1} @ ${formatTime(focusTimeMs)} · ` +
    `context ${apiLabel}`;
}

function disposeSideEffects(): void {
  if (onKey) {
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
  disposeGpu(gpu);
  gpu = null;
  shader = null;
  vbo = null;
  atlas = null;
  contextApi = null;
}

function paint(): void {
  rafId = null;
  if (!canvasEl || !gpu || !shader || !vbo || !atlas) {
    return;
  }

  syncViewportFromStage();
  const { w, h } = measureStage();
  const { layout } = viewportFromStage(w, h);

  if (canvasEl.width !== layout.canvasW || canvasEl.height !== layout.canvasH) {
    canvasEl.width = layout.canvasW;
    canvasEl.height = layout.canvasH;
  }

  const window = currentWindow();
  const visiblePrograms = programsInVisibleWindow(
    channels,
    programs,
    window,
  ) as Program[];

  const drawnCells = drawVisibleWindow({
    gl: gpu.gl,
    reg: gpu,
    shader,
    vbo,
    texture: atlas,
    channels,
    visiblePrograms,
    window,
    focusChannelIndex,
    focusTimeMs,
    layout,
  });

  updateHud(window, drawnCells);

  const key = windowKey(window);
  if (key !== lastLoggedWindowKey) {
    lastLoggedWindowKey = key;
    console.info('[webgl] visible window', {
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
      context: contextApi,
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
  } else {
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
  focusTimeMs = dayStartMs + 6 * MS_PER_HOUR;
  clampFocus();
  lastLoggedWindowKey = '';

  const root = document.createElement('div');
  root.className = 'webgl-lab';
  root.dataset.testid = 'webgl-lab';

  const title = document.createElement('h2');
  title.textContent = 'WebGL Lab — Textured Visible Window';

  const hint = document.createElement('p');
  hint.className = 'webgl-lab__hint';
  hint.textContent =
    'Raw WebGL (not Canvas 2D) · atlas textures + shaders · draw only Visible Window · ↑↓ channels · ←→ time · Back returns to menu. Same shared VW math as EPG.';

  const hud = document.createElement('p');
  hud.className = 'webgl-lab__hud';
  hud.dataset.testid = 'webgl-hud';
  hud.setAttribute('role', 'status');

  const stage = document.createElement('div');
  stage.className = 'webgl-lab__stage';
  stage.dataset.testid = 'webgl-stage';

  const canvas = document.createElement('canvas');
  canvas.className = 'webgl-lab__grid';
  canvas.dataset.testid = 'webgl-grid';
  canvas.setAttribute('aria-label', 'WebGL Visible Window grid');

  stage.append(canvas);
  root.append(title, hint, hud, stage);
  host.replaceChildren(root);

  stageEl = stage;
  canvasEl = canvas;
  hudEl = hud;

  const acquired = acquireContext(canvas);
  if (!acquired) {
    console.error('[webgl] WebGL context unavailable');
    hud.textContent =
      'WebGL context unavailable — cannot draw Visible Window (drawn unknown ≪ logical ' +
      `${logicalCells}).`;
    return;
  }

  contextApi = acquired.api;
  gpu = createRegistry(acquired.gl, acquired.api);
  console.info('[webgl] context acquired', { api: acquired.api });

  try {
    shader = createShaderProgram(gpu);
    vbo = createVbo(gpu);
    atlas = createColorAtlas(gpu);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[webgl] GPU bootstrap failed', error);
    hud.textContent = `WebGL bootstrap failed: ${message}`;
    disposeGpu(gpu);
    gpu = null;
    shader = null;
    vbo = null;
    atlas = null;
    contextApi = null;
    return;
  }

  onKey = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const action = getDpadAction(event);
    if (!action) {
      return;
    }

    // Surface root Back stays with Shell (bubble leave).
    if (action === 'back') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (action === 'select') {
      // Highlight only via focus — no detail panel in 3.1.
      schedulePaint();
      return;
    }

    handleAction(action);
  };
  window.addEventListener('keydown', onKey, true);

  resizeObserver = new ResizeObserver(() => {
    schedulePaint();
  });
  resizeObserver.observe(stage);

  schedulePaint();
  console.info('[webgl] mount', {
    surfaceId: ctx?.surfaceId ?? null,
    logicalCells,
    context: contextApi,
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
  lastLoggedWindowKey = '';
  console.info('[webgl] unmount');
}

/** Smoke/console proof that AD-6/AD-9 cleanup ran (listeners, RAF, ResizeObserver, GPU). */
export function hasActiveSideEffects(): boolean {
  return (
    onKey != null ||
    rafId != null ||
    resizeObserver != null ||
    gpu != null
  );
}
