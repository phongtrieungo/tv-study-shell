import { getDpadAction } from '@tvshell/shared';
import * as surfaceStub from '@tvshell/surface-stub';
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

// Story 1.4: every destination maps to the same stub; later epics swap registry entries.
const registry = {
  home: stubModule,
  live: stubModule,
  epg: stubModule,
  'webgl-lab': stubModule,
} as const satisfies SurfaceRegistry;

let restoreMenuFocus: (() => void) | null = null;

const host = createSurfaceHost({
  hostEl: chrome.surfaceHost,
  registry,
  setStatus: chrome.setStatus,
  setError: chrome.setError,
  cleanupProbe: surfaceStub.hasActiveSideEffects,
  onModeChange: (mode) => {
    chrome.setSurfaceActive(mode === 'surface');
    if (mode === 'menu') {
      restoreMenuFocus?.();
      console.info('[shell] cleanup probe after leave', {
        hasActiveSideEffects: surfaceStub.hasActiveSideEffects(),
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
      // Surface owns its own input later; stub ignores arrows/select while mounted.
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
  host: 'surface-stub registry',
});
