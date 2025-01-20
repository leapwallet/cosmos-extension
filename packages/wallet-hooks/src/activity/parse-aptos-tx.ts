import { EntryFunctionPayloadResponse, UserTransactionResponse } from '@aptos-labs/ts-sdk';
import { IbcTraceFetcher } from '@leapwallet/cosmos-wallet-store';
import { ParsedMessageType, ParsedTransaction } from '@leapwallet/parser-parfait';
import BigNumber from 'bignumber.js';

export enum AptosMessageType {
  CoinTransfer = '0x1::coin::transfer',
  AptosAccountTransfer = '0x1::aptos_account::transfer',
  AptosAccountTransferCoins = '0x1::aptos_account::transfer_coins',
}

export async function parseAptosTx(
  tx: UserTransactionResponse,
  ibcTraceFetcher: IbcTraceFetcher,
  lcdUrl: string,
  chainId: string,
  nativeDenom?: string,
): Promise<ParsedTransaction> {
  const timestamp = new Date(Number((Number(tx.timestamp) / 1e3).toFixed(0))).toISOString();
  const parsedTx: ParsedTransaction = {
    height: tx.version,
    txHash: tx.hash,
    code: tx.success ? 0 : 1,
    isSuccessful: tx.success,
    gasWanted: tx.max_gas_amount,
    gasUsed: tx.gas_used,
    fee: {
      amount: [
        {
          amount: new BigNumber(tx.gas_unit_price).multipliedBy(tx.gas_used).toFixed(0),
          denom: nativeDenom ?? '',
        },
      ],
      gasLimit: tx.gas_used,
    },
    memo: '',
    timeoutHeight: tx.expiration_timestamp_secs,
    timestamp,
    types: [],
    messages: [
      {
        __type: '' as ParsedMessageType.BankSend,
        fromAddress: tx.sender,
        toAddress: '',
        tokens: [
          {
            denomination: nativeDenom ?? '',
            quantity: '',
          },
        ],
      },
    ],
  };

  if (tx.payload.type === 'entry_function_payload') {
    const payload = tx.payload as EntryFunctionPayloadResponse;
    switch (payload.function) {
      case '0x1::coin::transfer':
      case '0x1::aptos_account::transfer':
      case '0x1::aptos_account::transfer_coins': {
        const denom =
          payload.function === '0x1::aptos_account::transfer'
            ? nativeDenom
            : (await ibcTraceFetcher.fetchIbcTrace(payload.type_arguments[0] as string, lcdUrl, chainId))
                ?.coinMinimalDenom;
        parsedTx.types.push(ParsedMessageType.BankSend);
        parsedTx.messages[0] = {
          __type: ParsedMessageType.BankSend,
          fromAddress: tx.sender,
          toAddress: payload.arguments[0] as string,
          tokens: [
            {
              denomination: denom ?? '',
              quantity: payload.arguments[1] as string,
            },
          ],
        };
        break;
      }
      default: {
        break;
      }
    }
  }

  return parsedTx;
}
