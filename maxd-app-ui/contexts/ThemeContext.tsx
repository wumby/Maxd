import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeName } from 'tamagui'
import AsyncStorage from '@react-native-async-storage/async-storage'

type ThemeContextType = {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
})

export const useThemePreference = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('light')

  useEffect(() => {
    AsyncStorage.getItem('theme').then(val => {
      if (val === 'dark' || val === 'light') {
        setThemeState(val)
      }
    })
  }, [])

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme)
    AsyncStorage.setItem('theme', newTheme)
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
