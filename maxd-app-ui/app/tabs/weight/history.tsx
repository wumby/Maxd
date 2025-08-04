import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { deleteWeightEntry, fetchWeights, updateWeightEntry } from '@/services/weightService'
import { Fallback } from '@/components/Fallback'
import { useRouter } from 'expo-router'
import { YStack, useThemeName } from 'tamagui'
import { ScreenContainer } from '@/components/ScreenContainer'
import { ScreenHeader } from '@/components/ScreenHeader'
import { WeightEntry } from '@/types/Weight'
import WeightUtil from '@/util/weightConversion'
import { usePreferences } from '@/contexts/PreferencesContext'
import { EditWeightSheet } from '@/components/weights/EditWeightSheet'
import { ConfirmDeleteSheet } from '@/components/ConfirmDeleteSheet'
import { WeightActionSheet } from '@/components/weights/WeightActionSheet'
import { WeightFilterControls } from '@/components/weights/WeightFilterControls'

const History = lazy(() => import('@/components/weights/History'))

export default function HistoryPage() {
  const { token } = useAuth()
  const [weights, setWeights] = useState<{ id: number; value: number; created_at: string }[]>([])
  const [filter, setFilter] = useState<'All Years' | string>(new Date().getFullYear().toString())
  const [range, setRange] = useState<'all' | '30d' | '3mo'>('3mo')
  const isDark = useThemeName() === 'dark'
  const router = useRouter()
  const [editWeight, setEditWeight] = useState<WeightEntry | null>(null)
  const [editInput, setEditInput] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const { weightUnit } = usePreferences()
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [selectedWeight, setSelectedWeight] = useState<WeightEntry | null>(null)

  useEffect(() => {
    if (!token) return
    const loadWeights = async () => {
      try {
        const data = await fetchWeights(token)
        setWeights(data)
      } catch (err) {
        console.error('Error fetching weights:', err)
        setWeights([])
      }
    }
    loadWeights()
  }, [token])

  const years = useMemo(() => {
    const uniqueYears = new Set(weights.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [weights])

  const rangeCutoff = useMemo(() => {
    if (range === 'all' || filter === 'All Years') return null
    const selected = weights.filter(w => {
      const d = new Date(w.created_at)
      return d.getFullYear().toString() === filter
    })
    if (selected.length === 0) return null
    const latest = new Date(Math.max(...selected.map(w => new Date(w.created_at).getTime())))
    const cutoff = new Date(latest)
    if (range === '30d') cutoff.setDate(cutoff.getDate() - 30)
    if (range === '3mo') cutoff.setMonth(cutoff.getMonth() - 3)
    return cutoff
  }, [weights, filter, range])

  const filteredWeights = useMemo(() => {
    return weights.filter(w => {
      const d = new Date(w.created_at)
      const matchYear = filter === 'All Years' || d.getFullYear().toString() === filter
      const matchRange = !rangeCutoff || d >= rangeCutoff
      return matchYear && matchRange
    })
  }, [weights, filter, rangeCutoff])
  const handleEditStart = (weight: WeightEntry) => {
    setSelectedWeight(weight) // used only for the action sheet
    setActionSheetOpen(true)
  }

  const handleEditSave = async () => {
    if (!editWeight || !editInput.trim() || isNaN(Number(editInput))) return
    const parsed = Number(editInput)
    const valueInKg = weightUnit === 'lb' ? WeightUtil.lbsToKg(parsed) : parsed

    try {
      const updated = await updateWeightEntry(token!, editWeight.id, valueInKg)
      setWeights(prev =>
        prev.map(w =>
          w.id === editWeight.id
            ? { ...w, value: updated.value, created_at: updated.created_at }
            : w
        )
      )
      setEditWeight(null)
      setEditInput('')
    } catch (err) {
      console.error('Edit failed:', err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteWeightEntry(token!, id)
      setWeights(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <ScreenContainer>
      <YStack pt="$4" pb="$2">
        <ScreenHeader title="Weight History" />
        <WeightFilterControls
          years={years}
          filter={filter}
          setFilter={setFilter}
          range={range}
          setRange={setRange}
          isDark={isDark}
        />
      </YStack>

      <Suspense fallback={<Fallback />}>
        <History
          visible
          onClose={router.back}
          weights={filteredWeights}
          setWeights={setWeights}
          onEdit={handleEditStart}
          onDelete={setConfirmId}
        />
      </Suspense>
      <EditWeightSheet
        open={!!editWeight}
        onOpenChange={() => {
          setEditWeight(null)
          setSelectedWeight(null)
        }}
        weightUnit={weightUnit}
        value={editInput}
        onChange={setEditInput}
        onCancel={() => {
          setEditWeight(null)
          setSelectedWeight(null)
        }}
        onSave={handleEditSave}
      />

      <ConfirmDeleteSheet
        open={confirmId !== null}
        onOpenChange={() => setConfirmId(null)}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId !== null) handleDelete(confirmId)
          setConfirmId(null)
        }}
        title="Delete Weight"
        message="Are you sure you want to delete this entry?"
      />
      <WeightActionSheet
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        onEdit={() => {
          if (!selectedWeight) return
          const val =
            weightUnit === 'lb'
              ? WeightUtil.kgToLbs(selectedWeight.value).toFixed(1)
              : selectedWeight.value.toString()
          setEditInput(val)
          setEditWeight(selectedWeight)
          setActionSheetOpen(false)
        }}
        onDelete={() => {
          if (selectedWeight) {
            setConfirmId(selectedWeight.id)
            setActionSheetOpen(false)
          }
        }}
        dateLabel={selectedWeight ? new Date(selectedWeight.created_at).toLocaleDateString() : ''}
      />
    </ScreenContainer>
  )
}
