export function getWordFromMnemonic(mnemonic: string, wordNumber: number) {
  return mnemonic
    .trim()
    .split(' ')
    .slice(wordNumber - 1, wordNumber)[0]
}
