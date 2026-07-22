export const KEY = {
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Enter: 'Enter',
  Backspace: 'Backspace',
  Escape: 'Escape',
} as const;

export type DpadKey = (typeof KEY)[keyof typeof KEY];
export type DpadAction = 'up' | 'down' | 'left' | 'right' | 'select' | 'back';

const ACTION_BY_KEY: Record<DpadKey, DpadAction> = {
  [KEY.ArrowUp]: 'up',
  [KEY.ArrowDown]: 'down',
  [KEY.ArrowLeft]: 'left',
  [KEY.ArrowRight]: 'right',
  [KEY.Enter]: 'select',
  [KEY.Backspace]: 'back',
  [KEY.Escape]: 'back',
};

export const DPAD_KEYS = Object.freeze([
  KEY.ArrowUp,
  KEY.ArrowDown,
  KEY.ArrowLeft,
  KEY.ArrowRight,
  KEY.Enter,
  KEY.Backspace,
  KEY.Escape,
] as const);

export function isDpadKey(value: string): value is DpadKey {
  return DPAD_KEYS.includes(value as DpadKey);
}

export function isBackKey(value: string): boolean {
  return value === KEY.Backspace || value === KEY.Escape;
}

export function normalizeDpadKey(value: string): DpadAction | null {
  if (!isDpadKey(value)) {
    return null;
  }

  return ACTION_BY_KEY[value];
}

export function getDpadAction(event: Pick<KeyboardEvent, 'key'>): DpadAction | null {
  return normalizeDpadKey(event.key);
}
