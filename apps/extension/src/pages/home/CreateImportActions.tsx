import { CardDivider, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { DownloadSimple, PlusCircle, Usb } from '@phosphor-icons/react'
import { ButtonName, EventName } from 'config/analytics'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { closeSidePanel } from 'utils/closeSidePanel'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import extension from 'webextension-polyfill'

import Text from '../../components/text'
import { Wallet } from '../../hooks/wallet/useWallet'

const CreateImportActions = observer(
  ({
    setShowImportSeedPhrase,
    setShowImportPrivateKey,
    setShowImportWatchWallet,
    setIsNewWalletFormVisible,
  }: {
    setShowImportSeedPhrase: (show: boolean) => void
    setShowImportPrivateKey: (show: boolean) => void
    setShowImportWatchWallet: (show: boolean) => void
    setIsNewWalletFormVisible: (show: boolean) => void
  }) => {
    const { theme } = useTheme()
    const navigate = useNavigate()
    const wallets = Wallet.useWallets()

    const handleCreateNewWalletClick = useCallback(() => {
      if (hasMnemonicWallet(wallets as Wallet.Keystore)) {
        setIsNewWalletFormVisible(true)
      } else {
        window.open(extension.runtime.getURL(`index.html#/onboarding`))
        closeSidePanel()
      }
    }, [setIsNewWalletFormVisible, wallets])

    const handleWatchWalletClick = useCallback(() => {
      setShowImportWatchWallet(true)
      mixpanel.track(EventName.ButtonClick, {
        buttonName: ButtonName.WATCH_WALLET,
      })
    }, [setShowImportWatchWallet])

    const handleConnectLedgerClick = useCallback(() => {
      const views = extension.extension.getViews({ type: 'popup' })
      if (views.length === 0 && !isSidePanel()) {
        navigate('/onboardingImport?walletName=hardwarewallet')
      } else {
        window.open('index.html#/onboardingImport?walletName=hardwarewallet')
        closeSidePanel()
      }
    }, [navigate])

    return (
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
                onClick={handleWatchWalletClick}
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
          onClick={handleConnectLedgerClick}
          className='flex items-center px-4 py-4 bg-white-100 dark:bg-gray-900 cursor-pointer rounded-2xl'
        >
          <Usb size={20} className='text-gray-400 mr-4' />
          <Text size='md' className='font-bold'>
            Connect Ledger
          </Text>
        </div>
      </>
    )
  },
)

export default CreateImportActions
