export type Dict = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | number | symbol]: any
}

export type StrictDict<T> = {
  [key: string | number | symbol]: T
}

export type TransactionStatus = 'loading' | 'success' | 'error' | 'idle'
