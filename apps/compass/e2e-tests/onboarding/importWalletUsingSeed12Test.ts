import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Page } from 'puppeteer'

import { JUNO_PRIVATE_KEY, PASSWORD, TEST_SEED_PHRASE } from '../constants'
import { clearInputField, getElement, getElementInnerText } from '../element-utils'
import { setNewActivePage, setUpBrowser } from '../utils'

export function importWalletUsingSeed12Test() {
  return describe('Import wallet using 12 words Seed phrase', () => {
    let page: Page

    beforeAll(async () => {
      ;({ page } = await setUpBrowser())
    })

    it('must not allow import given an invalid seed phrase', async () => {
      await page.click('[data-testing-id=import-seed-phrase]')
      await page.type('[data-testing-id=enter-phrase]', 'horse')
      await page.click('[data-testing-id=btn-import-wallet]')

      const errorText = await getElementInnerText(page, 'error-text-ele')
      const expectedErrorText = 'Invalid secret recovery phrase.'
      expect(errorText).toBe(expectedErrorText)
    })

    it('must not allow import given a private key', async () => {
      await clearInputField(page, 'enter-phrase')
      await page.type('[data-testing-id=enter-phrase]', JUNO_PRIVATE_KEY)
      await page.click('[data-testing-id=btn-import-wallet]')

      const errorText = await getElementInnerText(page, 'error-text-ele')
      const expectedErrorText = 'Invalid secret recovery phrase.'
      expect(errorText).toBe(expectedErrorText)
    })

    it('must allow import and show wallet 1 in the wallets list given a valid seed phrase', async () => {
      await clearInputField(page, 'enter-phrase')
      await page.type('[data-testing-id=enter-phrase]', TEST_SEED_PHRASE)
      await page.click('[data-testing-id=btn-import-wallet]')

      const wallet1Ele = await getElement(page, 'wallet-1')
      expect(wallet1Ele).not.toBeNull()
    })

    it('must not allow proceed given a wrong confirm password', async () => {
      await page.click('[data-testing-id=wallet-1]')
      await page.click('[data-testing-id=btn-select-wallet-proceed]')

      await page.type('[data-testing-id=input-password]', PASSWORD)
      await page.type('[data-testing-id=input-confirm-password]', `${PASSWORD}@#`)

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
