import { useChainApis, useChainId, useScrtKeysStore } from '@leapwallet/cosmos-wallet-hooks'
import { decrypt, encrypt } from '@leapwallet/cosmos-wallet-sdk'
import { SigningSscrt } from '@leapwallet/cosmos-wallet-sdk/dist/browser/secret/sscrt'
import { useCallback } from 'react'
import { Permit } from 'secretjs'
import browser from 'webextension-polyfill'

import { QUERY_PERMIT } from '../../config/storage-keys'
import { usePassword } from '../settings/usePassword'
import { useSecretWallet } from '../wallet/useScrtWallet'

export function useCreateQueryPermit() {
  const getWallet = useSecretWallet()
  const password = usePassword()

  const { setQueryPermits } = useScrtKeysStore()
  const { lcdUrl = '' } = useChainApis()
  const chainId = useChainId()

  // creates query permit, saves it to storage and updates the store
  return useCallback(
    async (signerAddress: string, contractAddress: string) => {
      const wallet = await getWallet()
      const sscrt = await SigningSscrt.create(lcdUrl, chainId as string, wallet)

      const storage = await browser.storage.local.get([QUERY_PERMIT])
      const permitStore = storage[QUERY_PERMIT]
      const encryptedPermit = permitStore?.[signerAddress]
      const _storedPermit = encryptedPermit ? decrypt(encryptedPermit, password as string) : null

      const storedPermit = _storedPermit ? JSON.parse(_storedPermit) : { contracts: [] }
      const contracts = [...storedPermit.contracts]

      if (!contracts.includes(contractAddress)) {
        contracts.push(contractAddress)
      }

      const permit = await sscrt.createQueryPermit(signerAddress, 'permit', contracts, [
        'balance',
        'history',
      ])

      const getPermitObj = (shouldEncrypt: boolean) => ({
        [signerAddress]: shouldEncrypt
          ? encrypt(JSON.stringify({ contracts, permit }), password as string)
          : { contracts, permit },
      })
      setQueryPermits(
        getPermitObj(false) as unknown as Record<
          string,
          { contracts: Array<string>; permit: Permit }
        >,
      )
      await browser.storage.local.set({
        [QUERY_PERMIT]: getPermitObj(true),
      })

      return permit
    },
    [chainId, getWallet, lcdUrl, password, setQueryPermits],
  )
}
