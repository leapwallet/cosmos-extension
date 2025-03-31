import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Page } from 'puppeteer'

import {
  KEPLR_SOCIAL_LOGIN_PRIVATE_KEY,
  LONG_PRIVATE_KEY,
  PASSWORD,
  TEST_SEED_PHRASE,
} from '../constants'
import { clearInputField, getElement, getElementInnerText } from '../element-utils'
import { getActiveBrowser, getActivePage, setNewActivePage } from '../utils'

export function importUsingPrivateKey() {
  return describe('Import wallet using Keplr social login Private key', () => {
    let page: Page

    beforeAll(() => {
      page = getActivePage()
    })

    it('must not allow import given an invalid private key', async () => {
      await page.click('[data-testing-id=import-private-key]')
      await page.type('[data-testing-id=enter-phrase]', TEST_SEED_PHRASE)
      await page.click('[data-testing-id=btn-import-wallet]')

      const errorText = await getElementInnerText(page, 'error-text-ele')
      const expectedErrorText = 'Invalid private key.'
      expect(errorText).toBe(expectedErrorText)
    })

    it('must not allow import given a long private key', async () => {
      await clearInputField(page, 'enter-phrase')
      await page.type('[data-testing-id=enter-phrase]', LONG_PRIVATE_KEY)
      await page.click('[data-testing-id=btn-import-wallet]')

      const errorText = await getElementInnerText(page, 'error-text-ele')
      const expectedErrorText = 'Invalid private key.'
      expect(errorText).toBe(expectedErrorText)
    })

    it('must allow import given a valid private key', async () => {
      await clearInputField(page, 'enter-phrase')
      await page.type('[data-testing-id=enter-phrase]', KEPLR_SOCIAL_LOGIN_PRIVATE_KEY)
      await page.click('[data-testing-id=btn-import-wallet]')

      const inputPasswordEle = await getElement(page, 'input-password')
      expect(inputPasswordEle).not.toBeNull()
    })

    it('must allow proceed given the same password and confirm password', async () => {
      await page.type('[data-testing-id=input-password]', PASSWORD)
      await page.type('[data-testing-id=input-confirm-password]', PASSWORD)

      await page.click('[data-testing-id=btn-password-proceed]')
      const readyWalletEleText = await getElementInnerText(page, 'ready-wallet-ele')

      const expectedReadyWalletEleText = 'Your Leap wallet is ready!'
      expect(readyWalletEleText).toBe(expectedReadyWalletEleText)
    })

    it('must be on cosmos with address cosmos12x6hrzd9gx7t0kxghrnx09wh6h2smjx7zylupr', async () => {
      await page.close()
      await setNewActivePage()
      const _page = getActivePage()

      const homeCopyAddressBtnText = await getElementInnerText(_page, 'home-copy-address-btn')
      const expectedHomeCopyAddressBtnText = 'cosmo...ylupr'
      expect(homeCopyAddressBtnText).toBe(expectedHomeCopyAddressBtnText)
    })

    afterAll(() => {
      getActiveBrowser().close()
    })
  })
}
