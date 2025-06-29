import React, { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Pressable } from 'react-native'
import { WebView } from 'react-native-webview'
import { YStack, Text, XStack, useThemeName } from 'tamagui'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YearFilterItem } from './YearFilterItem'
import { ChevronLeft } from '@tamagui/lucide-icons'
import Animated, { FadeInUp } from 'react-native-reanimated'

export default function MonthlyChartWebView({
  weights,
  onBack,
}: {
  weights: { value: number; created_at: string }[]
  onBack: () => void
}) {
  const [loading, setLoading] = useState(true)
  const insets = useSafeAreaInsets()
  const theme = useThemeName()
  const isDark = theme === 'dark'

  const years = useMemo(() => {
    const uniqueYears = new Set(weights.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [weights])

  const currentYear = new Date().getFullYear().toString()
  const [filter, setFilter] = useState(
    years.map(String).includes(currentYear) ? currentYear : 'All Years'
  )

  const [range, setRange] = useState<'6mo' | 'all'>('all')

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
    if (range === '6mo') {
      cutoff.setMonth(cutoff.getMonth() - 6)
    }

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

  const safeWeights = useMemo(() => {
    const monthlyMap: Record<string, number[]> = {}

    filteredWeights.forEach(w => {
      const date = new Date(w.created_at)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const key = `${year}-${month}`

      const value = Number(w.value)
      if (!isNaN(value)) {
        if (!monthlyMap[key]) monthlyMap[key] = []
        monthlyMap[key].push(value)
      }
    })

    return Object.entries(monthlyMap).map(([month, vals]) => {
      const avg = vals.reduce((sum, val) => sum + val, 0) / vals.length
      return { x: `${month}-01`, y: parseFloat(avg.toFixed(1)) }
    })
  }, [filteredWeights])

  const chartHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body, #container, canvas {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          background: ${isDark ? '#0D0D0D' : 'white'};
        }
          #container {
  height: 100%;
  overflow: hidden;
  padding-bottom: 1px; /* hides anti-aliasing artifacts */
}
      </style>
    </head>
    <body>
      <div id="container">
        <canvas id="chart"></canvas>
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
              label: 'Monthly Avg Weight',
              data: data,
              borderColor: '${isDark ? '#fff' : '#000'}',
              backgroundColor: '${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}',
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
                  unit: 'month',
                  tooltipFormat: 'MMM yyyy',
                  displayFormats: { month: 'MMM' }
                },
                ticks: {
                  color: '${isDark ? '#aaa' : '#333'}',
                },
                grid: { color: '${isDark ? '#333' : '#eee'}' },
                title: { display: true, text: 'Month', color: '${isDark ? '#fff' : '#000'}' }
              },
              y: {
                title: { display: true, text: 'Weight (lb)', color: '${isDark ? '#fff' : '#000'}' },
                grid: { color: '${isDark ? '#333' : '#eee'}' },
                ticks: { color: '${isDark ? '#aaa' : '#333'}' }
              }
            },
            plugins: {
              tooltip: {
                mode: 'nearest',
                intersect: false,
                callbacks: {
                  label: function(ctx) {
                    const y = ctx.raw.y;
                    return (typeof y === 'number' ? y.toFixed(1) : y) + ' lb';
                  }
                }
              },
              legend: { display: false }
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
      bg={isDark ? '#0D0D0D' : 'white'}
      paddingRight={20}
      paddingBottom={10}
      paddingLeft={10}
      paddingTop={insets.top}
    >
      <StatusBar hidden />
      <YStack px="$4" pt="$4" pb="$2">
        <XStack jc="space-between" ai="center" mb="$3">
          <Pressable onPress={onBack} hitSlop={10}>
            <XStack fd="row" ai="center" gap="$2">
              <ChevronLeft size={20} color={isDark ? 'white' : 'black'} />
              <Text fontSize="$5" fontWeight="600" color={isDark ? 'white' : 'black'}>
                Back
              </Text>
            </XStack>
          </Pressable>
        </XStack>

        <Animated.View entering={FadeInUp.duration(400)}>
          <Text
            fontSize="$9"
            fontWeight="900"
            ta="center"
            mb="$3"
            color={isDark ? 'white' : 'black'}
          >
            Monthly Averages
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
              { label: 'All Months', val: 'all' },
              { label: 'Last 6 Months', val: '6mo' },
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
          Showing {range === '6mo' ? 'last 6 months' : 'all months'} of{' '}
          {filter === 'All Years' ? 'all years' : filter}
        </Text>
      </YStack>

      {loading && (
        <YStack f={1} jc="center" ai="center">
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        </YStack>
      )}

      <WebView
        originWhitelist={['*']}
        source={{ html: chartHtml }}
        style={{ flex: 1 }}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        scalesPageToFit
      />
    </YStack>
  )
}
