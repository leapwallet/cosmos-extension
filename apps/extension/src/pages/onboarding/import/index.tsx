import { KeyChain } from '@leapwallet/leap-keychain'
import { Buttons, ProgressBar, TextArea } from '@leapwallet/leap-ui'
import * as secp256k1 from '@noble/secp256k1'
import classNames from 'classnames'
import ChoosePasswordView from 'components/choose-password-view'
import CssLoader from 'components/css-loader/CssLoader'
import ExtensionPage from 'components/extension-page'
import Loader, { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import WalletInfoCard from 'components/wallet-info-card'
import { AuthContextType, useAuth } from 'context/auth-context'
import { useOnboarding } from 'hooks/onboarding/useOnboarding'
import { usePassword } from 'hooks/settings/usePassword'
import useQuery from 'hooks/useQuery'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'
import correctMnemonic from 'utils/correct-mnemonic'
import { isCompassWallet } from 'utils/isCompassWallet'
import browser from 'webextension-polyfill'

import { IMPORT_WALLET_DATA } from '../constants'
import ImportLedgerView from './ImportLedgerView'

type SeedPhraseViewProps = {
  readonly walletName: string
  readonly onProceed: () => void
  secret: string
  setSecret: React.Dispatch<React.SetStateAction<string>>
  isPrivateKey: boolean
}

function SeedPhraseView({
  onProceed,
  walletName,
  secret,
  setSecret,
  isPrivateKey,
}: SeedPhraseViewProps) {
  const [error, setError] = useState('')

  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError('')
    setSecret(e.target.value)
  }

  /**
   * @description Function to validate the entered secret
   * @returns boolean - true/false
   */
  const validateSeedPhrase = () => {
    setError('')

    const correctedSecret = correctMnemonic(secret)

    if (isPrivateKey) {
      try {
        const privateKey = correctedSecret.toLowerCase().startsWith('0x')
          ? correctedSecret.slice(2)
          : correctedSecret
        if (!secp256k1.utils.isValidPrivateKey(privateKey)) {
          throw new Error('Invalid private key.')
        }
      } catch (error) {
        setError('Invalid private key.')
        return false
      }
    } else if (!SeedPhrase.validateSeedPhrase(correctedSecret)) {
      setError('Invalid secret recovery phrase.')
      return false
    }

    setSecret(correctedSecret)
    return true
  }

  const isCosmostation = walletName === 'Cosmostation'

  return (
    <div className='flex flex-row overflow-scroll gap-x-[20px]'>
      <div className='flex flex-col w-[408px]'>
        <img
          src={
            IMPORT_WALLET_DATA[isPrivateKey ? 'PrivateKey' : walletName]?.imgSrc ??
            Images.Misc.WalletIcon
          }
          width='36'
          height='36'
        />
        <Text size='xxl' className='font-black mt-4'>
          Import {isPrivateKey ? 'via Private Key' : walletName} {!walletName && 'via Seed Phrase'}
        </Text>
        <Text size='md' color='text-gray-600 dark:text-gray-400' className='font-medium mb-[32px]'>
          {isPrivateKey ? (
            <>
              To import an existing wallet, please enter the
              <br /> private key here:
            </>
          ) : (
            <>
              To import an existing {walletName} wallet, please enter the
              <br /> recovery seed phrase here:
            </>
          )}
        </Text>
        <TextArea
          autoFocus
          onChange={onChangeHandler}
          value={secret}
          isErrorHighlighted={!!error}
          placeholder={
            isPrivateKey
              ? 'Enter or Paste your private key'
              : 'Enter or Paste your recovery / seed phrase'
          }
          data-testing-id='enter-phrase'
        />
        {error && (
          <Text size='sm' color='text-red-300 mt-[16px]' data-testing-id='error-text-ele'>
            {' '}
            {error}
          </Text>
        )}
        <div className='w-[376px] h-auto rounded-xl dark:bg-gray-900 bg-white-100 flex items-center px-5 py-3 my-7'>
          <img className='mr-[16px]' src={Images.Misc.Warning} width='40' height='40' />
          <div className='flex flex-col gap-y-[2px]'>
            <Text size='sm' color='text-gray-400 font-medium'>
              Recommended security practice:
            </Text>
            <Text size='sm' color='text-white-100 font-bold'>
              {`It is always safer to type the ${
                isPrivateKey ? 'private key' : 'seed phrase'
              } rather than pasting it.`}
            </Text>
          </div>
        </div>
        <Buttons.Generic
          disabled={!!error || !secret}
          color={Colors.cosmosPrimary}
          onClick={() => {
            if (validateSeedPhrase()) onProceed()
          }}
          data-testing-id='btn-import-wallet'
        >
          Import Wallet
        </Buttons.Generic>
      </div>
      <div>
        <div className='shrink flex-col gap-y-[4px] w-[408px] p-[32px] rounded-lg border-[1px] border-gray-800'>
          <Text size='md' className='font-bold' color='text-gray-600 dark:text-gray-200'>
            {`What is a ${isPrivateKey ? 'private key' : 'recovery phrase'}?`}
          </Text>
          <Text size='sm' color='text-gray-600 font-medium dark:text-gray-400 mb-[32px] mt-1'>
            {`${
              isPrivateKey
                ? 'A private key is like a password — a string of letters and numbers — '
                : 'Recovery phrase is a 12 or 24-word phrase'
            } that can be used to restore your wallet.`}
          </Text>

          {walletName && !isPrivateKey && (
            <>
              <Text size='lg' className='font-medium text-gray-600 dark:text-gray-200'>
                {' '}
                Where can I find my phrase?
              </Text>
              <Text size='md' color=' text-gray-600 dark:text-gray-400 mb-[32px]'>
                <ol>
                  <li>
                    1. Open <strong> {walletName} extension </strong>{' '}
                  </li>
                  {walletName === 'Leap' ? (
                    <>
                      <li>
                        2. On top left, click on the <strong> Hamburger icon </strong>{' '}
                      </li>
                      <li>
                        3. Select show secret phrase and enter your password and{' '}
                        <strong> view mnemonic seed </strong>{' '}
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        2. On top {isCosmostation ? 'left' : 'right'}, click on the{' '}
                        <strong> Profile icon </strong>{' '}
                      </li>
                      <li>
                        3. Select {isCosmostation ? 'account settings' : 'wallet'} and click on the
                        3 dots and <strong> view mnemonic seed </strong>{' '}
                      </li>
                    </>
                  )}
                  <li>4. Copy and paste the mnemonic/seed phrase to the field on the left. </li>
                </ol>
              </Text>
            </>
          )}

          <Text size='md' className='font-bold text-gray-600 dark:text-gray-200 mt-1'>
            {' '}
            Is it safe to enter it into {isCompassWallet() ? 'Compass' : 'Leap'}?
          </Text>
          <Text size='sm' color='font-medium text-gray-600 dark:text-gray-400'>
            {' '}
            Yes. It will be stored locally and never leave your device without your explicit
            permission.
          </Text>
        </div>
      </div>
    </div>
  )
}

type SelectWalletViewProps = {
  readonly onProceed: () => void
  readonly accountsData: readonly { address: string; index: number }[]
  // eslint-disable-next-line no-unused-vars
  readonly setSelectedIds: (val: { [id: number]: boolean }) => void
  readonly selectedIds: { [id: string]: boolean }
}

function SelectWalletView({
  onProceed,
  accountsData,
  selectedIds,
  setSelectedIds,
}: SelectWalletViewProps) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [existingAddresses, setExistingAddresses] = useState<string[]>([])
  const [viewMore, setViewMore] = useState(false)

  const toggleViewMore = () => setViewMore((v) => !v)

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets()
      const addresses = []

      for (const wallet of Object.values(allWallets ?? {})) {
        const address = isCompassWallet() ? wallet.addresses.seiTestnet2 : wallet.addresses.cosmos
        addresses.push(address)
      }
      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  const validate = () => {
    setError('')
    if (!Object.values(selectedIds).some((val) => val)) {
      setError('Please select at least one wallet')
      return false
    }
    return true
  }

  const handleProceedClick = () => {
    setIsLoading(true)
    if (validate()) onProceed()
  }

  const walletCards = useMemo(() => {
    return accountsData.map(({ address, index: id }) => {
      const isExistingAddress = existingAddresses.indexOf(address) > -1
      const isChosen = selectedIds[id]

      return (
        <WalletInfoCard
          data-testing-id={id === 0 ? 'wallet-1' : ''}
          key={id}
          id={id}
          hidden={viewMore ? false : id >= 2}
          cosmosAddress={address}
          isChosen={isChosen}
          isExistingAddress={isExistingAddress}
          onClick={() => {
            if (!isExistingAddress) {
              const copy = selectedIds
              if (!isChosen) {
                setSelectedIds({ ...copy, [id]: true })
              } else {
                setSelectedIds({ ...copy, [id]: false })
              }
            }
          }}
        />
      )
    })
  }, [accountsData, existingAddresses, selectedIds, setSelectedIds, viewMore])

  return (
    <div className='flex flex-row gap-x-[20px]'>
      <div className='flex flex-col w-[408px]'>
        <div className='flex flex-row gap-x-[12px]'>
          <img src={Images.Misc.WalletIconWhite} />
          <Text size='xxl' className='font-medium'>
            Select wallets
          </Text>
        </div>
        <Text size='lg' color='text-gray-600 dark:text-gray-400' className='font-light mb-[32px]'>
          If you have used multiple accounts in your wallet, you can choose to import them here.
        </Text>
        <div className='flex flex-col space-y-4'>{walletCards}</div>
        <div className='mt-4'>
          {viewMore ? (
            <button
              title='Show Less'
              className={classNames(
                'outline-none pr-2 rounded font-bold focus:ring-1 flex items-center justify-around space-x-2',
                {
                  'focus:ring-mainChainTheme-400': !isCompassWallet(),
                  'text-mainChainTheme-400': !isCompassWallet(),
                  'focus:ring-compassChainTheme-400': isCompassWallet(),
                  'text-compassChainTheme-400': isCompassWallet(),
                },
              )}
              onClick={toggleViewMore}
            >
              <span className='material-icons-round'>expand_less</span>
              <span>Show Less Wallets</span>
            </button>
          ) : (
            <button
              title='Show More'
              className={classNames(
                'outline-none pr-2 rounded font-bold focus:ring-1 flex items-center justify-around space-x-2',
                {
                  'focus:ring-mainChainTheme-400': !isCompassWallet(),
                  'text-mainChainTheme-400': !isCompassWallet(),
                  'focus:ring-compassChainTheme-400': isCompassWallet(),
                  'text-compassChainTheme-400': isCompassWallet(),
                },
              )}
              onClick={toggleViewMore}
            >
              <span className='material-icons-round'>expand_more</span>
              <span>Show More Wallets</span>
            </button>
          )}
        </div>
        {error && (
          <Text size='sm' color='text-red-300 mt-[16px]'>
            {' '}
            {error}
          </Text>
        )}
        <div className='pt-[32px]'></div>

        {isLoading ? (
          <Buttons.Generic color={Colors.cosmosPrimary} type='button' className='flex items-center'>
            <CssLoader />
          </Buttons.Generic>
        ) : (
          <Buttons.Generic
            disabled={isLoading || Object.values(selectedIds).filter((val) => val).length === 0}
            color={Colors.cosmosPrimary}
            onClick={handleProceedClick}
            data-testing-id='btn-select-wallet-proceed'
          >
            Proceed
          </Buttons.Generic>
        )}
      </div>
      <div>
        <div className='shrink flex-col gap-y-[4px] w-[408px] p-[32px] rounded-lg border-[1px] dark:border-gray-800 border-gray-200'>
          <Text size='lg' className='font-medium text-gray-600 dark:text-gray-200'>
            {' '}
            Which wallets are displayed here?
          </Text>
          <Text size='md' color='text-gray-600 dark:text-gray-400 mb-[32px]'>
            {' '}
            Only wallets with transactions are imported.
          </Text>

          <Text size='lg' className='font-medium text-gray-600 dark:text-gray-200'>
            {' '}
            Can I edit wallet details?
          </Text>
          <Text size='md' color='text-gray-600 dark:text-gray-400'>
            You can rename, add or remove wallets at any time.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingImportWallet() {
  const walletName = useQuery().get('walletName') ?? undefined
  const isLedger = walletName === 'hardwarewallet'
  const isPrivateKey = walletName?.toLowerCase().includes('private')
  const { noAccount } = useAuth() as AuthContextType

  const [secret, setSecret] = useState('')
  const [selectedIds, setSelectedIds] = useState<{ [id: number]: boolean }>({})
  const [error, setError] = useState('')
  const savedPassword = usePassword()
  const [loading, setLoading] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const totalSteps = 4
  const {
    walletAccounts,
    getAccountDetails,
    getLedgerAccountDetails,
    onOnboardingComplete,
    onBoardingCompleteLedger,
  } = useOnboarding()

  const onOnboardingCompleted = async (password: string) => {
    try {
      setLoading(true)
      if (isLedger) {
        await onBoardingCompleteLedger(
          password,
          Object.entries(selectedIds)
            .filter(([, selected]) => selected)
            .map(
              ([id]) => walletAccounts?.find((w) => w.index.toString() === id)?.address,
            ) as string[],
        )
      } else {
        const onBoardingSelectedIds = isPrivateKey ? { 0: true } : selectedIds
        await onOnboardingComplete(secret, password, onBoardingSelectedIds, 'import')
      }

      // eslint-disable-next-line no-use-before-define
      if (!savedPassword) {
        await moveToNextStep()
      }
      if (password) {
        browser.runtime.sendMessage({ type: 'unlock', data: { password } })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message.trim() === 'Wallet already present') {
        throw error
      }
    } finally {
      setLoading(false)
    }
  }

  const moveToNextStep = async () => {
    if (currentStep + 1 === totalSteps) navigate('/onboardingSuccess')
    if (currentStep === 1 && isPrivateKey && savedPassword) {
      await onOnboardingCompleted(savedPassword as string)
      navigate('/onboardingSuccess')
      return
    }
    if (currentStep + 1 === 2 && isPrivateKey && !savedPassword) {
      setCurrentStep(currentStep + 2)
    } else if (currentStep === 2 && !noAccount) {
      try {
        await onOnboardingCompleted(savedPassword as string)
      } catch (_) {
        //
      }
      navigate('/onboardingSuccess')
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const backToPreviousStep = () => {
    if (currentStep === 3 && isPrivateKey) setCurrentStep(currentStep - 2)
    else if (currentStep > 1) setCurrentStep(currentStep - 1)
    else {
      navigate(-1)
    }
  }

  const importWalletFromSeedPhrase = async () => {
    if (isPrivateKey) {
      moveToNextStep()
    } else {
      const correctedSecret = correctMnemonic(secret)

      getAccountDetails(correctedSecret).then(moveToNextStep)
    }
  }

  const importLedger = () => {
    if (isLedger) {
      setError('')
      getLedgerAccountDetails()
        .then(moveToNextStep)
        .catch((e) => {
          setError(e.message)
        })
    }
  }

  useEffect(() => {
    importLedger()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      {currentStep === 1 && !isLedger && (
        <SeedPhraseView
          secret={secret}
          setSecret={setSecret}
          walletName={walletName as string}
          onProceed={importWalletFromSeedPhrase}
          isPrivateKey={isPrivateKey as boolean}
        />
      )}
      {currentStep === 1 && isLedger && <ImportLedgerView retry={importLedger} error={error} />}
      {currentStep === 2 && (
        <SelectWalletView
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          accountsData={walletAccounts as { address: string; index: number }[]}
          onProceed={moveToNextStep}
        />
      )}
      {currentStep === 3 && !savedPassword && (
        <ChoosePasswordView onProceed={onOnboardingCompleted} />
      )}
    </ExtensionPage>
  )
}
