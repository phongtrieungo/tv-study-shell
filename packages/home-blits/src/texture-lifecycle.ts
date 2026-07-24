/**
 * Texture lifecycle (Story 4.3 / FR-9 / AD-6).
 *
 * Policy: **placeholder → upgrade** inside a focus±N window.
 * - Far tiles: hashed color only (no Image src / no GPU bitmap).
 * - Near focus: tile-sized SVG data-URL “full” poster (practice full-res pattern; not 4K).
 * - Leave window: drop src (unload). Surface leave: clear registry + Blits quit.
 */

import { POSTER_H, TILE_W, type HomeTile } from './placeholders.js'

/** Keep full posters for focused index ± this many neighbors. */
export const TEXTURE_WINDOW = 2

export const TEXTURE_POLICY = 'placeholder-upgrade' as const

export type TextureStats = {
  policy: typeof TEXTURE_POLICY
  window: number
  loadedFull: number
  peakLoaded: number
  disposedOnLeave: number
}

/** itemId → data-URL currently upgraded (loaded as Lightning ImageTexture). */
const loaded = new Map<string, string>()
let peakLoaded = 0
let lastDisposed = 0

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Tile-sized “full” poster (≈200×260). Production pattern would swap this for a
 * CDN URL at the same dimensions — never decode 4K for a rail tile.
 */
export function buildPosterDataUrl(tile: HomeTile): string {
  const title = escapeXml(tile.title)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${POSTER_H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tile.color}"/>
      <stop offset="100%" stop-color="#0a0c10"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="12" y="${POSTER_H - 72}" width="${TILE_W - 24}" height="52" rx="6" fill="rgba(0,0,0,0.45)"/>
  <text x="20" y="${POSTER_H - 40}" fill="#e8ecf3" font-family="system-ui,sans-serif" font-size="18">${title}</text>
  <text x="20" y="36" fill="#fbbf24" font-family="system-ui,sans-serif" font-size="14">FULL</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function indicesInWindow(focused: number, itemCount: number, radius = TEXTURE_WINDOW): number[] {
  const from = Math.max(0, focused - radius)
  const to = Math.min(itemCount - 1, focused + radius)
  const out: number[] = []
  for (let i = from; i <= to; i++) {
    out.push(i)
  }
  return out
}

/**
 * Sync loaded full posters to the focus window. Returns current loaded count.
 * Far tiles are removed from the map (unload) — callers should clear tile.src.
 */
export function syncTextureWindow(focused: number, tiles: readonly HomeTile[]): number {
  const want = new Set(
    indicesInWindow(focused, tiles.length).map((i) => tiles[i]?.itemId).filter(Boolean) as string[],
  )

  for (const id of [...loaded.keys()]) {
    if (!want.has(id)) {
      loaded.delete(id)
    }
  }

  for (const id of want) {
    if (loaded.has(id)) {
      continue
    }
    const tile = tiles.find((t) => t.itemId === id)
    if (!tile) {
      continue
    }
    loaded.set(id, buildPosterDataUrl(tile))
  }

  peakLoaded = Math.max(peakLoaded, loaded.size)
  return loaded.size
}

export function srcForItem(itemId: string): string {
  return loaded.get(itemId) ?? ''
}

/** Apply window + return items with `src` / `upgraded` for Blits Image (empty = placeholder only). */
export function tilesWithTextureSrc(
  focused: number,
  tiles: readonly HomeTile[],
): Array<HomeTile & { src: string; upgraded: boolean }> {
  syncTextureWindow(focused, tiles)
  return tiles.map((tile) => {
    const src = srcForItem(tile.itemId)
    return {
      ...tile,
      src,
      upgraded: src.length > 0,
    }
  })
}

export function getTextureStats(): TextureStats {
  return {
    policy: TEXTURE_POLICY,
    window: TEXTURE_WINDOW,
    loadedFull: loaded.size,
    peakLoaded,
    disposedOnLeave: lastDisposed,
  }
}

/** Clear all upgraded posters (Surface leave). Returns dispose counts for logs. */
export function disposeAllTextures(): TextureStats {
  lastDisposed = loaded.size
  loaded.clear()
  const stats = getTextureStats()
  peakLoaded = 0
  return stats
}

export function hasLoadedTextures(): boolean {
  return loaded.size > 0
}
