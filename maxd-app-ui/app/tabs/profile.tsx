import { View, Text, StyleSheet, Button } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileTab() {
  const { logout } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Profile</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
  },
})
