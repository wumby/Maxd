import { Tabs } from 'expo-router'
import { Home, BarChart3, Dumbbell, User } from '@tamagui/lucide-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from 'react-native'

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#F5F5F5' : '#1A1A1A',
        tabBarInactiveTintColor: isDark ? '#7C7C7C' : '#A1A1AA',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarStyle: {
          backgroundColor: isDark ? '#0D0D0D' : '#F9FAFB',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          elevation: 0,
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
          tabBarIcon: ({ color, focused }) => <BarChart3 color={color} size={focused ? 24 : 22} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
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
