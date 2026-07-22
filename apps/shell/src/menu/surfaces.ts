export type SurfaceId = 'home' | 'live' | 'epg' | 'webgl-lab';

export type SurfaceMenuItem = {
  readonly id: SurfaceId;
  readonly label: string;
};

export const SURFACE_MENU = [
  { id: 'home', label: 'Home' },
  { id: 'live', label: 'Live' },
  { id: 'epg', label: 'EPG' },
  { id: 'webgl-lab', label: 'WebGL Lab' },
] as const satisfies readonly SurfaceMenuItem[];

export function isSurfaceId(value: string): value is SurfaceId {
  return SURFACE_MENU.some((item) => item.id === value);
}
