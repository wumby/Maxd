import { createContext, useContext, useState } from 'react'

type TabTransitionContextType = {
  tabIndex: number
  prevTabIndex: number
  direction: 1 | -1
  setTabIndex: (index: number) => void
}

const TabTransitionContext = createContext<TabTransitionContextType | null>(null)

export const TabTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [tabIndex, setTabIndexInternal] = useState(0)
  const [prevTabIndex, setPrevTabIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)

  const setTabIndex = (index: number) => {
    setDirection(index > tabIndex ? 1 : -1)
    setPrevTabIndex(tabIndex)
    setTabIndexInternal(index)
  }

  return (
    <TabTransitionContext.Provider value={{ tabIndex, prevTabIndex, setTabIndex, direction }}>
      {children}
    </TabTransitionContext.Provider>
  )
}

export const useTabTransition = () => {
  const context = useContext(TabTransitionContext)
  if (!context) throw new Error('useTabTransition must be used within TabTransitionProvider')
  return context
}
