import { BigNumber } from 'bignumber.js'
import currency from 'currency.js'

export const trim = (str: string, length: number) => {
  if (str && str.length > length) {
    return `${str.slice(0, length)}...`
  }
  return str
}

export const sliceAddress = (address?: string, visibleLetters = 5) => {
  return (
    address?.slice(0, visibleLetters) +
    '...' +
    address?.slice(address.length - visibleLetters, address.length)
  )
}

export const sliceSearchWord = (word: string, visibleLetters = 5) => {
  if (word && word.length < 2 * visibleLetters) return word
  return (
    word.slice(0, visibleLetters) + '...' + word.slice(word.length - visibleLetters, word.length)
  )
}

export const sliceWord = (word: string, visibleFrontLetters = 5, visibleLastLetters = 5) => {
  if (word && word.length <= visibleFrontLetters + visibleLastLetters) return word
  return (
    word?.slice(0, visibleFrontLetters) +
    '...' +
    word?.slice(word.length - visibleLastLetters, word.length)
  )
}

export const capitalize = (words?: string) => {
  if (!words) return words
  return words
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export const formatTokenAmount = (amount: string, symbol = '', precision = 3) => {
  symbol = trim(symbol, 6)

  if (new BigNumber(amount).lt(1) && +amount !== 0) {
    if (new BigNumber(amount).lt(1 / Math.pow(10, precision))) {
      return `<0.001 ${symbol.toUpperCase()}`
    }

    const amt = currency(new BigNumber(amount).valueOf(), { precision, symbol: '' }).format()

    if (!+amt) return '0 ' + symbol.toUpperCase()

    return `${(+amt).toString()} ${symbol.toUpperCase()}` // remove traling zeros
  }
  return currency(amount, { precision: 3, pattern: '# !', symbol }).format()
}

export const formatPercentAmount = (amount: string, precision = 3) => {
  return currency(amount, { precision, pattern: '!#', symbol: '' }).format()
}

export const removeLeadingZeroes = (inputString: string) => {
  return inputString?.replace?.(/^0+(?=\d)/, '')?.replace?.(/(\.+)/g, '.')
}

function toSubscript(num: number): string {
  const subscriptMap: { [key: string]: string } = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
    '10': '₁₀',
    '11': '₁₁',
    '12': '₁₂',
  }

  return subscriptMap[num.toString()]
}

export const formatForSubstring = (value: string) => {
  if (value === 'NaN') return '0'
  let val = value

  if (/e[-+]?\d+/i.test(val)) {
    const num = parseFloat(val)
    val = num.toFixed(10).replace(/\.0+$/, '')
  }
  const match = val.match(/^0\.(0+)(\d+)/)
  if (match) {
    const leadingZeros = match[1].length
    const significantDigits = match[2].slice(0, 3)

    if (leadingZeros >= 3) {
      val = `0.0${toSubscript(leadingZeros)}${significantDigits}`
    }
  }

  const num = parseFloat(val)
  if (!isNaN(num) && num > 0) {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(3).replace(/\.?0+$/, '') + 'B'
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(3).replace(/\.?0+$/, '') + 'M'
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(3).replace(/\.?0+$/, '') + 'K'
    } else {
      return num.toFixed(3)
    }
  }
  return val
}
