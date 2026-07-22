import { SURFACE_MENU, isSurfaceId, type SurfaceId } from './surfaces.js';

export type SurfaceMenuView = {
  list: HTMLUListElement;
  setFocusedIndex: (index: number) => void;
};

export function renderSurfaceMenu(host: HTMLElement): SurfaceMenuView {
  host.replaceChildren();

  const list = document.createElement('ul');
  list.className = 'surface-menu';
  list.dataset.testid = 'surface-menu';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Surfaces');

  for (const item of SURFACE_MENU) {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'surface-menu__item';
    button.dataset.testid = `surface-menu-item-${item.id}`;
    button.dataset.surfaceId = item.id;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', 'false');
    button.tabIndex = -1;
    button.textContent = item.label;

    li.append(button);
    list.append(li);
  }

  host.append(list);

  const setFocusedIndex = (index: number) => {
    const buttons = [...list.querySelectorAll<HTMLButtonElement>('.surface-menu__item')];
    buttons.forEach((button, i) => {
      const focused = i === index;
      button.classList.toggle('is-focused', focused);
      button.setAttribute('aria-selected', focused ? 'true' : 'false');
      button.tabIndex = focused ? 0 : -1;
      if (focused) {
        button.focus({ preventScroll: true });
      }
    });
  };

  return { list, setFocusedIndex };
}

export function surfaceIdFromElement(target: EventTarget | null): SurfaceId | null {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const id = target.closest<HTMLElement>('[data-surface-id]')?.dataset.surfaceId;
  if (!id || !isSurfaceId(id)) {
    return null;
  }

  return id;
}
