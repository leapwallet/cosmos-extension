import { OfflineSigner } from '@cosmjs/proto-signing';
import { ARCTIC_CHAIN_KEY, SeiEvmTx, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { EthWallet } from '@leapwallet/leap-keychain';
import { useCallback, useEffect, useState } from 'react';

import { useInvalidateSeiEvmBalance, useInvalidateTokenBalances } from '../bank';
import { useActiveChain, useActiveWallet, useAddress, useIsCompassWallet } from '../store';
import { WALLETTYPE } from '../types';
import { storage, useGetStorageLayer } from '../utils';

export function useSeiLinkedAddressState(wallet: SeiLinkedAddressStateHookParams) {
  const [addressLinkState, setAddressLinkState] = useState<AddressLinkState>('loading');
  const storage = useGetStorageLayer();
  const address = useAddress();
  const invalidateSeiEvmBalance = useInvalidateSeiEvmBalance();
  const invalidateTokenBalances = useInvalidateTokenBalances();

  const isCompassWallet = useIsCompassWallet();
  const activeWallet = useActiveWallet();
  const activeChain = useActiveChain();

  useEffect(() => {
    (async function getLinkedAddressState() {
      // We might need to change this condition when sei evm launches on mainnet
      if (!isCompassWallet || activeWallet?.walletType === WALLETTYPE.LEDGER) {
        setAddressLinkState('unknown');
        return;
      }

      const storedLinkedAddressState = await storage.get(SEI_EVM_LINKED_ADDRESS_STATE_KEY);
      if (storedLinkedAddressState) {
        const linkedAddressState = JSON.parse(storedLinkedAddressState);
        if (linkedAddressState[address] === 'done') {
          setAddressLinkState('done');
          return;
        }
      }

      try {
        if (!(wallet instanceof EthWallet)) {
          wallet = (await wallet(ARCTIC_CHAIN_KEY, true)) as unknown as EthWallet;
        }

        const seiEvm = SeiEvmTx.GetSeiEvmClient(wallet as EthWallet);
        const response = await seiEvm.getAssociation();

        if (response.error) {
          setAddressLinkState('pending');
        } else if (response.result) {
          await updateSeiLinkedAddressStateInStore(storage, address);
          setAddressLinkState('done');
        } else {
          setAddressLinkState('unknown');
        }
      } catch (_) {
        setAddressLinkState('unknown');
      }
    })();
  }, [wallet, storage, address]);

  const updateAddressLinkState = useCallback(
    async function handleLinkAddressClick(setError?, onClose?) {
      if (!isCompassWallet || activeWallet?.walletType === WALLETTYPE.LEDGER) return;
      try {
        if (!(wallet instanceof EthWallet)) {
          wallet = (await wallet(ARCTIC_CHAIN_KEY, true)) as unknown as EthWallet;
        }
        const seiEvmTxHandler = SeiEvmTx.GetSeiEvmClient(wallet);

        const result = await seiEvmTxHandler.associateEvmAddress();
        setAddressLinkState('loading');

        if (result.error) {
          const errorMessage = result.error?.message;
          const errorMessageToShow = getErrorMessageToShow(errorMessage, true);

          setError && setError(errorMessageToShow);
          setAddressLinkState('error');
        } else {
          setAddressLinkState('success');

          setTimeout(async () => {
            onClose && onClose(true);
            setError && setError('');

            await updateSeiLinkedAddressStateInStore(storage, address);
            invalidateSeiEvmBalance();
            invalidateTokenBalances(activeChain);
            setAddressLinkState('done');
          }, 2000);
        }
      } catch (error) {
        const _error = error as Error;
        const errorMessageToShow = getErrorMessageToShow(_error.message);

        setError && setError(errorMessageToShow);
        setAddressLinkState('error');
      }
    },
    [wallet, setAddressLinkState, address, storage, activeChain],
  );

  return { addressLinkState, setAddressLinkState, updateAddressLinkState };
}

export type AddressLinkState = 'unknown' | 'pending' | 'loading' | 'success' | 'error' | 'done';
export type SeiLinkedAddressStateHookParams =
  | EthWallet
  | ((chain?: SupportedChain | undefined, ethWallet?: boolean | undefined) => Promise<OfflineSigner>);

export const SEI_EVM_LINKED_ADDRESS_STATE_KEY = 'sei-evm-linked-address-state';
export const INSUFFICIENT_FUNDS_ERROR_MESSAGE =
  "Ensure there's at least 1 SEI in your 0x wallet to link addresses or enough balance to cover gas fees in both Sei and 0x address.";

export function getErrorMessageToShow(errorMessage: string, replaceColon?: boolean) {
  if (errorMessage.trim().toLowerCase().includes('insufficient funds')) {
    return INSUFFICIENT_FUNDS_ERROR_MESSAGE;
  } else if (replaceColon) {
    return errorMessage.replace(':', '');
  }

  return errorMessage;
}

export async function updateSeiLinkedAddressStateInStore(storage: storage, address: string) {
  const storedLinkedAddressState = await storage.get(SEI_EVM_LINKED_ADDRESS_STATE_KEY);

  await storage.set(
    SEI_EVM_LINKED_ADDRESS_STATE_KEY,
    JSON.stringify({
      ...(storedLinkedAddressState ? JSON.parse(storedLinkedAddressState) : {}),
      [address]: 'done',
    }),
  );
}
