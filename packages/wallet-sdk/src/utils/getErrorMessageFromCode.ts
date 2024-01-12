export const sdkErrors: Record<number, string> = {
  2: 'due to transaction parsing failure.',
  3: 'due to incorrect sequence number (nonce) for the signature.',
  4: 'due to invalid transaction signature.',
  5: 'due to insufficient account funds.',
  6: 'due to unrecognized request.',
  7: 'due to invalid address.',
  8: 'due to invalid public key.',
  9: 'due to unknown address.',
  10: 'due to invalid coins.',
  11: 'as the operation ran out of gas.',
  12: 'as the memo was too long.',
  13: 'due to insufficient fee.',
  14: 'as maximum number of signatures was exceeded.',
  15: 'as no signatures were supplied.',
  16: 'as conversion to JSON format failed.',
  17: 'as conversion from JSON format failed.',
  18: 'due to invalid request data.',
  19: 'as transaction already exists in the mempool.',
  20: 'as the mempool is full.',
  21: 'as the transaction is too large.',
  22: 'due to key not found.',
  23: 'due to invalid account password.',
  24: 'as intended signer of the transaction does not match the given signer.',
  25: 'due to invalid gas adjustment.',
  26: 'due to invalid height.',
  27: 'due to invalid version.',
  28: 'due to invalid chain-id.',
  29: 'due to invalid type.',
  30: 'as transaction was rejected due to timeout height.',
  31: 'due to unknown extension options.',
  32: 'as account sequence in signer info does not match actual account sequence.',
  33: 'as packing of protobuf message to Any failed.',
  34: 'as unpacking of protobuf message from Any failed.',
  35: 'due to internal logic error.',
  36: 'due to conflict while accessing a shared resource.',
  37: 'as the requested feature is not supported.',
  38: "as the requested entity doesn't exist in the state.",
  39: 'due to internal Input/Output error.',
  40: 'due to error in application configuration (app.toml).',
  41: 'due to invalid gas limit.',
};

export function getErrorMessageFromCode(errorCode: number, codespace = 'sdk') {
  if (codespace === 'sdk') {
    return sdkErrors[errorCode] ?? 'due to an unknown error.';
  }

  return 'due to an unknown error.';
}
