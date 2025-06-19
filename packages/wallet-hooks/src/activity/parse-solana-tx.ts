import { ParsedMessage, ParsedMessageType, ParsedTransaction } from '@leapwallet/parser-parfait';

export async function parseSolanaTx(tx: any, signature: string, address: string): Promise<ParsedTransaction | null> {
  if (!tx || tx.transactionError !== null) {
    console.warn(`Skipping invalid Solana transaction object for signature: ${signature}`);
    return null;
  }

  const isSuccessful = tx.transactionError === null;

  const types: ParsedMessageType[] = [];
  const messages: ParsedMessage[] = [];

  for (const ix of tx.instructions) {
    let message: ParsedMessage | null = null;
    let messageType: ParsedMessageType = ParsedMessageType.Unimplemented;

    if (
      ix.programId === '11111111111111111111111111111111' &&
      ix.accounts.length === 2 &&
      ix.accounts.includes(address)
    ) {
      const [fromAddress, toAddress] = ix.accounts;
      messageType = ParsedMessageType.BankSend;
      message = {
        __type: messageType,
        fromAddress,
        toAddress,
        tokens: [
          {
            denomination: 'lamports',
            quantity:
              tx.nativeTransfers
                .find((nt: any) => nt.fromUserAccount === fromAddress && nt.toUserAccount === toAddress)
                ?.amount.toString() || '0',
          },
        ],
      };
    } else if (ix.programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
      const { fromUserAccount, toUserAccount, tokenAmount, mint } = tx.tokenTransfers[0];
      messageType = ParsedMessageType.BankSend;
      message = {
        __type: messageType,
        fromAddress: fromUserAccount,
        toAddress: toUserAccount,
        tokens: [
          {
            denomination: mint,
            quantity: tokenAmount.toString(),
          },
        ],
      };
    }

    if (message) {
      messages.push(message);
      types.push(messageType);
    }
  }

  const parsedTx: ParsedTransaction = {
    height: tx.slot.toString(),
    txHash: signature,
    code: isSuccessful ? 0 : 1,
    isSuccessful,
    gasWanted: '0',
    gasUsed: '0',
    fee: {
      amount: [
        {
          amount: tx.fee.toString(),
          denom: 'lamports',
        },
      ],
      gasLimit: '0',
    },
    memo: '',
    timeoutHeight: '',
    timestamp: new Date(tx.timestamp * 1000).toISOString(),
    types,
    messages,
  };

  return parsedTx;
}
