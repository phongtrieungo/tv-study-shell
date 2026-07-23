import type { Program } from '@tvshell/shared';

function formatUtcClock(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    return iso;
  }
  return new Date(ms).toISOString().slice(11, 16);
}

export type DetailPanel = {
  root: HTMLElement;
  setProgram: (program: Program) => void;
  clear: () => void;
};

/** Minimal DOM program detail (title + start/end). Not a second canvas. */
export function createDetailPanel(): DetailPanel {
  const root = document.createElement('aside');
  root.className = 'epg-canvas__detail';
  root.dataset.testid = 'epg-detail';
  root.hidden = true;
  root.setAttribute('aria-live', 'polite');

  const heading = document.createElement('h3');
  heading.className = 'epg-canvas__detail-title';

  const time = document.createElement('p');
  time.className = 'epg-canvas__detail-time';

  const dismissHint = document.createElement('p');
  dismissHint.className = 'epg-canvas__detail-hint';
  dismissHint.textContent = 'Back dismisses detail · arrows resume when closed';

  root.append(heading, time, dismissHint);

  return {
    root,
    setProgram(program: Program) {
      heading.textContent = program.title;
      time.textContent = `${formatUtcClock(program.start)}–${formatUtcClock(program.end)} UTC`;
      root.hidden = false;
    },
    clear() {
      heading.textContent = '';
      time.textContent = '';
      root.hidden = true;
    },
  };
}
