// components/ConfirmModal.tsx
import { Modal, View } from 'react-native'
import { YStack, Text, Button, XStack } from 'tamagui'

interface ConfirmModalProps {
  visible: boolean
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmModal({ visible, title, message, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <YStack bg="$background" p="$4" br="$4" w="100%" maxWidth={400} gap="$4">
          <Text fontSize="$6" fontWeight="700">
            {title}
          </Text>
          <Text color="$gray10">{message}</Text>
          <XStack gap="$2">
            <Button flex={1} onPress={onCancel}>
              Cancel
            </Button>
            <Button theme="active" flex={1} onPress={onConfirm}>
              Delete
            </Button>
          </XStack>
        </YStack>
      </View>
    </Modal>
  )
}
