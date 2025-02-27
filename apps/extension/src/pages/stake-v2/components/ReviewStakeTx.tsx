import {
  formatPercentAmount,
  formatTokenAmount,
  sliceWord,
  STAKE_MODE,
  Token,
  useformatCurrency,
  useProviderApr,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Provider, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Buttons, Card } from '@leapwallet/leap-ui'
import { Info } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import Text from 'components/text'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'

import ProviderTooltip from '../restaking/ProviderTooltip'

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

const ProviderInfo = observer(
  ({ provider, rootDenomsStore }: { provider: Provider; rootDenomsStore: RootDenomsStore }) => {
    const [showTooltip, setShowTooltip] = useState(false)
    const { apr } = useProviderApr(provider.provider, rootDenomsStore.allDenoms)

    const handleMouseEnter = useCallback(() => {
      setShowTooltip(true)
    }, [])
    const handleMouseLeave = useCallback(() => {
      setShowTooltip(false)
    }, [])
    return (
      <div className='relative'>
        <div className='flex justify-between items-center px-4 cursor-pointer w-[344px] h-[72px] rounded-[16px] bg-white-100 dark:bg-gray-950'>
          <div className='flex items-center flex-grow'>
            <img
              src={Images.Misc.Validator}
              onError={imgOnError(GenericLight)}
              width={36}
              height={36}
              className='border rounded-full dark:border-[#333333] border-[#cccccc] mr-3'
            />
            <div className='flex flex-col justify-center items-start w-full'>
              <div className='flex justify-between w-full'>
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
                <div className='relative'>
                  <Info
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    size={18}
                    className='text-gray-400 dark:text-gray-600'
                  />
                  {showTooltip && (
                    <ProviderTooltip
                      provider={provider}
                      handleMouseEnter={handleMouseEnter}
                      handleMouseLeave={handleMouseLeave}
                      positionClassName='bottom-full -right-2 py-3'
                    />
                  )}
                </div>
              </div>
              <div className='flex justify-between w-full'>
                <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                  Provider
                </Text>
                {parseFloat(apr ?? '0') > 0 && (
                  <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                    Estimated APR&nbsp;
                    <span className='font-bold'>{formatPercentAmount(apr ?? '', 1)}</span>%
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

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
                <Info size={20} className='text-black-100 dark:text-white-100 shrink-0' />
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
                  <TokenImageWithFallback
                    assetImg={token?.img}
                    text={token?.symbol ?? ''}
                    altText={token?.symbol ?? ''}
                    imageClassName='w-9 h-9 rounded-full'
                    containerClassName='w-9 h-9 bg-gray-100 dark:bg-gray-850'
                    textClassName='text-[10px] !leading-[14px]'
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
              {provider && <ProviderInfo provider={provider} rootDenomsStore={rootDenomsStore} />}
            </div>
          </div>
          <div className='flex flex-col items-center w-full gap-y-2'>
            {ledgerError && <p className='text-sm font-bold text-red-300 px-2'>{ledgerError}</p>}
            {error && <p className='text-sm font-bold text-red-300 px-2'>{error}</p>}
            {gasError && <p className='text-sm font-bold text-red-300 px-2'>{gasError}</p>}
            <Buttons.Generic
              className='w-full'
              disabled={isLoading || (!!error && !ledgerError) || !!gasError}
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
