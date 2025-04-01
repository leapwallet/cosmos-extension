/**
 * Normalizes a mnemonic seed phrase string by:
 * 1. Trimming whitespace from start and end
 * 2. Splitting on any amount of whitespace (\s+)
 * 3. Joining words back together with single spaces
 *
 * This ensures consistent formatting regardless of input spacing:
 * - Removes leading/trailing spaces
 * - Collapses multiple spaces between words
 * - Handles tabs and newlines
 *
 * @param s The mnemonic seed phrase string to normalize
 * @returns The normalized mnemonic with single spaces between words
 */
const correctMnemonic = (s: string) => s.trim().split(/\s+/).join(' ')

export default correctMnemonic
