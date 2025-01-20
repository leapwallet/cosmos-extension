const formatUptoSixDecimals = (value: string) => {
  const parsed = parseFloat(value)
  if (isNaN(parsed)) {
    return ''
  }
  return Intl.NumberFormat('en', {
    maximumFractionDigits: 6,
  }).format(parsed)
}

function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}

const findMinAsset = (obj: any): string | undefined => {
  if (typeof obj !== 'object' || obj === null) {
    return undefined
  }

  if ('min_asset' in obj) {
    return obj.min_asset
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findMinAsset(item)
      if (result !== undefined) {
        return result
      }
    }
  } else {
    for (const value of Object.values(obj)) {
      const result = findMinAsset(value)
      if (result !== undefined) {
        return result
      }
    }
  }

  return undefined
}

export { capitalizeFirstLetter, findMinAsset, formatUptoSixDecimals }
