import { useAuth } from '@/contexts/AuthContext'
import {
  YStack,
  Text,
  Button,
  Card,
  Separator,
  XStack,
  Switch,
  Input,
  Adapt,
  Select,
  Sheet,
} from 'tamagui'
import React, { useEffect, useState } from 'react'
import { Alert, Pressable } from 'react-native'
import { LogOut, Moon, Sun, Trash2 } from '@tamagui/lucide-icons'
import { API_URL } from '@/env'
import { usePreferences } from '@/contexts/PreferencesContext'

export default function ProfileTab() {
  const { user, token, logout, updateUser } = useAuth()
  const { theme, setTheme, weightUnit, setWeightUnit } = usePreferences()
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editMode && user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [editMode, user])

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Validation', 'Name and email cannot be empty.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      })

      if (!res.ok) throw new Error('Failed to update profile')

      const updatedUser = await res.json()
      await updateUser(updatedUser)
      setEditMode(false)
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Could not update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert('Delete Profile', 'Are you sure you want to permanently delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/users/me`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            if (!res.ok) throw new Error('Failed to delete account')
            logout()
          } catch (err) {
            console.error(err)
            Alert.alert('Error', 'Could not delete account.')
          }
        },
      },
    ])
  }

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <YStack f={1} bg="$background" p="$4" space="$4" jc="center" ai="center">
      <XStack w="100%" maxWidth={400} ai="center" jc="space-between" px={4}>
        <Text />
        <Text fontSize="$9" fontWeight="700">
          Your Profile
        </Text>
        <Pressable onPress={() => setEditMode(v => !v)} hitSlop={10}>
          <XStack fd="row" ai="center" gap="$2">
            <Text fontSize="$5" fontWeight="600">
              {editMode ? '' : 'Edit'}
            </Text>
          </XStack>
        </Pressable>
      </XStack>

      <Card elevate p="$4" w="100%" maxWidth={400} br="$6" bg="$gray2" gap="$3">
        {editMode ? (
          <>
            <Input
              placeholder="Name"
              value={name}
              onChangeText={setName}
              maxLength={30}
              returnKeyType="done"
            />
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              returnKeyType="done"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <XStack jc="center" gap="$3" mt="$3">
              <Button size="$4" disabled={loading} onPress={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button size="$4" theme="active" disabled={loading} onPress={handleSave}>
                Save
              </Button>
            </XStack>
            <Button icon={Trash2} size="$4" mt="$9" theme="red" onPress={handleDelete}>
              Delete Profile
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="$6" fontWeight="700" mb="$2">
              User Info
            </Text>
            <Separator />
            <Text fontSize="$6" color="$gray12">
              Name: <Text fontWeight="600">{user?.name || 'Unknown'}</Text>
            </Text>
            <Text fontSize="$6" color="$gray12">
              Email: <Text fontWeight="600">{user?.email || 'Unknown'}</Text>
            </Text>
          </>
        )}
      </Card>

      <Separator />

      <Card elevate p="$4" w="100%" maxWidth={400} br="$6" bg="$gray2" gap="$3">
        <Text fontSize="$6" fontWeight="700" mb="$2">
          Preferences
        </Text>
        <Separator />

        <XStack ai="center" jc="space-between" mt="$3">
          <Text fontSize="$5">Weight Unit</Text>

          <XStack ai="center" gap="$2">
            <Text fontWeight="700" opacity={weightUnit === 'kg' ? 1 : 0.4}>
              kg
            </Text>
            <Switch
              size="$3"
              checked={weightUnit === 'lb'}
              onCheckedChange={val => setWeightUnit(val ? 'lb' : 'kg')}
              bg="$gray5"
              borderRadius="$10"
            >
              <Switch.Thumb backgroundColor="$color8" />
            </Switch>
            <Text fontWeight="700" opacity={weightUnit === 'lb' ? 1 : 0.4}>
              lb
            </Text>
          </XStack>
        </XStack>

        <XStack ai="center" jc="space-between" mt="$3">
          <Text fontSize="$5">Dark Mode</Text>
          <XStack ai="center" gap="$2">
            <Sun size={16} opacity={theme === 'light' ? 1 : 0.4} />

            <Switch
              size="$3"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
              bg="$gray5" // neutral consistent track color
              borderRadius="$10"
            >
              <Switch.Thumb backgroundColor="$color8" borderRadius={999} />
            </Switch>

            <Moon size={16} opacity={theme === 'dark' ? 1 : 0.4} />
          </XStack>
        </XStack>
      </Card>

      {!editMode && (
        <Button icon={LogOut} size="$4" mt="$4" theme="active" onPress={logout}>
          Log Out
        </Button>
      )}
    </YStack>
  )
}
