import { XStack, Button, Text, View, useTheme } from 'tamagui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { useRouter } from 'expo-router'

export function ScreenHeader({
  title,
  onBack,
  rightButton,
}: {
  title: string
  onBack?: () => void
  rightButton?: React.ReactNode
}) {
  const router = useRouter()
  const theme = useTheme()

  return (
    <XStack jc="space-between" ai="center" mb="$5">
      {/* Back Button */}
      <Button size="$4" chromeless onPress={onBack || router.back} px="$2" borderRadius="$6">
        <XStack ai="center" gap="$2">
          <ChevronLeft size={24} color={theme.color.val} />
        </XStack>
      </Button>

      {/* Centered Title */}
      <Animated.View entering={FadeInUp.duration(400)}>
        <Text fontSize="$9" fontWeight="900" ta="center" color="$color">
          {title}
        </Text>
      </Animated.View>

      {/* Right-side button or spacer */}
      {rightButton ? rightButton : <View style={{ width: 48 }} />}
    </XStack>
  )
}
