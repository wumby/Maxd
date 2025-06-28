import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { WidgetType } from '@/components/WidgetRegistry'

type WidgetLayoutItem = {
  id: string
  type: WidgetType
}

const DEFAULT_LAYOUT: WidgetLayoutItem[] = [
  { id: '1', type: 'currentWeight' },
  { id: '2', type: 'streak' },
  { id: '3', type: 'lastWorkout' },
]

export function useUserWidgets() {
  const [layout, setLayout] = useState<WidgetLayoutItem[]>([])

  useEffect(() => {
    const loadLayout = async () => {
      const saved = await AsyncStorage.getItem('widgetLayout')
      if (saved) {
        setLayout(JSON.parse(saved))
      } else {
        setLayout(DEFAULT_LAYOUT)
      }
    }
    loadLayout()
  }, [])

  const saveLayout = async (newLayout: WidgetLayoutItem[]) => {
    setLayout(newLayout)
    await AsyncStorage.setItem('widgetLayout', JSON.stringify(newLayout))
  }

  return { layout, setLayout: saveLayout }
}
