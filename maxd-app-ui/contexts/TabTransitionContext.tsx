// contexts/TabTransitionContext.tsx

import { createContext, useContext, useState } from 'react'

type TabTransitionContextType = {
  currentTab: number
  prevTab: number
  updateTab: (newTab: number) => void
}

const TabTransitionContext = createContext<TabTransitionContextType | null>(null)

export const TabTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTab, setCurrentTab] = useState(0)
  const [prevTab, setPrevTab] = useState(0)

  const updateTab = (newTab: number) => {
    setPrevTab(currentTab)       // store current as previous
    setCurrentTab(newTab)        // then update current
  }

  return (
    <TabTransitionContext.Provider value={{ currentTab, prevTab, updateTab }}>
      {children}
    </TabTransitionContext.Provider>
  )
}

export const useTabTransition = () => {
  const context = useContext(TabTransitionContext)
  if (!context) {
    throw new Error('useTabTransition must be used within a TabTransitionProvider')
  }
  return context
}
