export const formatWeightInput = (input: string): string => {
  const cleaned = input.replace(/[^0-9.]/g, '')

  // Only keep the first decimal point
  const parts = cleaned.split('.')
  const intPart = parts[0].slice(0, 4) // limit integer digits to 4
  const decimalPart = parts[1]?.slice(0, 2) ?? ''

  return parts.length > 1 ? `${intPart}.${decimalPart}` : intPart
}
