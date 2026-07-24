/**
 * Home Blits Surface — Featured rail + texture lifecycle (Stories 4.1–4.3).
 * Mount strategy ADR from 4.1 unchanged (in-page embed).
 */

import Blits from '@lightningjs/blits'
import { createHomeApp } from './App.js'
import {
  disposeAllTextures,
  getTextureStats,
  hasLoadedTextures,
} from './texture-lifecycle.js'

const FALLBACK_W = 640
const FALLBACK_H = 360

type QuitableApp = {
  quit?: () => void
  destroy?: () => void
}

let hostEl: HTMLElement | null = null
let stageEl: HTMLElement | null = null
let appRef: QuitableApp | null = null
let launchPending = false

function measureStage(): { w: number; h: number } {
  const w = stageEl?.clientWidth ?? 0
  const h = stageEl?.clientHeight ?? 0
  return {
    w: w > 0 ? w : FALLBACK_W,
    h: h > 0 ? h : FALLBACK_H,
  }
}

/**
 * Wrap the Blits Application factory so we keep a handle for quit/destroy on leave.
 * `Blits.Launch` assigns `app.quit` synchronously after the factory returns (inside its microtask).
 */
function createAppFactory(stageW: number, stageH: number): () => QuitableApp {
  const HomeApp = createHomeApp({ stageW, stageH })
  return () => {
    try {
      const app = (HomeApp as unknown as () => QuitableApp)()
      if (!app || typeof app !== 'object') {
        throw new Error(`[home] HomeApp() returned ${String(app)}`)
      }
      appRef = app
      return app
    } catch (error) {
      console.error('[home] Application factory failed', error)
      throw error
    }
  }
}

function disposeSideEffects(): void {
  const app = appRef
  appRef = null
  launchPending = false

  // Clear upgraded poster registry before / with app teardown (AD-6).
  const textureStats = disposeAllTextures()

  if (app?.quit) {
    try {
      app.quit()
    } catch (error) {
      console.error('[home] quit failed', error)
      try {
        app.destroy?.()
      } catch (destroyError) {
        console.error('[home] destroy after quit failure also failed', destroyError)
      }
    }
  } else if (app?.destroy) {
    try {
      app.destroy()
    } catch (error) {
      console.error('[home] destroy failed', error)
    }
  }

  console.info('[home] dispose', {
    disposedTextures: textureStats.disposedOnLeave,
    peakLoaded: textureStats.peakLoaded,
    policy: textureStats.policy,
    window: textureStats.window,
  })
}

export async function mount(
  host: HTMLElement,
  ctx?: { surfaceId?: string },
): Promise<void> {
  // Remount safety: tear down any prior Blits instance + textures before attaching again.
  disposeSideEffects()

  hostEl = host

  const root = document.createElement('div')
  root.className = 'home-blits'
  root.dataset.testid = 'home-blits'

  const title = document.createElement('h2')
  title.textContent = 'Home — Featured rail'

  const hint = document.createElement('p')
  hint.className = 'home-blits__hint'
  hint.textContent =
    'Placeholder→upgrade textures (focus±2). Far tiles stay cheap color; Back disposes FULL posters. Perf Note → 4.4.'

  const stage = document.createElement('div')
  stage.className = 'home-blits__stage'
  stage.dataset.testid = 'home-blits-stage'
  stage.id = 'tvshell-home-blits-root'

  root.append(title, hint, stage)
  host.replaceChildren(root)
  stageEl = stage

  const { w, h } = measureStage()
  launchPending = true

  try {
    Blits.Launch(createAppFactory(w, h), stage, {
      w,
      h,
      multithreaded: false,
      debugLevel: 1,
      canvasColor: '#12151c',
      enableMouse: false,
    })
    const deadline = Date.now() + 2000
    while (!appRef && Date.now() < deadline) {
      await Promise.resolve()
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0)
      })
    }
    if (!appRef) {
      throw new Error('[home] Blits Application failed to start (no app instance)')
    }
    launchPending = false
    console.info('[home] mount', {
      surfaceId: ctx?.surfaceId ?? null,
      strategy: 'in-page-embed',
      rail: 'rail-featured',
      textures: getTextureStats(),
      w,
      h,
    })
  } catch (error) {
    launchPending = false
    disposeSideEffects()
    if (hostEl) {
      hostEl.replaceChildren()
    }
    hostEl = null
    stageEl = null
    throw error instanceof Error ? error : new Error(String(error))
  }
}

export async function unmount(): Promise<void> {
  await Promise.resolve()
  disposeSideEffects()
  if (hostEl) {
    hostEl.replaceChildren()
  }
  hostEl = null
  stageEl = null
  console.info('[home] unmount')
}

/** Smoke/console proof that AD-6 cleanup ran (Blits app + texture registry). */
export function hasActiveSideEffects(): boolean {
  return appRef != null || launchPending || hasLoadedTextures()
}
