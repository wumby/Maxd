import { Stack } from 'expo-router'

export default function WorkoutsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="newWorkout" />
      <Stack.Screen name="workoutHistory" />
      <Stack.Screen name="exercisesHistory" />
      <Stack.Screen name="volume" />
      <Stack.Screen name="progress" />
    </Stack>
  )
}
