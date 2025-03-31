import path from 'path'
import puppeteer, { Browser, Page } from 'puppeteer'

/**
 * variables to share between different files
 */
let browser: Browser
let page: Page

/**
 *
 * @returns chrome browser
 */
async function getBrowser(): Promise<Browser> {
  const extensionPath = path.join(__dirname, '..', 'builds/cosmos-build')

  return await puppeteer.launch({
    headless: false,
    slowMo: 100,
    executablePath: process.env.PUPPETEER_EXEC_PATH,
    args: [
      '--no-sandbox',
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  })
}

/**
 *
 * @param {Browser} browser reference to the chrome browser
 * @returns the base url of the extension
 */
function getBaseURL(browser: Browser): string {
  const extensionTarget = browser.targets().find((target) => target.type() === 'service_worker')
  const partialExtensionUrl = extensionTarget?.url() || ''
  const [, , extensionId] = partialExtensionUrl.split('/')

  return `chrome-extension://${extensionId}`
}

/**
 *
 * @param {Browser} browser reference to the chrome browser
 * @returns the first page that opens when you install the extension
 */
async function getPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage()
  const baseURL = getBaseURL(browser)

  const context = browser.defaultBrowserContext()
  await context.overridePermissions(baseURL, ['clipboard-read', 'clipboard-write'])

  await page.goto(`${baseURL}/index.html`)
  await page.bringToFront()

  const pages = await browser.pages()
  const _page = pages.pop() as Page

  await _page.setViewport({
    width: 1200,
    height: 800,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global as any).page = _page

  return _page
}

export type SetupBrowser = {
  readonly browser: Browser
  readonly page: Page
}

/**
 *
 * @returns Promise<SetupBrowser>
 */
export async function setUpBrowser(): Promise<SetupBrowser> {
  browser = await getBrowser()
  page = await getPage(browser)

  return { browser, page }
}

/**
 *
 * @returns active browser
 */
export function getActiveBrowser(): Browser {
  return browser
}

/**
 *
 * @returns actie page
 */
export function getActivePage(): Page {
  return page
}

/**
 *
 */
export async function setNewActivePage() {
  page = await getPage(browser)
}

/**
 *
 * @param {number} milliseconds time to sleep
 * @returns Promise<unknown>
 */
export async function sleep(milliseconds: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
