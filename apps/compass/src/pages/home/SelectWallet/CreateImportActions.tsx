import { CaretRight, PlusCircle } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { ButtonName, EventName } from 'config/analytics'
import { EyeIcon } from 'icons/eye-icon'
import { KeyIcon } from 'icons/key-icon'
import { LedgerDriveIcon } from 'icons/ledger-drive-icon'
import { LockRotateIcon } from 'icons/lock-rotate-icon'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { closeSidePanel } from 'utils/closeSidePanel'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import { isSidePanel } from 'utils/isSidePanel'
import extension from 'webextension-polyfill'

import { Wallet } from '../../../hooks/wallet/useWallet'
import { NewWalletForm } from '../CreateNewWallet'
import { ImportPrivateKey } from '../ImportPrivateKey'
import { ImportSeedPhrase } from '../ImportSeedPhrase'
import ImportWatchWallet from '../ImportWatchWallet'

type SelectedAction = 'new-wallet' | 'import-private-key' | 'import-seed-phrase' | 'watch-wallet'

const CreateImportActions = observer(
  ({
    isVisible,
    onClose,
    title,
  }: {
    isVisible: boolean
    onClose: (closeParent?: boolean) => void
    title: string
  }) => {
    const navigate = useNavigate()
    const wallets = Wallet.useWallets()

    const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(null)

    const handleCreateNewWalletClick = useCallback(() => {
      if (hasMnemonicWallet(wallets as Wallet.Keystore)) {
        setSelectedAction('new-wallet')
      } else {
        window.open(extension.runtime.getURL(`index.html#/onboarding`))
        closeSidePanel()
      }
    }, [wallets])

    const handleWatchWalletClick = useCallback(() => {
      setSelectedAction('watch-wallet')
    }, [])

    const handleConnectLedgerClick = useCallback(() => {
      const views = extension.extension.getViews({ type: 'popup' })
      if (views.length === 0 && !isSidePanel()) {
        navigate('/onboardingImport?walletName=ledger')
      } else {
        window.open('index.html#/onboardingImport?walletName=ledger')
        closeSidePanel()
      }
    }, [navigate])

    const actions = [
      {
        title: 'Create new wallet',
        testId: 'create-new-wallet-div',
        icon: <PlusCircle size={20} weight='fill' className='size-6 text-accent-success' />,
        onClick: handleCreateNewWalletClick,
      },
      {
        title: 'Import using recovery phrase',
        testId: 'import-seed-phrase-div',
        icon: <LockRotateIcon className='size-6 text-destructive-100' />,
        onClick: () => setSelectedAction('import-seed-phrase'),
      },
      {
        title: 'Import using private key',
        testId: 'import-private-key-div',
        icon: <KeyIcon className='size-6 text-accent-blue-200' />,
        onClick: () => setSelectedAction('import-private-key'),
      },
      {
        title: 'Import using Ledger',
        testId: 'import-ledger-div',
        icon: <LedgerDriveIcon className='size-5 m-0.5 text-[#C984EB]' />,
        onClick: handleConnectLedgerClick,
      },
      {
        title: 'Watch wallet',
        testId: 'watch-wallet-div',
        icon: <EyeIcon size={20} weight='fill' className='size-6 text-accent-warning' />,
        onClick: handleWatchWalletClick,
      },
    ]

    return (
      <>
        <BottomModal
          isOpen={isVisible}
          onClose={onClose}
          title={title}
          fullScreen
          className='gap-2 flex flex-col'
        >
          {actions.map((action) => (
            <button
              key={action.testId}
              data-testing-id={action.testId}
              onClick={action.onClick}
              className='flex items-center p-4 bg-secondary-100 cursor-pointer rounded-2xl gap-3 hover:bg-secondary-200 transition-colors group'
            >
              {action.icon}
              <span className='text-sm font-bold'>{action.title}</span>
              <CaretRight
                weight='bold'
                className='ml-auto size-4 text-secondary-600 group-hover:text-secondary-800 group-hover:scale-105 transition-all'
              />
            </button>
          ))}
        </BottomModal>

        <NewWalletForm
          isVisible={selectedAction === 'new-wallet'}
          onClose={(closeSelectWallet: boolean) => {
            if (closeSelectWallet) {
              onClose(true)
            }
            setSelectedAction(null)
          }}
        />

        <ImportSeedPhrase
          isVisible={selectedAction === 'import-seed-phrase'}
          onClose={(closeSelectWallet: boolean) => {
            if (closeSelectWallet) onClose(true)
            setSelectedAction(null)
          }}
        />

        <ImportPrivateKey
          isVisible={selectedAction === 'import-private-key'}
          onClose={(closeSelectWallet: boolean) => {
            if (closeSelectWallet) onClose(true)
            setSelectedAction(null)
          }}
        />

        <ImportWatchWallet
          isVisible={selectedAction === 'watch-wallet'}
          onClose={(closeSelectWallet?: boolean) => {
            if (closeSelectWallet) onClose(true)
            setSelectedAction(null)
          }}
        />
      </>
    )
  },
)

export default CreateImportActions
