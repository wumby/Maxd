import { createTamagui } from 'tamagui'
import { config as tamaguiConfig } from '@tamagui/config'
import { createAnimations } from '@tamagui/animations-css'

const config = createTamagui({
  ...tamaguiConfig,
  animations: createAnimations({
    fast: 'ease-in 150ms',
    medium: 'ease-in 300ms',
    slow: 'ease-in 450ms',
    jiggle: 'ease-in-out 150ms',
  }),

  themeClassNameOnRoot: false,
})

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default config
