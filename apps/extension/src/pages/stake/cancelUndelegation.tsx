import {
  sliceWord,
  useChainInfo,
  useStakeTx,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import {
  UnbondingDelegation,
  UnbondingDelegationEntry,
} from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import {
  Avatar,
  Buttons,
  GenericCard,
  Header,
  HeaderActionType,
  LineDivider,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ErrorCard } from 'components/ErrorCard'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import ReadMoreText from 'components/read-more-text'
import Text from 'components/text'
import currency from 'currency.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { useCallback, useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { useTxCallBack } from 'utils/txCallback'

function ValidatorHeading({ validator }: { validator: Validator }) {
  const { data: imageUrl } = useValidatorImage(validator)

  return (
    <div className='flex flex-col pb-4 gap-2'>
      <div className='flex items-center gap-3'>
        <div className='h-9 w-9 rounded-full overflow-clip border border-gray-400 shrink flex items-center justify-center'>
          <Avatar
            size='sm'
            avatarImage={imageUrl ?? validator.image ?? Images.Misc.Validator}
            avatarOnError={imgOnError(Images.Misc.Validator)}
          />
        </div>
        <Text size='xxl' className='font-black'>
          {validator.moniker ?? validator.name}
        </Text>
      </div>
      <Text size='md' color='dark:text-gray-200 text-gray-800' className='font-bold'>
        {`Staked: ${currency(validator.delegations?.total_tokens_display as number, {
          precision: 2,
          symbol: '',
        }).format()} | Commission: ${
          currency((+(validator.commission?.commission_rates.rate ?? '') * 100).toString(), {
            precision: 0,
            symbol: '',
          }).format() + '%'
        }`}
      </Text>
    </div>
  )
}

function DepositAmountCard({
  totalDelegations,
  currencyAmountDelegation,
  validatorName,
  formatHideBalance,
}: {
  validatorName: string
  totalDelegations: string
  currencyAmountDelegation: string
  // eslint-disable-next-line no-unused-vars
  formatHideBalance: (s: string) => React.ReactNode
}) {
  if (!totalDelegations) return null

  return (
    <div className='dark:bg-gray-900 rounded-2xl bg-white-100 pt-4'>
      {totalDelegations && (
        <Text
          size='xs'
          color='dark:text-gray-200 text-gray-600'
          className='font-bold mb-3 py-1 px-4'
        >
          Your unstaking amount {`(${validatorName})`}
        </Text>
      )}
      {totalDelegations && (
        <div className='flex px-4 pb-4 justify-between items-center'>
          <div>
            <Text size='xl' className='text-[28px] mb-2 font-black'>
              {formatHideBalance(currencyAmountDelegation)}
            </Text>
            <Text size='xs' className='font-semibold'>
              {formatHideBalance(totalDelegations)}
            </Text>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailsView({
  validator,
  unBoundingdelegation,
  activeChain,
  simulationError,
  onClick,
}: {
  validator: Validator
  displayFeeText: string
  simulationError?: string
  unBoundingdelegation: UnbondingDelegationEntry
  activeChain: SupportedChain
  onClick: () => void
}) {
  const [formatter] = useFormatCurrency()
  const isDark = useTheme().theme === ThemeName.DARK
  const { formatHideBalance } = useHideAssets()

  return (
    <div>
      <ValidatorHeading validator={validator} />
      <div className='flex flex-col gap-y-4'>
        <DepositAmountCard
          formatHideBalance={formatHideBalance}
          currencyAmountDelegation={formatter(
            new BigNumber(unBoundingdelegation.currencyBalance ?? ''),
          )}
          totalDelegations={unBoundingdelegation.formattedBalance ?? ''}
          validatorName={sliceWord(validator.moniker ?? validator.name ?? '', 18, 3)}
        />
        <Buttons.Generic
          onClick={onClick}
          color={isDark ? Colors.gray900 : Colors.white100}
          size='normal'
          disabled={!!simulationError}
          className='w-[344px]'
        >
          <div className={'flex justify-center dark:text-white-100 text-black-100  items-center'}>
            <span className='mr-1 material-icons-round'>do_not_disturb_off</span>
            <span>Cancel Unstake</span>
          </div>
        </Buttons.Generic>

        {!!simulationError && (
          <div className='flex text-center justify-center'>
            <ErrorCard text={simulationError} />
          </div>
        )}
        <LineDivider size='sm' />
      </div>
      <div className='rounded-[16px] my-[16px] items-center'>
        <Text size='sm' className='p-[4px] font-bold ' color='text-gray-600 dark:text-gray-200'>
          {`About ${validator.moniker ?? validator.name ?? 'Validator'}`}
        </Text>
        <div className='flex flex-col p-[4px]'>
          <ReadMoreText
            textProps={{ size: 'md', className: 'font-medium  flex flex-column' }}
            readMoreColor={Colors.getChainColor(activeChain)}
          >
            {validator.description?.details ?? ''}
          </ReadMoreText>
        </div>
      </div>
    </div>
  )
}

export type CancleUndelegationProps = {
  validators: Record<string, Validator>
  validatorAddress: string
  unBoundingdelegationEntry: UnbondingDelegationEntry
  unBoundingdelegation: UnbondingDelegation
}

export default function CancelUndelegationPage() {
  const state = useLocation().state
  const navigate = useNavigate()
  const [showReviewPage, setShowReviewPage] = useState(false)

  const {
    validators = {},
    validatorAddress = '',
    unBoundingdelegationEntry = {},
  } = state as CancleUndelegationProps

  const validator = validators[validatorAddress]

  const { data: imgUrl } = useValidatorImage(validator)
  const activeChain = useActiveChain()
  const getWallet = Wallet.useGetWallet()
  const txCallback = useTxCallBack()
  const defaultTokenLogo = useDefaultTokenLogo()

  const activeChainInfo = useChainInfo()

  const {
    error,
    onReviewTransaction,
    setAmount,
    setCreationHeight,
    displayFeeText,
    simulationError,
    isLoading,
    setLedgerError,
  } = useStakeTx('CANCEL_UNDELEGATION', validator, undefined)

  useEffect(() => {
    setCreationHeight((unBoundingdelegationEntry as UnbondingDelegationEntry).creation_height)
    setAmount((unBoundingdelegationEntry as UnbondingDelegationEntry).balance)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAmount])

  const onSubmit = useCallback(async () => {
    try {
      const wallet = await getWallet()
      await onReviewTransaction(wallet, txCallback, false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setLedgerError(e.message)
      setTimeout(() => {
        setLedgerError('')
      }, 6000)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getWallet, onReviewTransaction, txCallback])

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                navigate(-1)
              },
              type: HeaderActionType.BACK,
            }}
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            title={
              <>
                <Text size='lg' className='font-bold'>
                  {'Cancel Unstake'}
                </Text>
              </>
            }
            topColor={Colors.getChainColor(activeChain)}
          />
        }
      >
        <div className='flex flex-col p-7 mb-8 overflow-scroll'>
          {
            <DetailsView
              onClick={() => {
                setShowReviewPage(true)
              }}
              simulationError={error ?? simulationError}
              displayFeeText={''}
              activeChain={activeChain}
              unBoundingdelegation={unBoundingdelegationEntry as UnbondingDelegationEntry}
              validator={validator ?? {}}
            />
          }
        </div>
      </PopupLayout>
      <BottomNav label={BottomNavLabel.Stake} />
      <BottomModal
        isOpen={showReviewPage}
        onClose={() => setShowReviewPage(false)}
        title={'Cancel Unstaking'}
      >
        <div className='flex gap-4 flex-col'>
          <div className='flex flex-col gap-2 dark:bg-gray-900 rounded-2xl bg-white-100 p-4'>
            <Text size='sm' color='dark:text-white-100 text-black-100 font-bold'>
              {'Are you sure you want to cancel your unstaking request?'}
            </Text>
            <Text size='sm'>
              {'This will reset the unstaking period and stake the tokens back to the validator'}
            </Text>
          </div>

          <GenericCard
            isRounded={true}
            img={
              <Avatar
                size='sm'
                className='rounded-full overflow-hidden'
                avatarImage={
                  imgUrl ?? validator.keybase_image ?? validator?.image ?? Images.Misc.Validator
                }
                avatarOnError={imgOnError(Images.Misc.Validator)}
              />
            }
            title={
              <Text size='md' className='font-bold ml-3 w-[120px]'>
                {`Validator`}
              </Text>
            }
            title2={
              <p className='text-right truncate w-[130px] py-2 text-ellipsis'>
                {validator?.moniker ?? validator?.name ?? ''}
              </p>
            }
          />

          <div className='mt-auto flex text-center justify-center'>
            {displayFeeText.includes('Enter') ? (
              <Skeleton count={1} className='w-[120px] light:bg-gray-200 bg-gray-800' />
            ) : (
              <Text size='sm'>{displayFeeText}</Text>
            )}
          </div>
          <div className='mt-auto flex gap-4 w-full'>
            <Buttons.Generic
              style={{ height: '48px', background: Colors.gray900, color: Colors.white100 }}
              onClick={() => {
                setShowReviewPage(false)
              }}
              disabled={isLoading}
            >
              Cancel
            </Buttons.Generic>

            <Buttons.Generic
              className='py-3'
              size='normal'
              color={activeChainInfo.theme.primaryColor}
              onClick={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Confirm'}
            </Buttons.Generic>
          </div>
        </div>
      </BottomModal>
    </div>
  )
}
