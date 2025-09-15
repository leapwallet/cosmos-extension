export function parseFormaTx(tx: any, nativeDenom?: string) {
  const parsedTx = {
    height: tx.block,
    txHash: tx.hash,
    code: 0,
    isSuccessful: tx.status === 'ok',
    timestamp: tx.timestamp,
    gasWanted: tx.gas_limit,
    gasUsed: tx.gas_used,
    fee: {
      amount: [
        {
          amount: tx.gas_price,
          denom: nativeDenom,
        },
      ],
      gasLimit: tx.gas_limit,
    },
    memo: '',
    timeoutHeight: '0',
    types: [],
    messages: [
      {
        __type: '',
        fromAddress: tx.from.hash,
        toAddress: tx.to.hash,
        tokens: [
          {
            denomination: nativeDenom,
            quantity: tx.value,
          },
        ],
      },
    ],
  };

  if (tx.tx_types.includes('coin_transfer')) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parsedTx.types.push('cosmos.bank.send');
    parsedTx.messages[0].__type = 'cosmos.bank.send';
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parsedTx.types.push(tx.tx_types[0]);
    parsedTx.messages[0].__type = tx.tx_types[0];
  }

  return parsedTx;
}
