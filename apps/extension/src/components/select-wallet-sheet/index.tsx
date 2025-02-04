import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { Avatar, Card, CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { walletLabels } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { addToConnections } from 'pages/ApproveConnection/utils'
import React, { useMemo } from 'react'
import { formatWalletName } from 'utils/formatWalletName'
import { imgOnError } from 'utils/imgOnError'
import { sliceAddress } from 'utils/strings'

import useWallets = Wallet.useWallets

type SelectWalletProps = {
  readonly title: string
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly currentWalletInfo?: {
    wallets: [Key]
    chainIds: [string]
    origin: string
  } | null
  readonly activeChain: SupportedChain
}

export default function SelectWalletSheet({
  isOpen,
  onClose,
  title,
  currentWalletInfo,
  activeChain,
}: SelectWalletProps) {
  const wallets = useWallets()
  const { activeWallet, setActiveWallet } = useActiveWallet()

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .sort((a, b) => a.name.localeCompare(b.name))
      : []
  }, [wallets])

  const walletName = currentWalletInfo?.wallets?.[0]?.name
  const walletAddress = currentWalletInfo?.wallets?.[0]?.addresses?.[activeChain]
  const walletColorIndex = currentWalletInfo?.wallets?.[0]?.colorIndex
  const siteName =
    currentWalletInfo?.origin?.split('//')?.at(-1)?.split('.')?.at(-2) ||
    currentWalletInfo?.origin?.split('//')?.at(-1)

  const siteLogo = useSiteLogo(currentWalletInfo?.origin)

  return (
    <>
      <BottomModal isOpen={isOpen} onClose={onClose} title={title} closeOnBackdropClick={true}>
        <div>
          {currentWalletInfo && (
            <div className='flex flex-col p-4 mb-4 rounded-2xl bg-white-100 dark:bg-gray-900 min-h-[100px] justify-center items-center'>
              <div className='mt-2 flex flex-row items-center'>
                <img
                  src={Images.Misc.getWalletIconAtIndex(
                    walletColorIndex as number,
                    currentWalletInfo?.wallets?.[0]?.watchWallet,
                  )}
                  className='z-10 border-2 border-gray-900 rounded-full relative left-2'
                />
                <Avatar
                  avatarImage={siteLogo}
                  avatarOnError={imgOnError(Images.Misc.DefaultWebsiteIcon)}
                  size='sm'
                  className='-left-2 z-0 rounded-full overflow-hidden'
                />
              </div>
              <Text size='md' color='text-green-600' className='font-bold my-2'>
                {siteName}
              </Text>
              <Text size='xl' className='my-0 font-extrabold'>
                {walletName} Connected
              </Text>
              {walletAddress ? (
                <p className='text-sm font-medium dark:text-gray-400 text-gray-700'>
                  {sliceAddress(walletAddress)}
                </p>
              ) : null}
            </div>
          )}
          <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 h-fit max-h-[250px] overflow-y-auto'>
            {walletsList.map((wallet, index, array) => {
              const isLast = index === array.length - 1
              if (wallet.id === currentWalletInfo?.wallets?.[0]?.id) return null
              let walletLabel = ''

              if (wallet.walletType === WALLETTYPE.LEDGER) {
                walletLabel = ` · /0'/0/${wallet.addressIndex}`
              }

              if (
                wallet.walletType === WALLETTYPE.PRIVATE_KEY ||
                wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
              ) {
                walletLabel = ` · Imported`
              }

              const walletName =
                wallet.walletType == WALLETTYPE.LEDGER &&
                !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(wallet.name)
                  ? `${walletLabels[wallet.walletType]} Wallet ${wallet.addressIndex + 1}`
                  : formatWalletName(wallet.name)
              const walletNameLength = walletName.length
              const shortenedWalletName =
                walletNameLength > 16 ? walletName.slice(0, 16) + '...' : walletName

              return (
                <div className='relative min-h-[56px] w-full' key={wallet.id}>
                  <Card
                    onClick={async () => {
                      const walletIds = currentWalletInfo?.wallets.map((wallet) => wallet.id)
                      await addToConnections(
                        currentWalletInfo?.chainIds as [string],
                        walletIds ?? [],
                        currentWalletInfo?.origin as string,
                      )
                      setActiveWallet(wallet)
                      onClose()
                    }}
                    className='!w-full'
                    key={wallet.name}
                    title={shortenedWalletName}
                    subtitle={`${sliceAddress(wallet.addresses[activeChain])}${walletLabel}`}
                    iconSrc={activeWallet?.id === wallet.id ? Images.Misc.CheckCosmos : undefined}
                    imgSrc={Images.Misc.getWalletIconAtIndex(wallet.colorIndex, wallet.watchWallet)}
                    isRounded={true}
                  />
                  {!isLast ? <CardDivider /> : null}
                </div>
              )
            })}
          </div>
        </div>
      </BottomModal>
    </>
  )
}
