export type Dict = {
  [key: string | number | symbol]: any
}

export type StrictDict<T> = {
  [key: string | number | symbol]: T
}
