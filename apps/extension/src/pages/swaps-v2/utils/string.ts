const formatUptoSixDecimals = (value: string) => {
  const parsed = parseFloat(value)
  if (isNaN(parsed)) {
    return ''
  }
  return Intl.NumberFormat('en', {
    maximumFractionDigits: 6,
  }).format(parsed)
}

export { formatUptoSixDecimals }
