import { beforeAll, describe, expect, it } from '@jest/globals'
import { Page } from 'puppeteer'

import { PASSWORD } from '../constants'
import { clearInputField, getElement, getElementInnerText } from '../element-utils'
import { getActivePage } from '../utils'

export function lockWalletTest() {
  return describe('Lock wallet', () => {
    let page: Page

    beforeAll(() => {
      page = getActivePage()
    })

    it('must show lock wallet card in sidenav on hamburger icon click', async () => {
      await page.click('[data-testing-id=home-sidenav-hamburger-btn]')
      const element = await getElement(page, 'sidenav-lock-wallet-card')
      expect(element).not.toBeNull()
    })

    it('must show login page with text Enter your password to unlock wallet on Lock Wallet click', async () => {
      await page.click('[data-testing-id=sidenav-lock-wallet-card]')
      const loginEnterYourPasswordEleText = await getElementInnerText(
        page,
        'login-enter-your-password-ele',
      )

      const expectedText = 'Enter your password to unlock wallet'
      expect(loginEnterYourPasswordEleText).toBe(expectedText)
    })

    it('must give an error given a wrong password', async () => {
      await page.type('[data-testing-id=login-input-enter-password]', `${PASSWORD}@`)
      await page.click('[data-testing-id=btn-unlock-wallet]')

      const loginErrorText = await getElementInnerText(page, 'login-error-text')
      const expectedLoginErrorText = 'Incorrect password. Please try again'
      expect(loginErrorText).toBe(expectedLoginErrorText)
    })

    it('must unlock the wallet and show Cosmos address given a correct password', async () => {
      await clearInputField(page, 'login-input-enter-password')
      await page.type('[data-testing-id=login-input-enter-password]', PASSWORD)
      await page.click('[data-testing-id=btn-unlock-wallet]')

      let homeCopyAddressBtnText = await getElementInnerText(page, 'home-copy-address-btn')
      homeCopyAddressBtnText = homeCopyAddressBtnText.slice(0, 5)
      const expectedHomeCopyAddressBtnText = 'cosmo'
      expect(homeCopyAddressBtnText).toBe(expectedHomeCopyAddressBtnText)
    })
  })
}
