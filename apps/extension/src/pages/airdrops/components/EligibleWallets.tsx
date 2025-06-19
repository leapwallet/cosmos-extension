import { AirdropEligibilityInfo, sliceAddress } from '@leapwallet/cosmos-wallet-hooks'
import { CheckCircle, CopySimple, Wallet, WarningCircle } from '@phosphor-icons/react'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { trim } from 'utils/strings'

interface EligibleWalletsProps {
  selectedAirdrop: AirdropEligibilityInfo
}

export default function EligibleWallets({ selectedAirdrop }: EligibleWalletsProps) {
  const [showAddreessError, setShowAddreessError] = useState<boolean>(false)
  const [copied, setCopied] = useState(false)

  const { activeWallet } = useActiveWallet()
  const walletName = formatWalletName(activeWallet?.name || '')

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar
    }

    return
  }, [activeWallet?.avatar])

  useEffect(() => {
    const addressNotFound = selectedAirdrop?.tokenInfo?.find((token) => !token?.address)
    if (addressNotFound) {
      setShowAddreessError(true)
    }
  }, [selectedAirdrop])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (copied) {
      timeout = setTimeout(() => setCopied(false), 2000)
    }
    return () => clearTimeout(timeout)
  }, [copied])

  const onCopy = (address: string | undefined) => {
    if (!address) return
    UserClipboard.copyText(address)
    setCopied(true)
  }

  return (
    <div className='flex flex-col gap-2 bg-secondary-100 rounded-xl p-4'>
      <Text size='md' className='font-bold gap-2'>
        <Wallet size={20} className='text-black-100 dark:text-white-100' />
        Eligible wallets
      </Text>
      <div className='bg-secondary-200 p-4 rounded-2xl mt-1'>
        <div className='flex items-center gap-2 mb-3'>
          {walletAvatar ? (
            <img className='w-5 h-5 rounded-full' src={walletAvatar} alt='wallet-avatar' />
          ) : (
            <img className='w-5 h-5' src={Images.Logos.LeapLogo28} alt='wallet-avatar' />
          )}
          <Text size='sm' className='font-bold'>
            {trim(walletName, 10)}
          </Text>
        </div>
        <div className='flex flex-wrap gap-3'>
          {selectedAirdrop?.tokenInfo?.map((token, index) => {
            if (token?.address) {
              return (
                <div key={index} className='flex gap-2 py-2 px-3 rounded-3xl bg-secondary-300'>
                  <Text size='sm' color='text-gray-800 dark:text-gray-200' className='font-medium'>
                    {sliceAddress(token?.address)}
                  </Text>
                  <div
                    className='text-black-100 dark:text-white-100 cursor-pointer'
                    onClick={() => onCopy(token?.address)}
                  >
                    {copied ? (
                      <CheckCircle
                        weight='fill'
                        size={20}
                        className='text-black-100 dark:text-white-100'
                      />
                    ) : (
                      <CopySimple size={20} className='text-black-100 dark:text-white-100' />
                    )}
                  </div>
                </div>
              )
            }
          })}
          {showAddreessError && (
            <div className='flex items-start bg-destructive/75 rounded-2xl p-4 gap-3'>
              <WarningCircle size={16} className='text-destructive-100 shrink-0 mt-1' />
              <p className='text-sm font-medium text-foreground !leading-[19px]'>
                We are unable to fetch airdrops for some addresses. Please try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
