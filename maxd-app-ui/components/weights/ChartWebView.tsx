import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Pressable } from 'react-native'
import { WebView } from 'react-native-webview'
import { YStack, Text, XStack, useThemeName, Button, useTheme } from 'tamagui'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YearFilterItem } from './YearFilterItem'
import { ChevronLeft } from '@tamagui/lucide-icons'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { usePreferences } from '@/contexts/PreferencesContext'
import WeightUtil from '@/util/weightConversion'

export default function ChartWebView({
  weights,
  onBack,
}: {
  weights: { value: number; created_at: string }[]
  onBack: () => void
}) {
  const { weightUnit } = usePreferences()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const insets = useSafeAreaInsets()
  const themeName = useThemeName()
  const isDark = themeName === 'dark'
  const bgColor = isDark ? '#0D0D0D' : '#FFFFFF'
  const textColor = isDark ? '#FFFFFF' : '#000000'
  const gridColor = isDark ? '#333' : '#eee'
  const borderColor = isDark ? '#FFFFFF' : '#000000'
  const fillColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'

  const years = useMemo(() => {
    const uniqueYears = new Set(weights.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [weights])

  const [filter, setFilter] = useState('All Years')

  useEffect(() => {
    if (years.length > 0) {
      setFilter(String(years[0]))
    }
  }, [years])

  const [range, setRange] = useState<'30d' | '3mo' | 'all'>('3mo')

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
    if (range === '30d') cutoff.setDate(cutoff.getDate() - 30)
    else if (range === '3mo') cutoff.setMonth(cutoff.getMonth() - 3)
    return cutoff
  }, [weights, filter, range])

  const filteredWeights = useMemo(() => {
    return weights.filter(w => {
      const date = new Date(w.created_at)
      const matchYear = filter === 'All Years' || date.getFullYear().toString() === filter
      const matchRange = !rangeCutoff || date >= rangeCutoff
      return matchYear && matchRange
    })
  }, [weights, filter, rangeCutoff])

  const safeWeights = filteredWeights
    .map(w => {
      const rawValue = Number(w.value)
      const value = weightUnit === 'lb' ? WeightUtil.kgToLbs(rawValue) : rawValue
      const date = new Date(w.created_at)
      if (!isNaN(value) && !isNaN(date.getTime())) {
        return { x: date.toISOString(), y: value }
      }
      return null
    })
    .filter(Boolean)

  const chartHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <style>
      html, body, #container, canvas {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        background: ${bgColor};
      }
    #scroll-container {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  background: ${bgColor};
}

#container {
  height: 100%;
  width: max-content;
  padding-bottom: 1px;
}

canvas {
  min-width: ${Math.max(safeWeights.length * 10, 400)}px;
  max-width: none;
  height: 100%;
}


    </style>
  </head>
  <body>
    <div id="scroll-container">
  <div id="container">
    <canvas id="chart" width="${Math.max(safeWeights.length * 10, 400)}"></canvas>
  </div>
</div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
    <script>
      const ctx = document.getElementById('chart').getContext('2d');
      const data = ${JSON.stringify(safeWeights)};
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Weight',
            data: data,
            borderColor: '${borderColor}',
            backgroundColor: '${fillColor}',
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
           x: {
  type: 'time',
  time: {
    unit: '${range === 'all' ? 'month' : 'day'}',
    tooltipFormat: 'MMM d, yyyy',
    displayFormats: {
      day: 'MMM d',
      month: 'MMM',
    }
  },
  ticks: {
    
    color: '${textColor}',
  },
  grid: { color: '${gridColor}' },
  title: { display: true, text: 'Date', color: '${textColor}' }
},

            y: {
              title: { display: true, text: 'Weight (${weightUnit})', color: '${textColor}' },
              grid: { color: '${gridColor}' },
              ticks: { color: '${textColor}' }
            }
          },
          plugins: {
            tooltip: {
              mode: 'nearest',
              intersect: false,
              callbacks: {
                label: function(ctx) {
                  const y = ctx.raw.y;
                  return (typeof y === 'number' ? y.toFixed(1) : y) + ' ${weightUnit}';
                }
              }
            },
            legend: { display: false },
          }
        }
      });
    </script>
  </body>
</html>
`

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={100}
      bg={bgColor}
      paddingRight={20}
      paddingBottom={10}
      paddingLeft={10}
      paddingTop={insets.top}
    >
      <StatusBar hidden />
      <YStack px="$4" pt="$4" pb="$2">
        <XStack jc="space-between" ai="center" mb="$3">
          <Button
            position="absolute"
            left={16}
            size="$4"
            chromeless
            onPress={onBack}
            px="$2"
            borderRadius="$6"
          >
            <XStack ai="center" gap="$2">
              <ChevronLeft size={24} color={theme.color.val} />
            </XStack>
          </Button>
        </XStack>

        <Animated.View entering={FadeInUp.duration(400)}>
          <Text fontSize="$9" fontWeight="900" ta="center" mb="$3" color={textColor}>
            Weight Graph
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

        <Text fontSize="$2" color="$gray10" ta="center" mt="$2">
          Showing{' '}
          {range === '30d' ? 'last 30 days' : range === '3mo' ? 'last 3 months' : 'all days'} of{' '}
          {filter === 'all' ? 'all years' : filter}
        </Text>
      </YStack>

      {loading && (
        <YStack f={1} jc="center" ai="center">
          <ActivityIndicator size="large" color={textColor} />
        </YStack>
      )}

      <WebView
        originWhitelist={['*']}
        source={{ html: chartHtml }}
        style={{ flex: 1 }}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        scalesPageToFit
        bounces={false} // 👈 disable scroll bounce (especially on iOS)
        overScrollMode="never"
      />
    </YStack>
  )
}
