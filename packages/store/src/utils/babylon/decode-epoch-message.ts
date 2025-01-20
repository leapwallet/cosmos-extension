type Amount = {
  denom: string;
  amount: string;
};

export type EpochMessage = {
  delegatorAddress: string;
  amount: Amount;
  validatorAddress: string | null;
  validatorSrcAddress: string | null;
  validatorDstAddress: string | null;
  creationHeight: string | null;
};

const parseAmount = (amountStr: string): Amount | null => {
  const denomMatch = amountStr.match(/denom:"([^"]+)"/);
  const amountMatch = amountStr.match(/amount:"([^"]+)"/);

  if (!denomMatch || !amountMatch) {
    return null;
  }

  return {
    denom: denomMatch[1],
    amount: amountMatch[1],
  };
};

/**
 * Decode an epoch message.
 * @param message - The message to decode.
 * @returns The decoded message or null if the message is not an epoch message.
 *
 * @example
 * ```ts
 * const message = 'delegator_address:\"bbn19vf5mfr40awvkefw69nl6p3mmlsnacmmaeh4lw\" validator_address:\"bbnvaloper1xm5tppshu94jvsa0007j6c5da8apuzv0w0cdlj\" amount:<denom:\"ubbn\" amount:\"100000\" > ';
 * decodeEpochMessage(message);
 * // {
 * //   delegatorAddress: 'bbn19vf5mfr40awvkefw69nl6p3mmlsnacmmaeh4lw',
 * //   validatorAddress: 'bbnvaloper1xm5tppshu94jvsa0007j6c5da8apuzv0w0cdlj',
 * //   validatorSrcAddress: null,
 * //   validatorDstAddress: null,
 * //   amount: { denom: 'ubbn', amount: '100000' }
 * //   creationHeight: null,
 * // }
 *
 * const message2 = 'delegator_address:"bbn19vf5mfr40awvkefw69nl6p3mmlsnacmmaeh4lw" validator_src_address:"bbnvaloper1galkwe9c6hxd9ymar0hxaljwxzet6p4edfg7jg" validator_dst_address:"bbnvaloper1xm5tppshu94jvsa0007j6c5da8apuzv0w0cdlj" amount:<denom:"ubbn" amount:"400000" >
 * decodeEpochMessage(message2);
 * // {
 * //   delegatorAddress: 'bbn19vf5mfr40awvkefw69nl6p3mmlsnacmmaeh4lw',
 * //   validatorAddress: null,
 * //   validatorSrcAddress: 'bbnvaloper1galkwe9c6hxd9ymar0hxaljwxzet6p4edfg7jg',
 * //   validatorDstAddress: 'bbnvaloper1xm5tppshu94jvsa0007j6c5da8apuzv0w0cdlj',
 * //   amount: { denom: 'ubbn', amount: '400000' }
 * //   creationHeight: null,
 * // }
 * ```
 */
export const decodeEpochMessage = (message: string): EpochMessage | null => {
  const amountMatch = message.match(/amount:<([^>]+)>/);
  if (!amountMatch) return null;

  const amount = parseAmount(amountMatch[1]);
  if (!amount) return null;

  const delegatorMatch = message.match(/delegator_address:"([^"]+)"/);
  if (!delegatorMatch) return null;

  const validatorMatch = message.match(/validator_address:"([^"]+)"/);
  const validatorSrcAddress = message.match(/validator_src_address:"([^"]+)"/);
  const validatorDstAddress = message.match(/validator_dst_address:"([^"]+)"/);
  const creationHeight = message.match(/creation_height:([^ ]+)/);

  return {
    amount,
    delegatorAddress: delegatorMatch[1],
    validatorAddress: validatorMatch ? validatorMatch[1] : null,
    creationHeight: creationHeight ? creationHeight[1] : null,
    validatorSrcAddress: validatorSrcAddress ? validatorSrcAddress[1] : null,
    validatorDstAddress: validatorDstAddress ? validatorDstAddress[1] : null,
  };
};
