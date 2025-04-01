import { beforeAll, describe, expect, it } from '@jest/globals'
import { Page } from 'puppeteer'

import { getElement } from '../element-utils'
import { getActivePage } from '../utils'

export function removeWalletTest() {
  return describe('Remove a wallet', () => {
    let page: Page

    beforeAll(() => {
      page = getActivePage()
    })

    it('must remove the last wallet from the wallet list', async () => {
      await page.click('[data-testing-id=home-create-wallet-btn]')
      await page.click('[data-testing-id=btn-more-horiz]')
      await page.click('[data-testing-id=btn-remove-wallet-bin]')
      await page.click('[data-testing-id=btn-remove-wallet]')

      const importSeedPhraseEle = await getElement(page, 'import-seed-phrase')
      expect(importSeedPhraseEle).not.toBeNull()
    })
  })
}
