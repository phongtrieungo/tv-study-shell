/**
 * Home Blits Surface — mount spike (Story 4.1 / FR-8 prelude).
 * Mount context shape matches Shell `SurfaceMountContext` structurally.
 */

import Blits from '@lightningjs/blits'
import { HelloApp } from './App.js'

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
function createAppFactory(): () => QuitableApp {
  return () => {
    try {
      // Blits typings declare Application factory as void; runtime returns the app instance.
      const app = (HelloApp as unknown as () => QuitableApp)()
      if (!app || typeof app !== 'object') {
        throw new Error(`[home] HelloApp() returned ${String(app)}`)
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
}

export async function mount(
  host: HTMLElement,
  ctx?: { surfaceId?: string },
): Promise<void> {
  // Remount safety: tear down any prior Blits instance before attaching again.
  disposeSideEffects()

  hostEl = host

  const root = document.createElement('div')
  root.className = 'home-blits'
  root.dataset.testid = 'home-blits'

  const title = document.createElement('h2')
  title.textContent = 'Home — Blits hello-world'

  const hint = document.createElement('p')
  hint.className = 'home-blits__hint'
  hint.textContent =
    'Applied WebGL via Blits / Lightning 3 (in-page embed). Rail focus lands in Story 4.2. Back returns to menu.'

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
    // Target is an HTMLElement (Blits also accepts id strings). Prefer element for Shell embed.
    Blits.Launch(createAppFactory(), stage, {
      w,
      h,
      multithreaded: false,
      debugLevel: 1,
      canvasColor: '#12151c',
      // Shell owns Back → leave; hello-world does not need rail keys yet.
      enableMouse: false,
    })
    // Launch defers App() to a microtask — poll briefly so quit() is attached.
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
  // Allow a pending Launch microtask to finish so quit exists.
  await Promise.resolve()
  disposeSideEffects()
  if (hostEl) {
    hostEl.replaceChildren()
  }
  hostEl = null
  stageEl = null
  console.info('[home] unmount')
}

/** Smoke/console proof that AD-6 cleanup ran (Blits app + stage). */
export function hasActiveSideEffects(): boolean {
  return appRef != null || launchPending
}
