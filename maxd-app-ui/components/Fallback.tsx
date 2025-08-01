import { YStack, Spinner } from 'tamagui'

export function Fallback() {
  return (
    <YStack
      f={1}
      minHeight="100%"
      px="$4"
      bg="$background"
      jc="center"
      ai="center"
      position="relative"
    >
      <Spinner size="large" />
    </YStack>
  )
}
