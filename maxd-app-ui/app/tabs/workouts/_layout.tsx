import { Stack } from 'expo-router'

export default function WorkoutsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    />
  )
}
