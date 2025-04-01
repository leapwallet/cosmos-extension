import { useChainApis, useChainId, useScrtKeysStore } from '@leapwallet/cosmos-wallet-hooks'
import { SigningSscrt } from '@leapwallet/cosmos-wallet-sdk/dist/browser/secret/sscrt'
import { decrypt, encrypt } from '@leapwallet/leap-keychain'
import { useSecretWallet } from 'hooks/wallet/useScrtWallet'
import { useCallback } from 'react'
import { Permit } from 'secretjs'
import { passwordStore } from 'stores/password-store'
import browser from 'webextension-polyfill'

import { QUERY_PERMIT } from '../../config/storage-keys'

export function useCreateQueryPermit() {
  const getWallet = useSecretWallet()

  const { setQueryPermits } = useScrtKeysStore()
  const { lcdUrl = '' } = useChainApis()
  const chainId = useChainId()

  // creates query permit, saves it to storage and updates the store
  return useCallback(
    async (signerAddress: string, contractAddress: string) => {
      if (!passwordStore.password) throw new Error('Password not set')
      const wallet = await getWallet()
      const sscrt = SigningSscrt.create(lcdUrl, chainId as string, wallet)

      const storage = await browser.storage.local.get([QUERY_PERMIT])
      const permitStore = storage[QUERY_PERMIT]
      const encryptedPermit = permitStore?.[signerAddress]
      const _storedPermit = encryptedPermit
        ? decrypt(encryptedPermit, passwordStore.password)
        : null

      const storedPermit = _storedPermit ? JSON.parse(_storedPermit) : { contracts: [] }
      const contracts = [...storedPermit.contracts]

      if (!contracts.includes(contractAddress)) {
        contracts.push(contractAddress)
      }

      const permit = await sscrt.createQueryPermit(signerAddress, 'permit', contracts, [
        'balance',
        'history',
      ])

      const getPermitObj = (shouldEncrypt: boolean) => {
        if (!passwordStore.password) throw new Error('Password not set')

        return {
          [signerAddress]: shouldEncrypt
            ? encrypt(JSON.stringify({ contracts, permit }), passwordStore.password)
            : { contracts, permit },
        }
      }
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
    [chainId, getWallet, lcdUrl, setQueryPermits],
  )
}
