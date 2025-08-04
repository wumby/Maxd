import { Suspense, lazy, useState } from 'react'
import { Fallback } from '@/components/Fallback'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'
import { ScreenContainer } from '@/components/ScreenContainer'
import { DatePickerSheet } from '@/components/weights/DatePickerSheet'

const EnterWeight = lazy(() => import('@/components/weights/EnterWeight'))

export default function NewWeightPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tempDate, setTempDate] = useState(new Date())
  const [showDateSheet, setShowDateSheet] = useState(false)
  return (
    <Suspense fallback={<Fallback />}>
      <ScreenContainer>
        <TabTransitionWrapper tabPosition={1}>
          <EnterWeight
            setTempDate={setTempDate}
            selectedDate={selectedDate}
            setShowDateSheet={setShowDateSheet}
          />
        </TabTransitionWrapper>
        <DatePickerSheet
          open={showDateSheet}
          onOpenChange={setShowDateSheet}
          tempDate={tempDate}
          setTempDate={setTempDate}
          setSelectedDate={setSelectedDate}
        />
      </ScreenContainer>
    </Suspense>
  )
}
