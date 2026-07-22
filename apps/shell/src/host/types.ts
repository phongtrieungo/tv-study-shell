import type { SurfaceId } from '../menu/surfaces.js';

export type SurfaceMountContext = {
  surfaceId: SurfaceId;
};

/**
 * Documented Surface lifecycle contract (AD-2 / AD-6).
 * Framework Surfaces may wrap their runtime; Shell only calls these.
 */
export type SurfaceModule = {
  mount: (host: HTMLElement, ctx?: SurfaceMountContext) => void | Promise<void>;
  unmount: () => void | Promise<void>;
};

export type SurfaceRegistry = Readonly<Record<SurfaceId, SurfaceModule>>;
