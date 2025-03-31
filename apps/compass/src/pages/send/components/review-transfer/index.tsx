/* eslint-disable @typescript-eslint/ban-ts-comment */
import HCaptcha from '@hcaptcha/react-hcaptcha'
import {
  getSeiEvmInfo,
  INITIAL_ADDRESS_WARNING,
  SeiEvmInfoEnum,
  useAddress,
  useChainsStore,
  useFeatureFlags,
  useGetAptosGasPrices,
  useGetEvmGasPrices,
  useSeiLinkedAddressState,
} from '@leapwallet/cosmos-wallet-hooks'
import { isAptosChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SkipSupportedAsset } from '@leapwallet/elements-core'
import {
  useAllSkipAssets,
  useDebouncedValue,
  useSkipSupportedChains,
  useTransfer,
} from '@leapwallet/elements-hooks'
import { useTransferReturnType } from '@leapwallet/elements-hooks/dist/use-transfer'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import { LoaderAnimation } from 'components/loader/Loader'
import { Button } from 'components/ui/button'
import { ButtonName, EventName } from 'config/analytics'
import { FIXED_FEE_CHAINS } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useEffectiveAmountValue } from 'hooks/useEffectiveAmountValue'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { useWalletClient } from 'hooks/useWalletClient'
import { Wallet } from 'hooks/wallet/useWallet'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send/context'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'
import { Colors } from 'theme/colors'
import { cn } from 'utils/cn'

import { FeesView } from '../fees-view'
import { FixedFee } from '../fees-view/FixedFee'
import { ReviewTransferSheet } from './review-transfer-sheet'

export const ReviewTransfer = observer(
  ({ setShowTxPage }: { setShowTxPage: (val: boolean) => void }) => {
    const { activeWallet } = useActiveWallet()
    const getWallet = Wallet.useGetWallet()
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
      isSeiEvmTransaction,
      hasToUseCw20PointerLogic,
      feeDenom,
      gasError,
    } = useSendContext()
    const { addressLinkState, updateAddressLinkState } = useSeiLinkedAddressState(getWallet)
    const { status: gasPriceStatus } = useGetEvmGasPrices(sendActiveChain, sendSelectedNetwork)
    const { status: aptosGasPriceStatus } = useGetAptosGasPrices(
      sendActiveChain,
      sendSelectedNetwork,
    )
    const isAptosTx = isAptosChain(sendActiveChain)

    const { chains } = useChainsStore()
    const userAddress = useAddress(sendActiveChain)
    const { walletClient } = useWalletClient(sendActiveChain)
    const walletAddresses = useGetWalletAddresses()

    const effectiveAmountValue = useEffectiveAmountValue(inputAmount)
    const debouncedAmount = useDebouncedValue(effectiveAmountValue, 500)
    const { data: elementsChains } = useSkipSupportedChains({
      chainTypes: ['cosmos'],
      onlyTestnets: sendSelectedNetwork === 'testnet',
    })
    const { data: featureFlags } = useFeatureFlags()

    const hCaptchaRef = useRef<HCaptcha>(null)
    const [hCaptchaError, setHCaptchaError] = useState<string>('')
    const [showLoadingMessage, setShowLoadingMessage] = useState('')

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

    const transferData: useTransferReturnType = useTransfer({
      amount: debouncedAmount,
      asset: asset,
      destinationChain: elementsChains?.find(
        //@ts-ignore
        (d) => d.chainId === chains[selectedAddress?.chainName]?.chainId,
      ),
      destinationAsset: destinationAsset,
      destinationAddress: selectedAddress?.address,
      sourceChain: elementsChains?.find(
        (chain) => chain.chainId === chains[sendActiveChain].chainId,
      ),
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
        if (
          // @ts-ignore
          !transferData?.isLoadingMessages &&
          // @ts-ignore
          !transferData?.isLoadingRoute &&
          selectedAddress?.chainName &&
          chains[selectedAddress?.chainName as SupportedChain]?.chainId !==
            chains[sendActiveChain]?.chainId &&
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
    ])

    const btnText = useMemo(() => {
      if (!inputAmount) return 'Enter amount'
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

      if (addressWarning.type === 'link' && addressLinkState === 'success') {
        return 'Addresses linked successfully'
      }

      if (addressWarning.type === 'link' && !['done', 'unknown'].includes(addressLinkState)) {
        if (featureFlags?.link_evm_address?.extension === 'redirect') {
          return (
            <span className='flex items-center gap-1'>
              Link Addresses
              <ArrowSquareOut size={16} className='!leading-[20px]' />
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
      inputAmount,
      routeError,
    ])

    const handleLinkAddressClick = async () => {
      try {
        mixpanel.track(EventName.ButtonClick, {
          buttonName: ButtonName.LINK_ADDRESS,
          walletAddresses,
        })
      } catch (_) {
        //
      }

      if (featureFlags?.link_evm_address?.extension === 'redirect') {
        const dAppLink = (await getSeiEvmInfo({
          activeNetwork: sendSelectedNetwork,
          activeChain: sendActiveChain as 'seiDevnet' | 'seiTestnet2',
          infoType: SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK,
        })) as string

        window.open(dAppLink, '_blank')
        return
      }

      if (featureFlags?.link_evm_address?.extension === 'no-funds') {
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

        return
      }

      await updateAddressLinkState({ setError: setGasError, ethAddress: walletAddresses[0] })
      setAddressWarning(INITIAL_ADDRESS_WARNING)
    }

    const showAdjustmentSheet = () => {
      if (activeWallet?.watchWallet) {
        globalSheetsStore.setImportWatchWalletSeedPopupOpen(true)
      } else {
        setCheckForAutoAdjust(true)
      }
    }

    const hideAdjustmentSheet = useCallback(() => {
      setCheckForAutoAdjust(false)
    }, [])

    const isReviewDisabled = useMemo(() => {
      if (
        isInitiaTxn &&
        // @ts-ignore
        (transferData?.isLoadingRoute ||
          // @ts-ignore
          transferData?.isLoadingMessages ||
          (selectedAddress?.chainName &&
            chains[selectedAddress?.chainName as SupportedChain]?.chainId !==
              chains[sendActiveChain]?.chainId &&
            // @ts-ignore
            !transferData?.messages))
      ) {
        return true
      }
      if (addressWarning.type === 'link') {
        return (
          ['loading', 'success'].includes(addressLinkState) ||
          featureFlags?.link_evm_address?.extension === 'disabled'
        )
      }
      if (isSeiEvmTransaction && gasPriceStatus === 'loading') {
        return true
      }

      if (isAptosTx && aptosGasPriceStatus === 'loading') {
        return true
      }

      return (
        sendDisabled ||
        !!gasError ||
        (!pfmEnabled && !isIbcUnwindingDisabled) ||
        (['error', 'loading'].includes(fetchAccountDetailsStatus) && !hasToUseCw20PointerLogic)
      )
    }, [
      isInitiaTxn,
      // @ts-ignore
      transferData?.isLoadingRoute,
      // @ts-ignore
      transferData?.isLoadingMessages,
      // @ts-ignore
      transferData?.messages,
      selectedAddress?.chainName,
      gasError,
      chains,
      sendActiveChain,
      addressWarning.type,
      isSeiEvmTransaction,
      gasPriceStatus,
      sendDisabled,
      pfmEnabled,
      isIbcUnwindingDisabled,
      fetchAccountDetailsStatus,
      hasToUseCw20PointerLogic,
      addressLinkState,
      featureFlags?.link_evm_address?.extension,
      aptosGasPriceStatus,
      isAptosTx,
    ])

    const feeValue = {
      amount: fee?.amount[0].amount.toString() ?? '',
      denom: feeDenom.coinMinimalDenom,
    }

    if (isSeiEvmTransaction && gasPriceStatus === 'loading') {
      return <></>
    }

    if (isAptosTx && aptosGasPriceStatus === 'loading') {
      return <></>
    }

    return (
      <>
        <div className='mt-4 flex flex-col gap-5'>
          {inputAmount &&
            (FIXED_FEE_CHAINS.includes(sendActiveChain) ? <FixedFee /> : <FeesView />)}

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

          <Button
            onClick={
              addressWarning.type === 'link' && !['done', 'unknown'].includes(addressLinkState)
                ? handleLinkAddressClick
                : showAdjustmentSheet
            }
            disabled={isReviewDisabled}
            data-testing-id='send-review-transfer-btn'
            className={cn('w-full', {
              '!bg-red-300 text-white-100': addressError || amountError || routeError || gasError,
            })}
          >
            {addressWarning.type === 'link' && addressLinkState === 'loading' ? (
              <LoaderAnimation color={Colors.white100} />
            ) : (
              btnText
            )}
          </Button>

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
            fee={feeValue}
            setShowReviewSheet={setShowReviewTxSheet}
            closeAdjustmentSheet={hideAdjustmentSheet}
            forceChain={sendActiveChain}
            forceNetwork={sendSelectedNetwork}
            isSeiEvmTransaction={isSeiEvmTransaction}
          />
        ) : null}

        <ReviewTransferSheet
          isOpen={showReviewTxSheet}
          onClose={() => {
            setShowReviewTxSheet(false)
            clearTxError()
          }}
          setShowTxPage={setShowTxPage}
        />
      </>
    )
  },
)
