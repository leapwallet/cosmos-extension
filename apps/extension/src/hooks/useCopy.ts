import { useEffect, useState } from 'react'

export const useCopy = () => {
  const [isCopied, setIsCopied] = useState(false)

  const copy = (text: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return
    }

    navigator.clipboard.writeText(text)
    setIsCopied(true)
  }

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setIsCopied(false), 1000)
    }
  }, [isCopied])

  return {
    isCopied,
    copy,
  }
}
