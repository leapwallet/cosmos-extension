export function parseBitcoinTx(tx: any, nativeDenom?: string, address?: string) {
  const fromAddr = tx?.vin?.[0]?.prevout?.scriptpubkey_address ?? '';

  let recipient;
  let toAddr;
  const vout = tx?.vout ?? [];

  if (fromAddr.toLowerCase() === (address ?? '').toLowerCase()) {
    recipient = vout?.find((item: any) => item.scriptpubkey_address?.toLowerCase() !== (address ?? '').toLowerCase());
    toAddr = recipient?.scriptpubkey_address;
  } else {
    recipient = vout?.find((item: any) => item.scriptpubkey_address?.toLowerCase() === (address ?? '').toLowerCase());
    toAddr = address;
  }

  const parsedTx = {
    height: tx?.status?.block_height,
    txHash: tx?.txid,
    code: 0,
    isSuccessful: tx?.status?.confirmed,
    timestamp: (tx?.status?.block_time ?? 1) * 1000,
    gasWanted: 1,
    gasUsed: tx?.fee,
    fee: {
      amount: [
        {
          amount: tx?.fee,
          denom: nativeDenom,
        },
      ],
      gasLimit: 1,
    },
    memo: '',
    timeoutHeight: '0',
    types: [],
    messages: [
      {
        __type: '',
        fromAddress: fromAddr,
        toAddress: toAddr,
        tokens: [
          {
            denomination: nativeDenom,
            quantity: recipient?.value,
          },
        ],
      },
    ],
  };

  if (recipient?.value > 0) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    parsedTx.types.push('cosmos.bank.send');
    parsedTx.messages[0].__type = 'cosmos.bank.send';
  }

  return parsedTx;
}
