import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { OfflineSigner } from '@cosmjs/proto-signing';
import {
  CWTx,
  EthermintTxHandler,
  GovGenTx,
  InitiaTx,
  InjectiveTx,
  LavaTx,
  // SeiTxHandler,
  StrideTx,
  SupportedChain,
  Tx,
} from '@leapwallet/cosmos-wallet-sdk';
import { SigningSscrt } from '@leapwallet/cosmos-wallet-sdk/dist/browser/secret/sscrt';
import { useCallback, useMemo } from 'react';
import { Wallet } from 'secretjs';

import { useActiveChain, useChainApis, useGetChains, useSelectedNetwork } from '../store';
import { useChainId, useChainInfo } from '../utils-hooks';

export function useTxHandler({
  forceChain,
  forceNetwork,
}: { forceChain?: SupportedChain; forceNetwork?: 'mainnet' | 'testnet' } = {}) {
  const selectedNetwork = useSelectedNetwork();
  const activeChain = useActiveChain();
  const chain = useMemo(() => forceChain ?? activeChain, [forceChain, activeChain]);
  const network = useMemo(() => forceNetwork ?? selectedNetwork, [forceNetwork, selectedNetwork]);

  const { rpcUrl, lcdUrl } = useChainApis(chain, network);
  const chainInfo = useChainInfo(chain);
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
        const chainId = selectedNetwork === 'mainnet' ? chainInfo.chainId : chainInfo.testnetChainId;
        let evmChainId = selectedNetwork === 'mainnet' ? chainInfo.evmChainId : chainInfo.evmChainIdTestnet;
        if (!evmChainId) {
          const regex = /(\d+)-\d+/;
          const matches = chainId?.match(regex);
          evmChainId = matches?.[1];
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return new EthermintTxHandler(lcdUrl, wallet, chainId, evmChainId);
      } else if (chain === 'initia') {
        const _tx = new InitiaTx(`${rpcUrl}/`, wallet);
        await _tx.initClient();
        _tx.setLcdEndPoint(lcdUrl ?? '');
        await _tx.addInitiaRegistry();
        console.log(_tx.client?.registry);
        return _tx;
      }
      // else if (
      //   chainInfo.chainId.toLowerCase().includes('atlantic-2') ||
      //   chainInfo.chainId.toLowerCase().includes('arctic-1')
      // ) {
      //   const _tx = new SeiTxHandler(lcdUrl, rpcUrl ?? '', wallet);
      //   await _tx.initClient();
      //   return _tx;
      // }
      else if (chain === 'stride') {
        const _tx = new StrideTx(`${rpcUrl}/`, wallet);
        await _tx.initClient();
        _tx.setLcdEndPoint(lcdUrl ?? '');
        _tx.addStrideRegistry();
        return _tx;
      } else if (chain === 'lava') {
        const _tx = new LavaTx(`${rpcUrl}/`, wallet);
        await _tx.initClient();
        _tx.setLcdEndPoint(lcdUrl ?? '');
        _tx.addLavaRegistry();
        return _tx;
      } else if (chainInfo.chainId === 'govgen-1') {
        const _tx = new GovGenTx(`${rpcUrl}/`, wallet);
        await _tx.initClient();
        _tx.setLcdEndPoint(lcdUrl ?? '');
        _tx.addGovGenRegistry();
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

export function useScrtTxHandler(forceNetwork?: 'mainnet' | 'testnet') {
  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [_selectedNetwork, forceNetwork]);

  const { lcdUrl = '' } = useChainApis('secret', selectedNetwork);
  const chainId = useChainId('secret', selectedNetwork);

  return useCallback(
    (wallet: Wallet) => {
      return SigningSscrt.create(lcdUrl, chainId ?? '', wallet);
    },
    [selectedNetwork, lcdUrl, chainId],
  );
}

export function useCW20TxHandler(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const { rpcUrl = '' } = useChainApis(forceChain, forceNetwork);

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

export function useCWTxHandler(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const { rpcUrl, lcdUrl = '' } = useChainApis(forceChain, forceNetwork);

  return useCallback(
    async (wallet: OfflineSigner) => {
      const _tx = new CWTx(`${rpcUrl}/`, lcdUrl, wallet);
      await _tx.initClient();
      return _tx;

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [rpcUrl],
  );
}
