export function convertObjInQueryParams(obj: Record<string, unknown>) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}
