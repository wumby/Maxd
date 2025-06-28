import {
  Text,
  XStack,
  Card,
  Separator,
  Button,
  View,
  YStack,
} from 'tamagui'
import { useSharedValue, withTiming, useAnimatedStyle, withRepeat, withSequence } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useState, useEffect } from 'react'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'expo-router'
import { Dumbbell, Scale, Trash2, Plus, ArrowUpRight } from '@tamagui/lucide-icons'
import { useUserWidgets } from '@/hooks/useUserWidgets'
import { AddWidgetModal } from '@/components/AddWidgetModal'
import { CurrentWeightWidget } from '@/components/widgets/CurrentWeightWidget'
import { StreakWidget } from '@/components/widgets/StreakWidget'

function JiggleWrapper({ children, isEditing }: { children: React.ReactNode; isEditing: boolean }) {
  const rotate = useSharedValue(0)

  useEffect(() => {
    if (isEditing) {
      rotate.value = withRepeat(
        withSequence(
          withTiming(-1, { duration: 100 }),
          withTiming(1, { duration: 100 })
        ),
        -1,
        true
      )
    } else {
      rotate.value = withTiming(0, { duration: 150 })
    }
  }, [isEditing])

  const style = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotate.value}deg` }],
  }))

  return <Animated.View style={style}>{children}</Animated.View>
}

export default function HomeTab() {
  const { user } = useAuth()
  const router = useRouter()
  const { layout, setLayout } = useUserWidgets()
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  useFocusEffect(
    useCallback(() => {
      opacity.value = 0
      translateY.value = -20
      opacity.value = withTiming(1, { duration: 250 })
      translateY.value = withTiming(0, { duration: 250 })
    }, [])
  )

  return (
    <ScreenContainer>
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <XStack jc="center" ai="center" px="$4" mt="$4" mb="$3">
          <Text fontSize="$10" fontWeight="900">Maxd</Text>
        </XStack>

        <Text fontSize="$6" ta="center" color="$gray10" mt="$1" mb="$4">
          {user?.name ? `Welcome, ${user.name}` : 'Let’s get stronger.'}
        </Text>

        <View
          px="$4"
          pb="$4"
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            rowGap: 16,
          }}
        >
         <CurrentWeightWidget />
         <StreakWidget />
        </View>

        <XStack jc="space-between" gap="$2" mt="$5" px="$4">
          <Card
            f={1}
            elevate
            p="$3"
            ai="center"
            br="$5"
            pressStyle={{ scale: 0.97 }}
            onPress={() => router.push('/tabs/weight?log=1')}
          >
            <YStack position="absolute" top="$2" right="$2" opacity={0.3}>
    <ArrowUpRight size={18} />
  </YStack>
  <Scale size={22} />
  <Text mt="$2" fontWeight="600">Log New Weight</Text>
          </Card>
          <Card
            f={1}
            elevate
            p="$3"
            ai="center"
            br="$5"
            pressStyle={{ scale: 0.97 }}
            onPress={() => router.push('/tabs/workouts?log=1')}
          >
            <YStack position="absolute" top="$2" right="$2" opacity={0.3}>
              <ArrowUpRight size={18} />
              </YStack>
               <Dumbbell size={22} />
            <Text mt="$2" fontWeight="600">Log New Workout</Text>
            
           
          </Card>
        </XStack>
      </Animated.View>
    </ScreenContainer>
  )
}
