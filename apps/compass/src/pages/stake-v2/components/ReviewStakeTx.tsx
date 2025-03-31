import {
  formatTokenAmount,
  sliceWord,
  STAKE_MODE,
  Token,
  useformatCurrency,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Info } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { Button } from 'components/ui/button'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { useMemo } from 'react'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { sidePanel } from 'utils/isSidePanel'

import { stakeButtonTitleMap, transitionTitleMap } from '../utils/stake-text'

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
  showLedgerPopup: boolean
  ledgerError: string | undefined
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
  gasError,
  showLedgerPopup,
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

  const anyError = ledgerError || error || gasError

  return (
    <>
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title={<span className=''>{transitionTitleMap[mode || 'DELEGATE']}</span>}
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
                imgSrc={imageUrl ?? validator?.image ?? Images.Misc.Validator}
                className={mode === 'REDELEGATE' ? '!rounded-b-none' : ''}
              />
              {mode === 'REDELEGATE' && (
                <div className='flex items-start gap-1.5 px-3 py-2.5 rounded-b-xl text-accent-blue bg-accent-blue-800'>
                  <Info size={16} className='shrink-0' />
                  <span className='text-xs font-medium'>
                    Sei enforces a 21-day wait period between redelegations. Once you have
                    redelegated from one validator to another, you must wait for 21 days before
                    redelegating again further.
                  </span>
                </div>
              )}
            </div>
          )}

          {anyError && <p className='text-xs font-bold text-destructive-100 px-2'>{anyError}</p>}

          <Button
            className='w-full mt-4'
            disabled={isLoading || (!!error && !ledgerError) || !!gasError}
            onClick={onSubmit}
          >
            Confirm {stakeButtonTitleMap[mode]}
          </Button>
        </div>
      </BottomModal>
      {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
    </>
  )
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
