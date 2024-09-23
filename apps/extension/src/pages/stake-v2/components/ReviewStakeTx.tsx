import {
  formatTokenAmount,
  sliceWord,
  STAKE_MODE,
  Token,
  useformatCurrency,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Provider, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Card } from '@leapwallet/leap-ui'
import { Info } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import Text from 'components/text'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import React, { useMemo } from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'

type ReviewStakeTxProps = {
  isVisible: boolean
  isLoading: boolean
  onClose: () => void
  onSubmit: () => void
  tokenAmount: string
  token?: Token
  error: string | undefined
  gasError: string | null
  validator?: Validator
  provider?: Provider
  mode: STAKE_MODE
  unstakingPeriod: string
  showLedgerPopup: boolean
  ledgerError: string | undefined
}

export const getButtonTitle = (mode: STAKE_MODE, isProvider = false) => {
  switch (mode) {
    case 'DELEGATE':
      return 'Stake'
    case 'UNDELEGATE':
      return 'Unstake'
    case 'CANCEL_UNDELEGATION':
      return 'Cancel Unstake'
    case 'CLAIM_REWARDS':
      return 'Claiming'
    case 'REDELEGATE':
      return `Switching ${isProvider ? 'Provider' : 'Validator'}`
  }
}

export default function ReviewStakeTx({
  isVisible,
  onClose,
  onSubmit,
  tokenAmount,
  token,
  validator,
  isLoading,
  error,
  mode,
  unstakingPeriod,
  gasError,
  showLedgerPopup,
  provider,
  ledgerError,
}: ReviewStakeTxProps) {
  const [formatCurrency] = useformatCurrency()
  const { data: imageUrl } = useValidatorImage(validator)

  const currentAmount = useMemo(() => {
    if (new BigNumber(token?.usdPrice ?? '').gt(0)) {
      return formatCurrency(new BigNumber(tokenAmount).times(token?.usdPrice ?? ''))
    }
    return ''
  }, [formatCurrency, token?.usdPrice, tokenAmount])

  return (
    <>
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        closeOnBackdropClick={true}
        title='Review Transaction'
        className='p-6'
      >
        <div className='flex flex-col gap-y-6'>
          <div className='flex flex-col gap-y-6 items-center'>
            {mode === 'REDELEGATE' && validator && (
              <div className='flex items-start gap-x-3 p-4 rounded-2xl bg-blue-200 dark:bg-blue-900'>
                <Info size={20} className='text-blue-500 dark:text-blue-300' />
                <Text size='xs' color='text-black-100 dark:text-white-100'>
                  Redelegating to a new validator takes {unstakingPeriod} as funds unbond from the
                  source validator, then moved to the new one.
                </Text>
              </div>
            )}
            <div className='flex flex-col gap-y-4'>
              <Card
                className='bg-white-100 dark:bg-gray-950'
                avatar={
                  <img
                    src={token?.img}
                    onError={imgOnError(GenericLight)}
                    width={36}
                    height={36}
                    className='border rounded-full dark:border-[#333333] border-[#cccccc]'
                  />
                }
                isRounded
                size='md'
                title={
                  <Text
                    size='sm'
                    color='text-black-100 dark:text-white-100'
                    className='font-bold mb-0.5'
                  >
                    {`${formatTokenAmount(tokenAmount)} ${token?.symbol}`}
                  </Text>
                }
                subtitle={
                  <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                    {currentAmount}
                  </Text>
                }
              />
              {validator && (
                <Card
                  className='bg-white-100 dark:bg-gray-950'
                  avatar={
                    <img
                      src={imageUrl ?? validator?.image ?? Images.Misc.Validator}
                      onError={imgOnError(GenericLight)}
                      width={36}
                      height={36}
                      className='border rounded-full dark:border-[#333333] border-[#cccccc]'
                    />
                  }
                  isRounded
                  size='md'
                  title={
                    <Text
                      size='sm'
                      color='text-black-100 dark:text-white-100'
                      className='font-bold mb-0.5'
                    >
                      {sliceWord(
                        validator?.moniker,
                        isSidePanel()
                          ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                          : 10,
                        2,
                      )}
                    </Text>
                  }
                  subtitle={
                    <Text
                      size='xs'
                      color='dark:text-gray-400 text-gray-600'
                      className='font-medium'
                    >
                      Validator
                    </Text>
                  }
                />
              )}
              {provider && (
                <Card
                  className='bg-white-100 dark:bg-gray-950'
                  avatar={
                    <img
                      src={Images.Misc.Validator}
                      onError={imgOnError(GenericLight)}
                      width={36}
                      height={36}
                      className='border rounded-full dark:border-[#333333] border-[#cccccc]'
                    />
                  }
                  isRounded
                  size='md'
                  title={
                    <Text
                      size='sm'
                      color='text-black-100 dark:text-white-100'
                      className='font-bold mb-0.5'
                    >
                      {sliceWord(
                        provider.moniker,
                        isSidePanel()
                          ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                          : 10,
                        3,
                      )}
                    </Text>
                  }
                  subtitle={
                    <Text
                      size='xs'
                      color='dark:text-gray-400 text-gray-600'
                      className='font-medium'
                    >
                      Provider
                    </Text>
                  }
                />
              )}
            </div>
          </div>
          <div className='flex flex-col items-center w-full gap-y-2'>
            {ledgerError && <p className='text-sm font-bold text-red-300 px-2'>{ledgerError}</p>}
            {error && <p className='text-sm font-bold text-red-300 px-2'>{error}</p>}
            {gasError && <p className='text-sm font-bold text-red-300 px-2'>{gasError}</p>}
            <Buttons.Generic
              className='w-full'
              disabled={isLoading || !!error || !!gasError}
              size='normal'
              color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
              onClick={onSubmit}
            >
              {isLoading ? (
                <Lottie
                  loop={true}
                  autoplay={true}
                  animationData={loadingImage}
                  rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice',
                  }}
                  className={'h-[28px] w-[28px]'}
                />
              ) : (
                `Confirm ${getButtonTitle(mode, !!provider)}`
              )}
            </Buttons.Generic>
          </div>
        </div>
      </BottomModal>
      {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
    </>
  )
}
