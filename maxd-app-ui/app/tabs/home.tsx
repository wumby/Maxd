import { Text, Card, XStack, Separator, Progress } from 'tamagui'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useFocusEffect } from 'expo-router'
import { Dumbbell, Scale } from '@tamagui/lucide-icons'
import Animated, { useSharedValue, withTiming, FadeIn } from 'react-native-reanimated'
import { useCallback } from 'react'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useIsFocused } from '@react-navigation/native'

export default function HomeTab() {
  const { token, user } = useAuth()
  const router = useRouter()

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

  const isFocused = useIsFocused()

  return (
    <ScreenContainer>
      <Animated.View key={isFocused ? 'focused' : 'unfocused'} entering={FadeIn.duration(500)}>
        <Text fontSize="$10" fontWeight="900" ta="center" mt="$4">
          Maxd
        </Text>
        <Text fontSize="$6" ta="center" color="$gray10" mt="$1" mb="$4">
          {user?.name ? `Welcome, ${user.name}` : 'Let’s get stronger.'}
        </Text>

        {/* Weight Summary Card */}
        <Card elevate p="$4" mb="$4" br="$5" gap="$3">
          <Text fontSize="$6" fontWeight="700">
            Current Weight
          </Text>
          <Text fontSize="$8" fontWeight="800">
            181.2 lb
          </Text>
          <XStack jc="space-between">
            <Text color="$gray10">Target: 175 lb</Text>
            <Text color="$gray10">Streak: 4 days </Text>
          </XStack>
          <Progress value={70} w="100%" mt="$2" />
        </Card>

        {/* Quick Actions */}
        <XStack jc="space-between" gap="$2" mb="$4">
          <Card
            f={1}
            elevate
            p="$3"
            ai="center"
            br="$5"
            pressStyle={{ scale: 0.97 }}
            onPress={() => router.push('/tabs/weight?log=1')}
          >
            <Scale size={22} />
            <Text mt="$2" fontWeight="600">
              Log New Weight
            </Text>
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
            <Dumbbell size={22} />
            <Text mt="$2" fontWeight="600">
              Log New Workout
            </Text>
          </Card>
        </XStack>

        {/* Streak Box */}
        <Card elevate p="$4" br="$5" mb="$4" gap="$2">
          <Text fontSize="$6" fontWeight="700">
            Progress Streak
          </Text>
          <Text color="$gray10">You&apos;ve logged 4 days in a row. Keep going!</Text>
        </Card>

        {/* Footer or Quote */}
        <Separator />
        <Text ta="center" mt="$3" color="$gray9" fontSize="$2">
          “Discipline is doing what needs to be done, even if you don’t want to.”
        </Text>
      </Animated.View>
    </ScreenContainer>
  )
}
