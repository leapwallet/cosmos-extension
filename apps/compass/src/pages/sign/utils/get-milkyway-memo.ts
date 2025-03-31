export const getMilkywayMemo = (
  txnSigningRequest: Record<string, any>,
  docDecoderJson: Record<string, any>,
  _memo: string,
) => {
  let memo = _memo
  if (txnSigningRequest?.origin?.includes('milkyway.zone')) {
    const memoToAdd = 'Milk:79a7a0305165d00'
    // memo to be added for liquid stake/unstake txn with milkyway
    if (
      txnSigningRequest?.isAmino &&
      (docDecoderJson?.msgs?.[0]?.value?.memo?.includes('liquid_stake') ||
        !!docDecoderJson?.msgs?.[0]?.value?.msg?.liquid_unstake)
    ) {
      memo = memoToAdd
    }

    if (
      !txnSigningRequest?.isAmino &&
      (docDecoderJson?.txBody?.messages?.[0]?.memo?.includes('liquid_stake') ||
        !!docDecoderJson?.txBody?.messages?.[0]?.msg?.liquid_unstake)
    ) {
      memo = memoToAdd
    }
  }
  return memo
}
