import { LeapWalletApi, useGasPriceSteps, useScrtKeysStore } from '@leapwallet/cosmos-wallet-hooks'
import { CosmosTxType } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, encrypt, Sscrt } from '@leapwallet/cosmos-wallet-sdk'
import { SigningSscrt } from '@leapwallet/cosmos-wallet-sdk/dist/secret/sscrt'
import { useCallback } from 'react'
import browser from 'webextension-polyfill'

import { VIEWING_KEYS } from '../../config/storage-keys'
import { usePassword } from '../settings/usePassword'
import { useSecretWallet } from '../wallet/useScrtWallet'

export async function verifyViewingKey(
  gprcUrl: string,
  key: string,
  contractAddress: string,
  address: string,
) {
  const sscrt = await Sscrt.create(gprcUrl, ChainInfos.secret.chainId, address)
  const res = await sscrt.getBalance(address, contractAddress, key)
  return !!res.balance
}

export function useCreateViewingKey() {
  const getWallet = useSecretWallet()
  const password = usePassword()
  const gasPriceSteps = useGasPriceSteps()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()

  const { setViewingKeys } = useScrtKeysStore()

  // creates viewing key, saves it to storage and updates the store
  return useCallback(
    async (
      lcdUrl: string,
      chainId: string,
      signerAddress: string,
      contractAddress: string,
      importKey: boolean,
      key?: string,
    ) => {
      const wallet = await getWallet()

      const signingSecretClient = await SigningSscrt.create(lcdUrl ?? '', chainId as string, wallet)
      let viewingKey = key
      if (!importKey) {
        try {
          const { txStatus: _txStatus, viewingKey: _key } =
            await signingSecretClient.createViewingKey(
              signerAddress,
              contractAddress,
              gasPriceSteps,
              key,
            )
          if (_txStatus.code !== 0) {
            return { validKey: false, error: _txStatus.rawLog }
          }
          txPostToDB({
            txHash: _txStatus.transactionHash,
            txType: CosmosTxType.SecretTokenTransaction,
            metadata: {
              contract: contractAddress,
            },
            feeDenomination: 'uscrt',
            feeQuantity: _txStatus.tx?.auth_info?.fee?.amount?.[0]?.amount ?? '0.01',
          })
          viewingKey = _key
        } catch (e) {
          return { validKey: false, error: 'Unable to create viewing key' }
        }
      } else {
        const validKey = await verifyViewingKey(
          lcdUrl ?? '',
          key as string,
          contractAddress,
          signerAddress,
        )
        if (!validKey) {
          return { validKey: false, error: 'Invalid viewing key', key: key }
        }
        viewingKey = key
      }

      const encryptedViewingKey = encrypt(viewingKey as string, password as string)
      const storage = await browser.storage.local.get([VIEWING_KEYS])
      const viewingKeys = storage[VIEWING_KEYS]
      if (viewingKeys) {
        const updatedViewingKeyStore = (shouldEncrypt: boolean) => ({
          ...viewingKeys,
          [signerAddress]: {
            ...viewingKeys[signerAddress],
            [contractAddress]: shouldEncrypt ? encryptedViewingKey : viewingKey,
          },
        })
        await browser.storage.local.set({
          [VIEWING_KEYS]: updatedViewingKeyStore(true),
        })
        setViewingKeys(updatedViewingKeyStore(false))
      } else {
        const viewingKeyStore = (shouldEncrypt: boolean) => ({
          [signerAddress]: {
            [contractAddress]: shouldEncrypt ? encryptedViewingKey : (viewingKey as string),
          },
        })
        await browser.storage.local.set({
          [VIEWING_KEYS]: viewingKeyStore(true),
        })
        setViewingKeys(viewingKeyStore(false))
      }
      return { validKey: true, error: null, key: viewingKey }
    },
    [getWallet, password, gasPriceSteps, txPostToDB, setViewingKeys],
  )
}
