export function parseAnkrTx(tx: any, nativeDenom?: string) {
  const parsedTx = {
    height: Number(tx.blockNumber),
    txHash: tx.hash,
    code: 0,
    isSuccessful: Number(tx.status) === 1,
    timestamp: Number(tx.timestamp) * 1000,
    gasWanted: Number(tx.gas),
    gasUsed: Number(tx.gasUsed),
    fee: {
      amount: [
        {
          amount: Number(tx.gasPrice) * Number(tx.gasUsed),
          denom: nativeDenom,
        },
      ],
      gasLimit: Number(tx.gas),
    },
    memo: '',
    timeoutHeight: '0',
    types: [],
    messages: [
      {
        __type: '',
        fromAddress: tx.from,
        toAddress: tx.to,
        tokens: [
          {
            denomination: nativeDenom,
            quantity: Number(tx.value),
          },
        ],
      },
    ],
  };

  if (Number(tx.value) > 0) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parsedTx.types.push('cosmos.bank.send');
    parsedTx.messages[0].__type = 'cosmos.bank.send';
  }

  return parsedTx;
}
