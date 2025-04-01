import { useMemo } from 'react'

export const useEffectiveAmountValue = (amount: string) => {
  const effectiveAmountValue = useMemo(() => {
    if (amount?.trim()?.length === 0) {
      return ''
    }
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount)) {
      return ''
    }
    return parsedAmount.toString()
  }, [amount])

  return effectiveAmountValue
}
