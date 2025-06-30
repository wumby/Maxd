// app/_layout.tsx or RootLayout.tsx
import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { TamaguiProvider, Theme } from 'tamagui'
import config from '../tamagui.config'
import { ToastContextProvider } from '@/contexts/ToastContextProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { StyleSheet } from 'react-native'
import { PreferencesProvider, usePreferences } from '@/contexts/PreferencesContext'

function InnerApp() {
  const { theme } = usePreferences()

  return (
    <GestureHandlerRootView style={styles.flex}>
      <TamaguiProvider config={config} defaultTheme={theme}>
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
    <PreferencesProvider>
      <InnerApp />
    </PreferencesProvider>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
})
