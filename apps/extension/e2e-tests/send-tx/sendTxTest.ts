import { beforeAll, describe, expect, it } from '@jest/globals'
import { Page } from 'puppeteer'

import {
  NOBLE_TEST_WALLET_ADDRESS,
  OSMOSIS_TEST_WALLET_ADDRESS,
  OTHER_NOBLE_TEST_WALLET_ADDRESS,
} from '../constants'
import {
  clearInputField,
  getElement,
  getElementInnerText,
  getInputElementValue,
} from '../element-utils'
import { getActivePage, sleep } from '../utils'

export function sendTxTest() {
  return describe('Send Tx', () => {
    let page: Page
    let tokenBalance = 0
    let feeValue = 0
    const amount = 0.00001

    beforeAll(() => {
      page = getActivePage()
    })

    it('must switch to noble chain', async () => {
      await page.click('[data-testing-id=home-switch-chain-btn]')
      await page.click('[data-testing-id=switch-chain-noble-ele]')
      let homeCopyAddressBtnText = await getElementInnerText(page, 'home-copy-address-btn')

      homeCopyAddressBtnText = homeCopyAddressBtnText.slice(0, 5)
      const expectedHomeCopyAddressBtnText = 'noble'
      expect(homeCopyAddressBtnText).toBe(expectedHomeCopyAddressBtnText)
    })

    it('must switch to noble testnet', async () => {
      await page.click('[data-testing-id=home-sidenav-hamburger-btn]')
      await page.click('[data-testing-id=sidenav-network-option]')
      await page.click('[data-testing-id=network-testnet-option]')

      const homeAlertStripText = await getElementInnerText(page, 'home-alertstrip-chainname')
      const expectedHomeAlertStripText = 'Noble Testnet'
      expect(homeAlertStripText).toContain(expectedHomeAlertStripText)
    })

    it('must navigate to send page', async () => {
      await page.click('[data-testing-id=home-generic-send-btn]')

      const sendRecipientCardText = await getElementInnerText(page, 'send-recipient-card')
      const expectedSendRecipientCardText = 'Recipient'
      expect(sendRecipientCardText).toBe(expectedSendRecipientCardText)
    })

    it('must give IBC not supported on testnet error given a osmosis testnet address', async () => {
      await page.type('[data-testing-id=input-send-recipient-address]', OSMOSIS_TEST_WALLET_ADDRESS)
      const sendRecipientAddressErrorEleText = await getElementInnerText(
        page,
        'send-recipient-address-error-ele',
      )

      const expectedSendRecipientAddressErrorEleText = 'IBC not supported on testnet'
      expect(sendRecipientAddressErrorEleText).toBe(expectedSendRecipientAddressErrorEleText)
    })

    it('must clear the input field on clicking cross btn', async () => {
      await page.click('[data-testing-id=send-recipient-cross-filled-btn]')
      const inputSendRecipientAddressValue = await getInputElementValue(
        page,
        'input-send-recipient-address',
      )
      const expectedInputSendRecipientAddressValue = ''
      expect(inputSendRecipientAddressValue).toBe(expectedInputSendRecipientAddressValue)
    })

    it('must give Cannot send to self error given the same wallet address', async () => {
      await page.type('[data-testing-id=input-send-recipient-address]', NOBLE_TEST_WALLET_ADDRESS)
      const sendRecipientAddressErrorEleText = await getElementInnerText(
        page,
        'send-recipient-address-error-ele',
      )

      const expectedSendRecipientAddressErrorEleText = 'Cannot send to self'
      expect(sendRecipientAddressErrorEleText).toBe(expectedSendRecipientAddressErrorEleText)
    })

    it('must not give any error given a different noble recipient address', async () => {
      await page.click('[data-testing-id=send-recipient-cross-filled-btn]')
      await page.type(
        '[data-testing-id=input-send-recipient-address]',
        OTHER_NOBLE_TEST_WALLET_ADDRESS.full,
      )

      const sendRecipientAddressErrorEle = await getElement(
        page,
        'send-recipient-address-error-ele',
      )
      expect(sendRecipientAddressErrorEle).toBe(null)
    })

    it('must give Please enter a valid amount error given abc as input', async () => {
      await page.type('[data-testing-id=input-send-enter-amount]', 'abc')
      const sendAmountErrorText = await getElementInnerText(page, 'send-amount-error-ele')
      const expectedSendAmountErrorText = 'Please enter a valid amount'
      expect(sendAmountErrorText).toBe(expectedSendAmountErrorText)
    })

    it('must give Please enter a positive amount error given -1 as input', async () => {
      await clearInputField(page, 'input-send-enter-amount')
      await page.type('[data-testing-id=input-send-enter-amount]', '-1')
      const sendAmountErrorText = await getElementInnerText(page, 'send-amount-error-ele')
      const expectedSendAmountErrorText = 'Please enter a positive amount'
      expect(sendAmountErrorText).toBe(expectedSendAmountErrorText)
    })

    it('must give Insufficient balance error give tokenValue plus 1 as input', async () => {
      await clearInputField(page, 'input-send-enter-amount')

      const sendAmountTokenBalanceText = await getElementInnerText(
        page,
        'send-amount-token-balance',
      )
      tokenBalance = Number(sendAmountTokenBalanceText.split(' ')[1])

      await page.type('[data-testing-id=input-send-enter-amount]', `${tokenBalance + 1}`)
      const sendAmountErrorText = await getElementInnerText(page, 'send-amount-error-ele')
      const expectedSendAmountErrorText = 'Insufficient balance'
      expect(sendAmountErrorText).toBe(expectedSendAmountErrorText)
    })

    it('must not give any error given amount as <0.001', async () => {
      await clearInputField(page, 'input-send-enter-amount')

      let amount = 0.00001
      if (tokenBalance < 0.00001) {
        amount = 0.000001
      }

      await page.type('[data-testing-id=input-send-enter-amount]', `${amount}`)
      const sendAmountErrorEle = await getElement(page, 'send-amount-error-ele')
      expect(sendAmountErrorEle).toBe(null)
    })

    it('must choose the low fee for tx', async () => {
      await page.click('[data-testing-id=send-tx-fee-text]')
      await page.click('[data-testing-id=send-input-low-fee]')

      const sendSelectedFeeText = await getElementInnerText(page, 'send-selected-fee-ele')
      const expectedSendSelectedFeeText = 'Low'
      expect(sendSelectedFeeText).toBe(expectedSendSelectedFeeText)
    })

    it('must have correct send token value in the Review Transaction sheet', async () => {
      const sendSelectedFeeValueEleText = await getElementInnerText(
        page,
        'send-selected-fee-value-ele',
      )
      feeValue = Number(sendSelectedFeeValueEleText.split(' ')[0])

      await page.click('[data-testing-id=send-tx-fee-proceed-btn]')
      await page.click('[data-testing-id=send-review-transfer-btn]')

      const sendReviewSheetInputAmountEleText = await getElementInnerText(
        page,
        'send-review-sheet-inputAmount-ele',
      )
      expect(sendReviewSheetInputAmountEleText).toContain(`${amount}`)
    })

    it('must have correct recipient address in the Review Transaction sheet', async () => {
      const sendReviewSheetToEleText = await getElementInnerText(page, 'send-review-sheet-to-ele')
      expect(sendReviewSheetToEleText).toContain(OTHER_NOBLE_TEST_WALLET_ADDRESS.sliced)
    })

    it('must have correct fee value in the Review Transaction sheet', async () => {
      const sendReviewSheetFeeEleText = await getElementInnerText(page, 'send-review-sheet-fee-ele')
      expect(sendReviewSheetFeeEleText).toContain(`${feeValue}`)
    })

    it('must show Success as the title of the Pending tx card on Activity Page', async () => {
      await page.click('[data-testing-id=send-review-sheet-send-btn]')
      let pendingTxTitleEle = await getElement(page, 'pending-tx-title-ele')
      for (; pendingTxTitleEle === null; await sleep(750)) {
        pendingTxTitleEle = await getElement(page, 'pending-tx-title-ele')
      }

      let pendingTxTitleEleText = ''
      const expectedPendingTxTitleEleText = 'Success'

      for (; pendingTxTitleEleText !== expectedPendingTxTitleEleText; await sleep(750)) {
        pendingTxTitleEleText = await getElementInnerText(page, 'pending-tx-title-ele')
      }

      expect(pendingTxTitleEleText).toBe(expectedPendingTxTitleEleText)
    })
  })
}
