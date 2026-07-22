export type Channel = {
  channelId: string;
  name: string;
  number: number;
};

export type Program = {
  programId: string;
  channelId: string;
  title: string;
  start: string;
  end: string;
};

export type RailItem = {
  itemId: string;
  title: string;
  posterUrl: string;
};

export type Rail = {
  railId: string;
  title: string;
  items: readonly RailItem[];
};
