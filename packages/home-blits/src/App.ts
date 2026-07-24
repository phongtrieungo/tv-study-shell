/**
 * Focusable horizontal Home rail (Stories 4.2–4.3).
 * Shared fixtures → one rail; Left/Right clamp; placeholder→upgrade textures.
 */

import Blits from '@lightningjs/blits'
import {
  featuredRailTiles,
  RAIL_PAD_X,
  RAIL_PAD_Y,
  TILE_GAP,
  TILE_H,
  TILE_STEP,
  TILE_W,
  POSTER_H,
  type HomeTile,
} from './placeholders.js'
import { RailTile } from './RailTile.js'
import {
  TEXTURE_POLICY,
  TEXTURE_WINDOW,
  getTextureStats,
  tilesWithTextureSrc,
} from './texture-lifecycle.js'

export type HomeAppOptions = {
  stageW: number
  stageH: number
}

/**
 * Keep the focused tile inside the visible stage (clamp scroll — no wrap).
 */
export function railOffsetForFocus(
  focused: number,
  stageW: number,
  itemCount: number,
): number {
  const focusedLeft = RAIL_PAD_X + focused * TILE_STEP
  const focusedRight = focusedLeft + TILE_W
  const margin = 40
  let offset = 0

  if (focusedRight + margin > stageW) {
    offset = stageW - margin - focusedRight
  }
  if (focusedLeft + offset < margin) {
    offset = margin - focusedLeft
  }

  const contentW = RAIL_PAD_X * 2 + itemCount * TILE_W + Math.max(0, itemCount - 1) * TILE_GAP
  const minOffset = Math.min(0, stageW - contentW)
  return Math.max(minOffset, Math.min(0, offset))
}

export function createHomeApp(options: HomeAppOptions) {
  const baseTiles: HomeTile[] = featuredRailTiles()
  const stageW = options.stageW
  const stageH = options.stageH

  return Blits.Application({
    components: { RailTile },
    template: `
      <Element w="${stageW}" h="${stageH}" color="#1a2332">
        <Text
          content="Featured"
          x="${RAIL_PAD_X}"
          y="24"
          size="28"
          color="#e8ecf3"
        />
        <Element :x.transition="{value: $railX, duration: 200}" y="${RAIL_PAD_Y}">
          <RailTile
            :for="(item, index) in $items"
            key="$item.itemId"
            :item="$item"
            :focused="$index === $focused"
            :x="$index * ${TILE_STEP}"
            :tileW="${TILE_W}"
            :tileH="${TILE_H}"
            :posterH="${POSTER_H}"
          />
        </Element>
        <Text
          :content="$hud"
          x="${RAIL_PAD_X}"
          :y="${stageH - 40}"
          size="18"
          color="#9aa4b2"
        />
      </Element>
    `,
    state() {
      return {
        focused: 0,
        items: tilesWithTextureSrc(0, baseTiles),
      }
    },
    computed: {
      railX() {
        return railOffsetForFocus(this.focused, stageW, this.items.length)
      },
      hud() {
        const n = this.items.length
        const title = this.items[this.focused]?.title ?? ''
        const stats = getTextureStats()
        return `Focus ${this.focused + 1}/${n} · ${title} · FULL ${stats.loadedFull} (peak ${stats.peakLoaded}) · ±${TEXTURE_WINDOW} · Esc Back`
      },
    },
    methods: {
      applyTextureWindow() {
        this.items = tilesWithTextureSrc(this.focused, baseTiles)
        const stats = getTextureStats()
        console.info('[home] textures', {
          policy: TEXTURE_POLICY,
          window: TEXTURE_WINDOW,
          focused: this.focused,
          loadedFull: stats.loadedFull,
          peakLoaded: stats.peakLoaded,
        })
      },
    },
    hooks: {
      ready() {
        this.applyTextureWindow()
      },
    },
    watch: {
      focused() {
        this.applyTextureWindow()
      },
    },
    input: {
      left() {
        this.focused = Math.max(0, this.focused - 1)
      },
      right() {
        this.focused = Math.min(this.items.length - 1, this.focused + 1)
      },
      up() {},
      down() {},
      // Do NOT handle back / escape — Shell owns Back → host.leave().
    },
  })
}
