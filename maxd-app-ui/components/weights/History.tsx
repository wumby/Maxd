import React, { useState, useMemo } from 'react'
import { YStack, Text, XStack, Card, Input, Button, useThemeName, useTheme } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft, Edit3, Trash2 } from '@tamagui/lucide-icons'
import { Pressable, FlatList, Dimensions, Modal, View, ScrollView } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { useAuth } from '@/contexts/AuthContext'
import { YearFilterItem } from './YearFilterItem'
import { useToast } from '@/contexts/ToastContextProvider'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'
import { deleteWeightEntry, updateWeightEntry } from '@/services/weightService'

interface WeightEntry {
  id: number
  value: number
  created_at: string
}

interface HistoryProps {
  visible: boolean
  onClose: () => void
  weights: WeightEntry[]
  setWeights: React.Dispatch<React.SetStateAction<WeightEntry[]>>
}

const HistoryItem = React.memo(
  ({
    item,
    prev,
    index,
    editMode,
    theme,
    onEdit,
    onDelete,
    goalMode,
  }: {
    item: WeightEntry
    prev: WeightEntry | undefined
    index: number
    editMode: boolean
    theme: ReturnType<typeof useTheme>
    onEdit: (w: WeightEntry) => void
    onDelete: (id: number) => void
    goalMode?: string
  }) => {
    const delta = prev ? item.value - prev.value : 0
    const screenWidth = Dimensions.get('window').width
    const { weightUnit } = usePreferences()

    const convertWeight = (val?: number | string) => {
      const num = typeof val === 'number' ? val : parseFloat(val!)
      if (isNaN(num)) {
        console.warn('Invalid weight value:', val)
        return '--'
      }
      const converted = weightUnit === 'lb' ? WeightUtil.kgToLbs(num) : num
      return converted.toFixed(1)
    }

  const getDeltaColor = () => {
  if (!prev) return '$gray10'
  if (goalMode === 'track') return theme.color.val
  if (delta === 0) return '$gray10'
  if (goalMode === 'lose') return delta < 0 ? 'green' : 'red'
  if (goalMode === 'gain') return delta > 0 ? 'green' : 'red'
  return '$gray10'
}


    return (
      <Animated.View entering={FadeInUp.duration(300).delay(index * 40)}>
        <Card p="$4" mb="$4" elevate bg="$color2" br="$6" width={screenWidth - 32}>
          <XStack jc="space-between" ai="center">
            <YStack>
              <Text fontSize="$6" fontWeight="700" color="$color">
                {convertWeight(item.value)} {weightUnit}
              </Text>
              <Text fontSize="$3" color="$gray10">
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </YStack>

            {editMode ? (
              <XStack gap="$5">
                <Pressable onPress={() => onEdit(item)}>
                  <Edit3 size={20} color={theme.color.val} />
                </Pressable>
                <Pressable onPress={() => onDelete(item.id)}>
                  <Trash2 size={20} color="red" />
                </Pressable>
              </XStack>
            ) : prev ? (
              <Text color={getDeltaColor()} fontSize="$3">
                {delta === 0
                  ? '±0'
                  : `${delta > 0 ? '+' : '−'}${convertWeight(Math.abs(delta))} ${weightUnit}`}
              </Text>
            ) : null}
          </XStack>
        </Card>
      </Animated.View>
    )
  }
)
HistoryItem.displayName = 'HistoryItem'

export default function History({ visible, onClose, weights, setWeights }: HistoryProps) {
  const { user } = useAuth()
  const goalMode = user?.goal_mode
  const insets = useSafeAreaInsets()
  const isDark = useThemeName() === 'dark'
  const theme = useTheme()
  const bgColor = theme.background.val
  const currentYear = new Date().getFullYear().toString()
  const [filter, setFilter] = useState<'All Years' | string>(currentYear)
  const [range, setRange] = useState<'all' | '30d' | '3mo'>('3mo')
  const [editMode, setEditMode] = useState(false)
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null)
  const [editInput, setEditInput] = useState('')
  const { token } = useAuth()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const { showToast } = useToast()
  const { weightUnit } = usePreferences()
  const years = useMemo(() => {
    const uniqueYears = new Set(weights.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [weights])

  const rangeCutoff = useMemo(() => {
    const selectedYearWeights = weights.filter(w => {
      const date = new Date(w.created_at)
      return filter === 'All Years' || date.getFullYear().toString() === filter
    })

    if (selectedYearWeights.length === 0 || range === 'all') return null

    const latestDate = new Date(
      Math.max(...selectedYearWeights.map(w => new Date(w.created_at).getTime()))
    )

    const cutoff = new Date(latestDate)
    if (range === '30d') {
      cutoff.setDate(cutoff.getDate() - 30)
    } else if (range === '3mo') {
      cutoff.setMonth(cutoff.getMonth() - 3)
    }
    return cutoff
  }, [weights, filter, range])

  const filtered = useMemo(() => {
    return weights.filter(w => {
      const date = new Date(w.created_at)
      const matchYear = filter === 'All Years' || date.getFullYear().toString() === filter
      const matchRange = !rangeCutoff || date >= rangeCutoff
      return matchYear && matchRange
    })
  }, [filter, weights, rangeCutoff])

  const handleDelete = async (id: number) => {
    try {
      await deleteWeightEntry(token!, id)
      setWeights(prev => prev.filter(w => w.id !== id))
      showToast('Weight successfully deleted!')
    } catch (err) {
      console.error('Failed to delete weight:', err)
    }
  }

  const confirmDelete = (id: number) => {
    setConfirmId(id)
  }

  const handleEditStart = (weight: WeightEntry) => {
    setEditingWeight(weight)

    const inputVal =
      weightUnit === 'lb' ? WeightUtil.kgToLbs(weight.value).toFixed(1) : weight.value.toString()

    setEditInput(inputVal)
  }

  const handleEditSave = async () => {
    if (!editingWeight || editInput.trim() === '' || isNaN(Number(editInput))) return
    const parsedValue = Number(editInput)
    const valueInKg = weightUnit === 'lb' ? WeightUtil.lbsToKg(parsedValue) : parsedValue
    try {
      const updated = await updateWeightEntry(token!, editingWeight.id, valueInKg)
      setWeights(prev =>
        prev.map(w =>
          w.id === editingWeight.id
            ? { ...w, value: updated.value, created_at: updated.created_at }
            : w
        )
      )
      setEditingWeight(null)
      setEditInput('')
    } catch (err) {
      console.error('Failed to update weight:', err)
    }
  }

  if (!visible) return null

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={100}
      bg={bgColor}
      paddingTop={insets.top}
    >
      <YStack px="$4" pt="$4" pb="$2">
        <XStack jc="space-between" ai="center" mb="$3">
          <Pressable onPress={onClose} hitSlop={10}>
            <XStack fd="row" ai="center" gap="$2">
              <ChevronLeft size={20} color={theme.color.val} />
              <Text fontSize="$5" fontWeight="600" color="$color">
                Back
              </Text>
            </XStack>
          </Pressable>

          <Pressable onPress={() => setEditMode(!editMode)} hitSlop={10}>
            <Text fontSize="$5" fontWeight="600" color="$color">
              {editMode ? 'Done' : 'Edit'}
            </Text>
          </Pressable>
        </XStack>

        <Animated.View entering={FadeInUp.duration(400)}>
          <Text fontSize="$9" fontWeight="900" ta="center" mb="$3" color="$color">
            Weight History
          </Text>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <XStack gap="$2" mb="$3">
            {['All Years', ...years.map(String)].map(val => (
              <YearFilterItem
                key={val}
                val={val}
                selected={filter === val}
                onPress={() => setFilter(val)}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <XStack gap="$2" mb="$4">
            {[
              { label: 'All Days', val: 'all' },
              { label: 'Last 3 Months', val: '3mo' },
              { label: 'Last 30 Days', val: '30d' },
            ].map(opt => (
              <YearFilterItem
                key={opt.val}
                val={opt.label}
                selected={range === opt.val}
                onPress={() => setRange(opt.val as any)}
                isDark={isDark}
              />
            ))}
          </XStack>
        </ScrollView>

        <Text fontSize="$2" color="$gray10" ta="center" mt="$1">
          Showing{' '}
          {range === '30d' ? 'last 30 days' : range === '3mo' ? 'last 3 months' : 'all days'} of{' '}
          {filter === 'all' ? 'all years' : filter}
        </Text>
      </YStack>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text textAlign="center" fontSize="$5" color="$gray10" mt="$6">
            No entries
          </Text>
        }
        renderItem={({ item, index }) => (
          <HistoryItem
            item={item}
            prev={filtered[index + 1]}
            index={index}
            editMode={editMode}
            theme={theme}
            onEdit={handleEditStart}
            onDelete={confirmDelete}
            goalMode={goalMode}
          />
        )}
      />

      {/* Edit Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={!!editingWeight}
        onRequestClose={() => setEditingWeight(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <YStack bg="$background" p="$4" br="$4" w="100%" maxWidth={400} gap="$4">
            <Text fontSize="$6" fontWeight="700" color="$color">
              Edit Weight
            </Text>
            <Input
              keyboardType="numeric"
              placeholder={weightUnit === 'lb' ? 'e.g. 175.5 (lb)' : 'e.g. 79.6 (kg)'}
              value={editInput}
              onChangeText={setEditInput}
              returnKeyType="done"
            />

            <XStack gap="$2">
              <Button flex={1} onPress={() => setEditingWeight(null)}>
                Cancel
              </Button>
              <Button flex={1} onPress={handleEditSave} theme="active">
                Save
              </Button>
            </XStack>
          </YStack>
        </View>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={confirmId !== null}
        onRequestClose={() => setConfirmId(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <YStack bg="$background" p="$4" br="$4" w="100%" maxWidth={400} gap="$4">
            <Text fontSize="$6" fontWeight="700" color="$color">
              Delete Weight
            </Text>
            <Text color="$gray10">Are you sure you want to delete this entry?</Text>
            <XStack gap="$2">
              <Button flex={1} onPress={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button
                theme="active"
                flex={1}
                onPress={() => {
                  if (confirmId !== null) handleDelete(confirmId)
                  setConfirmId(null)
                }}
              >
                Delete
              </Button>
            </XStack>
          </YStack>
        </View>
      </Modal>
    </YStack>
  )
}
