import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const buildDir = process.env.SHARED_BUILD_DIR;

if (!buildDir) {
  throw new Error('SHARED_BUILD_DIR is required');
}

const fixturesModule = await import(pathToFileURL(path.join(buildDir, 'fixtures', 'index.js')).href);
const inputModule = await import(pathToFileURL(path.join(buildDir, 'input', 'index.js')).href);

const { channels, programs, homeRails, fixtureMeta } = fixturesModule;
const { KEY, DPAD_KEYS, isBackKey, normalizeDpadKey } = inputModule;

assert.ok(Array.isArray(channels), 'channels export should be an array');
assert.ok(Array.isArray(programs), 'programs export should be an array');
assert.ok(Array.isArray(homeRails), 'homeRails export should be an array');
assert.ok(channels.length >= 50, 'fixtures should expose at least 50 channels');
assert.ok(homeRails.length >= 1, 'fixtures should expose at least one home rail');
assert.ok(homeRails[0].items.length >= 12, 'first home rail should expose at least 12 items');
assert.equal(fixtureMeta.scheduleHoursPerChannel, 24, 'fixtures should cover a 24 hour schedule');
assert.equal(KEY.ArrowUp, 'ArrowUp');
assert.equal(KEY.Enter, 'Enter');
assert.equal(isBackKey('Backspace'), true);
assert.equal(isBackKey('Escape'), true);
assert.equal(normalizeDpadKey('Escape'), 'back');
assert.equal(DPAD_KEYS.length, 7);

for (const program of programs) {
  assert.match(program.channelId, /^channel-\d{2}$/);
  assert.ok(program.end > program.start, 'program end must be later than start');
}

console.log(
  JSON.stringify(
    {
      channels: channels.length,
      programs: programs.length,
      firstRailItems: homeRails[0].items.length,
      scheduleHoursPerChannel: fixtureMeta.scheduleHoursPerChannel,
      dpadKeyCount: DPAD_KEYS.length,
    },
    null,
    2,
  ),
);
