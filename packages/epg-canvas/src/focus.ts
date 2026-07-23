import type { Program } from '@tvshell/shared';

type TimedProgram = {
  program: Program;
  startMs: number;
  endMs: number;
};

function parseProgram(program: Program): TimedProgram | null {
  const startMs = Date.parse(program.start);
  const endMs = Date.parse(program.end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || !(endMs > startMs)) {
    return null;
  }
  return { program, startMs, endMs };
}

/** Programs on a channel, sorted by start ascending. */
export function programsOnChannel(
  channelId: string,
  list: readonly Program[],
): TimedProgram[] {
  const timed: TimedProgram[] = [];
  for (const program of list) {
    if (program.channelId !== channelId) {
      continue;
    }
    const parsed = parseProgram(program);
    if (parsed) {
      timed.push(parsed);
    }
  }
  timed.sort((a, b) => a.startMs - b.startMs);
  return timed;
}

/**
 * Program covering `timeMs` on `channelId` using half-open `[start, end)` —
 * same rule as the canvas focus highlight.
 */
export function findProgramAt(
  channelId: string,
  timeMs: number,
  list: readonly Program[],
): Program | null {
  for (const program of list) {
    if (program.channelId !== channelId) {
      continue;
    }
    const parsed = parseProgram(program);
    if (!parsed) {
      continue;
    }
    if (timeMs >= parsed.startMs && timeMs < parsed.endMs) {
      return parsed.program;
    }
  }
  return null;
}

/** Index of the program covering `timeMs`, or -1. */
export function indexOfProgramAt(
  channelPrograms: readonly TimedProgram[],
  timeMs: number,
): number {
  return channelPrograms.findIndex(
    (item) => timeMs >= item.startMs && timeMs < item.endMs,
  );
}

/**
 * Focus time for an adjacent program on the same channel.
 * Lands at program start so the cell highlight is unambiguous.
 * Returns null when there is no neighbor in that direction.
 */
export function adjacentProgramFocusTime(
  channelId: string,
  timeMs: number,
  list: readonly Program[],
  direction: 'left' | 'right',
): number | null {
  const channelPrograms = programsOnChannel(channelId, list);
  if (channelPrograms.length === 0) {
    return null;
  }

  let index = indexOfProgramAt(channelPrograms, timeMs);
  if (index < 0) {
    // Between/outside cells: pick nearest edge in the travel direction.
    if (direction === 'right') {
      const next = channelPrograms.find((item) => item.startMs > timeMs);
      return next ? next.startMs : null;
    }
    for (let i = channelPrograms.length - 1; i >= 0; i -= 1) {
      if (channelPrograms[i].endMs <= timeMs) {
        return channelPrograms[i].startMs;
      }
    }
    return null;
  }

  const neighborIndex = direction === 'left' ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= channelPrograms.length) {
    return null;
  }
  return channelPrograms[neighborIndex].startMs;
}
