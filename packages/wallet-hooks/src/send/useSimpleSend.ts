import { Ed25519Account } from '@aptos-labs/ts-sdk';
import { coin, OfflineSigner } from '@cosmjs/proto-signing';
import { StdFee } from '@cosmjs/stargate';
import { parseEther, parseUnits } from '@ethersproject/units';
import {
  APTOS_CHAINS,
  AptosTx,
  BTC_CHAINS,
  BtcTx,
  convertScientificNotation,
  denoms as DefaultDenoms,
  DenomsRecord,
  Dict,
  EthermintTxHandler,
  getSourceChainChannelId,
  InjectiveTx,
  isEthAddress,
  isValidAddress,
  isValidAddressWithPrefix,
  isValidBtcAddress,
  LedgerError,
  MayaTx,
  NativeDenom,
  SeiEvmTx,
  SigningSscrt,
  SOLANA_CHAINS,
  SolanaTx,
  SUI_CHAINS,
  SuiTx,
  SupportedChain,
  SupportedDenoms,
  ThorTx,
  toSmall,
  transactionDeclinedError,
  Tx,
  txDeclinedErrorUser,
} from '@leapwallet/cosmos-wallet-sdk';
import { Token } from '@leapwallet/cosmos-wallet-store';
import { EthWallet } from '@leapwallet/leap-keychain';
import { BtcWallet, BtcWalletHD, BtcWalletPk } from '@leapwallet/leap-keychain/dist/browser/key/btc-wallet';
import { bech32 } from 'bech32';
import { BigNumber } from 'bignumber.js';
import e from 'express';
import { useCallback, useMemo, useState } from 'react';
import { Wallet } from 'secretjs';

import { CosmosTxType } from '../connectors';
import { useValidateIbcChannelId } from '../ibc/useValidateIbcChannelId';
import {
  PendingTx,
  useActiveChain,
  useActiveWalletStore,
  useAddressPrefixes,
  useChainApis,
  useChainsStore,
  useSelectedNetwork,
} from '../store';
import { useCWTxHandler, useScrtTxHandler, useTxHandler } from '../tx';
import { WALLETTYPE } from '../types';
import { ActivityCardContent } from '../types/activity';
import { getMetaDataForIbcTx, getMetaDataForSendTx, sliceAddress } from '../utils';
import { useChainId, useChainInfo } from '../utils-hooks';

type _TokenDenom = {
  ibcDenom?: string;
  aptosTokenType?: 'v1' | 'v2';
} & NativeDenom;

export type sendTokensParams = {
  toAddress: string;
  selectedToken: Token;
  amount: BigNumber;
  memo: string;
  getWallet: () => Promise<OfflineSigner | Wallet | Ed25519Account | any>;
  fees: StdFee;
  ibcChannelId?: string;
  txHandler?: SigningSscrt | InjectiveTx | EthermintTxHandler | Tx;
  computedGas?: number;
};

export type SendTokenEthParamOptions = {
  isERC20Token?: boolean;
  contractAddress?: string;
  decimals?: number;
  nativeTokenKey?: string;
};

export type sendTokensReturnType =
  | { success: false; errors: string[] }
  | {
      success: true;
      pendingTx: ActivityCardContent & {
        txHash?: string;
        promise: Promise<any>;
        txStatus: 'loading' | 'success' | 'failed' | 'submitted';
        feeDenomination?: string;
        feeQuantity?: string;
        toAddress?: string;
        toChain?: SupportedChain;
      };
      data?: {
        txHash: string;
        txType: CosmosTxType;
        metadata: Dict;
        feeDenomination: string;
        feeQuantity: string;
        forceChain?: SupportedChain;
        forceNetwork?: 'mainnet' | 'testnet';
        forceWalletAddress?: string;
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

export const useSimpleSend = (
  denoms: DenomsRecord,
  isCW20Token: (token: Token) => boolean,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) => {
  const [showLedgerPopup, setShowLedgerPopup] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const { activeWallet } = useActiveWalletStore();

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [forceNetwork, _selectedNetwork]);

  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);

  const chainInfo = useChainInfo(activeChain);
  const getTxHandler = useTxHandler({ forceChain: activeChain, forceNetwork: selectedNetwork });
  const getScrtTxHandler = useScrtTxHandler();
  const getCW20TxClient = useCWTxHandler(activeChain, selectedNetwork);

  const addressPrefixes = useAddressPrefixes();
  const validateIbcChannelId = useValidateIbcChannelId();
  const { chains } = useChainsStore();
  const { evmJsonRpc, rpcUrl } = useChainApis(activeChain, selectedNetwork);
  const evmChainId = useChainId(activeChain, selectedNetwork, true);

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

        const hash = await client.execute(
          fromAddress,
          selectedDenom.coinMinimalDenom,
          {
            transfer: {
              recipient: toAddress,
              amount: convertScientificNotation(amount.times(10 ** (selectedDenom?.coinDecimals ?? 6)).toNumber()),
            },
          },
          fees,
          memo,
        );

        const promise = client.pollForTx(hash);

        return {
          success: true,
          pendingTx: {
            img: chainInfo.chainSymbolImageUrl,
            sentAmount: amount.toString(),
            sentTokenInfo: selectedDenom,
            sentUsdValue: '',
            subtitle1: sliceAddress(toAddress),
            title1: `${amount.toString()} ${selectedDenom.coinDenom}`,
            txStatus: 'loading',
            txType: 'cw20TokenTransfer',
            promise,
            feeDenomination: fees.amount[0].denom,
            feeQuantity: fees.amount[0].amount,
            toAddress,
          },
        };
      } catch (error) {
        return {
          success: false,
          errors: ['Transaction declined'],
        };
      }
    },
    [getCW20TxClient],
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
            subtitle1: sliceAddress(toAddress),
            title1: `${amount.toString()} ${selectedDenom.coinDenom}`,
            txStatus: 'loading',
            txType: 'secretTokenTransfer',
            promise,
            toAddress,
          },
        };
      } catch (e: any) {
        if (e.message === transactionDeclinedError) {
          return {
            success: false,
            errors: [txDeclinedErrorUser.message],
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

  const send931 = useCallback(
    async ({
      wallet,
      fromAddress,
      toAddress,
      selectedDenom,
      amount,
      memo,
      fees,
    }: {
      wallet: OfflineSigner;
      fromAddress: string;
      toAddress: string;
      selectedDenom: _TokenDenom;
      amount: BigNumber;
      memo: string;
      fees: StdFee;
    }): Promise<sendTokensReturnType> => {
      try {
        let client;
        if (activeChain === 'mayachain') {
          client = new MayaTx(wallet);
        } else {
          client = new ThorTx(wallet);
        }

        const { txHash, amount: _amount } = await client.sendTokens(
          fromAddress,
          toAddress,
          {
            amount: amount.toNumber(),
            decimals: selectedDenom.coinDecimals ?? 10,
            denom: selectedDenom.coinMinimalDenom,
          },
          0,
          memo,
        );

        return {
          success: true,
          pendingTx: {
            txHash,
            img: chainInfo.chainSymbolImageUrl,
            sentAmount: amount.toString(),
            sentTokenInfo: selectedDenom as unknown as NativeDenom,
            sentUsdValue: '',
            subtitle1: sliceAddress(toAddress),
            title1: `${amount.toString()} ${selectedDenom.coinDenom}`,
            txStatus: 'loading',
            txType: 'send',
            promise: Promise.resolve({ code: 0 }),
            toAddress,
          },
          data: {
            txHash,
            txType: CosmosTxType.Send,
            metadata: getMetaDataForSendTx(
              toAddress,
              coin(toSmall(_amount.amount.toString(), _amount.decimals), selectedDenom.coinMinimalDenom),
            ),
            feeDenomination: fees.amount[0].denom,
            feeQuantity: fees.amount[0].amount,
          },
        };
      } catch (e: any) {
        return {
          success: false,
          errors: ['Failed to send tokens', e.message?.slice(0, 200)],
        };
      }
    },
    [],
  );

  const sendAptos = useCallback(
    async ({
      account,
      fromAddress,
      amount,
      selectedDenom,
      toAddress,
      memo,
      gasPrice,
      gasLimit,
    }: {
      account: Ed25519Account;
      fromAddress: string;
      amount: BigNumber;
      selectedDenom: _TokenDenom;
      toAddress: string;
      memo: string;
      gasPrice?: number;
      gasLimit?: number;
    }): Promise<sendTokensReturnType> => {
      try {
        const aptos = await AptosTx.getAptosClient(lcdUrl ?? '', account);
        const normalizedAmount = toSmall(amount.toString(), selectedDenom?.coinDecimals ?? 6);
        let txHash = '';
        if (selectedDenom.aptosTokenType === 'v1') {
          txHash = await aptos.sendTokens(
            fromAddress,
            toAddress,
            [{ amount: normalizedAmount, denom: selectedDenom.coinMinimalDenom }],
            gasPrice,
            gasLimit,
            memo,
          );
        } else {
          txHash = await aptos.sendFungibleAsset(
            fromAddress,
            selectedDenom.coinMinimalDenom,
            toAddress,
            parseInt(normalizedAmount),
            gasPrice,
            gasLimit,
          );
        }
        return {
          success: true,
          pendingTx: {
            txHash: txHash ?? '',
            img: chainInfo.chainSymbolImageUrl,
            sentAmount: amount.toString(),
            sentTokenInfo: selectedDenom as unknown as NativeDenom,
            sentUsdValue: '0',
            subtitle1: sliceAddress(fromAddress),
            title1: `${amount.toString()} ${selectedDenom.coinDenom}`,
            txStatus: 'submitted',
            txType: 'send',
            promise: new Promise((resolve) => {
              resolve({ status: 'submitted' });
            }),
          },
          data: {
            txHash,
            txType: CosmosTxType.Send,
            metadata: getMetaDataForSendTx(toAddress, coin(normalizedAmount, selectedDenom.coinMinimalDenom)),
            feeDenomination: selectedDenom.coinMinimalDenom,
            feeQuantity: gasPrice && gasLimit ? (gasPrice * gasLimit).toString() : '',
          },
        };
      } catch (e: any) {
        return {
          success: false,
          errors: [e.message],
        };
      }
    },
    [lcdUrl, chainInfo],
  );

  const sendSolana = useCallback(
    async ({
      account,
      fromAddress,
      toAddress,
      amount,
      selectedDenom,
      fees,
    }: {
      account: any;
      fromAddress: string;
      toAddress: string;
      amount: BigNumber;
      selectedDenom: _TokenDenom;
      fees: StdFee;
    }): Promise<sendTokensReturnType> => {
      try {
        const solanaTx = await SolanaTx.getSolanaClient(rpcUrl ?? '', account, selectedNetwork, activeChain);
        const normalizedAmount = parseFloat(toSmall(amount.toString(), selectedDenom?.coinDecimals ?? 9));
        let txHash = '';
        if (selectedDenom.coinMinimalDenom === 'lamports' || selectedDenom.coinMinimalDenom === 'fogo-native') {
          txHash = await solanaTx.sendSol(toAddress, normalizedAmount, fees);
        } else {
          txHash = await solanaTx.sendSplToken(
            selectedDenom.coinMinimalDenom,
            toAddress,
            normalizedAmount,
            selectedDenom.coinDecimals,
            fees,
          );
        }
        const feeQuantity =
          fees?.amount?.[0]?.amount && !new BigNumber(fees.amount[0].amount).isNaN()
            ? new BigNumber(fees.amount[0].amount).plus(5000).toString()
            : fees?.amount?.[0]?.amount;
        return {
          success: true,
          pendingTx: {
            txHash,
            img: chainInfo.chainSymbolImageUrl,
            sentAmount: amount.toString(),
            sentTokenInfo: selectedDenom as unknown as NativeDenom,
            sentUsdValue: '0',
            subtitle1: sliceAddress(fromAddress),
            title1: `${amount.toString()} ${selectedDenom.coinDenom}`,
            txStatus: 'submitted',
            txType: 'send',
            promise: new Promise((resolve) => {
              resolve({ status: 'submitted' });
            }),
          },
          data: {
            txHash,
            txType: CosmosTxType.Send,
            metadata: getMetaDataForSendTx(toAddress, coin(normalizedAmount, selectedDenom.coinMinimalDenom)),
            feeDenomination: fees?.amount?.[0]?.denom ?? 'lamports',
            feeQuantity,
          },
        };
      } catch (e: any) {
        return {
          success: false,
          errors: [e.message?.slice(0, 200)],
        };
      }
    },
    [rpcUrl, chainInfo],
  );

  const sendSui = useCallback(
    async ({
      account,
      fromAddress,
      toAddress,
      amount,
      selectedDenom,
      fees,
      computedGas,
    }: {
      account: any;
      fromAddress: string;
      toAddress: string;
      amount: BigNumber;
      selectedDenom: _TokenDenom;
      fees: StdFee;
      computedGas?: number;
    }): Promise<sendTokensReturnType> => {
      try {
        const suiTx = await SuiTx.getSuiClient(account, selectedNetwork);
        const normalizedAmount = parseFloat(toSmall(amount.toString(), selectedDenom?.coinDecimals ?? 9));

        let txHash = '';
        if (selectedDenom.coinMinimalDenom === 'mist') {
          const { digest } = await suiTx.sendSui(fromAddress, toAddress, normalizedAmount, fees);
          txHash = digest;
        } else {
          const { digest } = await suiTx.sendNonNativeToken(
            selectedDenom.coinMinimalDenom,
            toAddress,
            normalizedAmount,
            selectedDenom.coinDecimals,
            fees,
          );
          txHash = digest;
        }

        const feeQuantity =
          fees?.amount?.[0]?.amount && !new BigNumber(fees.amount[0].amount).isNaN()
            ? new BigNumber(fees.amount[0].amount).plus(computedGas ?? 0).toString()
            : fees?.amount?.[0]?.amount;
        return {
          success: true,
          pendingTx: {
            txHash,
            img: chainInfo.chainSymbolImageUrl,
            sentAmount: amount.toString(),
            sentTokenInfo: selectedDenom as unknown as NativeDenom,
            sentUsdValue: '0',
            subtitle1: sliceAddress(fromAddress),
            title1: `${amount.toString()} ${selectedDenom.coinDenom}`,
            txStatus: 'submitted',
            txType: 'send',
            promise: new Promise((resolve) => {
              resolve({ status: 'submitted' });
            }),
          },
          data: {
            txHash,
            txType: CosmosTxType.Send,
            metadata: getMetaDataForSendTx(toAddress, coin(normalizedAmount, selectedDenom.coinMinimalDenom)),
            feeDenomination: fees?.amount?.[0]?.denom ?? 'mist',
            feeQuantity,
          },
        };
      } catch (e: any) {
        return {
          success: false,
          errors: [e.message?.slice(0, 200)],
        };
      }
    },
    [rpcUrl, chainInfo],
  );

  const sendBtc = useCallback(
    async ({
      sourceAddress,
      destinationAddress,
      wallet,
      amount,
      selectedToken,
      rpcUrl,
      fees,
    }: {
      sourceAddress: string;
      destinationAddress: string;
      wallet: BtcWallet;
      amount: BigNumber;
      selectedToken: NativeDenom;
      memo: string;
      fees: StdFee;
      rpcUrl?: string;
    }): Promise<sendTokensReturnType> => {
      setIsSending(true);
      const chainInfo = chains[activeChain];
      const normalizedAmount = amount
        .multipliedBy(10 ** (selectedToken?.coinDecimals ?? 8))
        .toFixed(0, BigNumber.ROUND_DOWN);

      const network = activeChain === 'bitcoin' ? 'mainnet' : 'testnet';
      const btcTx = new BtcTx(network, wallet, rpcUrl);
      try {
        const feeRate = parseInt(fees.amount[0].amount) / parseInt(fees.gas);
        const accounts = wallet.getAccounts();

        if (!accounts[0].pubkey) {
          throw new Error('No public key found');
        }
        const result = await btcTx.createTransaction({
          sourceAddress: sourceAddress,
          addressType: 'p2wpkh',
          destinationAddress: destinationAddress,
          amount: Number(normalizedAmount),
          feeRate: feeRate,
          pubkey: accounts[0].pubkey,
        });

        const response = await btcTx.broadcastTx(result.txHex);

        return {
          success: true,
          pendingTx: {
            txHash: response.result ?? '',
            img: chainInfo.chainSymbolImageUrl,
            sentAmount: amount.toString(),
            sentTokenInfo: selectedToken as unknown as NativeDenom,
            sentUsdValue: '0',
            subtitle1: sliceAddress(sourceAddress),
            title1: `${amount.toString()} ${selectedToken.coinDenom}`,
            txStatus: 'submitted',
            txType: 'send',
            promise: new Promise((resolve) => {
              resolve({ status: 'submitted' });
            }),
          },
          data: {
            txHash: response.result,
            txType: CosmosTxType.Send,
            metadata: getMetaDataForSendTx(destinationAddress, {
              amount: amount.toString(),
              denom: selectedToken.coinMinimalDenom,
            }),
            feeDenomination: selectedToken.coinMinimalDenom,
            feeQuantity: result.fee.toString(),
          },
        };
      } catch (e: any) {
        return {
          success: false,
          errors: [e.message?.slice(0, 200)],
        };
      } finally {
        setIsSending(false);
      }
    },
    [activeChain, chains],
  );

  const sendTokenEth = useCallback(
    async (
      fromAddress: string,
      toAddress: string,
      value: string,
      gas: number,
      wallet: EthWallet,
      gasPrice?: number,
      options?: SendTokenEthParamOptions,
    ) => {
      try {
        setIsSending(true);
        const seiEvmTx = SeiEvmTx.GetSeiEvmClient(wallet, evmJsonRpc ?? '', Number(evmChainId));

        let result;
        let denom = options?.nativeTokenKey ?? Object.keys(chainInfo.nativeDenoms)[0];
        let weiValue = parseEther(value);
        if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
          setShowLedgerPopup(true);
        }

        if (!options?.isERC20Token) {
          result = await seiEvmTx.sendTransaction(fromAddress, toAddress, value, gas, gasPrice, undefined, false);
        } else {
          denom = options?.contractAddress ?? '';
          weiValue = parseUnits(value, options?.decimals ?? 18);

          result = await seiEvmTx.sendERC20Transaction(
            toAddress,
            value,
            options?.contractAddress ?? '',
            options?.decimals ?? 18,
            gas,
            gasPrice,
            false,
          );
        }

        const denomInfo = denoms[denom] ?? DefaultDenoms[denom as SupportedDenoms] ?? chainInfo?.nativeDenoms?.[denom];
        const pendingTx: PendingTx = {
          txHash: result.hash,
          img: chainInfo.chainSymbolImageUrl,
          sentAmount: value.toString(),
          sentTokenInfo: denomInfo,
          sentUsdValue: '',
          subtitle1: sliceAddress(toAddress),
          title1: `${value.toString()} ${denomInfo.coinDenom}`,
          txStatus: 'loading',
          txType: 'send',
          isEvmTx: true,
          promise: (async () => {
            try {
              const res = await result.wait();
              return {
                code: res.status !== 0 ? 0 : 1,
                txType: 'evm',
                rawResponse: res,
                transactionHash: res.transactionHash,
              };
            } catch (e: any) {
              return { code: 1, txType: 'evm', transactionHash: result.hash, rawResponse: e };
            }
          })(),
          toAddress,
        };

        setShowLedgerPopup(false);

        return {
          success: true,
          pendingTx: pendingTx,
          data: {
            txHash: result.hash,
            txType: CosmosTxType.Send,
            metadata: getMetaDataForSendTx(toAddress, coin(weiValue.toString(), denom)),
          },
        };
      } catch (e: any) {
        return {
          success: false,
          errors: e instanceof LedgerError ? e : [e.message?.slice(0, 200)],
        };
      } finally {
        setIsSending(false);
        setShowLedgerPopup(false);
      }
    },
    [evmJsonRpc, showLedgerPopup],
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
          _ibcChannelId || (await getSourceChannelIdUnsafe(srcChainRegistryPath, destChainRegistryPath));

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

          metadata = await getMetaDataForIbcTx(ibcChannelId, toAddress, {
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
            subtitle1: sliceAddress(toAddress),
            title1: `${amount.toString()} ${selectedDenom.coinDenom}`,
            txStatus: 'loading',
            txType: isIBCTx ? 'ibc/transfer' : 'send',
            promise: pollPromise,
            toAddress,
            toChain: destChainKey,
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
        if (e.message === transactionDeclinedError) {
          return {
            success: false,
            errors: [txDeclinedErrorUser.message],
          };
        } else {
          return {
            success: false,
            errors: [e.message?.slice(0, 200)],
          };
        }
      } finally {
        setIsSending(false);
      }
    },
    [addressPrefixes, activeChain],
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
      computedGas,
    }: sendTokensParams): Promise<sendTokensReturnType> => {
      setIsSending(true);
      const isBtcTx = BTC_CHAINS.includes(activeChain);
      const isAptosTx = APTOS_CHAINS.includes(activeChain);
      const isSolanaTx = SOLANA_CHAINS.includes(activeChain);
      const isSuiTx = SUI_CHAINS.includes(activeChain);

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

      if (!isBtcTx && !isAptosTx && !isSolanaTx && !isSuiTx && !isValidAddress(toAddress)) {
        return {
          success: false,
          errors: ['Invalid recipient address'],
        };
      }
      if (isBtcTx && !isValidBtcAddress(toAddress, activeChain === 'bitcoin' ? 'mainnet' : 'testnet')) {
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

      const _nativeDenom = Object.values(chainInfo.nativeDenoms).find(
        (denom) => denom.coinMinimalDenom === selectedToken.coinMinimalDenom,
      );

      const isDenomSupported = denoms[selectedToken.coinMinimalDenom] ?? _nativeDenom;
      const isFAToken = selectedToken.aptosTokenType === 'v2';

      if (!isDenomSupported && !isFAToken && !selectedToken.isSolana && !selectedToken.isSui) {
        return {
          success: false,
          errors: ['We do not support transferring this token yet'],
        };
      }

      let selectedDenomData = _nativeDenom as NativeDenom;
      if (denoms[selectedToken.coinMinimalDenom]) {
        selectedDenomData = {
          ...denoms[selectedToken.coinMinimalDenom],
          coinDenom: selectedToken.symbol ?? denoms[selectedToken.coinMinimalDenom].coinDenom,
          name: selectedToken.name ?? denoms[selectedToken.coinMinimalDenom].name,
        };
      }

      const isSnip20Tx = isValidAddressWithPrefix(selectedToken.coinMinimalDenom ?? '', 'secret');
      const isCW20Tx = isCW20Token(selectedToken);

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
      } else if (['mayachain', 'thorchain'].includes(activeChain)) {
        result = await send931({
          fromAddress: activeWallet.addresses[activeChain],
          wallet: (await getWallet()) as OfflineSigner,
          toAddress,
          amount,
          selectedDenom: {
            ibcDenom: selectedToken.ibcDenom,
            ...selectedDenomData,
          },
          memo,
          fees,
        });
      } else if (isBtcTx) {
        const res = await sendBtc({
          sourceAddress: activeWallet.addresses[activeChain],
          destinationAddress: toAddress,
          wallet: (await getWallet()) as unknown as BtcWalletPk | BtcWalletHD,
          amount: amount,
          selectedToken: selectedDenomData,
          memo,
          fees,
          rpcUrl: rpcUrl,
        });
        if (!res) {
          throw new Error('Unable to send transaction');
        }

        result = res;
      } else if (isAptosTx) {
        const gasLimit = Number(fees.gas);
        const gasPrice = Math.floor(gasLimit > 0 ? Number(fees.amount[0].amount) / gasLimit : 0);
        const account = (await getWallet()) as Ed25519Account;
        result = await sendAptos({
          account,
          fromAddress: activeWallet.addresses[activeChain],
          amount: amount,
          selectedDenom: {
            ...selectedDenomData,
            ibcDenom: selectedToken.ibcDenom,
            aptosTokenType: selectedToken.aptosTokenType,
            coinMinimalDenom: selectedToken.coinMinimalDenom,
            coinDenom: selectedToken.symbol || selectedDenomData.coinDenom,
          },
          toAddress,
          memo,
          gasPrice,
          gasLimit,
        });
      } else if (isSolanaTx) {
        const account = (await getWallet()) as any;
        result = await sendSolana({
          account: account,
          fromAddress: activeWallet.addresses[activeChain],
          amount: amount,
          selectedDenom: {
            ...selectedDenomData,
            coinMinimalDenom: selectedToken.coinMinimalDenom,
            coinDenom: selectedToken.symbol || selectedDenomData.coinDenom,
            coinDecimals: selectedToken.coinDecimals ?? selectedDenomData.coinDecimals,
          },
          toAddress,
          fees,
        });
      } else if (isSuiTx) {
        const account = (await getWallet()) as any;
        result = await sendSui({
          account: account,
          fromAddress: activeWallet.addresses[activeChain],
          amount: amount,
          selectedDenom: {
            ...selectedDenomData,
            coinMinimalDenom: selectedToken.coinMinimalDenom,
            coinDenom: selectedToken.symbol || selectedDenomData.coinDenom,
            coinDecimals: selectedToken.coinDecimals ?? selectedDenomData.coinDecimals,
          },
          toAddress,
          fees,
          computedGas,
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
    setShowLedgerPopup,
    sendTokens,
    sendTokenEth,
    isSending,
    setIsSending,
  };
};
