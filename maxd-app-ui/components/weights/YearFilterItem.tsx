import { Animated, Pressable } from 'react-native'
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Card, Text } from 'tamagui'

export function YearFilterItem({
  val,
  selected,
  onPress,
  isDark,
}: {
  val: string
  selected: boolean
  onPress: () => void
  isDark: boolean
}) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onPressIn={() => (scale.value = withTiming(0.95, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 100 }))}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>
        <Card
          px="$4"
          py="$2"
          br="$10"
          bg={selected ? (isDark ? '#333' : '#e5e7eb') : 'transparent'}
          borderWidth={1}
          borderColor={selected ? '$gray8' : '$gray5'}
        >
          <Text
            fontWeight="600"
            fontSize="$2"
            color={selected ? (isDark ? 'white' : 'black') : '$gray10'}
          >
            {val === 'all' ? 'All' : val}
          </Text>
        </Card>
      </Animated.View>
    </Pressable>
  )
}
