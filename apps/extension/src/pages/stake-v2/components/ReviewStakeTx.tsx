import {
  formatTokenAmount,
  sliceWord,
  STAKE_MODE,
  Token,
  useformatCurrency,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Card } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'

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
  mode: STAKE_MODE
  unstakingPeriod: string
  showLedgerPopup: boolean
}

export const buttonTitle = {
  DELEGATE: 'Stake',
  UNDELEGATE: 'Unstake',
  REDELEGATE: 'Switching Validator',
  CLAIM_REWARDS: 'Claiming',
  CANCEL_UNDELEGATION: 'Cancel Unstake',
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
}: ReviewStakeTxProps) {
  const [formatCurrency] = useformatCurrency()
  const { data: imageUrl } = useValidatorImage(validator)

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
            {mode === 'REDELEGATE' && (
              <div className='flex items-start gap-x-3 p-4 rounded-2xl bg-blue-200 dark:bg-blue-900'>
                <span className='material-icons-round text-blue-600 dark:text-blue-400 !text-lg'>
                  info
                </span>
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
                    {`${formatCurrency(new BigNumber(tokenAmount)?.times(token?.usdPrice ?? 1))}`}
                  </Text>
                }
              />
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
                    {sliceWord(validator?.moniker, 10, 2)}
                  </Text>
                }
                subtitle={
                  <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                    Validator
                  </Text>
                }
              />
            </div>
          </div>
          <div className='flex flex-col items-center w-full gap-y-2'>
            {error && <p className='text-sm font-bold text-red-300 px-2'>{error}</p>}
            {gasError && <p className='text-sm font-bold text-red-300 px-2'>{gasError}</p>}
            <Buttons.Generic
              className='w-full'
              disabled={isLoading || !!error || !!gasError}
              size='normal'
              color={Colors.green600}
              onClick={onSubmit}
            >
              {isLoading ? (
                <LoaderAnimation color={Colors.white100} />
              ) : (
                `Confirm ${buttonTitle[mode]}`
              )}
            </Buttons.Generic>
          </div>
        </div>
      </BottomModal>
      {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
    </>
  )
}
