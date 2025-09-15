export const isLedgerDisconnected = (error: string | undefined | null) => {
  if (!error) return false
  return error
    ?.toLowerCase()
    ?.includes(
      'unable to connect to ledger device. please check if your ledger is connected and try again.',
    )
}
