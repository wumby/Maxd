import { Suspense, lazy } from 'react'
import { Fallback } from '@/components/Fallback'
import { TabTransitionWrapper } from '@/components/TabTransitionWrapper'
import { ScreenContainer } from '@/components/ScreenContainer'

const EnterWeight = lazy(() => import('@/components/weights/EnterWeight'))

export default function NewWeightPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ScreenContainer>
        <TabTransitionWrapper tabPosition={1}>
          <EnterWeight />
        </TabTransitionWrapper>
      </ScreenContainer>
    </Suspense>
  )
}
