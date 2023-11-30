import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from '../config/config'

export function formatWalletName(name: string) {
  return name.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '').trim()
}
