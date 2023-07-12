export const parseQueryParams = (queryString) => {
  return queryString
    .substring(1)
    .split('&')
    .reduce((acc, curr) => {
      const temp = curr.split('=')
      acc[temp[0]] = [...(acc[temp[0]] || []), temp[1]]
      return acc
    }, {})
}
