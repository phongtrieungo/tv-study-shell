import type { SurfaceId } from '../menu/surfaces.js';
import type { SurfaceModule, SurfaceRegistry } from './types.js';

export type SurfaceHostOptions = {
  hostEl: HTMLElement;
  registry: SurfaceRegistry;
  setStatus: (message: string) => void;
  setError: (message: string | null) => void;
  /** When provided, leave status reflects whether side effects remain. */
  cleanupProbe?: () => boolean;
  onModeChange?: (mode: 'menu' | 'surface', surfaceId: SurfaceId | null) => void;
};

export type SurfaceHost = {
  enter: (id: SurfaceId) => Promise<void>;
  leave: () => Promise<void>;
  getActiveId: () => SurfaceId | null;
  isSurfaceActive: () => boolean;
};

export function createSurfaceHost(options: SurfaceHostOptions): SurfaceHost {
  let activeId: SurfaceId | null = null;
  let activeModule: SurfaceModule | null = null;
  let queue: Promise<void> = Promise.resolve();

  const notify = (mode: 'menu' | 'surface', id: SurfaceId | null) => {
    options.onModeChange?.(mode, id);
  };

  const runExclusive = (operation: () => Promise<void>): Promise<void> => {
    const run = queue.then(operation, operation);
    queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };

  const leaveInternal = async (): Promise<void> => {
    if (!activeModule) {
      // Already on menu — do not re-notify (avoids false cleanup-probe logs).
      return;
    }

    const leavingId = activeId;
    const mod = activeModule;
    let unmountError: unknown;

    // Keep activeId set until teardown finishes so input stays in surface mode.
    try {
      await mod.unmount();
    } catch (error) {
      unmountError = error;
    } finally {
      activeModule = null;
      activeId = null;
      options.hostEl.replaceChildren();
    }

    if (unmountError) {
      const message =
        unmountError instanceof Error ? unmountError.message : String(unmountError);
      options.setError(`Unmount failed: ${message}`);
      options.setStatus('Unmount error — see banner. Host cleared; retry from menu.');
      console.error('[shell] surface unmount failed', unmountError);
      notify('menu', null);
      throw unmountError instanceof Error
        ? unmountError
        : new Error(String(unmountError));
    }

    const sideEffectsGone = options.cleanupProbe ? !options.cleanupProbe() : true;
    options.setError(null);
    options.setStatus(
      leavingId
        ? sideEffectsGone
          ? `Left ${leavingId}. Side effects cleared.`
          : `Left ${leavingId}. Warning: cleanup probe still reports side effects.`
        : 'Returned to menu.',
    );
    console.info('[shell] surface unmounted', {
      id: leavingId,
      sideEffectsGone,
    });
    notify('menu', null);
  };

  const enterInternal = async (id: SurfaceId): Promise<void> => {
    const mod = options.registry[id];
    if (!mod) {
      options.setError(`No Surface module registered for “${id}”.`);
      options.setStatus(`Cannot mount ${id}.`);
      console.error('[shell] missing surface module', { id });
      return;
    }

    if (activeModule) {
      await leaveInternal();
    }

    options.setError(null);

    try {
      await mod.mount(options.hostEl, { surfaceId: id });
      activeModule = mod;
      activeId = id;
      options.setStatus(`Mounted ${id}. Press Back to unmount and return to the menu.`);
      console.info('[shell] surface mounted', { id });
      notify('surface', id);
    } catch (error) {
      // Partial mount may have registered listeners/timers — ask the module to dispose.
      try {
        await mod.unmount();
      } catch (unmountError) {
        console.error('[shell] cleanup unmount after mount failure also failed', unmountError);
      } finally {
        activeModule = null;
        activeId = null;
        options.hostEl.replaceChildren();
      }

      const message = error instanceof Error ? error.message : String(error);
      options.setError(`Mount failed for “${id}”: ${message}`);
      options.setStatus(`Mount error for ${id} — see banner.`);
      console.error('[shell] surface mount failed', { id, error });
      notify('menu', null);
    }
  };

  return {
    enter: (id) => runExclusive(() => enterInternal(id)),
    leave: () => runExclusive(() => leaveInternal()),
    getActiveId: () => activeId,
    isSurfaceActive: () => activeId != null,
  };
}
