import { useAddress, useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import { isSolanaChain, SolanaTx, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { WarningCircle, X } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useEffect, useState } from 'react'
import { getStorageAdapter } from 'utils/storageAdapter'

export const MALICIOUS_WALLET_ALERT_KEY = 'malicious-wallet-alert'

export const MaliciousWalletAlert = ({
  activeChain,
  selectedNetwork,
}: {
  activeChain: SupportedChain
  selectedNetwork: 'mainnet' | 'testnet'
}) => {
  const [show, setShow] = useState(false)
  const { rpcUrl } = useChainApis(activeChain, selectedNetwork)
  const selectedAddress = useAddress(activeChain)
  const storageAdapter = getStorageAdapter()

  const { data: isMaliciousWallet } = useQuery(
    ['is-malicious-wallet', selectedAddress, selectedNetwork, activeChain],
    async () => {
      if (!selectedAddress || !isSolanaChain(activeChain)) {
        return false
      }
      try {
        const solanaTx = await SolanaTx.getSolanaClient(
          rpcUrl as string,
          undefined,
          selectedNetwork,
          activeChain,
        )
        return await solanaTx.isMaliciousWallet(selectedAddress, selectedNetwork)
      } catch (error) {
        return false
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: isSolanaChain(activeChain) && Boolean(selectedAddress),
      retry: false,
    },
  )

  useEffect(() => {
    const checkStorageAndSetShow = async () => {
      const storedValue = (await storageAdapter.get(MALICIOUS_WALLET_ALERT_KEY, 'idb')) as
        | Record<string, boolean>
        | undefined
      const shouldHide =
        storedValue?.[`${activeChain}-${selectedNetwork}-${selectedAddress}`] === false

      if (isMaliciousWallet && !shouldHide) {
        setShow(true)
      } else {
        setShow(false)
      }
    }
    checkStorageAndSetShow()
  }, [activeChain, isMaliciousWallet, selectedAddress, selectedNetwork, storageAdapter])

  const handleClose = useCallback(async () => {
    await storageAdapter.set<Record<string, boolean>>(
      MALICIOUS_WALLET_ALERT_KEY,
      {
        [`${activeChain}-${selectedNetwork}-${selectedAddress}`]: false,
      },
      'idb',
    )
    setShow(false)
  }, [activeChain, selectedNetwork, selectedAddress, storageAdapter, setShow])

  if (!show || !isMaliciousWallet) {
    return null
  }

  return (
    <div className='flex flex-col px-7 pb-8'>
      <div
        className={
          'w-full flex justify-start items-start gap-2 text-sm font-bold rounded-xl bg-accent-warning-700 text-accent-warning-foreground px-4 py-3 relative'
        }
      >
        <WarningCircle weight='fill' size={28} className='-mt-0.5' />
        <p className='font-bold text-[14px] leading-[140%] tracking-[0px] decoration-solid decoration-[0%] underline-offset-[0%]'>
          This account could be malicious. Do not send money or make deposits.{' '}
          <a
            href='https://www.leapwallet.io/blog/why-leap-wallet-shows-a-malicious-account-warning'
            target='_blank'
            rel='noreferrer'
            className='text-blue-500 cursor-pointer underline underline-offset-4'
          >
            Learn more
          </a>
        </p>
        <div className='absolute right-2 top-2 rounded-full bg-[#8B5E13]'>
          <X weight='bold' size={14} className='cursor-pointer p-0.5' onClick={handleClose} />
        </div>
      </div>
    </div>
  )
}
