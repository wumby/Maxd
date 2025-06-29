import { Tabs } from 'expo-router'
import { Home, Dumbbell, User, Scale } from '@tamagui/lucide-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeName } from 'tamagui'
import { Platform } from 'react-native'

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const isDark = useThemeName() === 'dark'

  const activeTintColor = isDark ? '#E4E4E7' : '#1F2937'
  const inactiveTintColor = isDark ? '#7C7C8A' : '#A3A3A3'
  const backgroundColor = isDark ? 'rgba(20, 20, 20, 0.93)' : 'rgba(255,255,255,0.9)'

  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarStyle: {
          backgroundColor,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
          borderTopColor: borderColor,
          backdropFilter: 'blur(12px)', // iOS only
          // For Android: use blur view component if needed
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <Home color={color} size={focused ? 24 : 22} />,
        }}
      />
      <Tabs.Screen
        name="weight"
        options={{
          title: 'Weight',
          tabBarIcon: ({ color, focused }) => <Scale color={color} size={focused ? 24 : 22} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, focused }) => <Dumbbell color={color} size={focused ? 24 : 22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <User color={color} size={focused ? 24 : 22} />,
        }}
      />
    </Tabs>
  )
}
