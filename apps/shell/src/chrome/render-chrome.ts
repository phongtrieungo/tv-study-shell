import { createSafeZoneGuide } from './safe-zone.js';

export type ShellChrome = {
  root: HTMLElement;
  menuHost: HTMLElement;
  statusEl: HTMLElement;
  setStatus: (message: string) => void;
};

export function renderChrome(appRoot: HTMLElement): ShellChrome {
  appRoot.replaceChildren();

  const root = document.createElement('div');
  root.className = 'shell-root';
  root.dataset.testid = 'shell-root';

  const { frame, label } = createSafeZoneGuide();

  const chrome = document.createElement('div');
  chrome.className = 'shell-chrome';
  chrome.dataset.testid = 'shell-chrome';

  const header = document.createElement('header');
  header.className = 'shell-header';
  header.dataset.testid = 'shell-header';

  const title = document.createElement('h1');
  title.textContent = 'TV Study Shell';

  const subtitle = document.createElement('p');
  subtitle.textContent =
    'Safe Zone chrome + Surface menu. Select acknowledges a destination; mount/unmount lands in Story 1.4.';

  header.append(title, subtitle);

  const menuHost = document.createElement('div');
  menuHost.dataset.testid = 'surface-menu-host';

  const hint = document.createElement('p');
  hint.className = 'shell-hint';
  hint.textContent = 'D-pad: ↑ / ↓ move · Enter select · Backspace / Escape Back (menu stays put for now)';

  const statusEl = document.createElement('div');
  statusEl.className = 'shell-status';
  statusEl.dataset.testid = 'shell-status';
  statusEl.setAttribute('role', 'status');
  statusEl.setAttribute('aria-live', 'polite');

  const setStatus = (message: string) => {
    statusEl.replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = 'Status: ';
    statusEl.append(strong, document.createTextNode(message));
  };

  setStatus('Ready — focus a Surface and press Enter.');

  // Label lives inside chrome padding so teaching copy stays in the Safe Zone.
  chrome.append(label, header, menuHost, hint, statusEl);
  root.append(frame, chrome);
  appRoot.append(root);

  return { root, menuHost, statusEl, setStatus };
}
