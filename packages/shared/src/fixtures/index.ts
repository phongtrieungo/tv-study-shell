import type { Channel, Program, Rail, RailItem } from '../types';

const FIXTURE_DAY_START = '2026-07-22T00:00:00.000Z';
const CHANNEL_COUNT = 50;
const HOME_RAIL_ITEM_COUNT = 12;
const HOURS_PER_CHANNEL = 24;
const PROGRAM_BLOCK_HOURS = 2;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function addHours(isoDate: string, hours: number): string {
  const date = new Date(isoDate);
  date.setUTCHours(date.getUTCHours() + hours);
  return date.toISOString();
}

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach((item) => deepFreeze(item));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => deepFreeze(item));
  }

  return Object.freeze(value);
}

function createChannels(): Channel[] {
  return Array.from({ length: CHANNEL_COUNT }, (_, index) => {
    const number = index + 1;
    return {
      channelId: `channel-${String(number).padStart(2, '0')}`,
      name: `Channel ${number}`,
      number,
    };
  });
}

function createPrograms(channels: readonly Channel[]): Program[] {
  return channels.flatMap((channel) =>
    Array.from({ length: HOURS_PER_CHANNEL / PROGRAM_BLOCK_HOURS }, (_, slotIndex) => {
      const start = addHours(FIXTURE_DAY_START, slotIndex * PROGRAM_BLOCK_HOURS);
      const end = addHours(FIXTURE_DAY_START, (slotIndex + 1) * PROGRAM_BLOCK_HOURS);
      const title = `${channel.name} Show ${slotIndex + 1}`;

      return {
        programId: `${channel.channelId}-${slugify(title)}`,
        channelId: channel.channelId,
        title,
        start,
        end,
      };
    }),
  );
}

function createHomeRailItems(): RailItem[] {
  return Array.from({ length: HOME_RAIL_ITEM_COUNT }, (_, index) => ({
    itemId: `home-item-${String(index + 1).padStart(2, '0')}`,
    title: `Featured Tile ${index + 1}`,
    posterUrl: '',
  }));
}

function createHomeRails(): Rail[] {
  return [
    {
      railId: 'rail-featured',
      title: 'Featured',
      items: createHomeRailItems(),
    },
  ];
}

const rawChannels = createChannels();
const rawPrograms = createPrograms(rawChannels);
const rawHomeRails = createHomeRails();

export const fixtureMeta = deepFreeze({
  dayStart: FIXTURE_DAY_START,
  channelCount: rawChannels.length,
  programCount: rawPrograms.length,
  scheduleHoursPerChannel: HOURS_PER_CHANNEL,
  homeRailCount: rawHomeRails.length,
  homeRailItemCount: rawHomeRails[0]?.items.length ?? 0,
});

export const channels: readonly Channel[] = deepFreeze(rawChannels);
export const programs: readonly Program[] = deepFreeze(rawPrograms);
export const homeRails: readonly Rail[] = deepFreeze(rawHomeRails);

