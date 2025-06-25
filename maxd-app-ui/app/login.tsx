import { useState } from 'react'
import { Alert } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { useThemeName, YStack, Input, Text, Button, Spinner } from 'tamagui'
import { router } from 'expo-router'

export default function LoginScreen() {
  const { login } = useAuth()
  const theme = useThemeName()
  const isDark = theme === 'dark'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      await login(email, password)
      router.replace('/')
    } catch (err: any) {
      Alert.alert('Login failed', err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack
      f={1}
      jc="center"
      ai="center"
      p="$4"
      bg="$background"
      gap="$4"
      w="100%"
    >
      <Text fontSize="$9" fontWeight="700">
        Log In
      </Text>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        size="$6"
        fontSize="$5"
        w="100%"
         returnKeyType="done"
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        size="$6"
        fontSize="$5"
        w="100%"
         returnKeyType="done"
      />

      <Button
        size="$4"
        theme="active"
        onPress={handleLogin}
        disabled={loading}
        w="100%"
      >
        {loading ? <Spinner size="small" color="$color" /> : 'Login'}
      </Button>

      <Text
        fontSize="$4"
        color="$blue10"
        mt="$2"
        onPress={() => router.push('/signup')}
      >
        Don’t have an account? Sign up
      </Text>
    </YStack>
  )
}
