import { isEthAddress, isValidWalletAddress } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Input, ProgressBar, TextArea } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import ChoosePasswordView from 'components/choose-password-view'
import CssLoader from 'components/css-loader/CssLoader'
import ExtensionPage from 'components/extension-page'
import Text from 'components/text'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordStore } from 'stores/password-store'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import browser from 'webextension-polyfill'

type WatchAddressViewProps = {
  address: string
  setAddress: (value: string) => void
  onImportWallet: () => void
  walletName: string
  setWalletName: (value: string) => void
}

const WatchAddressView = ({
  address,
  setAddress,
  onImportWallet,
  walletName,
  setWalletName,
}: WatchAddressViewProps) => {
  const [error, setError] = useState('')

  const onChangeHandler = (value: string) => {
    setError('')
    setAddress(value)
  }

  useEffect(() => {
    if (!address) {
      setError('')
      return
    }
    if (!isValidWalletAddress(address)) {
      setError('Invalid public address, please enter a valid address')
      return
    }
    if (isCompassWallet() && !address.startsWith('sei') && !isEthAddress(address)) {
      setError('Invalid public address, please enter a valid address')
      return
    }
    setError('')
  }, [address])

  return (
    <div className='flex flex-row overflow-scroll gap-x-[20px] mt-16'>
      <div className='flex flex-col w-[408px] px-4 gap-y-8'>
        <div className='flex flex-col gap-y-4'>
          <img src={Images.Misc.GreenEye} className='!w-9 !h-9' />
          <div className='flex flex-col gap-y-1'>
            <Text size='xxl' className='font-black !leading-10'>
              Watch wallet
            </Text>
            <Text size='md' color='text-gray-600 dark:text-gray-400' className='font-medium'>
              Add a wallet address you’d like to watch. You’ll have view-only access to assets &
              balances.
            </Text>
          </div>
        </div>

        <div className='flex flex-col gap-y-5'>
          <TextArea
            autoFocus
            onChange={(event) => onChangeHandler(event.target.value)}
            value={address}
            isErrorHighlighted={!!error}
            placeholder='Public address'
            data-testing-id='enter-watch-address'
            className={classNames(
              'dark:bg-gray-900 bg-gray-50 outline-none h-[120px] px-4 py-3 rounded-lg dark:text-white-100 text-black-100 border-2',
              {
                'border-red-300 focus:border-red-300': !!error,
                'border-transparent focus:border-gray-400': !error,
              },
            )}
          />

          {error && (
            <Text size='sm' color='text-red-300'>
              {error}
            </Text>
          )}

          <div className='flex relative justify-center shrink w-full'>
            <Input
              placeholder='Name your wallet (optional)'
              maxLength={24}
              value={walletName.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
              onChange={(e) => setWalletName(e.target.value)}
              className={
                'border-2 border-gray-50 dark:border-gray-900  placeholder:text-gray-400 placeholder:dark:text-gray-700 bg-gray-50 dark:bg-gray-900 text-black-100 dark:text-gray-100 p-4 rounded-lg w-full font-medium text-md'
              }
            />
            {walletName.length > 0 ? (
              <div className='absolute right-[16px] top-[14px] text-gray-400 text-sm font-medium'>{`${walletName.length}/24`}</div>
            ) : null}
          </div>
        </div>

        <Buttons.Generic
          disabled={!!error || !address}
          color={Colors.cosmosPrimary}
          onClick={onImportWallet}
          data-testing-id='btn-import-wallet'
        >
          Start watching
        </Buttons.Generic>
      </div>
      <div>
        <div className='flex shrink flex-col gap-y-8 w-[408px] p-[32px] rounded-2xl border border-gray-300 dark:border-gray-800'>
          <div className='flex flex-col gap-y-1'>
            <Text size='md' className='font-bold text-gray-600 dark:text-gray-200'>
              What chains are currently supported for watching?
            </Text>
            <Text size='sm' color='text-gray-600 dark:text-gray-400' className='font-medium'>
              We support watching chains from the Cosmos and EVM ecosystems along with support for
              Bitcoin addresses
            </Text>
          </div>
          <div className='flex flex-col gap-y-1'>
            <Text size='md' className='font-bold text-gray-600 dark:text-gray-200'>
              Can I import my wallet later?
            </Text>
            <Text size='sm' color='text-gray-600 dark:text-gray-400' className='font-medium'>
              Yes. You can import your wallet via private key or seed phrase at any point you like
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

const OnboardingWatchAddress = () => {
  const password = passwordStore.password
  const saveWatchWallet = Wallet.useSaveWatchWallet()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [walletName, setWalletName] = useState('')

  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const totalSteps = 3

  const backToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      navigate(-1)
    }
  }

  const handleImportWallet = async (password: Uint8Array) => {
    if (address) {
      try {
        await saveWatchWallet(address, walletName, password)
        setAddress('')
      } catch (error: any) {
        //
      }
    }
  }

  const onOnboardingCompleted = async (password: Uint8Array) => {
    const passwordBuffer = Buffer.from(password)
    const passwordBase64 = passwordBuffer.toString('base64')
    await browser.runtime.sendMessage({ type: 'unlock', data: { password: passwordBase64 } })
    await handleImportWallet(passwordBuffer)
    navigate('/onboardingSuccess')
  }

  const onImportWallet = () => {
    if (!password) {
      setCurrentStep(currentStep + 1)
    } else {
      onOnboardingCompleted(password)
    }
  }

  if (loading) {
    return (
      <ExtensionPage
        titleComponent={
          <div className='flex flex-row w-[836px] items-center justify-between align-'>
            <Buttons.Back isFilled={true} onClick={backToPreviousStep} />
            <ProgressBar
              color={Colors.cosmosPrimary}
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
            <div />
          </div>
        }
      >
        <div className='mt-72'>
          <CssLoader />
        </div>
      </ExtensionPage>
    )
  }

  return (
    <ExtensionPage
      titleComponent={
        <div className='flex flex-row w-[836px] items-center justify-between align-'>
          <Buttons.Back isFilled={true} onClick={backToPreviousStep} />
          <ProgressBar
            color={Colors.cosmosPrimary}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
          <div />
        </div>
      }
    >
      {currentStep === 1 && (
        <WatchAddressView
          address={address}
          setAddress={setAddress}
          walletName={walletName}
          setWalletName={setWalletName}
          onImportWallet={onImportWallet}
        />
      )}
      {currentStep === 2 && !password && <ChoosePasswordView onProceed={onOnboardingCompleted} />}
    </ExtensionPage>
  )
}

export default OnboardingWatchAddress
