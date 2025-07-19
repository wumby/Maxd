// CustomDatePicker.tsx
import { useEffect, useState } from 'react'
import { Select, Adapt, YStack, XStack, Text } from 'tamagui'
import { useThemeName } from 'tamagui'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

export function CustomDatePicker({
  value,
  onChange,
}: {
  value: Date
  onChange: (date: Date) => void
}) {
  const theme = useThemeName()

  const [year, setYear] = useState(value.getFullYear())
  const [month, setMonth] = useState(value.getMonth())
  const [day, setDay] = useState(value.getDate())

  // Adjust day if needed on month/year change
  useEffect(() => {
    const maxDays = getDaysInMonth(year, month)
    if (day > maxDays) setDay(maxDays)
    else onChange(new Date(year, month, day))
  }, [year, month, day])

  return (
    <XStack gap="$4" jc="center" ai="center" pt="$2">
      {/* Month */}
      <Select value={month.toString()} onValueChange={val => setMonth(Number(val))}>
        <Select.Trigger width={90} borderWidth={1} borderColor="$gray5">
          <Select.Value placeholder="Month" />
        </Select.Trigger>
        <Adapt platform="touch">
          <Select.Sheet snapPoints={[40]} modal />
        </Adapt>
        <Select.Content>
          {months.map((label, i) => (
            <Select.Item key={i} index={i} value={i.toString()}>
              <Text>{label}</Text>
            </Select.Item>
          ))}
        </Select.Content>
      </Select>

      {/* Day */}
      <Select value={day.toString()} onValueChange={val => setDay(Number(val))}>
        <Select.Trigger width={70} borderWidth={1} borderColor="$gray5">
          <Select.Value placeholder="Day" />
        </Select.Trigger>
        <Adapt platform="touch">
          <Select.Sheet snapPoints={[40]} modal />
        </Adapt>
        <Select.Content>
          {Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1).map(day => (
            <Select.Item key={day} index={day - 1} value={day.toString()}>
              <Text>{day}</Text>
            </Select.Item>
          ))}
        </Select.Content>
      </Select>

      {/* Year */}
      <Select value={year.toString()} onValueChange={val => setYear(Number(val))}>
        <Select.Trigger width={80} borderWidth={1} borderColor="$gray5">
          <Select.Value placeholder="Year" />
        </Select.Trigger>
        <Adapt platform="touch">
          <Select.Sheet snapPoints={[40]} modal />
        </Adapt>
        <Select.Content>
          {years.map((y, i) => (
            <Select.Item key={y} index={i} value={y.toString()}>
              <Text>{y}</Text>
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </XStack>
  )
}
