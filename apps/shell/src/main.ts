import {
  DPAD_KEYS,
  SHARED_MARKER,
  channels,
  fixtureMeta,
  homeRails,
  programs,
} from '@tvshell/shared';

const root = document.querySelector('#app');
if (!root) {
  throw new Error('[shell] #app missing');
}

const [featuredRail] = homeRails;

root.textContent =
  `TV Study Shell — ${SHARED_MARKER} | ` +
  `${channels.length} channels | ` +
  `${programs.length} programs | ` +
  `${featuredRail?.items.length ?? 0} featured tiles`;

console.info('[shell] mounted with shared fixtures', {
  marker: SHARED_MARKER,
  fixtureMeta,
  dpadKeys: DPAD_KEYS,
});
