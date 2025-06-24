import { Tabs } from 'expo-router'
import { Home, BarChart3, Dumbbell, User, Scale } from '@tamagui/lucide-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeName } from 'tamagui'

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const isDark = useThemeName() === 'dark'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#1A1A1A' : '#F5F5F5',
        tabBarInactiveTintColor: isDark ? '#A1A1AA' : '#7C7C7C',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarStyle: {
          backgroundColor: isDark ? '#F9FAFB' : '#0D0D0D',
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
