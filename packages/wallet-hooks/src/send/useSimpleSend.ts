import { coin, OfflineSigner } from '@cosmjs/proto-signing';
import { StdFee } from '@cosmjs/stargate';
import {
  Dict,
  EthermintTxHandler,
  getSourceChainChannelId,
  InjectiveTx,
  isEthAddress,
  isValidAddress,
  isValidAddressWithPrefix,
  NativeDenom,
  SigningSscrt,
  SupportedChain,
  toSmall,
  transactionDeclinedError,
  Tx,
} from '@leapwallet/cosmos-wallet-sdk';
import * as bech32 from 'bech32';
import { BigNumber } from 'bignumber.js';
import { useCallback, useState } from 'react';
import { Wallet } from 'secretjs';

import { CosmosTxType } from '../connectors';
import { useValidateIbcChannelId } from '../ibc/useValidateIbcChannelId';
import { useActiveChain, useActiveWalletStore, useAddressPrefixes, useChainsStore, useDenoms } from '../store';
import { useChainInfo } from '../store/useChainInfo';
import { useCW20TxHandler, useScrtTxHandler, useTxHandler } from '../tx';
import { WALLETTYPE } from '../types';
import { ActivityCardContent } from '../types/activity';
import { Token } from '../types/bank';
import { sliceAddress } from '../utils/strings';
import { getMetaDataForIbcTx, getMetaDataForSendTx } from './get-metadata';
import { useIsCW20Tx } from './useIsCW20Tx';

type _TokenDenom = {
  ibcDenom?: string;
} & NativeDenom;

export type sendTokensParams = {
  toAddress: string;
  selectedToken: Token;
  amount: BigNumber;
  memo: string;
  getWallet: () => Promise<OfflineSigner | Wallet>;
  fees: StdFee;
  ibcChannelId?: string;
  txHandler?: SigningSscrt | InjectiveTx | EthermintTxHandler | Tx;
};

export type sendTokensReturnType =
  | { success: false; errors: string[] }
  | {
      success: true;
      pendingTx: ActivityCardContent & {
        txHash?: string;
        promise: Promise<any>;
        txStatus: 'loading' | 'success' | 'failed';
        feeDenomination?: string;
        feeQuantity?: string;
      };
      data?: {
        txHash: string;
        txType: CosmosTxType;
        metadata: Dict;
        feeDenomination: string;
        feeQuantity: string;
      };
    };

const getSourceChannelIdUnsafe = async (srcChain: string, destChain: string): Promise<string | undefined> => {
  try {
    const id = await getSourceChainChannelId(srcChain, destChain);
    return id;
  } catch (e) {
    return undefined;
  }
};

export const useSimpleSend = () => {
  const [showLedgerPopup, setShowLedgerPopup] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const denoms = useDenoms();
  const chainInfo = useChainInfo();
  const activeChain = useActiveChain();
  const { activeWallet } = useActiveWalletStore();
  const getTxHandler = useTxHandler();
  const getScrtTxHandler = useScrtTxHandler();
  const getCW20TxClient = useCW20TxHandler();
  const checkIsCW20Tx = useIsCW20Tx();
  const addressPrefixes = useAddressPrefixes();
  const validateIbcChannelId = useValidateIbcChannelId();
  const { chains } = useChainsStore();

  const sendCW20 = useCallback(
    async ({
      wallet,
      fromAddress,
      toAddress,
      selectedDenom,
      memo,
      fees,
      amount,
    }: {
      wallet: Wallet;
      fromAddress: string;
      toAddress: string;
      selectedDenom: _TokenDenom;
      memo: string;
      fees: StdFee;
      amount: BigNumber;
    }): Promise<sendTokensReturnType> => {
      try {
        const client = await getCW20TxClient(wallet);
        const promise = client.execute(
          fromAddress,
          selectedDenom.coinMinimalDenom,
          {
            transfer: { recipient: toAddress, amount: amount.times(10 ** selectedDenom?.coinDecimals ?? 6).toString() },
          },
          fees,
          memo,
        );

        return {
          success: true,
          pendingTx: {
            img: chainInfo.chainSymbolImageUrl,
            sentAmount: amount.toString(),
            sentTokenInfo: selectedDenom,
            sentUsdValue: '',
            subtitle1: `to ${sliceAddress(toAddress)}`,
            title1: `Sent ${selectedDenom.coinDenom}`,
            txStatus: 'loading',
            txType: 'cw20TokenTransfer',
            promise,
            feeDenomination: fees.amount[0].denom,
            feeQuantity: fees.amount[0].amount,
          },
        };
      } catch (error) {
        return {
          success: false,
          errors: ['Transaction declined'],
        };
      }
    },
    [],
  );

  const sendSnip20 = useCallback(
    ({
      wallet,
      fromAddress,
      toAddress,
      selectedDenom,
      amount,
      txHandler,
    }: {
      wallet: Wallet;
      fromAddress: string;
      toAddress: string;
      selectedDenom: _TokenDenom;
      amount: BigNumber;
      txHandler?: SigningSscrt;
    }): sendTokensReturnType => {
      try {
        const _txHandler = txHandler ?? getScrtTxHandler(wallet);
        const promise = _txHandler.transfer(fromAddress, selectedDenom.coinMinimalDenom, {
          transfer: { recipient: toAddress, amount: amount.decimalPlaces(selectedDenom?.coinDecimals ?? 6).toString() },
        });

        return {
          success: true,
          pendingTx: {
            img: chainInfo.chainSymbolImageUrl,
            sentAmount: amount.toString(),
            sentTokenInfo: selectedDenom,
            sentUsdValue: '',
            subtitle1: `to ${sliceAddress(toAddress)}`,
            title1: `Sent ${selectedDenom.coinDenom}`,
            txStatus: 'loading',
            txType: 'secretTokenTransfer',
            promise,
          },
        };
      } catch (e: any) {
        if (e.message === transactionDeclinedError.message) {
          return {
            success: false,
            errors: ['Transaction declined'],
          };
        } else {
          return {
            success: false,
            errors: [e.message?.slice(0, 60)],
          };
        }
      }
    },
    [],
  );

  const send = useCallback(
    async ({
      wallet,
      fromAddress,
      toAddress,
      selectedDenom,
      amount,
      memo,
      fees,
      txHandler,
      ibcChannelId: _ibcChannelId,
    }: {
      wallet: OfflineSigner;
      fromAddress: string;
      toAddress: string;
      selectedDenom: _TokenDenom;
      amount: BigNumber;
      memo: string;
      fees: StdFee;
      txHandler?: InjectiveTx | EthermintTxHandler | Tx;
      ibcChannelId?: string;
    }): Promise<sendTokensReturnType> => {
      try {
        const _tx = txHandler ?? (await getTxHandler(wallet));

        const srcChainPrefix = bech32.decode(fromAddress).prefix;
        const destChainPrefix = bech32.decode(toAddress).prefix;

        const srcChainKey = addressPrefixes[srcChainPrefix] as SupportedChain;
        const destChainKey = addressPrefixes[destChainPrefix] as SupportedChain;

        if (!destChainKey) {
          return {
            success: false,
            errors: ['Destination chain not supported'],
          };
        }

        const isIBCTx = srcChainPrefix !== destChainPrefix;

        const srcChainRegistryPath = chains[srcChainKey]?.chainRegistryPath;
        const destChainRegistryPath = chains[destChainKey]?.chainRegistryPath;
        const srcChainName = chains[srcChainKey].chainName;
        const destChainName = chains[destChainKey].chainName;

        if (!destChainRegistryPath) {
          return {
            success: false,
            errors: ['Destination chain not supported'],
          };
        }

        const normalizedAmount = toSmall(amount.toString(), selectedDenom?.coinDecimals ?? 6);

        let token = selectedDenom.ibcDenom || selectedDenom.coinMinimalDenom;
        token = isEthAddress(token) ? `erc20/${token}` : token;
        const amountOfCoins = coin(normalizedAmount, token);

        if (!_tx) {
          throw new Error('Unable to send tokens. Please try again later.');
        }

        let txHash: string;
        let metadata: {
          token: { amount: string; denom: string };
          toAddress: string;
          sourceChannel?: string;
          toChain?: string;
        };

        const ibcChannelId =
          _ibcChannelId ?? (await getSourceChannelIdUnsafe(srcChainRegistryPath, destChainRegistryPath));

        if (isIBCTx) {
          if (!ibcChannelId) {
            return {
              success: false,
              errors: [`No active IBC channels from ${srcChainName} to ${destChainName}`],
            };
          }
          const response = await validateIbcChannelId(ibcChannelId, srcChainKey, destChainKey);
          if (!response.success) {
            return {
              success: false,
              errors: [response.message],
            };
          }
          txHash = await _tx.sendIBCTokens(
            fromAddress,
            toAddress,
            amountOfCoins,
            'transfer',
            ibcChannelId,
            undefined,
            Math.floor(Date.now() / 1000) + 120,
            fees,
            memo,
          );
          metadata = getMetaDataForIbcTx(ibcChannelId, toAddress, {
            denom: selectedDenom.coinMinimalDenom,
            amount: normalizedAmount,
          });
        } else {
          txHash = await _tx.sendTokens(fromAddress, toAddress, [amountOfCoins], fees, memo);
          metadata = getMetaDataForSendTx(toAddress, coin(normalizedAmount, selectedDenom.coinMinimalDenom));
        }

        const txType = isIBCTx ? CosmosTxType.IbcSend : CosmosTxType.Send;

        const pollPromise = _tx.pollForTx(txHash);

        return {
          success: true,
          pendingTx: {
            txHash,
            img: chainInfo.chainSymbolImageUrl,
            sentAmount: amount.toString(),
            sentTokenInfo: selectedDenom as unknown as NativeDenom,
            sentUsdValue: '',
            subtitle1: `to ${sliceAddress(toAddress)}`,
            title1: `Sent ${selectedDenom.coinDenom}`,
            txStatus: 'loading',
            txType: isIBCTx ? 'ibc/transfer' : 'send',
            promise: pollPromise,
          },
          data: {
            txHash,
            txType,
            metadata,
            feeDenomination: fees.amount[0].denom,
            feeQuantity: fees.amount[0].amount,
          },
        };
      } catch (e: any) {
        if (e.message === transactionDeclinedError.message) {
          return {
            success: false,
            errors: ['Transaction declined'],
          };
        } else {
          return {
            success: false,
            errors: [e.message?.slice(0, 200)],
          };
        }
      }
    },
    [addressPrefixes],
  );

  const sendTokens = useCallback(
    async ({
      toAddress,
      selectedToken,
      fees,
      amount,
      getWallet,
      memo,
      txHandler,
      ibcChannelId,
    }: sendTokensParams): Promise<sendTokensReturnType> => {
      setIsSending(true);

      if (!selectedToken) {
        return {
          success: false,
          errors: ['No token selected'],
        };
      }

      if (!toAddress?.trim()) {
        return {
          success: false,
          errors: ['No recipient address provided'],
        };
      }

      if (!isValidAddress(toAddress)) {
        return {
          success: false,
          errors: ['Invalid recipient address'],
        };
      }

      if (!activeWallet) {
        return {
          success: false,
          errors: ['No active wallet'],
        };
      }

      if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
        setShowLedgerPopup(true);
      }

      let result: sendTokensReturnType;
      const selectedDenomData =
        denoms[selectedToken.coinMinimalDenom as keyof typeof denoms] ??
        Object.values(chainInfo.nativeDenoms).find(
          (denom) => denom.coinMinimalDenom === selectedToken.coinMinimalDenom,
        );

      if (!selectedDenomData) {
        return {
          success: false,
          errors: ['We do not support transferring this token yet'],
        };
      }

      const isSnip20Tx = isValidAddressWithPrefix(selectedToken.coinMinimalDenom ?? '', 'secret');
      const isCW20Tx = checkIsCW20Tx(selectedToken);

      if (isCW20Tx) {
        result = await sendCW20({
          fromAddress: activeWallet.addresses[activeChain],
          amount: amount,
          toAddress,
          selectedDenom: {
            ibcDenom: selectedToken.ibcDenom,
            ...selectedDenomData,
          },
          memo,
          fees,
          wallet: (await getWallet()) as Wallet,
        });
      } else if (isSnip20Tx) {
        result = sendSnip20({
          fromAddress: activeWallet.addresses[activeChain],
          amount: amount,
          selectedDenom: {
            ibcDenom: selectedToken.ibcDenom,
            ...selectedDenomData,
          },
          toAddress,
          wallet: (await getWallet()) as Wallet,
          txHandler: txHandler as SigningSscrt,
        });
      } else {
        result = await send({
          fromAddress: activeWallet.addresses[activeChain],
          amount: amount,
          wallet: (await getWallet()) as OfflineSigner,
          selectedDenom: {
            ibcDenom: selectedToken.ibcDenom,
            ...selectedDenomData,
          },
          toAddress,
          ibcChannelId,
          memo,
          fees,
          txHandler: txHandler as InjectiveTx | EthermintTxHandler | Tx,
        });
      }

      setShowLedgerPopup(false);
      setIsSending(false);

      return result;
    },
    [denoms, activeWallet, activeChain, chainInfo, send, sendCW20, sendSnip20],
  );

  return {
    showLedgerPopup,
    sendTokens,
    isSending,
  };
};
