import { Text, XStack, Card, View, YStack } from 'tamagui'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'expo-router'
import { Dumbbell, Scale, ArrowUpRight } from '@tamagui/lucide-icons'
import { CurrentWeightWidget } from '@/components/widgets/CurrentWeightWidget'
import { StreakWidget } from '@/components/widgets/StreakWidget'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'

export default function HomeTab() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <ScreenContainer>
      <TabTransitionWrapper tabPosition={0}>
        <XStack jc="center" ai="center" px="$4" mt="$4" mb="$3">
          <Text fontSize="$10" fontWeight="900" color="$accentColor">
            Maxd
          </Text>
        </XStack>
        <Text fontSize="$6" ta="center" color="$color" mt="$1" mb="$4">
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
            bg="$background"
            br="$5"
            pressStyle={{ scale: 0.97 }}
            onPress={() => router.push('/tabs/weight/newWeight')}
          >
            <YStack position="absolute" top="$2" right="$2" opacity={0.3}>
              <ArrowUpRight size={18} color="$accentColor" />
            </YStack>
            <Scale size={22} color="$accentColor" />
            <Text mt="$2" fontWeight="600" color="$color">
              Log New Weight
            </Text>
          </Card>
          <Card
            f={1}
            elevate
            p="$3"
            ai="center"
            bg="$background"
            br="$5"
            pressStyle={{ scale: 0.97 }}
            onPress={() => router.push('/tabs/workouts/newWorkout')}
          >
            <YStack position="absolute" top="$2" right="$2" opacity={0.3}>
              <ArrowUpRight size={18} color="$accentColor" />
            </YStack>
            <Dumbbell size={22} color="$accentColor" />
            <Text mt="$2" fontWeight="600" color="$color">
              Log New Workout
            </Text>
          </Card>
        </XStack>
      </TabTransitionWrapper>
    </ScreenContainer>
  )
}
