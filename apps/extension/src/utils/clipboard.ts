export class UserClipboard {
  /**
   * Copy text to clipboard
   */
  static async copyText(text: string): Promise<boolean> {
    try {
      await window.navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }
  /**
   * Paste text from clipboard
   */
  static async pasteText(): Promise<string | null> {
    try {
      const text = await window.navigator.clipboard.readText()
      return text
    } catch {
      return null
    }
  }
}
