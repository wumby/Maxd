import { YStack, Text, Button } from 'tamagui'
import { ScrollView } from 'react-native'

export function FavoritesTab({
  saved,
  loading,
  onSelectTemplate,
}: {
  saved: any[]
  loading: boolean
  onSelectTemplate: (template: any) => void
}) {
  return (
    <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
      <YStack gap="$3">
        {loading && <Text>Loading...</Text>}

        {!loading && saved.length === 0 && (
          <Text color="$gray10" fontSize="$4" textAlign="center">
            No saved workouts yet.
          </Text>
        )}

        {!loading && saved.length > 0 && (
          <YStack>
            <Text fontSize="$7" textAlign="left" mb="$3">
              Select a Favorite
            </Text>
            <Text fontSize="$3" color="$gray10" textAlign="left">
              Selecting will use that workout as a template
            </Text>
          </YStack>
        )}

        {saved.map(template => (
          <Button key={template.id} onPress={() => onSelectTemplate(template)}>
            {template.title}
          </Button>
        ))}
      </YStack>
    </ScrollView>
  )
}
