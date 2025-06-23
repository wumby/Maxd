import { useState } from 'react'
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { API_URL } from '@/env'

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

    console.log('SIGNUP: button pressed')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      console.log('Signup response body:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      await login(email, password) // reuses login() to get token + user
      console.log('Login after signup successful')
      router.replace('/')
    } catch (err: any) {
      console.error('Signup error:', err)
      Alert.alert('Signup Error', err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#888"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        style={styles.input}
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title={loading ? 'Signing up...' : 'Sign Up'} onPress={handleSignup} />

      <Text style={styles.link} onPress={() => router.push('/login')}>
        Already have an account? Log in
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  link: {
    color: '#0af',
    marginTop: 12,
    textAlign: 'center',
  },
})
