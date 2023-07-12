import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { InjectiveTx, SeiTxHandler, StrideTx, SupportedChain, Tx } from '@leapwallet/cosmos-wallet-sdk';
import { EthermintTxHandler } from '@leapwallet/cosmos-wallet-sdk';
import { SigningSscrt } from '@leapwallet/cosmos-wallet-sdk/dist/secret/sscrt';
import { useCallback } from 'react';
import { Wallet } from 'secretjs';

import { useActiveChain, useChainApis, useChainId, useChainInfo, useGetChains, useSelectedNetwork } from '../store';

export function useTxHandler({
  forceChain,
  forceNetwork,
}: { forceChain?: SupportedChain; forceNetwork?: 'mainnet' | 'testnet' } = {}) {
  const selectedNetwork = useSelectedNetwork();
  const activeChain = useActiveChain();
  const chain = forceChain ?? activeChain;
  const network = forceNetwork ?? selectedNetwork;

  const { rpcUrl, lcdUrl } = useChainApis(forceChain, forceNetwork);
  const chainInfo = useChainInfo(forceChain);
  const chainInfos = useGetChains();

  return useCallback(
    async (wallet: OfflineSigner) => {
      if (chain === 'injective') {
        return new InjectiveTx(
          network === 'testnet',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          wallet,
          network === 'testnet' ? chainInfos.injective.apis.restTest : chainInfos.injective.apis.rest,
        );
      } else if (chainInfo.bip44.coinType === '60') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return new EthermintTxHandler(lcdUrl, wallet, chainInfo.chainId);
      } else if (chainInfo.chainId.toLowerCase().includes('atlantic-2')) {
        const _tx = new SeiTxHandler(lcdUrl, rpcUrl ?? '', wallet);
        await _tx.initClient();
        return _tx;
      } else if (chain === 'stride') {
        const _tx = new StrideTx(`${rpcUrl}/`, wallet);
        await _tx.initClient();
        _tx.setLcdEndPoint(lcdUrl ?? '');
        _tx.addStrideRegistry();
        return _tx;
      } else {
        const _tx = new Tx(`${rpcUrl}/`, wallet);
        await _tx.initClient();
        _tx.setLcdEndPoint(lcdUrl ?? '');
        return _tx;
      }
    },
    [chain, network],
  );
}

export function useScrtTxHandler() {
  const selectedNetwork = useSelectedNetwork();
  const { lcdUrl = '' } = useChainApis();
  const chainId = useChainId();
  return useCallback(
    (wallet: Wallet) => {
      return SigningSscrt.create(lcdUrl, chainId ?? '', wallet);
    },
    [selectedNetwork, lcdUrl, chainId],
  );
}

export function useCW20TxHandler() {
  const { rpcUrl = '' } = useChainApis();

  return useCallback(
    async (wallet: Wallet) => {
      const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, wallet, {
        broadcastPollIntervalMs: 2_000,
        broadcastTimeoutMs: 60_000,
      });
      return client;
    },
    [rpcUrl],
  );
}
