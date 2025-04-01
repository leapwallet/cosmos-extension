import { beforeAll, describe, expect, it } from '@jest/globals'
import { Page } from 'puppeteer'

import { PASSWORD } from '../constants'
import { clearInputField, getElement, getElementInnerText } from '../element-utils'
import { getActivePage } from '../utils'

export function showSecretPhraseTest(mnemonicObj: { mnemonic: string }) {
  return describe('Show secret phrase', () => {
    let page: Page

    beforeAll(() => {
      page = getActivePage()
    })

    it('must show secret phrase card in sidenav on hamburger icon click', async () => {
      await page.click('[data-testing-id=home-sidenav-hamburger-btn]')
      const element = await getElement(page, 'sidenav-show-secret-phrase-card')
      expect(element).not.toBeNull()
    })

    it("must show password page with text Verify it's you on Show Secret Phrase click", async () => {
      await page.click('[data-testing-id=sidenav-show-secret-phrase-card]')
      const passwordVerifyYouText = await getElementInnerText(page, 'password-verify-you-text')

      const expectedText = "Verify it's you"
      expect(passwordVerifyYouText).toBe(expectedText)
    })

    it('must give an error given a wrong password', async () => {
      await page.type('[data-testing-id=password]', `${PASSWORD}@`)
      await page.click('[data-testing-id=submit]')

      const errorText = await getElementInnerText(page, 'error-text')
      const expectedErrorText = 'Incorrect Password'
      expect(errorText).toBe(expectedErrorText)
    })

    it('must show the correct secret phrase', async () => {
      await clearInputField(page, 'password')
      await page.type('[data-testing-id=password]', PASSWORD)
      await page.click('[data-testing-id=submit]')

      await page.click('[data-testing-id=copy-seed-phrase]')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mnemonic = await page.evaluate(() => (window as any).testingClipboard ?? '')

      expect(mnemonic).toBe(mnemonicObj.mnemonic)
      await page.reload()
    })
  })
}
