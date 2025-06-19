/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  useAddress,
  useChainsStore,
  useFeatureFlags,
  useGetAptosGasPrices,
} from '@leapwallet/cosmos-wallet-hooks'
import { isAptosChain, isSuiChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  RootBalanceStore,
  RootDenomsStore,
  RootERC20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { SkipSupportedAsset } from '@leapwallet/elements-core'
import {
  useAllSkipAssets,
  useDebouncedValue,
  useSkipSupportedChains,
  useTransfer,
} from '@leapwallet/elements-hooks'
import { useTransferReturnType } from '@leapwallet/elements-hooks/dist/use-transfer'
import { Buttons } from '@leapwallet/leap-ui'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import { FIXED_FEE_CHAINS } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useEffectiveAmountValue } from 'hooks/useEffectiveAmountValue'
import { useWalletClient } from 'hooks/useWalletClient'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'
import { Colors } from 'theme/colors'

import { FeesView } from '../fees-view'
import { FixedFee } from '../fees-view/FixedFee'
import { ReviewTransferSheet } from './review-transfer-sheet'

export const ReviewTransfer = observer(
  ({
    rootDenomsStore,
    rootBalanceStore,
    rootERC20DenomsStore,
  }: {
    rootDenomsStore: RootDenomsStore
    rootBalanceStore: RootBalanceStore
    rootERC20DenomsStore: RootERC20DenomsStore
  }) => {
    const { activeWallet } = useActiveWallet()
    const [showReviewTxSheet, setShowReviewTxSheet] = useState(false)
    const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false)
    const [routeError, setRouteError] = useState(false)

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
      fetchAccountDetailsStatus,
      amountError,
      addressError,
      sendActiveChain,
      sendSelectedNetwork,
      hasToUseCw20PointerLogic,
      feeDenom,
    } = useSendContext()
    const { status: aptosGasPriceStatus } = useGetAptosGasPrices(
      sendActiveChain,
      sendSelectedNetwork,
    )
    const isAptosTx = isAptosChain(sendActiveChain)
    const isSuiTx = isSuiChain(sendActiveChain)

    const { chains } = useChainsStore()
    const userAddress = useAddress(sendActiveChain)
    const { walletClient } = useWalletClient(sendActiveChain)

    const effectiveAmountValue = useEffectiveAmountValue(inputAmount)
    const debouncedAmount = useDebouncedValue(effectiveAmountValue, 500)
    const { data: elementsChains } = useSkipSupportedChains({
      chainTypes: ['cosmos'],
      onlyTestnets: sendSelectedNetwork === 'testnet',
    })
    const { data: featureFlags } = useFeatureFlags()

    const isInitiaTxn = selectedAddress?.address?.startsWith('init') ?? false

    const { data: allSkipAssets } = useAllSkipAssets({
      only_testnets: sendSelectedNetwork === 'testnet',
    })

    const skipAssets = useMemo(() => {
      return allSkipAssets?.[chains?.[sendActiveChain]?.chainId]
    }, [allSkipAssets, chains, sendActiveChain])

    const asset: SkipSupportedAsset = useMemo(() => {
      const skipAsset = skipAssets?.find((a) => {
        const skipDenom = a.denom?.replace(/(cw20:|erc20\/)/g, '')
        if (selectedToken?.ibcDenom) {
          return skipDenom === selectedToken.ibcDenom
        }

        return skipDenom === selectedToken?.coinMinimalDenom
      })

      if (!skipAsset) {
        return {
          denom: (selectedToken?.ibcDenom || selectedToken?.coinMinimalDenom) ?? '',
          symbol: selectedToken?.symbol || '',
          logoUri: selectedToken?.img || '',
          decimals: selectedToken?.coinDecimals || 0,
          originDenom: selectedToken?.coinMinimalDenom || '',
          trace: selectedToken?.ibcChainInfo
            ? `transfer/${selectedToken.ibcChainInfo?.channelId}`
            : '',
          name: selectedToken?.name || '',
          chainId: selectedToken?.ibcChainInfo?.name || '',
          originChainId: selectedToken?.ibcChainInfo?.name || '',
          isCw20: false,
          coingeckoId: selectedToken?.coinGeckoId || '',
        }
      }
      return {
        ...skipAsset,
        trace: selectedToken?.ibcChainInfo
          ? `transfer/${selectedToken.ibcChainInfo?.channelId}`
          : skipAsset.trace,
      }
    }, [selectedToken, skipAssets])

    const destinationAsset: SkipSupportedAsset | undefined = useMemo(() => {
      if (
        selectedAddress &&
        selectedAddress.address?.startsWith('init') &&
        selectedAddress.chainName !== sendActiveChain
      ) {
        const chain = chains[selectedAddress?.chainName as SupportedChain]
        const asset = allSkipAssets?.[chain?.chainId]?.find(
          (asset) => asset.denom === Object.values(chain?.nativeDenoms)[0]?.coinMinimalDenom,
        )

        return asset
      }
      return undefined
    }, [allSkipAssets, chains, selectedAddress, sendActiveChain])

    const destinationChain = useMemo(() => {
      return sendSelectedNetwork === 'mainnet'
        ? chains[selectedAddress?.chainName as SupportedChain]?.chainId
        : chains[selectedAddress?.chainName as SupportedChain]?.testnetChainId
    }, [chains, selectedAddress, sendSelectedNetwork])

    const sourceChainId = useMemo(() => {
      return sendSelectedNetwork === 'mainnet'
        ? chains[sendActiveChain]?.chainId
        : chains[sendActiveChain]?.testnetChainId
    }, [chains, sendActiveChain, sendSelectedNetwork])

    const transferData: useTransferReturnType = useTransfer({
      amount: debouncedAmount,
      asset: asset,
      destinationChain: elementsChains?.find(
        //@ts-ignore
        (d) => d.chainId === destinationChain,
      ),
      destinationAsset: destinationAsset,
      destinationAddress: selectedAddress?.address,
      sourceChain: elementsChains?.find((chain) => chain.chainId === sourceChainId),
      userAddress: userAddress ?? '',
      walletClient: walletClient,
      enabled: (isIBCTransfer || isInitiaTxn) && featureFlags?.ibc?.extension !== 'disabled',
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

    useEffect(() => {
      if (isInitiaTxn) {
        const selectedAddressChainId =
          sendSelectedNetwork === 'mainnet'
            ? chains[selectedAddress?.chainName as SupportedChain]?.chainId
            : chains[selectedAddress?.chainName as SupportedChain]?.testnetChainId
        if (
          // @ts-ignore
          !transferData?.isLoadingMessages &&
          // @ts-ignore
          !transferData?.isLoadingRoute &&
          selectedAddress?.chainName &&
          selectedAddressChainId !== sourceChainId &&
          // @ts-ignore
          !transferData?.messages
        ) {
          setRouteError(true)
        } else {
          setRouteError(false)
        }
      }
    }, [
      chains,
      isInitiaTxn,
      selectedAddress?.chainName,
      sendActiveChain,
      // @ts-ignore
      transferData?.isLoadingMessages,
      // @ts-ignore
      transferData?.messages,
      // @ts-ignore
      transferData?.isLoadingRoute,
      sourceChainId,
      sendSelectedNetwork,
    ])

    const btnText = useMemo(() => {
      if (routeError) return 'No routes found'

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

      return 'Review Transfer'
    }, [addressError, amountError, routeError])

    const showAdjustmentSheet = () => {
      if (activeWallet?.watchWallet) {
        importWatchWalletSeedPopupStore.setShowPopup(true)
      } else {
        setCheckForAutoAdjust(true)
      }
    }

    const hideAdjustmentSheet = useCallback(() => {
      setCheckForAutoAdjust(false)
    }, [])

    const isReviewDisabled = useMemo(() => {
      const selectedAddressChainId =
        sendSelectedNetwork === 'mainnet'
          ? chains[selectedAddress?.chainName as SupportedChain]?.chainId
          : chains[selectedAddress?.chainName as SupportedChain]?.testnetChainId
      if (
        isInitiaTxn &&
        // @ts-ignore
        (transferData?.isLoadingRoute ||
          // @ts-ignore
          transferData?.isLoadingMessages ||
          (selectedAddress?.chainName &&
            selectedAddressChainId !== sourceChainId &&
            // @ts-ignore
            !transferData?.messages))
      ) {
        return true
      }

      if (isAptosTx && aptosGasPriceStatus === 'loading') {
        return true
      }

      // if (isSuiTx) {
      //   return true
      // }

      return (
        sendDisabled ||
        (!pfmEnabled && !isIbcUnwindingDisabled) ||
        (['error', 'loading'].includes(fetchAccountDetailsStatus) && !hasToUseCw20PointerLogic)
      )
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      isInitiaTxn,
      // @ts-ignore
      transferData?.isLoadingRoute,
      // @ts-ignore
      transferData?.isLoadingMessages,
      // @ts-ignore
      transferData?.messages,
      selectedAddress?.chainName,
      chains,
      sendActiveChain,
      sendDisabled,
      pfmEnabled,
      isIbcUnwindingDisabled,
      fetchAccountDetailsStatus,
      hasToUseCw20PointerLogic,
      aptosGasPriceStatus,
      sendSelectedNetwork,
      sourceChainId,
      isAptosTx,
    ])

    const feeValue = {
      amount: fee?.amount[0].amount.toString() ?? '',
      denom: feeDenom.coinMinimalDenom,
    }

    if (isAptosTx && aptosGasPriceStatus === 'loading') {
      return <></>
    }

    return (
      <>
        <div className='absolute w-[calc(100%-4px)] flex flex-col gap-4 p-4 !pr-[14px] bottom-0 left-0 dark:bg-black-100 bg-gray-50'>
          {inputAmount &&
            (FIXED_FEE_CHAINS.includes(sendActiveChain) ? (
              <FixedFee />
            ) : (
              <FeesView rootDenomsStore={rootDenomsStore} rootBalanceStore={rootBalanceStore} />
            ))}

          <Buttons.Generic
            size='normal'
            color={addressError || amountError || routeError ? Colors.red300 : Colors.green600}
            onClick={showAdjustmentSheet}
            disabled={isReviewDisabled}
            data-testing-id='send-review-transfer-btn'
            className='w-full'
          >
            {btnText}
          </Buttons.Generic>
        </div>

        {selectedToken && fee && checkForAutoAdjust ? (
          <AutoAdjustAmountSheet
            amount={inputAmount}
            setAmount={setInputAmount}
            selectedToken={selectedToken}
            fee={feeValue}
            setShowReviewSheet={setShowReviewTxSheet}
            closeAdjustmentSheet={hideAdjustmentSheet}
            forceChain={sendActiveChain}
            forceNetwork={sendSelectedNetwork}
            rootDenomsStore={rootDenomsStore}
          />
        ) : null}

        <ReviewTransferSheet
          isOpen={showReviewTxSheet}
          onClose={() => {
            setShowReviewTxSheet(false)
            clearTxError()
          }}
          rootERC20DenomsStore={rootERC20DenomsStore}
        />
      </>
    )
  },
)
