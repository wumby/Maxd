import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PortalProvider, TamaguiProvider } from 'tamagui'
import config from '../tamagui.config'
import { ToastContextProvider } from '@/contexts/ToastContextProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { StyleSheet } from 'react-native'
import { PreferencesProvider, usePreferences } from '@/contexts/PreferencesContext'
import { TabTransitionProvider } from '@/contexts/TabTransitionContext'

function InnerApp() {
  const { theme } = usePreferences()

  return (
    <TamaguiProvider config={config} defaultTheme={theme}>
      <PortalProvider>
        <ToastContextProvider>
          <AuthProvider>
            <Slot />
          </AuthProvider>
        </ToastContextProvider>
      </PortalProvider>
    </TamaguiProvider>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <PreferencesProvider>
        <TabTransitionProvider>
          <InnerApp />
        </TabTransitionProvider>
      </PreferencesProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
})
