import { CardDivider, GenericCard } from '@leapwallet/leap-ui'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useWindowSize } from 'hooks/utility/useWindowSize'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { sliceAddress } from 'utils/strings'

import { Wallet } from '../../hooks/wallet/useWallet'
import useWallets = Wallet.useWallets

import { walletLabels } from '../../config/constants'
import Key = Wallet.Key
import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

type SelectWalletsProps = {
  selectedWallets: Wallet.Key[]
  setSelectedWallets: React.Dispatch<React.SetStateAction<Wallet.Key[]>>
  forceChain?: SupportedChain
}

type SelectWalletsWalletCardProps = {
  imgSrc: string
  onClick?: () => void
  title?: string
  subtitle?: string
  isSelected?: boolean
}

const SelectWalletsWalletCard = ({
  imgSrc,
  onClick,
  title,
  subtitle,
  isSelected,
}: SelectWalletsWalletCardProps) => {
  const { width } = useWindowSize()
  const isFullScreen = width && width > 800

  return (
    <div className={`h-14 ${isFullScreen ? 'w-[716px]' : 'w-[360px]'}`}>
      <GenericCard
        title={<span className='text-[15px]'>{title}</span>}
        subtitle={subtitle}
        className={isFullScreen ? 'w-full' : 'w-[360px]'}
        img={<img src={imgSrc} className='h-10 w-10 mr-3' />}
        onClick={onClick}
        size='sm'
        isRounded
        icon={isSelected ? <img src={Images.Misc.Tick} alt='tick icon' /> : null}
      />
    </div>
  )
}

export const SelectWallets = ({
  selectedWallets,
  setSelectedWallets,
  forceChain,
}: SelectWalletsProps) => {
  const { activeWallet } = useActiveWallet()
  const { width } = useWindowSize()
  const isFullScreen = width && width > 800
  const [shouldShowAll] = useState(false)

  const wallets = useWallets()
  const activeChain = useActiveChain()

  const chain = forceChain ?? activeChain

  const walletsList = useMemo(() => {
    return wallets ? Object.values(wallets).sort((a, b) => a.addressIndex - b.addressIndex) : []

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, activeChain])

  const handleCardClick = (wallet: Wallet.Key) => {
    const index = selectedWallets.findIndex(
      (selectedWallet) => selectedWallet.addresses[chain] === wallet.addresses[chain],
    )

    const isPresent = index > -1
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const temp: any = []

    Object.assign(temp, selectedWallets)
    if (isPresent) {
      temp.splice(index, 1)
      setSelectedWallets(temp)
    } else {
      temp.push(wallet)
      setSelectedWallets(temp)
    }
  }

  useEffect(() => {
    setSelectedWallets([activeWallet as Key])

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (walletsList.length <= 1) return null

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden py-2 bg-white-100 dark:bg-gray-900 ${
        isFullScreen ? 'w-[716px]' : 'w-full'
      }`}
    >
      <div>
        {walletsList
          .filter((wallet: Key) => wallet.id === activeWallet?.id)
          .slice(0, shouldShowAll || isFullScreen ? walletsList.length : 2)
          .map((wallet, index, array) => {
            const isLast = index === array.length - 1
            const walletLabel =
              wallet.walletType === WALLETTYPE.LEDGER ? ` · /0'/0/${wallet.addressIndex}` : ''

            const walletName =
              wallet.walletType == WALLETTYPE.LEDGER
                ? `${walletLabels[wallet.walletType]} Wallet ${wallet.addressIndex + 1}`
                : wallet.name
            return (
              <>
                <SelectWalletsWalletCard
                  key={wallet.name}
                  subtitle={`${sliceAddress(wallet.addresses[chain])}${walletLabel}`}
                  title={`Connecting to ${walletName}`}
                  imgSrc={Images.Misc.getWalletIconAtIndex(wallet.colorIndex)}
                  onClick={() => handleCardClick(wallet)}
                />
                {!isLast && !isFullScreen ? <CardDivider /> : null}
              </>
            )
          })}
      </div>
    </div>
  )
}
