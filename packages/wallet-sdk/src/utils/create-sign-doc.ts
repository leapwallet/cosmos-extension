import { StdFee, StdSignDoc } from '@cosmjs/amino';

export function createSignDoc(
  chainId: string,
  accountNumber: number,
  fromAddress: string,
  toAddress: string,
  amount: { amount: string; denom: string }[],
  fee: StdFee,
  memo: string,
): StdSignDoc {
  return {
    chain_id: chainId,
    account_number: `${accountNumber}`,
    sequence: '0',
    fee,
    memo,
    msgs: [
      {
        type: 'cosmos-sdk/MsgSend',
        value: {
          amount,
          from_address: fromAddress,
          to_address: toAddress,
        },
      },
    ],
  };
}
