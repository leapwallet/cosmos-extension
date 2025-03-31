export function getDerivationPathToShow(path: string) {
  const pathElements = path.split('/')
  const lastElementIndex = (pathElements?.length ?? 0) - 1

  if (lastElementIndex < 0) return ''

  return `${pathElements?.[lastElementIndex - 2]}/${pathElements?.[lastElementIndex - 1]}/${
    pathElements?.[lastElementIndex]
  }`
}
