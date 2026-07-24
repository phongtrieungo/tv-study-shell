import { createSafeZoneGuide } from './safe-zone.js';

export type ShellChrome = {
  root: HTMLElement;
  menuHost: HTMLElement;
  surfaceHost: HTMLElement;
  statusEl: HTMLElement;
  errorBanner: HTMLElement;
  setStatus: (message: string) => void;
  setError: (message: string | null) => void;
  setSurfaceActive: (active: boolean) => void;
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
    'Safe Zone chrome + Surface menu. Home (Blits hello-world), EPG (Canvas), and WebGL Lab are live; Live still uses the stub. Back unmounts and returns here.';

  header.append(title, subtitle);

  const errorBanner = document.createElement('div');
  errorBanner.className = 'shell-error-banner';
  errorBanner.dataset.testid = 'shell-error-banner';
  errorBanner.setAttribute('role', 'alert');
  errorBanner.hidden = true;

  const menuHost = document.createElement('div');
  menuHost.dataset.testid = 'surface-menu-host';

  const surfaceHost = document.createElement('div');
  surfaceHost.className = 'surface-host';
  surfaceHost.dataset.testid = 'surface-host';
  surfaceHost.tabIndex = -1;
  surfaceHost.setAttribute('aria-label', 'Active Surface');
  surfaceHost.hidden = true;

  const hint = document.createElement('p');
  hint.className = 'shell-hint';
  hint.textContent =
    'D-pad: ↑ / ↓ move · Enter mount · Backspace / Escape Back (from Surface → menu)';

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

  const setError = (message: string | null) => {
    if (!message) {
      errorBanner.hidden = true;
      errorBanner.replaceChildren();
      return;
    }
    errorBanner.hidden = false;
    errorBanner.replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = 'Error: ';
    errorBanner.append(strong, document.createTextNode(message));
  };

  const setSurfaceActive = (active: boolean) => {
    root.classList.toggle('is-surface-active', active);
    menuHost.hidden = active;
    surfaceHost.hidden = !active;
    hint.textContent = active
      ? 'Surface active — arrows may be owned by the Surface; Backspace / Escape returns to the menu.'
      : 'D-pad: ↑ / ↓ move · Enter mount · Backspace / Escape Back (from Surface → menu)';

    if (active) {
      // Move focus off the now-hidden menu control (AT / keyboard ownership).
      surfaceHost.focus({ preventScroll: true });
    }
  };

  setStatus('Ready — focus a Surface and press Enter to mount.');

  // Label lives inside chrome padding so teaching copy stays in the Safe Zone.
  chrome.append(label, header, errorBanner, menuHost, surfaceHost, hint, statusEl);
  root.append(frame, chrome);
  appRoot.append(root);

  return {
    root,
    menuHost,
    surfaceHost,
    statusEl,
    errorBanner,
    setStatus,
    setError,
    setSurfaceActive,
  };
}
