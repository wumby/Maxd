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
} from 'tamagui'
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { LogOut, Trash2 } from '@tamagui/lucide-icons'
import { API_URL } from '@/env'
import { usePreferences } from '@/contexts/PreferencesContext'
import { ScreenContainer } from '@/components/ScreenContainer'

export default function ProfileTab() {
  const { user, token, logout, updateUser } = useAuth()
  const { weightUnit, setWeightUnit } = usePreferences()
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

  return (
    <ScreenContainer>
      <YStack f={1} bg="$background" p="$4" space="$4" pt="$6">
        <XStack w="100%" maxWidth={400} ai="center" jc="center" px={4}>
          <Text fontSize="$9" fontWeight="700">
            Your Profile
          </Text>
        </XStack>

        <Card elevate p="$4" w="100%" maxWidth={400} br="$6" bg="$gray2" gap="$3">
          <>
            <XStack ai="center" jc="space-between" mb="$2">
              <Text fontSize="$6" fontWeight="700">
                User Info
              </Text>
              {!editMode && (
                <Button
                  onPress={() => setEditMode(true)}
                  size="$4"
                  chromeless
                  px={0}
                  py={0}
                  h="auto"
                  minHeight="auto"
                >
                  <Text fontSize="$5" fontWeight="600">
                    Edit
                  </Text>
                </Button>
              )}
            </XStack>

            <Separator />

            {/* Name Row */}
            <XStack ai="center" jc="flex-start" mb="$2">
              <Text fontSize="$6" color="$gray12" w={80}>
                Name:
              </Text>
              {editMode ? (
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Name"
                  maxLength={30}
                  returnKeyType="done"
                  fontSize="$6"
                  p={5}
                  w="70%"
                  backgroundColor="transparent"
                />
              ) : (
                <Text fontSize="$6" fontWeight="600">
                  {user?.name || 'Unknown'}
                </Text>
              )}
            </XStack>

            {/* Email Row */}
            <XStack ai="center" jc="flex-start">
              <Text fontSize="$6" color="$gray12" w={80}>
                Email:
              </Text>
              {editMode ? (
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  returnKeyType="done"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  fontSize="$6"
                  p={5}
                  w="70%"
                  backgroundColor="transparent"
                />
              ) : (
                <Text fontSize="$6" fontWeight="600">
                  {user?.email || 'Unknown'}
                </Text>
              )}
            </XStack>
          </>
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
        </Card>

        {!editMode && (
          <Button icon={LogOut} size="$4" mt="$4" theme="active" onPress={logout}>
            Log Out
          </Button>
        )}
        {editMode && (
          <>
            <XStack jc="center" gap="$3" mt="$4">
              <Button size="$5" onPress={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button size="$5" theme="active" onPress={handleSave} disabled={loading}>
                Save
              </Button>
            </XStack>

            <Button icon={Trash2} size="$4" mt="$9" theme="red" onPress={handleDelete}>
              Delete Profile
            </Button>
          </>
        )}
      </YStack>
    </ScreenContainer>
  )
}
