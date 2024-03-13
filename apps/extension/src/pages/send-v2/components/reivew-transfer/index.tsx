import {
  useActiveChain,
  useAddress,
  useChainsStore,
  useFeatureFlags,
} from '@leapwallet/cosmos-wallet-hooks'
import { Asset } from '@leapwallet/elements-core'
import { useChains, useDebouncedValue, useTransfer } from '@leapwallet/elements-hooks'
import { useTransferReturnType } from '@leapwallet/elements-hooks/dist/use-transfer'
import { Buttons } from '@leapwallet/leap-ui'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import BottomModal from 'components/bottom-modal'
import { FIXED_FEE_CHAINS } from 'config/constants'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useEffectiveAmountValue } from 'hooks/useEffectiveAmountValue'
import { useWalletClient } from 'hooks/useWalletClient'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useState } from 'react'

import { FeesView } from '../fees-view'
import { FixedFee } from '../fees-view/FixedFee'
import { ReviewTransferSheet } from './review-transfer-sheet'

type ReviewTransferProps = {
  themeColor: string
}

export const ReviewTransfer: React.FC<ReviewTransferProps> = ({ themeColor }) => {
  const [showReviewTxSheet, setShowReviewTxSheet] = useState(false)
  const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false)

  const {
    sendDisabled,
    clearTxError,
    fee,
    inputAmount,
    setInputAmount,
    selectedToken,
    selectedAddress,
    setTransferData,
    pfmEnabled,
    isIbcUnwindingDisabled,
    isIBCTransfer,
    showLedgerPopup,
  } = useSendContext()

  const showAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(true)
  }, [])

  const hideAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(false)
  }, [])

  const { chains } = useChainsStore()
  const userAddress = useAddress()
  const { walletClient } = useWalletClient()
  const effectiveAmountValue = useEffectiveAmountValue(inputAmount)
  const debouncedAmount = useDebouncedValue(effectiveAmountValue, 500)
  const activeChain = useActiveChain()
  const { data: elementsChains } = useChains()
  const activeNetwork = useSelectedNetwork()
  const { data: featureFlags } = useFeatureFlags()

  const asset: Asset = {
    denom: (selectedToken?.ibcDenom || selectedToken?.coinMinimalDenom) ?? '',
    symbol: selectedToken?.symbol || '',
    logoUri: selectedToken?.img || '',
    decimals: selectedToken?.coinDecimals || 0,
    originDenom: selectedToken?.coinMinimalDenom || '',
    denomTracePath: selectedToken?.ibcChainInfo
      ? `transfer/${selectedToken.ibcChainInfo?.channelId}`
      : '',
  }

  const transferData: useTransferReturnType = useTransfer({
    amount: debouncedAmount,
    asset: asset,
    destinationChain: elementsChains?.find(
      //@ts-ignore
      (d) => d.chainId === chains[selectedAddress?.chainName]?.chainId,
    ),
    destinationAddress: selectedAddress?.address,
    sourceChain: elementsChains?.find((chain) => chain.chainId === chains[activeChain].chainId),
    userAddress: userAddress ?? '',
    walletClient: walletClient,
    enabled: isIBCTransfer && featureFlags?.ibc?.extension === 'active',
    isMainnet: activeNetwork === 'mainnet',
  })

  useEffect(() => {
    //@ts-ignore
    if (transferData && transferData.messages) {
      setTransferData(transferData)
    } else {
      setTransferData({
        isSkipTransfer: false,
        isGasFeesLoading: false,
        gasFees: undefined,
        gasFeesError: undefined,
      })
    }
  }, [
    selectedToken?.coinMinimalDenom,
    selectedAddress?.chainName,
    // @ts-ignore
    transferData?.isLoadingMessages,
    // @ts-ignore
    transferData?.isLoadingRoute,
    // @ts-ignore
    transferData?.isLoadingSkipGasFee,
    transferData?.isSkipTransfer,
    //@ts-ignore
    transferData?.messages,
    //@ts-ignore
    transferData?.routeResponse,
  ])

  return (
    <>
      <div className='absolute w-full flex flex-col gap-4 p-4 bottom-0 left-0 dark:bg-black-100 bg-gray-50'>
        {FIXED_FEE_CHAINS.includes(activeChain) ? <FixedFee /> : <FeesView />}
        <Buttons.Generic
          size='normal'
          color={themeColor}
          onClick={showAdjustmentSheet}
          disabled={sendDisabled || (!pfmEnabled && !isIbcUnwindingDisabled)}
          data-testing-id='send-review-transfer-btn'
          className='w-full'
        >
          Review Transfer
        </Buttons.Generic>
      </div>
      {selectedToken && fee && checkForAutoAdjust ? (
        <AutoAdjustAmountSheet
          amount={inputAmount}
          setAmount={setInputAmount}
          selectedToken={selectedToken}
          fee={fee.amount[0]}
          setShowReviewSheet={setShowReviewTxSheet}
          closeAdjustmentSheet={hideAdjustmentSheet}
        />
      ) : null}

      <ReviewTransferSheet
        isOpen={showReviewTxSheet}
        onClose={() => {
          setShowReviewTxSheet(false)
          clearTxError()
        }}
        themeColor={themeColor}
      />
    </>
  )
}
