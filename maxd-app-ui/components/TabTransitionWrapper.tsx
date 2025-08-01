import { useTabTransition } from '@/contexts/TabTransitionContext'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useEffect, useCallback } from 'react'
import { Dimensions } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

const SCREEN_WIDTH = Dimensions.get('window').width

export function TabTransitionWrapper({
  tabPosition,
  children,
}: {
  tabPosition: number
  children: React.ReactNode
}) {
  const { tabIndex, prevTabIndex, direction, setTabIndex } = useTabTransition()
  const offset = useSharedValue(direction * SCREEN_WIDTH)

  useFocusEffect(
    useCallback(() => {
      if (tabIndex !== tabPosition) {
        setTabIndex(tabPosition)
      }
    }, [tabIndex, tabPosition])
  )

  useEffect(() => {
    const alwaysAnimate = tabPosition === 0 || tabPosition === 3
    const isActive = tabIndex === tabPosition || prevTabIndex === tabPosition
    if (!alwaysAnimate && !isActive) return
    offset.value = direction * SCREEN_WIDTH
    const timeout = setTimeout(() => {
      offset.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      })
    }, 10)

    return () => clearTimeout(timeout)
  }, [tabIndex, prevTabIndex, direction, tabPosition])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }))

  return <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>
}
