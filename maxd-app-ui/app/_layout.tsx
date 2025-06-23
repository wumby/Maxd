import { Slot } from 'expo-router'
import { TamaguiProvider, Theme } from 'tamagui'
import config from '../tamagui.config'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider, useThemePreference } from '@/contexts/ThemeContext'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'
import { ToastContextProvider } from '@/contexts/ToastContextProvider'

function InnerApp() {
  const { theme } = useThemePreference()

  return (
    <GestureHandlerRootView style={styles.flex}>
      <TamaguiProvider config={config}>
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
  flex: {
    flex: 1,
  },
})
