/**
 * Single Home rail poster tile — focus affordance + placeholder→upgrade src.
 */

import Blits from '@lightningjs/blits'

export const RailTile = Blits.Component('RailTile', {
  template: `
    <Element
      :w="$tileW + 16"
      :h="$tileH + 16"
      :scale.transition="{value: $scale, duration: 150}"
    >
      <!-- Focus ring: amber, must read at 10-foot / Safe Zone -->
      <Element
        w="$tileW + 16"
        h="$posterH + 16"
        :color="$ringColor"
      />
      <!--
        Placeholder color always under; Image src only when upgraded (focus±N).
        Empty src keeps Lightning from holding a full poster texture.
      -->
      <Element
        x="8"
        y="8"
        w="$tileW"
        h="$posterH"
        :color="$item.color"
      >
        <Element
          w="$tileW"
          h="$posterH"
          :src="$item.src"
          :show="$item.upgraded"
          color="#ffffffff"
        />
        <Text
          :content="$item.title"
          x="12"
          y="12"
          size="22"
          color="#e8ecf3"
          :maxwidth="$tileW - 24"
          maxlines="3"
          lineheight="28"
          :show="!$item.upgraded"
        />
      </Element>
      <Text
        :content="$badge"
        x="8"
        :y="$posterH + 20"
        size="16"
        :color="$labelColor"
        :maxwidth="$tileW"
        maxlines="1"
        lineheight="20"
      />
    </Element>
  `,
  props: ['item', 'focused', 'tileW', 'tileH', 'posterH'],
  state() {
    return {
      scale: 1,
    }
  },
  computed: {
    ringColor() {
      return this.focused ? '#fbbf24' : '#00000000'
    },
    labelColor() {
      return this.focused ? '#fbbf24' : '#9aa4b2'
    },
    badge() {
      const tier = this.item.upgraded ? 'FULL' : 'cheap'
      return `${this.item.title} · ${tier}`
    },
  },
  watch: {
    focused() {
      this.scale = this.focused ? 1.08 : 1
    },
  },
  hooks: {
    ready() {
      this.scale = this.focused ? 1.08 : 1
    },
  },
})
