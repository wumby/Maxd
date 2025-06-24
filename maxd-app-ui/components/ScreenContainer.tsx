import { YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets()

  return (
    <YStack f={1} pt={insets.top} px="$4" bg="$background">
      {children}
    </YStack>
  )
}
