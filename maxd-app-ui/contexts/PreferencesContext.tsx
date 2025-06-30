import { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'

type Theme = 'light' | 'dark'
type WeightUnit = 'kg' | 'lb'

type Preferences = {
  theme: Theme
  weightUnit: WeightUnit
}

type PreferencesContextType = Preferences & {
  setTheme: (theme: Theme) => void
  setWeightUnit: (unit: WeightUnit) => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('lb')

  useEffect(() => {
    const loadPrefs = async () => {
      const storedTheme = await SecureStore.getItemAsync('theme')
      const storedWeightUnit = await SecureStore.getItemAsync('weightUnit')

      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeState(storedTheme)
      }

      if (storedWeightUnit === 'kg' || storedWeightUnit === 'lb') {
        setWeightUnitState(storedWeightUnit)
      }
    }

    loadPrefs()
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    SecureStore.setItemAsync('theme', newTheme)
  }

  const setWeightUnit = (unit: WeightUnit) => {
    setWeightUnitState(unit)
    SecureStore.setItemAsync('weightUnit', unit)
  }

  return (
    <PreferencesContext.Provider value={{ theme, weightUnit, setTheme, setWeightUnit }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
