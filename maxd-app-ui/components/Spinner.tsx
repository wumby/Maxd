// Spinner.tsx
import { Dimensions } from 'react-native'
import { YStack, Spinner as TSpinner } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function Spinner() {
  const insets = useSafeAreaInsets()
  const height = Dimensions.get('window').height

  return (
    <YStack h={height} pt={insets.top} px="$4" bg="$background" jc="center" ai="center">
      <TSpinner size="large" />
    </YStack>
  )
}
