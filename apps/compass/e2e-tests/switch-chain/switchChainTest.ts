import { beforeAll, describe, expect, it } from '@jest/globals'
import { Page } from 'puppeteer'

import { clearInputField, getElementInnerText } from '../element-utils'
import { getActivePage } from '../utils'

export function switchChainTest() {
  return describe('Switch Chains', () => {
    let page: Page

    beforeAll(() => {
      page = getActivePage()
    })

    it('must show no results given an invalid chain in search', async () => {
      await page.click('[data-testing-id=home-switch-chain-btn]')
      await page.type('[data-testing-id=switch-chain-input-search]', 'abc')
      const emptyCardHeadingEleText = await getElementInnerText(
        page,
        'switch-chain-empty-card-heading-ele',
      )

      const expectedEmptyCardHeadingEleText = 'No results for abc'
      expect(emptyCardHeadingEleText).toBe(expectedEmptyCardHeadingEleText)
    })

    it('must show osmosis chain given osmosis as input in search', async () => {
      await clearInputField(page, 'switch-chain-input-search')
      await page.type('[data-testing-id=switch-chain-input-search]', 'osmosis')

      const switchChainOsmosisEleText = await getElementInnerText(page, 'switch-chain-osmosis-ele')
      const expectedSwitchChainOsmosisEleText = 'Osmosis'

      expect(switchChainOsmosisEleText).toBe(expectedSwitchChainOsmosisEleText)
    })

    it('must switch to osmosis chain', async () => {
      await page.click('[data-testing-id=switch-chain-osmosis-ele]')
      let homeCopyAddressBtnText = await getElementInnerText(page, 'home-copy-address-btn')

      homeCopyAddressBtnText = homeCopyAddressBtnText.slice(0, 4)
      const expectedHomeCopyAddressBtnText = 'osmo'
      expect(homeCopyAddressBtnText).toBe(expectedHomeCopyAddressBtnText)
    })
  })
}
