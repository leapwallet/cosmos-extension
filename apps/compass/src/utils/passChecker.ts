import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import zxcvbnDePackage from '@zxcvbn-ts/language-de'
import zxcvbnEnPackage from '@zxcvbn-ts/language-en'

/**
 * check out https://zxcvbn-ts.github.io/zxcvbn/guide/getting-started/
 * for more info on the below logic
 */

const options = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
    ...zxcvbnDePackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  useLevenshteinDistance: true,
  translations: zxcvbnEnPackage.translations,
}
zxcvbnOptions.setOptions(options)

/**
 *
 * @param password
 * @returns number - The score of the password strength which ranges between [0-4]
 */
export const getPassScore = (password: string) => {
  const result = zxcvbn(password)
  return result.score
}
