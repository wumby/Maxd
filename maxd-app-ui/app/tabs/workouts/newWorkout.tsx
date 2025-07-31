import { useRouter } from 'expo-router'
import { Spinner, Text, YStack } from 'tamagui'
import { Suspense } from 'react'
import NewWorkout from '@/components/workouts/NewWorkout'

export default function NewWorkoutPage() {
  const router = useRouter()

  return (
    <Suspense fallback={ <YStack
              f={1}
              minHeight="100%"
              px="$4"
              bg="$background"
              jc="center"
              ai="center"
              position="relative"
            >
              <Spinner size="large" />
            </YStack>}>
      <NewWorkout
        onCancel={() => router.back()}
        onSubmit={() => router.back()}
      />
    </Suspense>
  )
}
