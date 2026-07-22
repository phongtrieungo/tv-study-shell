import { getDpadAction } from '@tvshell/shared';
import { renderChrome } from './chrome/render-chrome.js';
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

const acknowledgeSelect = (id: SurfaceId) => {
  const item = SURFACE_MENU.find((entry) => entry.id === id);
  const label = item?.label ?? id;
  chrome.setStatus(
    `Selected ${label} (${id}). Mount/unmount host contract is Story 1.4 — not mounted yet.`,
  );
  console.info('[shell] surface selected', { id, label });
};

const focus = createMenuFocusController({
  onFocusChange: (index) => {
    menu.setFocusedIndex(index);
  },
  onSelect: acknowledgeSelect,
  onBack: () => {
    chrome.setStatus('Back on menu — staying here until Surfaces mount (Story 1.4).');
    console.info('[shell] back on menu (no-op)');
  },
});

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
    focus.handleAction(action);
  },
  { signal },
);

menu.list.addEventListener(
  'click',
  (event) => {
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
  });
}

console.info('[shell] chrome ready', {
  surfaces: SURFACE_MENU.map((item) => item.id),
  focused: focus.getFocusedId(),
});
