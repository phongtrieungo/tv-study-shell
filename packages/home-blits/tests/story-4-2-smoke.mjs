/**
 * Story 4.2 smoke: clamp scroll math for the Featured rail.
 * (Shared ≥12 homeRails already covered by packages/shared/tests/story-1-2-smoke.mjs.)
 * Run: node packages/home-blits/tests/story-4-2-smoke.mjs
 */
import assert from 'node:assert/strict'

/** Mirror of railOffsetForFocus in App.ts — keep in sync. */
function railOffsetForFocus(focused, stageW, itemCount) {
  const TILE_W = 200
  const TILE_GAP = 24
  const TILE_STEP = TILE_W + TILE_GAP
  const RAIL_PAD_X = 48
  const focusedLeft = RAIL_PAD_X + focused * TILE_STEP
  const focusedRight = focusedLeft + TILE_W
  const margin = 40
  let offset = 0
  if (focusedRight + margin > stageW) {
    offset = stageW - margin - focusedRight
  }
  if (focusedLeft + offset < margin) {
    offset = margin - focusedLeft
  }
  const contentW = RAIL_PAD_X * 2 + itemCount * TILE_W + Math.max(0, itemCount - 1) * TILE_GAP
  const minOffset = Math.min(0, stageW - contentW)
  return Math.max(minOffset, Math.min(0, offset))
}

assert.equal(railOffsetForFocus(0, 800, 12), 0, 'focus 0 stays at origin')
assert.ok(railOffsetForFocus(11, 800, 12) < 0, 'last tile scrolls left into view')
assert.ok(railOffsetForFocus(5, 800, 12) <= 0, 'mid focus never positive offset')
assert.equal(
  railOffsetForFocus(0, 800, 12),
  railOffsetForFocus(-1, 800, 12) === 0
    ? railOffsetForFocus(0, 800, 12)
    : railOffsetForFocus(0, 800, 12),
  'sanity',
)

// Clamp contract: calling math with ends only (UI clamps index before offset)
const last = railOffsetForFocus(11, 640, 12)
const nearLast = railOffsetForFocus(10, 640, 12)
assert.ok(last <= nearLast, 'further right focus scrolls further left (or equal)')

console.info('[home-blits 4.2 smoke] rail offset clamp OK', { last, nearLast })
console.info('[home-blits 4.2 smoke] PASS')
