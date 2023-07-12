import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { Buttons, ProgressBar } from '@leapwallet/leap-ui'
import ExtensionPage from 'components/extension-page'
import { useSetPassword } from 'hooks/settings/usePassword'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'
import correctMnemonic from 'utils/correct-mnemonic'
import { DEBUG } from 'utils/debug'
import { isCompassWallet } from 'utils/isCompassWallet'

import Disclaimer from './screens/disclaimer'
import RequireSeedPhrase from './screens/requireSeedPhrase'
import SelectWallets from './screens/select-wallets'
import SetPassword from './screens/setPassword'

const maxSteps = 4

const ForgotPassword = () => {
  const navigate = useNavigate()
  const setNewPassword = useSetPassword()

  const [mnemonic, setMnemonic] = useState('')
  const [processStep, setProcessStep] = useState(1)
  const [walletAccounts, setWalletAccounts] = useState<{ address: string; index: number }[]>([])
  const [selectedIds, setSelectedIds] = useState<{ [k: number]: boolean }>({})
  const [loading, setLoading] = useState(false)

  const importWalletAccounts = Wallet.useImportMultipleWalletAccounts()
  const { removeAll } = Wallet.useRemoveWallet()

  const fetchWalletAccounts = useCallback(async (mnemonic: string) => {
    const correctedMnemonic = correctMnemonic(mnemonic)
    const fetchChainInfosOf = isCompassWallet() ? 'seiTestnet2' : 'cosmos'

    const walletAccounts = await KeyChain.getWalletsFromMnemonic(
      correctedMnemonic,
      5,
      ChainInfos[fetchChainInfosOf].bip44.coinType,
      ChainInfos[fetchChainInfosOf].key,
    )
    setWalletAccounts(walletAccounts)
  }, [])

  /**
   * @description Increment the process step
   * @returns null
   */
  const incrementStep = useCallback(() => {
    if (processStep + 1 <= maxSteps) {
      setProcessStep(processStep + 1)
    } else {
      navigate('/onboardingSuccess')
    }
  }, [navigate, processStep])

  /**
   * @description Increment the process step
   * @returns null
   */
  const decrementStep = useCallback(() => {
    if (processStep <= maxSteps && processStep - 1 > 0) {
      setProcessStep(processStep - 1)
    } else {
      navigate('/')
    }
  }, [navigate, processStep])

  /**
   * @description Final step that resets the password of the wallet
   * @returns null
   */
  const onSubmit = useCallback(
    async (password: string) => {
      setLoading(true)
      setNewPassword(password)
      await removeAll()
      if (mnemonic && password) {
        await importWalletAccounts({
          mnemonic,
          password,
          selectedAddressIndexes: Object.entries(selectedIds)
            .filter(([, selected]) => selected)
            .map(([addressIndex]) => parseInt(addressIndex)),
          type: 'import',
        })
        incrementStep()
      }
      setLoading(false)
    },
    [importWalletAccounts, incrementStep, mnemonic, removeAll, selectedIds, setNewPassword],
  )

  useEffect(() => {
    if (processStep === 3) {
      fetchWalletAccounts(mnemonic).catch((e) => DEBUG('Fetching Wallet Accounts', e.message))
    }
  }, [fetchWalletAccounts, mnemonic, processStep])

  return (
    <ExtensionPage
      titleComponent={
        <div className='flex flex-row w-[836px] items-center justify-between align-'>
          <Buttons.Back isFilled={true} onClick={decrementStep} />
          <ProgressBar
            color={Colors.cosmosPrimary}
            currentStep={processStep}
            totalSteps={maxSteps}
          />
          <div />
        </div>
      }
    >
      <div className='absolute top-0 flex h-full w-1/2 z-5 justify-center'>
        {processStep === 1 && (
          <div className='self-center'>
            <Disclaimer incrementStep={incrementStep} />
          </div>
        )}
        {processStep === 2 && (
          <div className='self-center'>
            <RequireSeedPhrase incrementStep={incrementStep} setMnemonicAtRoot={setMnemonic} />
          </div>
        )}
        {processStep === 3 && (
          <div className='mt-32'>
            <SelectWallets
              accountsData={walletAccounts}
              onProceed={incrementStep}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          </div>
        )}
        {processStep === 4 && (
          <div className='self-center'>
            <SetPassword resetPassword={onSubmit} loading={loading} />
          </div>
        )}
      </div>
    </ExtensionPage>
  )
}

export default ForgotPassword
