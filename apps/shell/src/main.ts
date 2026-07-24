import { getDpadAction } from '@tvshell/shared';
import * as epgCanvas from '@tvshell/epg-canvas';
import * as homeBlits from '@tvshell/home-blits';
import * as surfaceStub from '@tvshell/surface-stub';
import * as webglLab from '@tvshell/webgl-lab';
import { renderChrome } from './chrome/render-chrome.js';
import { createSurfaceHost } from './host/surface-host.js';
import type { SurfaceModule, SurfaceRegistry } from './host/types.js';
import { createMenuFocusController } from './menu/focus-menu.js';
import { renderSurfaceMenu, surfaceIdFromElement } from './menu/render-menu.js';
import { SURFACE_MENU, type SurfaceId } from './menu/surfaces.js';
import './styles.css';

const root = document.querySelector('#app');
if (!(root instanceof HTMLElement)) {
  throw new Error('[shell] #app missing');
}

const chrome = renderChrome(root);
const menu = renderSurfaceMenu(chrome.menuHost);

const stubModule: SurfaceModule = {
  mount: surfaceStub.mount,
  unmount: surfaceStub.unmount,
};

const homeModule: SurfaceModule = {
  mount: homeBlits.mount,
  unmount: homeBlits.unmount,
};

const epgModule: SurfaceModule = {
  mount: epgCanvas.mount,
  unmount: epgCanvas.unmount,
};

const webglModule: SurfaceModule = {
  mount: webglLab.mount,
  unmount: webglLab.unmount,
};

// Home + EPG + WebGL Lab are real; Live remains on the stub until Epic 5.
const registry = {
  home: homeModule,
  live: stubModule,
  epg: epgModule,
  'webgl-lab': webglModule,
} as const satisfies SurfaceRegistry;

const probeBySurface: Record<SurfaceId, () => boolean> = {
  home: homeBlits.hasActiveSideEffects,
  live: surfaceStub.hasActiveSideEffects,
  epg: epgCanvas.hasActiveSideEffects,
  'webgl-lab': webglLab.hasActiveSideEffects,
};

/** Kept across leave so cleanupProbe still matches the Surface that just unmounted. */
let cleanupProbeForActive: (() => boolean) | undefined;

let restoreMenuFocus: (() => void) | null = null;

const host = createSurfaceHost({
  hostEl: chrome.surfaceHost,
  registry,
  setStatus: chrome.setStatus,
  setError: chrome.setError,
  cleanupProbe: () => (cleanupProbeForActive ? cleanupProbeForActive() : false),
  onModeChange: (mode, surfaceId) => {
    chrome.setSurfaceActive(mode === 'surface');
    if (mode === 'surface' && surfaceId) {
      cleanupProbeForActive = probeBySurface[surfaceId];
    }
    if (mode === 'menu') {
      restoreMenuFocus?.();
      console.info('[shell] cleanup probe after leave', {
        hasActiveSideEffects: cleanupProbeForActive ? cleanupProbeForActive() : null,
      });
    }
  },
});

const focus = createMenuFocusController({
  onFocusChange: (index) => {
    if (!host.isSurfaceActive()) {
      menu.setFocusedIndex(index);
    }
  },
  onSelect: (id: SurfaceId) => {
    // Set probe before mount so a failed mount / leave still reports the correct Surface.
    cleanupProbeForActive = probeBySurface[id];
    void host.enter(id);
  },
  onBack: () => {
    chrome.setStatus('Back on menu — pick a Surface and press Enter to mount.');
    console.info('[shell] back on menu (no-op)');
  },
});

restoreMenuFocus = () => {
  menu.setFocusedIndex(focus.getIndex());
};

const listenerAbort = new AbortController();
const { signal } = listenerAbort;

window.addEventListener(
  'keydown',
  (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const action = getDpadAction(event);
    if (!action) {
      return;
    }

    event.preventDefault();

    if (host.isSurfaceActive()) {
      if (action === 'back') {
        void host.leave();
      }
      // EPG / WebGL Lab own arrows via capture listeners; stub ignores them.
      return;
    }

    focus.handleAction(action);
  },
  { signal },
);

menu.list.addEventListener(
  'click',
  (event) => {
    if (host.isSurfaceActive()) {
      return;
    }

    const id = surfaceIdFromElement(event.target);
    if (!id) {
      return;
    }

    const index = SURFACE_MENU.findIndex((item) => item.id === id);
    if (index < 0) {
      return;
    }

    // Click is a desktop convenience; D-pad remains the primary input path.
    focus.setIndex(index);
    focus.handleAction('select');
  },
  { signal },
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    listenerAbort.abort();
    void host.leave();
  });
}

console.info('[shell] chrome ready', {
  surfaces: SURFACE_MENU.map((item) => item.id),
  focused: focus.getFocusedId(),
  host: 'home → @tvshell/home-blits; epg → @tvshell/epg-canvas; webgl-lab → @tvshell/webgl-lab; live → surface-stub',
});
