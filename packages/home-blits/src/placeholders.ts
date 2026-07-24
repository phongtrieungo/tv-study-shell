/**
 * Visible tile art for Mock Data `posterUrl: ''` — no backend, no CDN.
 * Hashed color tiles keyed by itemId (Story 4.2).
 * Story 4.3 upgrades near-focus tiles to SVG data-URL “FULL” posters.
 */

import { homeRails, type RailItem } from '@tvshell/shared'

export type HomeTile = {
  itemId: string
  title: string
  /** Empty in shared fixtures today; kept for 4.3 texture work. */
  posterUrl: string
  /** Solid placeholder color (#rrggbb) derived from itemId. */
  color: string
}

const FEATURED_RAIL_ID = 'rail-featured'

/** Stable pastel-ish palette — readable at 10-foot distance on dark stage. */
const PALETTE = [
  '#1e3a5f',
  '#3b1f5e',
  '#1f4d3a',
  '#5c3d1e',
  '#4a1f3d',
  '#1f455c',
  '#3d4a1f',
  '#5c1f2e',
] as const

function hashItemId(itemId: string): number {
  let h = 0
  for (let i = 0; i < itemId.length; i++) {
    h = (h * 31 + itemId.charCodeAt(i)) >>> 0
  }
  return h
}

export function colorForItemId(itemId: string): string {
  return PALETTE[hashItemId(itemId) % PALETTE.length] ?? PALETTE[0]
}

/**
 * One rail (`rail-featured`) with all ≥12 fixture items + generated tile colors.
 * Does not duplicate rail arrays — maps shared `homeRails` only.
 */
export function featuredRailTiles(): HomeTile[] {
  const rail = homeRails.find((r) => r.railId === FEATURED_RAIL_ID) ?? homeRails[0]
  if (!rail) {
    throw new Error('[home] shared homeRails is empty — expected rail-featured')
  }
  return rail.items.map((item: RailItem) => ({
    itemId: item.itemId,
    title: item.title,
    posterUrl: item.posterUrl,
    color: colorForItemId(item.itemId),
  }))
}

export const TILE_W = 200
export const TILE_H = 300
export const TILE_GAP = 24
export const TILE_STEP = TILE_W + TILE_GAP
export const POSTER_H = 260
/** Left padding inside stage before first tile. */
export const RAIL_PAD_X = 48
export const RAIL_PAD_Y = 72
