export function getPercentage(a: number, b: number) {
  if (b === 0) return '0%'
  return `${Number((a / b) * 100).toFixed(2)}%`
}
