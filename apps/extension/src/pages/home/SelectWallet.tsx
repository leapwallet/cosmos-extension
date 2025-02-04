import {
  Key,
  useActiveChain,
  useChainInfo,
  useGetChains,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, ThemeName, useTheme, WalletCard } from '@leapwallet/leap-ui'
import { DotsThree, DownloadSimple, PlusCircle, Usb } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { ButtonName, EventName } from 'config/analytics'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { AGGREGATED_CHAIN_KEY, walletLabels } from 'config/constants'
import { useChainPageInfo } from 'hooks'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import { addToConnections } from 'pages/ApproveConnection/utils'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { activeChainStore } from 'stores/active-chain-store'
import { chainInfoStore } from 'stores/chain-infos-store'
import { AggregatedSupportedChain } from 'types/utility'
import { closeSidePanel } from 'utils/closeSidePanel'
import { formatWalletName } from 'utils/formatWalletName'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import { isSidePanel } from 'utils/isSidePanel'
import extension from 'webextension-polyfill'

import Text from '../../components/text'
import useActiveWallet from '../../hooks/settings/useActiveWallet'
import { Wallet } from '../../hooks/wallet/useWallet'
import { sliceAddress } from '../../utils/strings'
import { NewWalletForm } from './CreateNewWallet'
import { EditWalletForm } from './EditWallet'
import { ImportPrivateKey } from './ImportPrivateKey'
import { ImportSeedPhrase } from './ImportSeedPhrase'
import ImportWatchWallet from './ImportWatchWallet'

type SelectWalletProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly title: string
  readonly hideCreateNewWallet?: boolean
  readonly currentWalletInfo?: {
    wallets: [Key]
    chainIds: [string]
    origin: string
  } | null
}

export default function SelectWallet({
  isVisible,
  onClose,
  title,
  currentWalletInfo,
  hideCreateNewWallet,
}: SelectWalletProps) {
  const [isNewWalletFormVisible, setIsNewWalletFormVisible] = useState(false)
  const [isEditWalletVisible, setIsEditWalletVisible] = useState(false)
  const wallets = Wallet.useWallets()
  const activeChainInfo = useChainInfo()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const [editWallet, setEditWallet] = useState<Key>()
  const navigate = useNavigate()
  const { theme } = useTheme()

  const chains = useGetChains()
  const { topChainColor } = useChainPageInfo()
  const [showImportPrivateKey, setShowImportPrivateKey] = useState(false)
  const [showImportSeedPhrase, setShowImportSeedPhrase] = useState(false)
  const [showImportWatchWallet, setShowImportWatchWallet] = useState(false)

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .sort((a, b) =>
            a.watchWallet === b.watchWallet ? a.name.localeCompare(b.name) : a.watchWallet ? 1 : -1,
          )
      : []
  }, [wallets])

  const handleConnectWalletClick = async () => {
    const walletIds = currentWalletInfo?.wallets.map((wallet) => wallet.id)
    await addToConnections(
      currentWalletInfo?.chainIds as [string],
      walletIds ?? [],
      currentWalletInfo?.origin as string,
    )
    onClose()
  }

  const walletName = currentWalletInfo?.wallets?.[0]?.name
  const walletColorIndex = currentWalletInfo?.wallets?.[0]?.colorIndex
  const siteName =
    currentWalletInfo?.origin?.split('//')?.at(-1)?.split('.')?.at(-2) ||
    currentWalletInfo?.origin?.split('//')?.at(-1)
  const siteLogo = useSiteLogo(currentWalletInfo?.origin)

  const handleCreateNewWalletClick = () => {
    if (hasMnemonicWallet(wallets as Wallet.Keystore)) {
      setIsNewWalletFormVisible(true)
    } else {
      window.open(extension.runtime.getURL(`index.html#/onboarding`))
      closeSidePanel()
    }
  }

  return (
    <>
      <BottomModal isOpen={isVisible} onClose={onClose} title={title} closeOnBackdropClick={true}>
        <div>
          {currentWalletInfo && (
            <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 min-h-[100px] justify-center items-center p-2'>
              <div className='pt-8 pb-2 flex flex-row'>
                <img
                  src={Images.Misc.getWalletIconAtIndex(
                    walletColorIndex as number,
                    currentWalletInfo?.wallets?.[0]?.watchWallet,
                  )}
                  className='z-10 border-2 border-gray-900 rounded-full relative left-2'
                />
                <object data={siteLogo} type='image' className='relative -left-2 z-0'>
                  <img src={Images.Misc.DefaultWebsiteIcon} alt='Website default icon' />
                </object>
              </div>
              <Text size='md' color='text-green-600' className='font-bold my-2'>
                {siteName}
              </Text>
              <Text size='xl' className='my-0 font-extrabold'>
                {walletName} not Connected
              </Text>
              <Text
                size='xs'
                style={{ textAlign: 'center' }}
                className='mb-2'
                color='text-gray-400'
              >
                You can connect this wallet, or can switch to an already connected wallet.
              </Text>
              <div
                onClick={handleConnectWalletClick}
                style={{ background: 'rgba(225, 136, 129, 0.1)', color: '#E18881' }}
                className='font-bold p-1 px-2 rounded-2xl cursor-pointer my-2'
              >
                Connect {walletName}
              </div>
            </div>
          )}

          <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 max-h-[200px] overflow-y-auto mb-4 py-1'>
            {walletsList.map((wallet, index, array) => {
              const isLast = index === array.length - 1
              if (wallet.id === currentWalletInfo?.wallets?.[0]?.id) return null
              let walletLabel = ''

              if (wallet.walletType === WALLETTYPE.LEDGER) {
                walletLabel = ` · /0'/0/${wallet.addressIndex}`
              }

              if (
                (wallet.walletType === WALLETTYPE.PRIVATE_KEY ||
                  wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED) &&
                !wallet.watchWallet
              ) {
                walletLabel = ` · Imported`
              }

              const walletName =
                wallet.walletType == WALLETTYPE.LEDGER &&
                !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(wallet.name)
                  ? `${walletLabels[wallet.walletType]} Wallet ${wallet.addressIndex + 1}`
                  : formatWalletName(wallet.name)
              const walletNameLength = walletName.length
              const sliceLength = wallet.walletType === WALLETTYPE.LEDGER ? 10 : 19
              const shortenedWalletName =
                walletNameLength > sliceLength
                  ? walletName.slice(0, sliceLength) + '...'
                  : walletName

              const addressValue = activeChainInfo?.evmOnlyChain
                ? pubKeyToEvmAddressToShow(wallet?.pubKeys?.[activeChainInfo?.key]) ??
                  wallet?.addresses?.[activeChainInfo?.key]
                : wallet?.addresses?.[activeChainInfo?.key] ?? ''
              let addressText = `${
                addressValue
                  ? sliceAddress(addressValue) + walletLabel
                  : walletLabel.replace(' · ', '')
              }`

              let disableEdit = false

              if (
                wallet.walletType === WALLETTYPE.LEDGER &&
                !isLedgerEnabled(
                  activeChainInfo?.key,
                  activeChainInfo?.bip44?.coinType,
                  Object.values(chains),
                )
              ) {
                addressText = `Ledger not supported on ${activeChainInfo?.chainName}`
                disableEdit = true
              }
              if (
                wallet.walletType === WALLETTYPE.LEDGER &&
                isLedgerEnabled(
                  activeChainInfo?.key,
                  activeChainInfo?.bip44?.coinType,
                  Object.values(chains),
                ) &&
                !wallet.addresses[activeChainInfo?.key]
              ) {
                addressText = `Please import EVM wallet`
                disableEdit = true
              }
              return (
                <div className='relative min-h-[56px]' key={wallet.id}>
                  <WalletCard
                    onClick={async () => {
                      await setActiveWallet(wallet)
                      onClose()
                    }}
                    key={formatWalletName(wallet.name)}
                    title={
                      <div className='flex flex-row items-center whitespace-nowrap'>
                        {shortenedWalletName}
                        {wallet.walletType === WALLETTYPE.LEDGER && (
                          <Text
                            className='bg-gray-950 font-normal rounded-2xl justify-center items-center px-2 ml-1 h-[18px]'
                            color='text-gray-400'
                            size='xs'
                          >
                            Ledger
                          </Text>
                        )}
                      </div>
                    }
                    icon={
                      <div
                        className='flex h-[28px] w-[28px] hover:cursor-pointer justify-center text-gray-400 items-center bg-white-100 dark:bg-gray-900'
                        onClick={(e) => {
                          e.stopPropagation()
                          if (disableEdit) return
                          setEditWallet(wallet)
                          setIsEditWalletVisible(true)
                        }}
                        data-testing-id={isLast ? 'btn-more-horiz' : ''}
                      >
                        <DotsThree size={20} className='text-gray-400' />
                      </div>
                    }
                    subtitle={
                      activeChain === AGGREGATED_CHAIN_KEY
                        ? walletLabel?.replace(' · ', '')
                        : addressText
                    }
                    isSelected={activeWallet?.id === wallet.id}
                    imgSrc={
                      wallet?.avatar ??
                      Images.Misc.getWalletIconAtIndex(wallet.colorIndex, wallet.watchWallet)
                    }
                    color={topChainColor}
                    isRounded={true}
                  />
                  {!isLast ? <CardDivider /> : null}
                </div>
              )
            })}
          </div>

          {!hideCreateNewWallet ? (
            <>
              <div className='bg-white-100 dark:bg-gray-900 rounded-2xl mb-4 overflow-hidden'>
                <div
                  data-testing-id='create-new-wallet-div'
                  onClick={handleCreateNewWalletClick}
                  className='flex items-center p-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
                >
                  <PlusCircle size={20} className='text-gray-400 mr-4' />
                  <Text size='md' className='font-bold'>
                    Create new wallet
                  </Text>
                </div>

                <CardDivider />
                <div
                  onClick={() => setShowImportSeedPhrase(true)}
                  className='flex items-center px-4 py-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
                >
                  <DownloadSimple size={20} className='text-gray-400 mr-4' />
                  <Text size='md' className='font-bold'>
                    Import using recovery phrase
                  </Text>
                </div>

                <CardDivider />
                <div
                  onClick={() => setShowImportPrivateKey(true)}
                  className='flex items-center px-4 py-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
                >
                  <img src={Images.Misc.FilledKey} alt='filled-key' className='mr-4' />
                  <Text size='md' className='font-bold'>
                    Import using private key
                  </Text>
                </div>

                {isCompassWallet() ? null : (
                  <>
                    <CardDivider />
                    <div
                      onClick={() => {
                        setShowImportWatchWallet(true)
                        mixpanel.track(EventName.ButtonClick, {
                          buttonName: ButtonName.WATCH_WALLET,
                        })
                      }}
                      className='flex items-center p-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
                    >
                      <img
                        src={theme === ThemeName.DARK ? Images.Misc.EyeDark : Images.Misc.EyeLight}
                        className='mr-4 w-5 h-5 dark:opacity-60'
                      />
                      <Text size='md' className='font-bold'>
                        Watch wallet
                      </Text>
                      <div className='text-xs font-medium text-green-500 bg-green-500/10 py-1 px-2.5 rounded-2xl ml-2'>
                        NEW
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div
                onClick={() => {
                  const views = extension.extension.getViews({ type: 'popup' })
                  if (views.length === 0 && !isSidePanel()) {
                    navigate('/onboardingImport?walletName=hardwarewallet')
                  } else {
                    window.open('index.html#/onboardingImport?walletName=hardwarewallet')
                    closeSidePanel()
                  }
                }}
                className='flex items-center px-4 py-4 bg-white-100 dark:bg-gray-900 cursor-pointer rounded-2xl'
              >
                <Usb size={20} className='text-gray-400 mr-4' />
                <Text size='md' className='font-bold'>
                  Connect Ledger
                </Text>
              </div>
            </>
          ) : null}
        </div>
      </BottomModal>

      <EditWalletForm
        wallet={editWallet as Key}
        isVisible={isEditWalletVisible}
        onClose={() => {
          setIsEditWalletVisible(false)
        }}
        activeChainStore={activeChainStore}
        chainInfosStore={chainInfoStore}
      />

      <NewWalletForm
        isVisible={isNewWalletFormVisible}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) {
            onClose()
          }
          setIsNewWalletFormVisible(false)
        }}
      />

      <ImportSeedPhrase
        isVisible={showImportSeedPhrase}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose()
          setShowImportSeedPhrase(false)
        }}
      />

      <ImportPrivateKey
        isVisible={showImportPrivateKey}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose()
          setShowImportPrivateKey(false)
        }}
      />

      <ImportWatchWallet
        isVisible={showImportWatchWallet}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) onClose()
          setShowImportWatchWallet(false)
        }}
      />
    </>
  )
}
