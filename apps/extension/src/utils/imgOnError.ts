export function imgOnError(defaultTokenLogo: string) {
  return function ({ currentTarget }: { currentTarget: HTMLImageElement }) {
    currentTarget.onerror = null
    currentTarget.src = defaultTokenLogo
  }
}
