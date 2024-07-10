/* eslint-disable @typescript-eslint/ban-ts-comment */
import HCaptcha from '@hcaptcha/react-hcaptcha'
import {
  getSeiEvmInfo,
  INITIAL_ADDRESS_WARNING,
  SeiEvmInfoEnum,
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
import { useEffectiveAmountValue } from 'hooks/useEffectiveAmountValue'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { useWalletClient } from 'hooks/useWalletClient'
import { Wallet } from 'hooks/wallet/useWallet'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'

import { FeesView } from '../fees-view'
import { FixedFee } from '../fees-view/FixedFee'
import { ReviewTransferSheet } from './review-transfer-sheet'

export const ReviewTransfer: React.FC = () => {
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
    fetchAccountDetailsStatus,
    amountError,
    addressError,
    sendActiveChain,
    sendSelectedNetwork,
  } = useSendContext()
  const { addressLinkState, updateAddressLinkState } = useSeiLinkedAddressState(getWallet)

  const { chains } = useChainsStore()
  const userAddress = useAddress(sendActiveChain)
  const { walletClient } = useWalletClient(sendActiveChain)
  const walletAddresses = useGetWalletAddresses()

  const effectiveAmountValue = useEffectiveAmountValue(inputAmount)
  const debouncedAmount = useDebouncedValue(effectiveAmountValue, 500)
  const { data: elementsChains } = useChains()
  const { data: featureFlags } = useFeatureFlags()

  const hCaptchaRef = useRef<HCaptcha>(null)
  const [hCaptchaError, setHCaptchaError] = useState<string>('')
  const [showLoadingMessage, setShowLoadingMessage] = useState('')

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
    sourceChain: elementsChains?.find((chain) => chain.chainId === chains[sendActiveChain].chainId),
    userAddress: userAddress ?? '',
    walletClient: walletClient,
    enabled: isIBCTransfer && featureFlags?.ibc?.extension !== 'disabled',
    isMainnet: sendSelectedNetwork === 'mainnet',
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
    if (amountError) {
      if (amountError.includes('IBC transfers are not supported')) {
        return 'Select different chain or address'
      } else if (amountError.includes('You can only send this token to a SEI address')) {
        return 'Address not supported'
      } else {
        return amountError
      }
    }

    if (addressError) {
      if (addressError === 'The entered address is invalid') {
        return 'Invalid address'
      } else if (addressError.includes('IBC transfers are not supported')) {
        return 'Select different chain or address'
      } else {
        return addressError
      }
    }

    if (addressWarning.type === 'link' && addressLinkState === 'success') {
      return 'Addresses linked successfully'
    }

    if (addressWarning.type === 'link' && !['done', 'unknown'].includes(addressLinkState)) {
      if (featureFlags?.link_evm_address?.extension === 'redirect') {
        return (
          <span className='flex items-center gap-1'>
            Link Addresses
            <span className='!leading-[20px] !text-lg material-icons-round'>open_in_new</span>
          </span>
        )
      }

      return 'Link Addresses'
    }

    return 'Review Transfer'
  }, [
    addressError,
    addressLinkState,
    addressWarning.type,
    amountError,
    featureFlags?.link_evm_address?.extension,
  ])

  const handleLinkAddressClick = async () => {
    if (featureFlags?.link_evm_address?.extension === 'redirect') {
      const dAppLink = (await getSeiEvmInfo({
        activeNetwork: sendSelectedNetwork,
        activeChain: sendActiveChain as 'seiDevnet' | 'seiTestnet2',
        infoType: SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK,
      })) as string

      window.open(dAppLink, '_blank')
    } else if (featureFlags?.link_evm_address?.extension === 'no-funds') {
      try {
        const result = await hCaptchaRef.current?.execute({ async: true })

        if (!result) {
          setHCaptchaError('Could not get hCaptcha response. Please try again.')
          return
        }

        await updateAddressLinkState({
          setError: setGasError,
          ethAddress: walletAddresses[0],
          token: result.response,
          setShowLoadingMessage,
        })
      } catch (_) {
        setHCaptchaError('Failed to verify captcha. Please try again.')
      }
    } else {
      await updateAddressLinkState({ setError: setGasError, ethAddress: walletAddresses[0] })
    }

    setAddressWarning(INITIAL_ADDRESS_WARNING)
  }

  const showAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(true)
  }, [])

  const hideAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(false)
  }, [])

  const isReviewDisabled = useMemo(() => {
    if (addressWarning.type === 'link') {
      return (
        ['loading', 'success'].includes(addressLinkState) ||
        featureFlags?.link_evm_address?.extension === 'disabled'
      )
    }

    return (
      sendDisabled ||
      (!pfmEnabled && !isIbcUnwindingDisabled) ||
      ['error', 'loading'].includes(fetchAccountDetailsStatus)
    )
  }, [
    addressLinkState,
    addressWarning.type,
    featureFlags?.link_evm_address?.extension,
    fetchAccountDetailsStatus,
    isIbcUnwindingDisabled,
    pfmEnabled,
    sendDisabled,
  ])

  return (
    <>
      <div className='absolute w-full flex flex-col gap-4 p-4 bottom-0 left-0 dark:bg-black-100 bg-gray-50'>
        {inputAmount && (FIXED_FEE_CHAINS.includes(sendActiveChain) ? <FixedFee /> : <FeesView />)}

        {featureFlags?.link_evm_address?.extension === 'no-funds' &&
        addressWarning.type === 'link' &&
        !['done', 'unknown'].includes(addressLinkState) ? (
          <form>
            <HCaptcha
              ref={hCaptchaRef}
              sitekey={process.env.LINK_ADDRESS_HCAPTCHA_SITE_KEY ?? ''}
              size='invisible'
              theme='dark'
            />
          </form>
        ) : null}

        <Buttons.Generic
          size='normal'
          color={addressError || amountError ? Colors.red300 : Colors.green600}
          onClick={
            addressWarning.type === 'link' && !['done', 'unknown'].includes(addressLinkState)
              ? handleLinkAddressClick
              : showAdjustmentSheet
          }
          disabled={isReviewDisabled}
          data-testing-id='send-review-transfer-btn'
          className='w-full'
        >
          {addressWarning.type === 'link' && addressLinkState === 'loading' ? (
            <LoaderAnimation color={Colors.white100} />
          ) : (
            btnText
          )}
        </Buttons.Generic>

        {hCaptchaError ? <p className='text-red-300 text-center mt-4'>{hCaptchaError}</p> : null}
        {showLoadingMessage ? (
          <p className='text-yellow-600 text-center mt-4'>{showLoadingMessage}</p>
        ) : null}
      </div>

      {selectedToken && fee && checkForAutoAdjust ? (
        <AutoAdjustAmountSheet
          amount={inputAmount}
          setAmount={setInputAmount}
          selectedToken={selectedToken}
          fee={fee.amount[0]}
          setShowReviewSheet={setShowReviewTxSheet}
          closeAdjustmentSheet={hideAdjustmentSheet}
          forceChain={sendActiveChain}
          forceNetwork={sendSelectedNetwork}
        />
      ) : null}

      <ReviewTransferSheet
        isOpen={showReviewTxSheet}
        onClose={() => {
          setShowReviewTxSheet(false)
          clearTxError()
        }}
      />
    </>
  )
}
