/**
 * @function protectAgainstNaN
 * @description Protect against NaN
 * @param value the value to protect against NaN
 * @returns the value if it is a number, or 0 if it is not
 */
const protectAgainstNaN = (value: number) => (isNaN(value) ? 0 : value)

/**
 * @function convertMicroDenomToDenom
 * @description Convert a micro denom to a denom
 * @param value the value to convert to denom
 * @param decimals the number of decimals of the token
 * @returns number: the value in denoms
 */
export function convertMicroDenomToDenom(value: number | string, decimals: number): number {
  if (decimals === 0) return Number(value)

  return protectAgainstNaN(Number(value) / Math.pow(10, decimals))
}

/**
 * @function convertDenomToMicroDenom
 * @description Convert a denom to a micro denom
 * @param value the value to convert to micro denom
 * @param decimals the number of decimals of the token
 * @returns number: the value in micro denom
 */
export function convertDenomToMicroDenom(value: number | string, decimals: number): number {
  if (decimals === 0) return Number(value)

  return protectAgainstNaN(parseInt(String(Number(value) * Math.pow(10, decimals)), 10))
}
