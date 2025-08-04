import { useState, lazy, Suspense, useMemo, useEffect } from 'react'
import { YStack, useThemeName } from 'tamagui'

import { useAuth } from '@/contexts/AuthContext'
import { usePreferences } from '@/contexts/PreferencesContext'
import { deleteWeightEntry, fetchWeights, updateWeightEntry } from '@/services/weightService'
import { useFetch } from '@/hooks/useFetch'

import { Fallback } from '@/components/Fallback'
import { ScreenContainer } from '@/components/ScreenContainer'
import { ScreenHeader } from '@/components/ScreenHeader'
import { EditWeightSheet } from '@/components/weights/EditWeightSheet'
import { ConfirmDeleteSheet } from '@/components/ConfirmDeleteSheet'
import { WeightActionSheet } from '@/components/weights/WeightActionSheet'
import { WeightFilterControls } from '@/components/weights/WeightFilterControls'

import { WeightEntry } from '@/types/Weight'
import WeightUtil from '@/util/weightConversion'

const History = lazy(() => import('@/components/weights/History'))

export default function HistoryPage() {
  const { weightUnit } = usePreferences()
  const isDark = useThemeName() === 'dark'
  const { token } = useAuth()
  const {
    data: weights = [],
    setData: setWeights,
    execute: loadWeights,
  } = useFetch(fetchWeights, [])
  const [filter, setFilter] = useState<'All Years' | string>(new Date().getFullYear().toString())
  const [year, setYear] = useState<string | 'All Years'>(new Date().getFullYear().toString())
  const [editWeight, setEditWeight] = useState<WeightEntry | null>(null)
  const [editInput, setEditInput] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [selectedWeight, setSelectedWeight] = useState<WeightEntry | null>(null)

  useEffect(() => {
    loadWeights()
  }, [loadWeights])

  const years = useMemo(() => {
    const uniqueYears = new Set(weights.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [weights])

  const filteredWeights = useMemo(() => {
    return weights.filter(w => {
      const d = new Date(w.created_at)
      return year === 'All Years' || d.getFullYear().toString() === year
    })
  }, [weights, year])

  const handleEditStart = (weight: WeightEntry) => {
    setSelectedWeight(weight)
    setActionSheetOpen(true)
  }

  const handleEditSave = async () => {
    if (!token) return
    if (!editWeight || !editInput.trim() || isNaN(Number(editInput))) return
    const parsed = Number(editInput)
    const valueInKg = weightUnit === 'lb' ? WeightUtil.lbsToKg(parsed) : parsed

    try {
      const updated = await updateWeightEntry(token, editWeight.id, valueInKg)
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
    if (!token) return
    try {
      await deleteWeightEntry(token, id)
      setWeights(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <ScreenContainer>
      <YStack pt="$4" pb="$2">
        <ScreenHeader title="Weight History" />
        <WeightFilterControls years={years} filter={year} setFilter={setYear} isDark={isDark} />
      </YStack>

      <Suspense fallback={<Fallback />}>
        <History
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
