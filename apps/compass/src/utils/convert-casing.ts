export const convertCamelCaseToSnakeCase = (str: string) => {
  return str.replace(/([A-Z])/g, ($1) => {
    return `_${$1.toLowerCase()}`
  })
}

export const convertSnakeCaseToCamelCase = (str: string) => {
  return str.replace(/([-_][a-z])/g, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '')
  })
}
