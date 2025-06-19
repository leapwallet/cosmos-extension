import {
  formatTokenAmount,
  sliceWord,
  STAKE_MODE,
  Token,
  useformatCurrency,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Provider, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Info } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import React, { useMemo } from 'react'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { sidePanel } from 'utils/isSidePanel'

import { transitionTitleMap } from '../utils/stake-text'

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

const ValidatorCard = (props: {
  title: string
  subTitle: string
  imgSrc?: string
  className?: string
}) => {
  return (
    <div
      className={cn(
        'flex justify-between items-center p-6 rounded-xl bg-secondary-100 w-full',
        props.className,
      )}
    >
      <div className='flex flex-col gap-1'>
        <span className='font-bold text-lg'>{props.title}</span>
        <span className='text-sm text-muted-foreground'>{props.subTitle}</span>
      </div>

      <img
        width={48}
        height={48}
        src={props.imgSrc}
        onError={imgOnError(GenericLight)}
        className='border rounded-full bg-secondary-50'
      />
    </div>
  )
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
  const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator)
  const imageUrl = validator?.image || validatorImage || Images.Misc.Validator

  const currentAmount = useMemo(() => {
    if (new BigNumber(token?.usdPrice ?? '').gt(0)) {
      return formatCurrency(new BigNumber(tokenAmount).times(token?.usdPrice ?? ''))
    }
    return ''
  }, [formatCurrency, token?.usdPrice, tokenAmount])

  const anyError = ledgerError || error || gasError

  return (
    <>
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title={
          <span className=''>
            {mode === 'REDELEGATE' && provider
              ? 'Review provider switching'
              : transitionTitleMap[mode || 'DELEGATE']}
          </span>
        }
        className='p-6 pt-8'
      >
        <div className='flex flex-col gap-4 items-center'>
          <ValidatorCard
            title={`${formatTokenAmount(tokenAmount)} ${token?.symbol}`}
            subTitle={currentAmount}
            imgSrc={token?.img}
          />
          {validator && (
            <div className='w-full'>
              <ValidatorCard
                title={sliceWord(
                  validator?.moniker,
                  sidePanel
                    ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                    : 10,
                  2,
                )}
                subTitle={'Validator'}
                imgSrc={imageUrl}
                className={mode === 'REDELEGATE' ? '!rounded-b-none' : ''}
              />
              {mode === 'REDELEGATE' && validator && (
                <div className='flex items-start gap-1.5 px-3 py-2.5 rounded-b-xl text-blue-400 bg-blue-400/10'>
                  <Info size={16} className='shrink-0' />
                  <span className='text-xs font-medium'>
                    Redelegating to a new validator takes {unstakingPeriod} as funds unbond from the
                    source validator, then moved to the new one.
                  </span>
                </div>
              )}
            </div>
          )}
          {provider && (
            <ValidatorCard
              title={sliceWord(
                provider.moniker,
                sidePanel
                  ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 10,
                2,
              )}
              subTitle={'Provider'}
              imgSrc={Images.Misc.Validator}
            />
          )}
          {anyError && <p className='text-xs font-bold text-destructive-100 px-2'>{anyError}</p>}

          <Button
            className='w-full mt-4'
            disabled={isLoading || (!!error && !ledgerError) || !!gasError}
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
                className={'h-[24px] w-[24px]'}
              />
            ) : (
              `Confirm ${getButtonTitle(mode, !!provider)}`
            )}
          </Button>
        </div>
      </BottomModal>
      {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
    </>
  )
}
