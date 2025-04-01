export function sessionStoreItem(key: string, value: string) {
  sessionStorage.setItem(key, value)
}

export function sessionGetItem(key: string) {
  return sessionStorage.getItem(key)
}

export function sessionRemoveItem(key: string) {
  sessionStorage.removeItem(key)
}
