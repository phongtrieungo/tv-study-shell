/** Safe Zone convention: ~5% per edge (~48×27 px at 1920×1080). */

export const SAFE_ZONE = {
  percentX: 2.5,
  percentY: 2.7,
  pxAt1080: { x: 48, y: 27 },
  label: 'Safe Zone (~5% inset)',
} as const;

export function createSafeZoneGuide(): { frame: HTMLDivElement; label: HTMLParagraphElement } {
  const frame = document.createElement('div');
  frame.className = 'safe-zone-frame';
  frame.dataset.testid = 'safe-zone-frame';
  frame.setAttribute('aria-hidden', 'true');

  const label = document.createElement('p');
  label.className = 'safe-zone-label';
  label.dataset.testid = 'safe-zone-label';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = SAFE_ZONE.label;

  return { frame, label };
}
