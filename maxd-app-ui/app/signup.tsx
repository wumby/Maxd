import { useState } from 'react'
import { Alert, Pressable } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { API_URL } from '@/env'
import { router } from 'expo-router'
import { YStack, Input, Button, Text, Spinner, Separator } from 'tamagui'

export default function SignupScreen() {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing fields', 'Please fill out all fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      await login(email, password)
      router.replace('/')
    } catch (err: any) {
      Alert.alert('Signup Error', err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" bg="$background" gap="$4" w="100%">
      <Text fontSize="$9" fontWeight="700">
        Create Account
      </Text>

      <Input
        placeholder="Name"
        value={name}
        onChangeText={setName}
        maxLength={30}
        size="$6"
        autoCapitalize="words"
        w={'100%'}
        returnKeyType="done"
      />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        size="$6"
        autoCapitalize="none"
        keyboardType="email-address"
        w={'100%'}
        returnKeyType="done"
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        size="$6"
        w={'100%'}
        returnKeyType="done"
      />

      <Button size="$4" theme="active" onPress={handleSignup} disabled={loading}>
        {loading ? <Spinner size="small" color="$color" /> : 'Sign Up'}
      </Button>

      <Separator />
      <Pressable hitSlop={15} onPress={() => router.push('/login')}>
        <Text fontSize="$4" color="$blue10">
          Already have an account? Log in
        </Text>
      </Pressable>
    </YStack>
  )
}
