import { Key } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, ChainInfos, sleep, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { chainInfosState } from 'atoms/chains'
import { BETA_CHAINS, CHECKED_NOBLE_AIRDROP_PUBKEYS } from 'config/storage-keys'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet, { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSetRecoilState } from 'recoil'
import Browser, { Storage } from 'webextension-polyfill'

export function useAirdropEligibility() {
  const { activeWallet } = useActiveWallet()
  const noblePubKeys = activeWallet?.pubKeys?.noble
  const [isEligible, setIsEligible] = useState(true)

  useEffect(() => {
    const nobleAirdropPubKeysListener = (changes: Record<string, Storage.StorageChange>) => {
      if (changes[CHECKED_NOBLE_AIRDROP_PUBKEYS]) {
        const { newValue } = changes[CHECKED_NOBLE_AIRDROP_PUBKEYS]
        if (newValue.includes(noblePubKeys)) {
          setIsEligible(false)
        }
      }
    }

    Browser.storage.onChanged.addListener(nobleAirdropPubKeysListener)

    return () => Browser.storage.onChanged.removeListener(nobleAirdropPubKeysListener)
  }, [noblePubKeys])

  const { status: eligibilityStatus } = useQuery(['airdropEligibility', noblePubKeys], async () => {
    const response = await fetch('https://assets.leapwallet.io/cosmos/noble/airdrop-wallets.json')
    const nobleAirdropWallets: { pub_key: { key: string } }[] = await response.json()

    const _isEligible = nobleAirdropWallets.some((wallet) => wallet.pub_key.key === noblePubKeys)
    setIsEligible(_isEligible)
  })

  return { isEligible, eligibilityStatus }
}

export function useEnableMarsAlternateChain() {
  const [loading, setLoading] = useState(false)
  const setChainInfos = useSetRecoilState(chainInfosState)
  const chainInfos = useChainInfos()
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const updateKeyStore = useUpdateKeyStore()
  const navigate = useNavigate()
  const setActiveChain = useSetActiveChain()

  const addMarsAirdropChain = async () => {
    setLoading(true)
    const chainName = 'Mars (Airdrop users)'
    const data: ChainInfo = {
      ...ChainInfos.mars,
      bip44: {
        coinType: '330',
      },
      chainName,
      beta: true,
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setChainInfos({ ...chainInfos, [chainName]: data })
    await sleep(500)
    Browser.storage.local.get([BETA_CHAINS]).then(async (resp) => {
      try {
        let betaChains = resp?.[BETA_CHAINS]

        betaChains = typeof betaChains === 'string' ? JSON.parse(betaChains) : {}
        betaChains[chainName] = data
        await Browser.storage.local.set({ [BETA_CHAINS]: JSON.stringify(betaChains) })
        const updatedKeystore = await updateKeyStore(
          activeWallet as Key,
          chainName as unknown as SupportedChain,
          'UPDATE',
          data,
        )
        await setActiveWallet(updatedKeystore[activeWallet?.id ?? ''] as Key)
        await setActiveChain(chainName as unknown as SupportedChain, data)
        navigate('/')
      } catch (error) {
        // do nothing
      } finally {
        setLoading(false)
      }
    })
  }
  return { addMarsAirdropChain, loading }
}
