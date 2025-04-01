export const toUint8Array = (str: string) =>
  new Uint8Array(
    atob(str)
      .split('')
      .map((char) => char.charCodeAt(0)),
  )

export const uint8ArrayToBase64 = (arr: Uint8Array) => {
  const numberedArr = arr as unknown as number[]
  return btoa(String.fromCharCode.apply(null, numberedArr))
}

export const strToUint8Array = (str: string) => {
  const enc = new TextEncoder()
  return enc.encode(str)
}
