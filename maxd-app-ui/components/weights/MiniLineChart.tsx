import { View } from 'react-native'
import { Svg, Polyline, Line, Text as SvgText, Circle } from 'react-native-svg'

interface MiniLineChartProps {
  weights: { value: number }[]
  width?: number
  height?: number
  padding?: number
}

export function MiniLineChart({
  weights,
  width = 140,
  height = 85,
  padding = 8,
}: MiniLineChartProps) {
  const data = weights.map(w => w.value).slice(-6)
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * chartWidth + padding
    const y = padding + chartHeight - ((val - min) / range) * chartHeight
    return { x, y }
  })

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <View style={{ width, height, borderRadius: 8 }}>
      <Svg width={width} height={height}>
        <Polyline
          points={`${polylinePoints} ${points.at(-1)?.x},${height - padding} ${points[0].x},${height - padding}`}
          fill="rgba(0,0,0,0.05)"
          stroke="none"
        />
        <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />
        <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke="#000"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, idx) => (
          <Circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill="#000"
          />
        ))}
      </Svg>
    </View>
  )
}
