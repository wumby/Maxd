// app/_layout.tsx or RootLayout.tsx
import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { TamaguiProvider, Theme } from 'tamagui'
import config from '../tamagui.config'
import { ThemeProvider, useThemePreference } from '@/contexts/ThemeContext'
import { ToastContextProvider } from '@/contexts/ToastContextProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { StyleSheet } from 'react-native'

function InnerApp() {
  const { theme } = useThemePreference()

  return (
    <GestureHandlerRootView style={styles.flex}>
      <TamaguiProvider config={config} defaultTheme={theme} key={theme}>
        <ToastContextProvider>
          <Theme name={theme}>
            <AuthProvider>
              <Slot />
            </AuthProvider>
          </Theme>
        </ToastContextProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <InnerApp />
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
})
