/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseUnits } from '@ethersproject/units'
import {
  CosmosTxType,
  GasOptions,
  hasToAddEvmDetails,
  LeapWalletApi,
  useActiveWallet,
  useAddress,
  useChainApis,
  useChainId,
  useChainInfo,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useGetEvmGasPrices,
  useNativeFeeDenom,
  useSeiLinkedAddressState,
  useTxMetadata,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  DefaultGasEstimates,
  GasPrice,
  LedgerError,
  NetworkType,
  pubKeyToEvmAddressToShow,
  SeiEvmTx,
  SupportedChain,
  transactionDeclinedError,
  txDeclinedErrorUser,
} from '@leapwallet/cosmos-wallet-sdk'
import { EvmBalanceStore, RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { EthWallet } from '@leapwallet/leap-keychain'
import { captureException } from '@sentry/react'
import BigNumber from 'bignumber.js'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import LedgerConfirmationModal from 'components/ledger-confirmation/confirmation-modal'
import { Button } from 'components/ui/button'
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from 'config/constants'
import { MessageTypes } from 'config/message-types'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TransactionStatus } from 'types/utility'
import { assert } from 'utils/assert'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import { uiErrorTags } from 'utils/sentry'
import Browser from 'webextension-polyfill'

import { handleRejectClick } from '../../utils'
import { Loading } from '../index'
import { TabList } from './tab-list'
import { SignTransactionWrapper } from './wrapper'

const useGetWallet = Wallet.useGetWallet

export type SignTransactionProps = {
  txnData: Record<string, any>
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  evmBalanceStore: EvmBalanceStore
  donotClose: boolean
  activeChain: SupportedChain
  activeNetwork: NetworkType
  handleTxnListUpdate: () => void
}

export const SignTransaction = observer(
  ({
    txnData,
    rootDenomsStore,
    rootBalanceStore,
    evmBalanceStore,
    donotClose,
    handleTxnListUpdate,
    activeChain,
    activeNetwork,
  }: SignTransactionProps) => {
    const getWallet = useGetWallet(activeChain)

    const { addressLinkState } = useSeiLinkedAddressState(activeChain)
    const evmBalance = evmBalanceStore.evmBalance
    const chainInfo = useChainInfo(activeChain)
    const activeWallet = useActiveWallet()
    const allAssets = rootBalanceStore.getBalancesForChain(activeChain, activeNetwork, undefined)
    const [showLedgerPopup, setShowLedgerPopup] = useState(false)

    const assets = useMemo(() => {
      let _assets = allAssets
      const addEvmDetails = hasToAddEvmDetails(
        isCompassWallet(),
        addressLinkState,
        chainInfo?.evmOnlyChain ?? false,
      )

      if (addEvmDetails) {
        _assets = [..._assets, ...(evmBalance ?? [])].filter((token) =>
          new BigNumber(token.amount).gt(0),
        )
      }

      return _assets
    }, [addressLinkState, allAssets, chainInfo?.evmOnlyChain, evmBalance])

    const isEvmTokenExist = useMemo(
      () =>
        (assets ?? []).some(
          (asset) =>
            asset?.isEvm && (asset?.coinMinimalDenom === 'usei' || chainInfo?.evmOnlyChain),
        ),
      [assets, chainInfo?.evmOnlyChain],
    )

    assert(activeWallet !== null, 'activeWallet is null')
    const globalTxMeta = useTxMetadata()
    const txPostToDb = LeapWalletApi.useLogCosmosDappTx()

    const navigate = useNavigate()

    const address = useAddress(activeChain)
    const evmChainId = useChainId(activeChain, activeNetwork, true)
    const { evmJsonRpc } = useChainApis(activeChain, activeNetwork)
    const defaultGasPrice = useDefaultGasPrice(rootDenomsStore.allDenoms, {
      activeChain,
      isSeiEvmTransaction: true,
    })
    const { status: gasPriceStatus } = useGetEvmGasPrices(activeChain, activeNetwork)

    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle')
    const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<string>('')
    const [gasPriceError, setGasPriceError] = useState<string | null>(null)
    const [signingError, setSigningError] = useState<string | null>(null)

    const [isLoadingGasLimit, setIsLoadingGasLimit] = useState<boolean>(false)
    const defaultGasEstimates = useDefaultGasEstimates()
    const gasAdjustment = useGasAdjustmentForChain(activeChain)
    const defaultGasLimit = useMemo(
      () =>
        parseInt(
          (
            (defaultGasEstimates[activeChain]?.DEFAULT_GAS_IBC ??
              DefaultGasEstimates.DEFAULT_GAS_IBC) * gasAdjustment
          ).toString(),
        ),
      [activeChain, defaultGasEstimates, gasAdjustment],
    )

    const [recommendedGasLimit, setRecommendedGasLimit] = useState<number>(defaultGasLimit)
    const [gasPriceOption, setGasPriceOption] = useState<{
      option: GasOptions
      gasPrice: GasPrice
    }>({ gasPrice: defaultGasPrice.gasPrice, option: GasOptions.LOW })

    const siteOrigin = txnData?.origin as string | undefined
    const siteLogo = useSiteLogo(siteOrigin)

    const nativeFeeDenom = useNativeFeeDenom(rootDenomsStore.allDenoms, activeChain, activeNetwork)

    const nativeFeeToken = useMemo(() => {
      if (!nativeFeeDenom) {
        return undefined
      }

      return (assets ?? []).find(
        (asset) => asset?.coinMinimalDenom === nativeFeeDenom.coinMinimalDenom,
      )
    }, [assets, nativeFeeDenom])

    useEffect(() => {
      rootBalanceStore.loadBalances(activeChain, activeNetwork)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChain, activeNetwork])

    useEffect(() => {
      ;(async function fetchGasEstimate() {
        if (txnData.signTxnData.gas) {
          setRecommendedGasLimit(Number(txnData.signTxnData.gas))
          return
        }

        try {
          setIsLoadingGasLimit(true)
          let gasUsed = defaultGasLimit

          if (txnData.signTxnData.params) {
            const _gasUsed = await SeiEvmTx.ExecuteEthEstimateGas(
              txnData.signTxnData.params,
              evmJsonRpc,
            )

            gasUsed = Math.ceil(Number(_gasUsed))
          } else {
            const fromEthAddress = pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain])

            gasUsed = await SeiEvmTx.SimulateTransaction(
              txnData.signTxnData.to,
              txnData.signTxnData.value,
              evmJsonRpc,
              txnData.signTxnData.data,
              undefined,
              fromEthAddress,
            )
          }

          setRecommendedGasLimit(gasUsed)
        } catch (_) {
          setRecommendedGasLimit(defaultGasLimit)
        } finally {
          setIsLoadingGasLimit(false)
        }
      })()
    }, [
      activeChain,
      activeWallet?.pubKeys,
      defaultGasLimit,
      evmJsonRpc,
      gasAdjustment,
      txnData.signTxnData.data,
      txnData.signTxnData.gas,
      txnData.signTxnData.params,
      txnData.signTxnData.to,
      txnData.signTxnData.value,
    ])

    useEffect(() => {
      function resetGasPriceError() {
        if (
          gasPriceError?.includes('Max fee per gas is less than the block base fee') ||
          gasPriceError?.includes('Insufficient funds to cover gas and transaction amount.')
        ) {
          setGasPriceError('')
        }
      }

      async function compareAgainstBlockBaseFee() {
        if (gasPriceStatus === 'loading' || !gasPriceOption?.gasPrice?.amount) {
          resetGasPriceError()
          return
        }

        const latestBaseFeePerGas = await SeiEvmTx.BlockBaseFee(evmJsonRpc)

        if (
          latestBaseFeePerGas &&
          new BigNumber(gasPriceOption.gasPrice.amount.toString()).lt(latestBaseFeePerGas)
        ) {
          setGasPriceError(
            'Max fee per gas is less than the block base fee. Please increase the gas fee.',
          )
          return
        }

        const amount = txnData.signTxnData.value
        const gasAmount = new BigNumber(userPreferredGasLimit || recommendedGasLimit).multipliedBy(
          gasPriceOption.gasPrice.amount.toString(),
        )

        const decimals = isCompassWallet() ? 18 : Number(nativeFeeToken?.coinDecimals ?? 18)
        if (
          nativeFeeToken &&
          !!amount &&
          Number(amount) !== 0 &&
          gasAmount
            .plus(parseUnits(Number(amount).toFixed(decimals), decimals).toString())
            .gt(parseUnits(Number(nativeFeeToken.amount).toFixed(decimals), decimals).toString())
        ) {
          setGasPriceError(`Insufficient funds to cover gas and transaction amount.`)
          return
        }

        resetGasPriceError()
      }

      compareAgainstBlockBaseFee()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      evmJsonRpc,
      gasPriceOption,
      gasPriceStatus,
      nativeFeeToken,
      recommendedGasLimit,
      txnData.signTxnData.value,
      userPreferredGasLimit,
    ])

    const refetchData = useCallback(() => {
      setTimeout(() => {
        rootBalanceStore.refetchBalances(activeChain, activeNetwork)
      }, 3000)
    }, [activeChain, activeNetwork, rootBalanceStore])

    const handleApproveClick = async () => {
      try {
        if (activeWallet.walletType === WALLETTYPE.LEDGER && activeWallet.app !== 'sei') {
          throw new Error(SEI_EVM_LEDGER_ERROR_MESSAGE)
        }

        setSigningError(null)
        setTxStatus('loading')

        const wallet = (await getWallet(activeChain, true)) as unknown as EthWallet

        const seiEvmTx = SeiEvmTx.GetSeiEvmClient(wallet, evmJsonRpc ?? '', Number(evmChainId))
        if (activeWallet.walletType === WALLETTYPE.LEDGER) {
          setShowLedgerPopup(true)
        }

        const result = await seiEvmTx.sendTransaction(
          '',
          txnData.signTxnData.to,
          txnData.signTxnData.value,
          parseInt(Number(userPreferredGasLimit || recommendedGasLimit).toString()),
          parseInt(gasPriceOption.gasPrice.amount.toString()),
          txnData.signTxnData.data,
        )

        try {
          const evmTxHash = result.hash
          const feeQuantity = new BigNumber(
            Number(userPreferredGasLimit || recommendedGasLimit).toString(),
          )
            .multipliedBy(gasPriceOption.gasPrice.amount.toString())
            .dividedBy(isCompassWallet() ? 1e12 : 1)
            .toFixed(0)
          const feeDenomination = nativeFeeDenom.coinMinimalDenom

          if (chainInfo?.evmOnlyChain) {
            await txPostToDb({
              txType: CosmosTxType.Dapp,
              txHash: evmTxHash,
              metadata: { ...globalTxMeta, dapp_url: siteOrigin ?? origin },
              address: pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain]),
              chain: activeChain,
              network: activeNetwork,
              isEvmOnly: true,
              feeQuantity,
              feeDenomination,
            })
          } else {
            const cosmosTxHash = await SeiEvmTx.GetCosmosTxHash(evmTxHash, evmJsonRpc ?? '')
            await txPostToDb({
              txType: CosmosTxType.Dapp,
              txHash: cosmosTxHash,
              metadata: { ...globalTxMeta, dapp_url: siteOrigin ?? origin },
              address,
              chain: activeChain,
              network: activeNetwork,
              feeQuantity,
              feeDenomination,
            })
          }
        } catch {
          // Added here as the GetCosmosTxHash call is currently failing causing the send flow to break
        }

        setTxStatus('success')
        try {
          await Browser.runtime.sendMessage({
            type: MessageTypes.signSeiEvmResponse,
            payloadId: txnData?.payloadId,
            payload: { status: 'success', data: result.hash },
          })
        } catch {
          throw new Error('Could not send transaction to the dApp')
        }

        if (!donotClose) {
          if (isSidePanel()) {
            refetchData()
            navigate('/home')
          } else {
            window.close()
          }
        } else {
          handleTxnListUpdate()
        }
      } catch (error: any) {
        if (error instanceof LedgerError) {
          setSigningError(error.message)
          error.message === txDeclinedErrorUser.message &&
            handleRejectClick(navigate, txnData?.payloadId, donotClose)
          return
        }

        setTxStatus('error')
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong.'
        if (errorMessage.includes('intrinsic gas too low')) {
          setSigningError('Please try again with higher gas fee.')
          return
        }

        setSigningError(errorMessage)
        captureException(error, {
          tags: uiErrorTags,
        })
      }
    }

    if (
      (!['done', 'unknown'].includes(addressLinkState) || chainInfo?.evmOnlyChain) &&
      evmBalanceStore.status === 'loading'
    ) {
      return (
        <SignTransactionWrapper
          className='bg-secondary-50'
          chainName={activeChain}
          origin={siteOrigin || 'Unknown site'}
          logo={siteLogo}
        >
          <Loading />
        </SignTransactionWrapper>
      )
    }

    const isApproveBtnDisabled =
      !!signingError ||
      txStatus === 'loading' ||
      !!gasPriceError ||
      isLoadingGasLimit ||
      gasPriceStatus === 'loading'

    return (
      <SignTransactionWrapper
        className='bg-secondary-50'
        chainName={activeChain}
        origin={siteOrigin || 'Unknown site'}
        logo={siteLogo}
      >
        <GasPriceOptions
          className='-mx-6 panel-width mt-5 flex flex-col gap-6'
          gasLimit={userPreferredGasLimit || recommendedGasLimit?.toString()}
          setGasLimit={(value: string | number | BigNumber) =>
            setUserPreferredGasLimit(value.toString())
          }
          recommendedGasLimit={recommendedGasLimit?.toString()}
          gasPriceOption={gasPriceOption}
          onGasPriceOptionChange={(value: any) => setGasPriceOption(value)}
          error={gasPriceError}
          setError={setGasPriceError}
          considerGasAdjustment={false}
          chain={activeChain}
          network={activeNetwork}
          isSelectedTokenEvm={isEvmTokenExist}
          isSeiEvmTransaction={true}
        >
          <TabList gasPriceError={gasPriceError} txData={txnData?.signTxnData?.details} />
        </GasPriceOptions>

        {signingError && txStatus === 'error' ? (
          <ErrorCard text={signingError} className='mt-3' />
        ) : null}

        {txStatus !== 'error' && showLedgerPopup ? (
          <LedgerConfirmationModal
            showLedgerPopup={showLedgerPopup}
            onClose={() => setShowLedgerPopup(false)}
          />
        ) : null}

        <div className='flex items-center justify-center w-full gap-4 mt-auto [&>*]:flex-1 p-4 sticky bottom-0'>
          <Button
            variant={'mono'}
            onClick={() => {
              handleRejectClick(navigate, txnData?.payloadId, donotClose)

              if (donotClose) {
                handleTxnListUpdate()
              }
            }}
            disabled={txStatus === 'loading'}
          >
            Reject
          </Button>

          <Button
            onClick={handleApproveClick}
            disabled={isApproveBtnDisabled}
            className={`${isApproveBtnDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {txStatus === 'loading' ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      </SignTransactionWrapper>
    )
  },
)
