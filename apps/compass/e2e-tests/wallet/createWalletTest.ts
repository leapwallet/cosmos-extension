import { beforeAll, describe, expect, it } from '@jest/globals'
import { Page } from 'puppeteer'

import { getElementInnerText, getInputElementValue } from '../element-utils'
import { getActivePage } from '../utils'

export function createWalletTest() {
  return describe('Create a new wallet', () => {
    let page: Page

    beforeAll(() => {
      page = getActivePage()
    })

    it('must not allow creating a new wallet given the wallet name already exists', async () => {
      await page.click('[data-testing-id=home-create-wallet-btn]')
      await page.click('[data-testing-id=create-new-wallet-div]')
      await page.type('[data-testing-id=input-enter-wallet-name]', 'Wallet 1')
      await page.click('[data-testing-id=btn-create-wallet]')

      const createNewWalletErrorText = await getElementInnerText(page, 'create-new-wallet-error')
      const expectedCreateWalletErrorText = 'Wallet name already exists'
      expect(createNewWalletErrorText).toBe(expectedCreateWalletErrorText)
    })

    it('must not allow wallet name greater than 24 characters', async () => {
      await page.type('[data-testing-id=input-enter-wallet-name]', '11111111111111111')
      const inputEnterWalletNameValue = await getInputElementValue(page, 'input-enter-wallet-name')

      const expectedInputEnterWalletNameValue = 'Wallet 11111111111111111'
      expect(inputEnterWalletNameValue).toBe(expectedInputEnterWalletNameValue)
    })

    it('must allow creating a new wallet given a new wallet name', async () => {
      await page.click('[data-testing-id=btn-create-wallet]')
      const homeCreateWalletBtnText = await getElementInnerText(page, 'home-create-wallet-btn')

      const expectedHomeCreateWalletBtnText = 'Wallet 111...'
      expect(homeCreateWalletBtnText).toBe(expectedHomeCreateWalletBtnText)
    })
  })
}
