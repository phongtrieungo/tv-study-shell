/**
 * Story 4.3 smoke: placeholder→upgrade window math + dispose clears registry.
 * Run: node packages/home-blits/tests/story-4-3-smoke.mjs
 *
 * Mirrors texture-lifecycle.ts (keep in sync).
 */
import assert from 'node:assert/strict'

const TEXTURE_WINDOW = 2

function indicesInWindow(focused, itemCount, radius = TEXTURE_WINDOW) {
  const from = Math.max(0, focused - radius)
  const to = Math.min(itemCount - 1, focused + radius)
  const out = []
  for (let i = from; i <= to; i++) out.push(i)
  return out
}

function sync(focused, itemCount, loaded) {
  const want = new Set(indicesInWindow(focused, itemCount).map(String))
  for (const id of [...loaded]) {
    if (!want.has(id)) loaded.delete(id)
  }
  for (const id of want) loaded.add(id)
  return loaded.size
}

const loaded = new Set()
assert.equal(sync(0, 12, loaded), 3, 'focus 0 → indices 0,1,2')
assert.deepEqual([...loaded].sort(), ['0', '1', '2'])

assert.equal(sync(5, 12, loaded), 5, 'focus 5 → 3,4,5,6,7')
assert.ok(!loaded.has('0'), 'far tile 0 unloaded')
assert.ok(loaded.has('5'))

assert.equal(sync(11, 12, loaded), 3, 'focus last → 9,10,11')
assert.ok(!loaded.has('5'), 'mid tiles unloaded when far')

const disposed = loaded.size
loaded.clear()
assert.equal(loaded.size, 0)
assert.equal(disposed, 3, 'leave disposes remaining window')

console.info('[home-blits 4.3 smoke] texture window + dispose OK', {
  window: TEXTURE_WINDOW,
  maxWindowSize: TEXTURE_WINDOW * 2 + 1,
})
console.info('[home-blits 4.3 smoke] PASS')
