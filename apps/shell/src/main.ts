import { SHARED_MARKER } from '@tvshell/shared';

const root = document.querySelector('#app');
if (!root) {
  throw new Error('[shell] #app missing');
}

root.textContent = `TV Study Shell — ${SHARED_MARKER}`;
console.info(`[shell] mounted with ${SHARED_MARKER}`);
