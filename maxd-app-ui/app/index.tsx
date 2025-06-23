import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useRootNavigationState } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'

export default function Index() {
  const { token, authLoaded } = useAuth()
  const router = useRouter()
  const navState = useRootNavigationState()

  const isReady = !!navState?.key

  useEffect(() => {
    if (!isReady || !authLoaded) return

    if (token) {
      router.replace('/tabs/home')
    } else {
      router.replace('/signup')
    }
  }, [isReady, authLoaded, token, router])

  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}
    >
      <ActivityIndicator size="large" color="#fff" />
    </View>
  )
}
