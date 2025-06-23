import React, { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Pressable } from 'react-native'
import { WebView } from 'react-native-webview'
import { YStack, Text, XStack } from 'tamagui'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YearFilterItem } from './YearFilterItem'
import { ChevronLeft } from '@tamagui/lucide-icons'
import Animated, { FadeInUp } from 'react-native-reanimated'

export default function ChartWebView({
  weights,
  onBack,
}: {
  weights: { value: number; created_at: string }[]
  onBack: () => void
}) {
  const [loading, setLoading] = useState(true)
  const insets = useSafeAreaInsets()

  const years = useMemo(() => {
    const uniqueYears = new Set(weights.map(w => new Date(w.created_at).getFullYear()))
    return Array.from(uniqueYears).sort((a, b) => b - a)
  }, [weights])

  const currentYear = new Date().getFullYear().toString()
  const [filter, setFilter] = useState(
    years.map(String).includes(currentYear) ? currentYear : 'All Years'
  )

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
  if (range === '30d') {
    cutoff.setDate(cutoff.getDate() - 30)
  } else if (range === '3mo') {
    cutoff.setMonth(cutoff.getMonth() - 3)
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

  const safeWeights = filteredWeights
    .map(w => {
      const value = Number(w.value)
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body, #container, canvas {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          background: white;
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
              label: 'Weight',
              data: data,
              borderColor: '#000',
              backgroundColor: 'rgba(0,0,0,0.05)',
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
                  unit: 'day',
                  tooltipFormat: 'MMM d, yyyy',
                  displayFormats: { day: 'MMM d' }
                },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 7,
                  color: '#333'
                },
                grid: { color: '#eee' },
                title: { display: true, text: 'Date' }
              },
              y: {
                title: { display: true, text: 'Weight (lb)' },
                grid: { color: '#eee' },
                ticks: { color: '#333' }
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
      bg="white"
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
              <ChevronLeft size={20} />
              <Text fontSize="$5" fontWeight="600">Back</Text>
            </XStack>
          </Pressable>
        </XStack>

        <Animated.View entering={FadeInUp.duration(400)}>
          <Text fontSize="$9" fontWeight="900" ta="center" mb="$3">
            Weight Graph
          </Text>
        </Animated.View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <XStack gap="$2" mb="$3">
            {['All Years', ...years.map(String)].map(val => (
              <YearFilterItem
                key={val}
                val={val}
                selected={filter === val}
                onPress={() => setFilter(val)}
                isDark={false}
              />
            ))}
          </XStack>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
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
                isDark={false}
              />
            ))}
          </XStack>
        </ScrollView>
        <Text fontSize="$2" color="$gray10" ta="center" mt="$2">
   Showing {range === '30d'
    ? 'last 30 days'
    : range === '3mo'
    ? 'last 3 months'
    : 'all days'} of {filter === 'all' ? 'all years' : filter}
</Text>
      </YStack>

      {loading && (
        <YStack f={1} jc="center" ai="center">
          <ActivityIndicator size="large" color="#000" />
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
