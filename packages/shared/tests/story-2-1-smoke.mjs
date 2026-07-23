/**
 * Node smoke for Visible Window math (no Vitest — Story 7.1 owns that).
 * Run after emitting shared JS:
 *   pnpm exec tsc -p packages/shared/tsconfig.json --noEmit false --outDir /tmp/tvshell-shared-smoke
 *   SHARED_BUILD_DIR=/tmp/tvshell-shared-smoke node packages/shared/tests/story-2-1-smoke.mjs
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const buildDir = process.env.SHARED_BUILD_DIR;

if (!buildDir) {
  throw new Error('SHARED_BUILD_DIR is required');
}

const fixturesModule = await import(
  pathToFileURL(path.join(buildDir, 'fixtures', 'index.js')).href
);
const vwModule = await import(
  pathToFileURL(path.join(buildDir, 'visible-window', 'index.js')).href
);

const { channels, programs, fixtureMeta } = fixturesModule;
const {
  computeVisibleWindow,
  countLogicalProgramCells,
  countProgramsInVisibleWindow,
} = vwModule;

const dayStartMs = Date.parse(fixtureMeta.dayStart);
const dayEndMs = dayStartMs + fixtureMeta.scheduleHoursPerChannel * 60 * 60 * 1000;
const logical = countLogicalProgramCells(fixtureMeta.programCount);

assert.equal(logical, 600);
assert.ok(channels.length >= 50);

const window = computeVisibleWindow({
  focusChannelIndex: 0,
  focusTimeMs: dayStartMs,
  viewportChannelCount: 10,
  viewportDurationMs: 4 * 60 * 60 * 1000,
  totalChannels: channels.length,
  dayStartMs,
  dayEndMs,
  anchor: 'center',
});

assert.equal(window.channelStart, 0);
assert.ok(window.channelEnd <= channels.length);
assert.ok(window.timeStartMs >= dayStartMs);
assert.ok(window.timeEndMs <= dayEndMs);

const drawn = countProgramsInVisibleWindow(channels, programs, window);
assert.ok(drawn > 0, 'default window should include some programs');
assert.ok(drawn < logical, 'drawn must be ≪ logical');

const edge = computeVisibleWindow({
  focusChannelIndex: 49,
  focusTimeMs: dayEndMs - 1,
  viewportChannelCount: 10,
  viewportDurationMs: 4 * 60 * 60 * 1000,
  totalChannels: channels.length,
  dayStartMs,
  dayEndMs,
  anchor: 'center',
});
assert.equal(edge.channelEnd, channels.length);
assert.ok(edge.channelStart >= 0);
assert.ok(edge.timeEndMs <= dayEndMs);

console.log(
  JSON.stringify(
    {
      logical,
      drawn,
      channelStart: window.channelStart,
      channelEnd: window.channelEnd,
      edgeChannelStart: edge.channelStart,
    },
    null,
    2,
  ),
);
