/**
 * Stub Surface — proves the Shell mount/unmount contract (Story 1.4 / AD-6).
 * Not a real Lab package; later epics swap the host registry to real Surfaces.
 *
 * Mount context shape matches Shell `SurfaceMountContext` structurally
 * (`surfaceId` string). Canonical contract type lives in `apps/shell/src/host/types.ts`.
 */

let hostEl: HTMLElement | null = null;
let timerId: ReturnType<typeof setInterval> | null = null;
let onVisibility: ((event: Event) => void) | null = null;
let tickCount = 0;

export function mount(
  host: HTMLElement,
  ctx?: { surfaceId?: string },
): void {
  // Remount safety: clear any leftover side effects before attaching again.
  disposeSideEffects();

  hostEl = host;
  tickCount = 0;

  const panel = document.createElement('div');
  panel.className = 'surface-stub';
  panel.dataset.testid = 'surface-stub';

  const title = document.createElement('h2');
  title.textContent = 'Surface stub';

  const body = document.createElement('p');
  body.textContent = ctx?.surfaceId
    ? `Mounted as “${ctx.surfaceId}”. All menu destinations share this stub until real Surfaces land.`
    : 'Mounted. Press Back to unmount and return to the menu.';

  const probe = document.createElement('p');
  probe.className = 'surface-stub__probe';
  probe.dataset.testid = 'surface-stub-probe';
  probe.textContent = 'Cleanup probe: timer + visibility listener active (tick 0).';

  panel.append(title, body, probe);
  host.replaceChildren(panel);

  onVisibility = () => {
    console.info('[surface-stub] visibilitychange', document.visibilityState);
  };
  document.addEventListener('visibilitychange', onVisibility);

  timerId = setInterval(() => {
    tickCount += 1;
    const el = hostEl?.querySelector<HTMLElement>('[data-testid="surface-stub-probe"]');
    if (el) {
      el.textContent = `Cleanup probe: timer + visibility listener active (tick ${tickCount}).`;
    }
  }, 1000);

  console.info('[surface-stub] mount', { surfaceId: ctx?.surfaceId ?? null });
}

export function unmount(): void {
  disposeSideEffects();
  if (hostEl) {
    hostEl.replaceChildren();
  }
  hostEl = null;
  console.info('[surface-stub] unmount');
}

/** Smoke/console proof that AD-6 cleanup ran. */
export function hasActiveSideEffects(): boolean {
  return onVisibility != null || timerId != null;
}

function disposeSideEffects(): void {
  if (onVisibility) {
    document.removeEventListener('visibilitychange', onVisibility);
    onVisibility = null;
  }
  if (timerId != null) {
    clearInterval(timerId);
    timerId = null;
  }
  tickCount = 0;
}
