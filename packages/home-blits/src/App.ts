/**
 * Hello-world Blits Application (Story 4.1).
 * No rail yet — proves in-page Launch into Shell host.
 */

import Blits from '@lightningjs/blits'

export const HelloApp = Blits.Application({
  template: `
    <Element w="800" h="450" color="#1a2332">
      <Element x="40" y="40" w="720" h="140" color="#243044" />
      <Element x="40" y="220" w="400" h="48" color="#7dd3fc" />
    </Element>
  `,
})
