export function isNotValidURL(value: string) {
  return !/^(http|https):\/\/[^ "]+$/.test(value)
}

export function isNotValidNumber(value: string) {
  return !/^\d+$/.test(value)
}
