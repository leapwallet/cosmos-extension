import { ElementHandle, Page } from 'puppeteer'

/**
 *
 * @param {Page} page - active page
 * @param {string} dataTestingId - element data-testing-id
 * @returns Promise<ElementHandle<HTMLElement>>
 */
export async function getElement<T extends HTMLElement>(
  page: Page,
  dataTestingId: string,
): Promise<ElementHandle<T>> {
  const element = (await page.$(`[data-testing-id=${dataTestingId}]`)) as ElementHandle<T>
  return element
}

/**
 *
 * @param {Page} page - acitve page
 * @param {string} dataTestingId - element data-testing-id
 * @returns Promise<string>
 */
export async function getElementInnerText(page: Page, dataTestingId: string): Promise<string> {
  const element = await getElement<HTMLElement>(page, dataTestingId)
  const innerText = await page.evaluate((element) => element.innerText.trim(), element)
  return innerText
}

/**
 *
 * @param {Page} page - active page
 * @param {string} dataTestingId - element data-testing-id
 * @returns Promise<string>
 */
export async function getInputElementValue(page: Page, dataTestingId: string): Promise<string> {
  const element = await getElement<HTMLInputElement>(page, dataTestingId)
  const value = await page.evaluate((element) => element.value.trim(), element)
  return value
}

/**
 *
 * @param {Page} page - active page
 * @param {string} dataTestingId - element data-testing-id
 */
export async function clearInputField(page: Page, dataTestingId: string) {
  const element = await getElement<HTMLInputElement>(page, dataTestingId)
  await element.click({ clickCount: 3 })
  await element.press('Backspace')
}
