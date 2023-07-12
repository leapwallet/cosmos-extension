import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Page } from 'puppeteer'

import { getWordFromMnemonic } from '../../src/utils/getWordFromMnemonic'
import { PASSWORD } from '../constants'
import { clearInputField, getElement, getElementInnerText } from '../element-utils'
import { setNewActivePage, setUpBrowser } from '../utils'

export function createNewWalletTest(mnemonicObj: { mnemonic: string }) {
  return describe('Create new wallet', () => {
    let page: Page

    beforeAll(async () => {
      ;({ page } = await setUpBrowser())
    })

    it('must show 12 words mnemonic on click of Create new wallet', async () => {
      await page.click('[data-testing-id=create-new-wallet]')
      await page.click('[data-testing-id=mnemonic-copy-to-clipboard]')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mnemonicObj.mnemonic = await page.evaluate(() => (window as any).testingClipboard ?? '')

      const wordsCount = mnemonicObj.mnemonic.split(' ').length
      expect(wordsCount).toEqual(12)
    })

    it('must show confirm secret recovery phrase page on click of Saved button', async () => {
      await page.click('[data-testing-id=saved-mnemonic-btn]')
      const fourthMnemonicWord = await getElement(page, 'input-fourth-word')
      expect(fourthMnemonicWord).not.toBeNull()
    })

    it('must show Enter correct 4th word error given a wrong 4th word', async () => {
      await page.type('[data-testing-id=input-fourth-word]', 'four')
      await page.type('[data-testing-id=input-eighth-word]', 'eight')
      await page.type('[data-testing-id=input-tweleveth-word]', 'tweleve')

      await page.click('[data-testing-id=confirm-phrase-btn]')
      const errorText = await getElementInnerText(page, 'error-text-ele')
      const expectedErrorText = 'Enter correct 4th word.'

      expect(errorText).toBe(expectedErrorText)
    })

    it('must show Enter correct 8th word error given a wrong 8th word', async () => {
      await clearInputField(page, 'input-fourth-word')
      await page.type(
        '[data-testing-id=input-fourth-word]',
        getWordFromMnemonic(mnemonicObj.mnemonic, 4),
      )
      await page.click('[data-testing-id=confirm-phrase-btn]')

      const errorText = await getElementInnerText(page, 'error-text-ele')
      const expectedErrorText = 'Enter correct 8th word.'

      expect(errorText).toBe(expectedErrorText)
    })

    it('must show Enter correct 12th word error given a wrong 12th word', async () => {
      await clearInputField(page, 'input-eighth-word')
      await page.type(
        '[data-testing-id=input-eighth-word]',
        getWordFromMnemonic(mnemonicObj.mnemonic, 8),
      )
      await page.click('[data-testing-id=confirm-phrase-btn]')

      const errorText = await getElementInnerText(page, 'error-text-ele')
      const expectedErrorText = 'Enter correct 12th word.'

      expect(errorText).toBe(expectedErrorText)
    })

    it('must not allow proceed given a wrong confirm password', async () => {
      await clearInputField(page, 'input-tweleveth-word')
      await page.type(
        '[data-testing-id=input-tweleveth-word]',
        getWordFromMnemonic(mnemonicObj.mnemonic, 12),
      )
      await page.click('[data-testing-id=confirm-phrase-btn]')

      await page.type('[data-testing-id=input-password]', PASSWORD)
      await page.type('[data-testing-id=input-confirm-password]', `${PASSWORD}@`)

      await page.click('[data-testing-id=btn-password-proceed]')
      const passwordErrorText = await getElementInnerText(page, 'password-error-ele')

      const expectedPasswordErrorText = 'Passwords do not match'
      expect(passwordErrorText).toBe(expectedPasswordErrorText)
    })

    it('must allow proceed given a right confirm password', async () => {
      await clearInputField(page, 'input-confirm-password')
      await page.type('[data-testing-id=input-confirm-password]', PASSWORD)

      await page.click('[data-testing-id=btn-password-proceed]')
      const readyWalletEleText = await getElementInnerText(page, 'ready-wallet-ele')

      const expectedReadyWalletEleText = 'Your Leap wallet is ready!'
      expect(readyWalletEleText).toBe(expectedReadyWalletEleText)
    })

    afterAll(async () => {
      await page.close()
      await setNewActivePage()
    })
  })
}
