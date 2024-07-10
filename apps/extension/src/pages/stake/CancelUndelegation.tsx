import { useChainInfo, useStakeTx, useValidatorImage } from '@leapwallet/cosmos-wallet-hooks'
import {
  SupportedChain,
  UnbondingDelegation,
  UnbondingDelegationEntry,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk'
import { Avatar, Buttons, GenericCard, Header } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { useDefaultTokenLogo } from 'hooks'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { useCallback, useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'
import { HeaderActionType } from 'types/components'
import { imgOnError } from 'utils/imgOnError'
import { useTxCallBack } from 'utils/txCallback'

import { CancelUndelegationDetailsView } from './components'

export type CancleUndelegationProps = {
  validators: Record<string, Validator>
  validatorAddress: string
  unBoundingdelegationEntry: UnbondingDelegationEntry
  unBoundingdelegation: UnbondingDelegation
  activeChain: SupportedChain
  activeNetwork: SelectedNetwork
}

export default function CancelUndelegation() {
  const state = useLocation().state
  const navigate = useNavigate()
  const [showReviewPage, setShowReviewPage] = useState(false)

  const {
    validators = {},
    validatorAddress = '',
    unBoundingdelegationEntry = {},
    activeChain,
    activeNetwork,
  } = state as CancleUndelegationProps
  const validator = validators[validatorAddress]

  const { data: imgUrl } = useValidatorImage(validator)
  const getWallet = Wallet.useGetWallet()
  const txCallback = useTxCallBack()
  const defaultTokenLogo = useDefaultTokenLogo()

  const activeChainInfo = useChainInfo(activeChain)
  const {
    error,
    onReviewTransaction,
    setAmount,
    setCreationHeight,
    displayFeeText,
    simulationError,
    isLoading,
    setLedgerError,
  } = useStakeTx('CANCEL_UNDELEGATION', validator, undefined, undefined, activeChain, activeNetwork)

  useEffect(() => {
    setCreationHeight((unBoundingdelegationEntry as UnbondingDelegationEntry).creation_height)
    setAmount((unBoundingdelegationEntry as UnbondingDelegationEntry).balance)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAmount])

  const onSubmit = useCallback(async () => {
    try {
      const wallet = await getWallet(activeChain)
      await onReviewTransaction(wallet, txCallback, false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setLedgerError(e.message)
      setTimeout(() => {
        setLedgerError('')
      }, 6000)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getWallet, onReviewTransaction, txCallback, activeChain])

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
          />
        }
      >
        <div className='flex flex-col p-7 mb-8 overflow-scroll'>
          <CancelUndelegationDetailsView
            onClick={() => {
              setShowReviewPage(true)
            }}
            simulationError={error ?? simulationError}
            displayFeeText={''}
            activeChain={activeChain}
            unBoundingdelegation={unBoundingdelegationEntry as UnbondingDelegationEntry}
            validator={validator ?? {}}
          />
        </div>
      </PopupLayout>

      <BottomNav label={BottomNavLabel.Stake} />
      <BottomModal
        isOpen={showReviewPage}
        onClose={() => setShowReviewPage(false)}
        title='Cancel Unstaking'
        closeOnBackdropClick={true}
        contentClassName='[&>div:first-child>div:last-child]:-mt-[2px]'
      >
        <div className='flex gap-4 flex-col'>
          <div className='flex flex-col gap-2 dark:bg-gray-950 rounded-2xl bg-white-100 p-4'>
            <Text size='sm' color='dark:text-white-100 text-black-100 font-bold'>
              Are you sure you want to cancel your unstaking request?
            </Text>
            <Text size='sm'>
              This will reset the unstaking period and stake the tokens back to the validator
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
                Validator
              </Text>
            }
            title2={
              <p className='text-right truncate w-[130px] py-2 text-ellipsis'>
                {validator?.moniker ?? validator?.name ?? ''}
              </p>
            }
            className='dark:!bg-gray-950'
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
              style={{ height: '48px', background: Colors.gray950, color: Colors.white100 }}
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
