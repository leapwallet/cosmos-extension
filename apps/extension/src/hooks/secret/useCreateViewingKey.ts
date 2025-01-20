import { LeapWalletApi, useGasPriceSteps, useScrtKeysStore } from '@leapwallet/cosmos-wallet-hooks'
import { CosmosTxType } from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfos,
  CreateViewingKeyOptions,
  SigningSscrt,
  Sscrt,
} from '@leapwallet/cosmos-wallet-sdk'
import { encrypt } from '@leapwallet/leap-keychain'
import { useCallback } from 'react'
import { passwordStore } from 'stores/password-store'
import browser from 'webextension-polyfill'

import { VIEWING_KEYS } from '../../config/storage-keys'
import { useSecretWallet } from '../wallet/useScrtWallet'

export async function verifyViewingKey(
  gprcUrl: string,
  key: string,
  contractAddress: string,
  address: string,
) {
  const sscrt = Sscrt.create(gprcUrl, ChainInfos.secret.chainId, address)
  const res = await sscrt.getBalance(address, contractAddress, key)
  return !!res.balance
}

export function useCreateViewingKey() {
  const getWallet = useSecretWallet()
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
      options?: CreateViewingKeyOptions,
    ) => {
      if (!passwordStore.password) throw new Error('Password not set')
      const wallet = await getWallet()
      const signingSecretClient = SigningSscrt.create(lcdUrl ?? '', chainId as string, wallet)
      let viewingKey = options?.key

      if (!importKey) {
        try {
          const { txStatus: _txStatus, viewingKey: _key } =
            await signingSecretClient.createViewingKey(
              signerAddress,
              contractAddress,
              gasPriceSteps,
              {
                key: viewingKey,
                gasLimit: options?.gasLimit,
                feeDenom: options?.feeDenom,
              },
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
            chainId,
          })

          viewingKey = _key
        } catch (e) {
          return { validKey: false, error: 'Unable to create viewing key' }
        }
      } else {
        const validKey = await verifyViewingKey(
          lcdUrl ?? '',
          viewingKey ?? '',
          contractAddress,
          signerAddress,
        )

        if (!validKey) {
          return { validKey: false, error: 'Invalid viewing key', key: viewingKey }
        }
      }

      const encryptedViewingKey = encrypt(viewingKey as string, passwordStore.password)
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
    [getWallet, gasPriceSteps, txPostToDB, setViewingKeys],
  )
}
