/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  useActiveChain,
  useAddress,
  useChainsStore,
  useFeatureFlags,
  useSeiLinkedAddressState,
} from '@leapwallet/cosmos-wallet-hooks'
import { Asset } from '@leapwallet/elements-core'
import { useChains, useDebouncedValue, useTransfer } from '@leapwallet/elements-hooks'
import { useTransferReturnType } from '@leapwallet/elements-hooks/dist/use-transfer'
import { Buttons } from '@leapwallet/leap-ui'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import { LoaderAnimation } from 'components/loader/Loader'
import { FIXED_FEE_CHAINS } from 'config/constants'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useEffectiveAmountValue } from 'hooks/useEffectiveAmountValue'
import { useWalletClient } from 'hooks/useWalletClient'
import { Wallet } from 'hooks/wallet/useWallet'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'

import { FeesView } from '../fees-view'
import { FixedFee } from '../fees-view/FixedFee'
import { ReviewTransferSheet } from './review-transfer-sheet'

type ReviewTransferProps = {
  themeColor: string
}

export const ReviewTransfer: React.FC<ReviewTransferProps> = ({ themeColor }) => {
  const getWallet = Wallet.useGetWallet()
  const [showReviewTxSheet, setShowReviewTxSheet] = useState(false)
  const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false)

  const {
    sendDisabled,
    clearTxError,
    fee,
    inputAmount,
    setInputAmount,
    selectedToken,
    addressWarning,
    setAddressWarning,
    setGasError,
    selectedAddress,
    setTransferData,
    pfmEnabled,
    isIbcUnwindingDisabled,
    isIBCTransfer,
  } = useSendContext()
  const { addressLinkState, updateAddressLinkState } = useSeiLinkedAddressState(getWallet)

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
    enabled: isIBCTransfer && featureFlags?.ibc?.extension !== 'disabled',
    isMainnet: activeNetwork === 'mainnet',
  })

  useEffect(() => {
    //@ts-ignore
    if (transferData?.messages) {
      setTransferData(transferData)
    } else {
      setTransferData({
        isSkipTransfer: false,
        isGasFeesLoading: false,
        gasFees: undefined,
        gasFeesError: undefined,
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedToken?.coinMinimalDenom,
    selectedAddress?.chainName,
    // @ts-ignore
    transferData?.messages,
  ])

  const btnText = useMemo(() => {
    if (addressWarning && addressLinkState === 'success') {
      return 'Addresses linked successfully'
    }

    if (addressWarning && !['done', 'unknown'].includes(addressLinkState)) {
      return 'Link Addresses'
    }

    return 'Review Transfer'
  }, [addressLinkState, addressWarning])

  const handleLinkAddressClick = async () => {
    await updateAddressLinkState(setGasError)
    setAddressWarning('')
  }

  const showAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(true)
  }, [])

  const hideAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(false)
  }, [])

  const isReviewDisabled = addressWarning
    ? ['loading', 'success'].includes(addressLinkState)
    : sendDisabled || (!pfmEnabled && !isIbcUnwindingDisabled)

  return (
    <>
      <div className='absolute w-full flex flex-col gap-4 p-4 bottom-0 left-0 dark:bg-black-100 bg-gray-50'>
        {FIXED_FEE_CHAINS.includes(activeChain) ? <FixedFee /> : <FeesView />}

        <Buttons.Generic
          size='normal'
          color={themeColor}
          onClick={
            addressWarning && !['done', 'unknown'].includes(addressLinkState)
              ? handleLinkAddressClick
              : showAdjustmentSheet
          }
          disabled={isReviewDisabled}
          data-testing-id='send-review-transfer-btn'
          className='w-full'
        >
          {addressWarning && addressLinkState === 'loading' ? (
            <LoaderAnimation color={Colors.white100} />
          ) : (
            btnText
          )}
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
