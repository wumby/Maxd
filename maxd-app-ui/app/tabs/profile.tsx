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
import { useState } from 'react'
import { Alert, Pressable } from 'react-native'
import { Sun, Moon, LogOut, Pencil, Trash2 } from '@tamagui/lucide-icons'
import { API_URL } from '@/env'

export default function ProfileTab() {
  const { user, token, logout } = useAuth()
  const [useKg, setUseKg] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

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
          }
        },
      },
    ])
  }

  return (
    <YStack f={1} bg="$background" p="$4" space="$4" jc="center" ai="center">
     <XStack w="100%" maxWidth={400} ai="center" jc="space-between" px={4}>
        <Text />
    
  <Text fontSize="$9" fontWeight="700">
    Your Profile
  </Text>

  
  
  <Pressable onPress={() => setEditMode((v) => !v)} hitSlop={10}>
             <XStack fd="row" ai="center" gap="$2">
               <Text fontSize="$5" fontWeight="600">
                 {editMode ? 'Cancel' : 'Edit'}
               </Text>
             </XStack>
           </Pressable>
</XStack>


      <Card elevate p="$4" w="100%" maxWidth={400} br="$6" bg="$gray2" gap="$3">
        {editMode ? (
          <>
            <Input placeholder="Name" value={name} onChangeText={setName} maxLength={30}  returnKeyType="done" />
            <Input placeholder="Email" value={email} onChangeText={setEmail}  returnKeyType="done" />
          </>
        ) : (
          <>
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

        <XStack ai="center" jc="space-between">
          <Text fontSize="$5">Use Kilograms</Text>
          <Switch size="$3" checked={useKg} onCheckedChange={setUseKg} />
        </XStack>

        <XStack ai="center" jc="space-between" mt="$3">
          <Text fontSize="$5">Dark Mode</Text>
          <Switch
            size="$3"
            checked={darkMode}
            onCheckedChange={setDarkMode}
            icon={darkMode ? <Moon size={16} /> : <Sun size={16} />}
          />
        </XStack>
      </Card>

      <Separator />

      {editMode && (
        <Button
          icon={Trash2}
          size="$4"
          mt="$4"
          theme="red"
          onPress={handleDelete}
        >
          Delete Profile
        </Button>
      )}

      {!editMode && <Button
        icon={LogOut}
        size="$4"
        mt="$4"
        theme="active"
        onPress={logout}
      >
        Log Out
      </Button>}
    </YStack>
  )
}
