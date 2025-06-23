import { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert, useColorScheme } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>Log In</Text>

      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Email"
        placeholderTextColor={isDark ? '#aaa' : '#888'}
        onChangeText={setEmail}
        autoCapitalize="none"
        value={email}
      />

      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Password"
        placeholderTextColor={isDark ? '#aaa' : '#888'}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  containerDark: {
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    color: '#111',
  },
  titleDark: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
})
