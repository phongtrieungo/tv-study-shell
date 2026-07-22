import type { DpadAction } from '@tvshell/shared';
import { SURFACE_MENU, type SurfaceId } from './surfaces.js';

export type MenuFocusController = {
  getIndex: () => number;
  getFocusedId: () => SurfaceId;
  setIndex: (next: number) => number;
  move: (delta: number) => number;
  handleAction: (action: DpadAction) => SurfaceId | 'back' | null;
};

export type MenuFocusOptions = {
  initialIndex?: number;
  onFocusChange: (index: number) => void;
  onSelect: (id: SurfaceId) => void;
  onBack?: () => void;
};

export function createMenuFocusController(options: MenuFocusOptions): MenuFocusController {
  const length = SURFACE_MENU.length;
  let index = clamp(options.initialIndex ?? 0, 0, length - 1);

  const getIndex = () => index;

  const getFocusedId = () => SURFACE_MENU[index]!.id;

  const setIndex = (next: number) => {
    index = clamp(next, 0, length - 1);
    options.onFocusChange(index);
    return index;
  };

  const move = (delta: number) => setIndex(index + delta);

  const handleAction = (action: DpadAction): SurfaceId | 'back' | null => {
    switch (action) {
      case 'up':
        move(-1);
        return null;
      case 'down':
        move(1);
        return null;
      case 'left':
      case 'right':
        // Vertical menu: horizontal arrows are intentionally ignored.
        return null;
      case 'select': {
        const id = getFocusedId();
        options.onSelect(id);
        return id;
      }
      case 'back':
        options.onBack?.();
        return 'back';
      default:
        return null;
    }
  };

  options.onFocusChange(index);

  return { getIndex, getFocusedId, setIndex, move, handleAction };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
