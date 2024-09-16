import { AirdropEligibilityInfo, sliceAddress, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { CheckCircle, CopySimple, Wallet, WarningCircle } from '@phosphor-icons/react'
import Text from 'components/text'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { walletLabels } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { isCompassWallet } from 'utils/isCompassWallet'
import { trim } from 'utils/strings'

interface EligibleWalletsProps {
  selectedAirdrop: AirdropEligibilityInfo
}

export default function EligibleWallets({ selectedAirdrop }: EligibleWalletsProps) {
  const [showAddreessError, setShowAddreessError] = useState<boolean>(false)
  const [copied, setCopied] = useState(false)

  const { activeWallet } = useActiveWallet()

  const walletName =
    activeWallet?.walletType === WALLETTYPE.LEDGER &&
    !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(activeWallet.name)
      ? `${walletLabels[activeWallet.walletType]} Wallet ${activeWallet.addressIndex + 1}`
      : formatWalletName(activeWallet?.name || '')

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar
    }

    if (isCompassWallet()) {
      return Images.Logos.CompassCircle
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
    <div className='flex flex-col gap-2'>
      <Text size='md' className='font-bold gap-2'>
        <Wallet size={20} className='text-black-100 dark:text-white-100' />
        Eligible wallets
      </Text>
      <div className='bg-white-100 dark:bg-gray-950 p-4 rounded-2xl mt-1'>
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
                <div
                  key={index}
                  className='flex gap-2 py-2 px-3 rounded-3xl bg-gray-100 dark:bg-gray-900'
                >
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
            <div className='flex items-center bg-gray-100 dark:bg-gray-900 rounded-2xl border border-red-300 p-4 gap-3'>
              <WarningCircle size={20} className='text-red-300' />
              <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                We are unable to fetch airdrops for some addresses. Please try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
