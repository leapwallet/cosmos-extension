import { OfflineSigner } from '@cosmjs/proto-signing';
import { CompassSeiLedgerSigner, getAssociation, SeiEvmTx, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { EthWallet } from '@leapwallet/leap-keychain';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import { useInvalidateSeiEvmBalance, useInvalidateTokenBalances } from '../bank';
import { useFeatureFlags } from '../config';
import {
  useActiveChain,
  useActiveWallet,
  useAddress,
  useChainApis,
  useCompassSeiEvmConfigStore,
  useIsCompassWallet,
  useSelectedNetwork,
} from '../store';
import { WALLETTYPE } from '../types';
import { getPlatformType, storage, useGetStorageLayer } from '../utils/global-vars';

/**
 * Please use `SeiLinkedAddressState` from `@leapwallet/cosmos-wallet-store` instead.
 */
export function useSeiLinkedAddressState(forceChain?: SupportedChain) {
  const [addressLinkState, setAddressLinkState] = useState<AddressLinkState>('loading');
  const storage = useGetStorageLayer();
  const invalidateSeiEvmBalance = useInvalidateSeiEvmBalance();
  const invalidateTokenBalances = useInvalidateTokenBalances();

  const isCompassWallet = useIsCompassWallet();
  const activeWallet = useActiveWallet();
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();
  const { evmJsonRpc } = useChainApis();
  const { compassSeiEvmConfig } = useCompassSeiEvmConfigStore();

  const { ATLANTIC_CHAIN_KEY, PACIFIC_ETH_CHAIN_ID, ATLANTIC_ETH_CHAIN_ID } = useMemo(() => compassSeiEvmConfig, []);
  const activeChain = forceChain || _activeChain;

  const [activeChainKey, activeEvmChainId, selectedNetwork, activeCosmosChainId]: [
    SupportedChain,
    number,
    'mainnet' | 'testnet',
    string,
  ] = useMemo(() => {
    if (_selectedNetwork === 'testnet') {
      return [ATLANTIC_CHAIN_KEY as SupportedChain, ATLANTIC_ETH_CHAIN_ID, 'testnet', 'atlantic-2'];
    }

    return [ATLANTIC_CHAIN_KEY as SupportedChain, PACIFIC_ETH_CHAIN_ID, 'mainnet', 'pacific-1'];
  }, [activeChain, _selectedNetwork]);

  const { data: featureFlags } = useFeatureFlags();
  const platformType = getPlatformType();
  const address = useAddress(activeChainKey);

  useEffect(() => {
    (async function getLinkedAddressState() {
      // We might need to change this condition when sei evm launches on mainnet
      const notSeiLedger = activeWallet?.walletType === WALLETTYPE.LEDGER && activeWallet?.app !== 'sei';
      if (!isCompassWallet || notSeiLedger) {
        setAddressLinkState('unknown');
        return;
      }

      const storedLinkedAddressState = await storage.get(SEI_EVM_LINKED_ADDRESS_STATE_KEY);
      if (storedLinkedAddressState) {
        const linkedAddressState = JSON.parse(storedLinkedAddressState);
        if (linkedAddressState[address]?.[activeChainKey]?.[selectedNetwork] === 'done') {
          setAddressLinkState('done');
          return;
        }
      }

      try {
        const pubkey = activeWallet?.pubKeys?.[activeChainKey];
        if (!pubkey) return;
        const response = await getAssociation(pubkey, evmJsonRpc ?? '');

        if (response.error) {
          setAddressLinkState('pending');
        } else if (response.result) {
          await updateSeiLinkedAddressStateInStore(storage, address, activeChainKey, selectedNetwork);
          setAddressLinkState('done');
        } else {
          setAddressLinkState('unknown');
        }
      } catch (_) {
        setAddressLinkState('unknown');
      }
    })();
  }, [storage, address, activeChainKey, activeEvmChainId, selectedNetwork, evmJsonRpc, isCompassWallet, activeWallet]);

  const updateAddressLinkState = useCallback(
    async function handleLinkAddressClick({
      wallet,
      setError,
      onClose,
      ethAddress,
      token,
      setShowLoadingMessage,
    }: HandleLinkAddressClickParams) {
      const notSeiLedger = activeWallet?.walletType !== WALLETTYPE.LEDGER && activeWallet?.app !== 'sei';
      if (!isCompassWallet || notSeiLedger) return;
      try {
        if (!(wallet instanceof EthWallet || wallet instanceof CompassSeiLedgerSigner)) {
          wallet = (await wallet(activeChainKey, true)) as unknown as EthWallet | CompassSeiLedgerSigner;
        }

        const seiEvmTxHandler = SeiEvmTx.GetSeiEvmClient(wallet, evmJsonRpc ?? '', activeEvmChainId);
        const _platform = platformType.toLowerCase() as 'extension';
        let result;
        setAddressLinkState('loading');

        if (featureFlags?.link_evm_address?.[_platform] === 'no-funds') {
          setShowLoadingMessage && setShowLoadingMessage('Linking addresses...');
          result = await seiEvmTxHandler.linkAddressWithoutFunds(ethAddress ?? '', token ?? '');

          if (result?.[activeCosmosChainId]) {
            const pacificResponse = result?.[activeCosmosChainId];

            if (pacificResponse?.status === 'fail') {
              const errorMessageToShow = getErrorMessageToShow(pacificResponse?.message);

              setError && setError(errorMessageToShow);
              setAddressLinkState('error');

              setShowLoadingMessage && setShowLoadingMessage('');
              return;
            } else if (pacificResponse?.status === 'success') {
              setShowLoadingMessage && setShowLoadingMessage('Checking if the addresses are linked...');
              const data = await seiEvmTxHandler.pollLinkAddressWithoutFunds(ethAddress ?? '', activeCosmosChainId);

              setShowLoadingMessage && setShowLoadingMessage('');
              if (data?.data?.status === 'fail') {
                const errorMessageToShow = getErrorMessageToShow(data?.data?.message);

                setError && setError(errorMessageToShow);
                setAddressLinkState('error');
                return;
              }
            }
          }
        } else if (featureFlags?.link_evm_address?.[_platform] === 'with-funds') {
          result = await seiEvmTxHandler.associateEvmAddress();
        }

        setShowLoadingMessage && setShowLoadingMessage('');
        if (result?.status === 'fail') {
          const errorMessageToShow = getErrorMessageToShow(result?.message);

          setError && setError(errorMessageToShow);
          setAddressLinkState('error');
        } else if (result?.error) {
          const errorMessage = result?.error?.message;
          const errorMessageToShow = getErrorMessageToShow(errorMessage, true);

          setError && setError(errorMessageToShow);
          setAddressLinkState('error');
        } else if (result) {
          setAddressLinkState('success');

          setTimeout(async () => {
            onClose && onClose(true);
            setError && setError('');

            await updateSeiLinkedAddressStateInStore(storage, address, activeChainKey, selectedNetwork);
            invalidateSeiEvmBalance(activeChainKey);
            invalidateTokenBalances(activeChainKey);
            setAddressLinkState('done');
          }, 2000);
        } else {
          setAddressLinkState('unknown');
        }
      } catch (error) {
        const _error = error as Error;
        const errorMessageToShow = getErrorMessageToShow(_error.message);

        setShowLoadingMessage && setShowLoadingMessage('');
        setError && setError(errorMessageToShow);
        setAddressLinkState('error');
      }
    },
    [
      setAddressLinkState,
      address,
      storage,
      activeChainKey,
      activeEvmChainId,
      selectedNetwork,
      isCompassWallet,
      activeWallet,
      evmJsonRpc,
      featureFlags?.link_evm_address,
      platformType,
      activeCosmosChainId,
    ],
  );

  return { addressLinkState, setAddressLinkState, updateAddressLinkState };
}

export type AddressLinkState = 'unknown' | 'pending' | 'loading' | 'success' | 'error' | 'done';
export type SeiLinkedAddressStateHookParams =
  | EthWallet
  | CompassSeiLedgerSigner
  | ((chain?: SupportedChain | undefined, ethWallet?: boolean | undefined) => Promise<OfflineSigner>);

export const SEI_EVM_LINKED_ADDRESS_STATE_KEY = 'sei-evm-linked-address-state';
export const INSUFFICIENT_FUNDS_ERROR_MESSAGE =
  "Ensure there's at least 1 SEI in your 0x wallet to link addresses or enough balance to cover gas fees in both Sei and 0x address.";

export type HandleLinkAddressClickParams = {
  wallet: SeiLinkedAddressStateHookParams;
  setError?: Dispatch<SetStateAction<string | any>>;
  onClose?: (refetch?: boolean | undefined) => void;
  ethAddress?: string;
  token?: string;
  setShowLoadingMessage?: Dispatch<SetStateAction<string>>;
};

export function getErrorMessageToShow(errorMessage: string, replaceColon?: boolean) {
  if (errorMessage.trim().toLowerCase().includes('insufficient funds')) {
    return INSUFFICIENT_FUNDS_ERROR_MESSAGE;
  } else if (replaceColon) {
    return errorMessage.replace(':', '');
  }

  return errorMessage;
}

export async function updateSeiLinkedAddressStateInStore(
  storage: storage,
  address: string,
  chainKey: SupportedChain,
  network: 'mainnet' | 'testnet',
) {
  const storedLinkedAddressState = await storage.get(SEI_EVM_LINKED_ADDRESS_STATE_KEY);
  const previousValue = storedLinkedAddressState ? JSON.parse(storedLinkedAddressState) : {};

  await storage.set(
    SEI_EVM_LINKED_ADDRESS_STATE_KEY,
    JSON.stringify({
      ...previousValue,
      [address]: {
        ...(previousValue[address] ?? {}),
        [chainKey]: {
          ...(previousValue[address]?.[chainKey] ?? {}),
          [network]: 'done',
        },
      },
    }),
  );
}
