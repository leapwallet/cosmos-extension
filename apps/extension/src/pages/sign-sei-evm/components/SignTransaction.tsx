/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CosmosTxType,
  GasOptions,
  hasToAddEvmDetails,
  LeapWalletApi,
  useActiveChain,
  useActiveWallet,
  useAddress,
  useChainApis,
  useChainId,
  useChainInfo,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useGetEvmGasPrices,
  useLastEvmActiveChain,
  useSeiLinkedAddressState,
  useSelectedNetwork,
  useTxMetadata,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  DefaultGasEstimates,
  GasPrice,
  pubKeyToEvmAddressToShow,
  SeiEvmTx,
} from '@leapwallet/cosmos-wallet-sdk'
import { EvmBalanceStore, RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { EthWallet } from '@leapwallet/leap-keychain'
import { Avatar, Buttons, Header } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Tooltip from 'components/better-tooltip'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import PopupLayout from 'components/layout/popup-layout'
import LedgerConfirmationModal from 'components/ledger-confirmation/confirmation-modal'
import { LoaderAnimation } from 'components/loader/Loader'
import { Tabs } from 'components/tabs'
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from 'config/constants'
import { MessageTypes } from 'config/message-types'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { TransactionStatus } from 'types/utility'
import { assert } from 'utils/assert'
import { formatWalletName } from 'utils/formatWalletName'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import { trim } from 'utils/strings'
import Browser from 'webextension-polyfill'

import { Loading } from '../SignSeiEvmTransaction'
import { handleRejectClick } from '../utils'

const useGetWallet = Wallet.useGetWallet

export type SignTransactionProps = {
  txnData: Record<string, any>
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  evmBalanceStore: EvmBalanceStore
}

export const SignTransaction = observer(
  ({ txnData, rootDenomsStore, rootBalanceStore, evmBalanceStore }: SignTransactionProps) => {
    const getWallet = useGetWallet()
    const lastEvmActiveChain = useLastEvmActiveChain()
    const _activeChain = useActiveChain()
    const activeChain = isCompassWallet() ? _activeChain : lastEvmActiveChain

    const { addressLinkState } = useSeiLinkedAddressState(getWallet)
    const evmBalance = evmBalanceStore.evmBalance
    const chainInfo = useChainInfo(activeChain)
    const activeWallet = useActiveWallet()
    const activeNetwork = useSelectedNetwork()
    const allAssets = rootBalanceStore.getBalancesForChain(activeChain)
    const [showLedgerPopup, setShowLedgerPopup] = useState(false)

    const assets = useMemo(() => {
      let _assets = allAssets
      const addEvmDetails = hasToAddEvmDetails(
        isCompassWallet(),
        addressLinkState,
        chainInfo?.evmOnlyChain ?? false,
      )

      if (addEvmDetails) {
        _assets = [..._assets, ...(evmBalance.evmBalance ?? [])].filter((token) =>
          new BigNumber(token.amount).gt(0),
        )
      }

      return _assets
    }, [addressLinkState, allAssets, chainInfo?.evmOnlyChain, evmBalance.evmBalance])

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
    const walletName = useMemo(() => {
      return formatWalletName(activeWallet.name)
    }, [activeWallet.name])
    const navigate = useNavigate()

    const address = useAddress(activeChain)
    const evmChainId = useChainId(activeChain, activeNetwork, true)
    const { evmJsonRpc } = useChainApis(activeChain, activeNetwork)
    const defaultGasPrice = useDefaultGasPrice(rootDenomsStore.allDenoms, {
      activeChain,
      isSeiEvmTransaction: true,
    })
    const { status: gasPriceStatus } = useGetEvmGasPrices()

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
    const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2)
    const siteLogo = useSiteLogo(siteOrigin)

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

    if (
      ((isCompassWallet() && !['done', 'unknown'].includes(addressLinkState)) ||
        chainInfo?.evmOnlyChain) &&
      evmBalanceStore.evmBalance.status === 'loading'
    ) {
      return <Loading />
    }

    const refetchData = useCallback(() => {
      setTimeout(() => {
        rootBalanceStore.refetchBalances(activeChain)
        evmBalanceStore.loadEvmBalance(activeChain)
      }, 3000)
    }, [activeChain, evmBalanceStore, rootBalanceStore])

    const handleApproveClick = async () => {
      try {
        if (activeWallet.walletType === WALLETTYPE.LEDGER) {
          if (chainInfo?.evmOnlyChain) {
            setShowLedgerPopup(true)
          } else {
            throw new Error(SEI_EVM_LEDGER_ERROR_MESSAGE)
          }
        }

        setSigningError(null)
        setTxStatus('loading')

        const wallet = (await getWallet(activeChain, true)) as unknown as EthWallet

        const seiEvmTx = SeiEvmTx.GetSeiEvmClient(wallet, evmJsonRpc ?? '', Number(evmChainId))
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

          if (chainInfo?.evmOnlyChain) {
            txPostToDb({
              txType: CosmosTxType.Dapp,
              txHash: evmTxHash,
              metadata: { ...globalTxMeta, dapp_url: siteOrigin ?? origin },
              address: pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[activeChain]),
              chain: activeChain,
              isEvmOnly: true,
            })
          } else {
            const cosmosTxHash = await SeiEvmTx.GetCosmosTxHash(evmTxHash, evmJsonRpc ?? '')
            txPostToDb({
              txType: CosmosTxType.Dapp,
              txHash: cosmosTxHash,
              metadata: { ...globalTxMeta, dapp_url: siteOrigin ?? origin },
              address,
              chain: activeChain,
            })
          }
        } catch {
          // Added here as the GetCosmosTxHash call is currently failing causing the send flow to break
        }

        setTxStatus('success')
        try {
          Browser.runtime.sendMessage({
            type: MessageTypes.signSeiEvmResponse,
            payload: { status: 'success', data: result.hash },
          })
        } catch {
          throw new Error('Could not send transaction to the dApp')
        }

        if (isSidePanel()) {
          refetchData()
          navigate('/home')
        } else {
          window.close()
        }
      } catch (error) {
        setTxStatus('error')
        setSigningError((error as Error).message)
      }
    }

    const isApproveBtnDisabled =
      !!signingError ||
      txStatus === 'loading' ||
      !!gasPriceError ||
      isLoadingGasLimit ||
      gasPriceStatus === 'loading'

    return (
      <div
        className={classNames(
          'panel-width enclosing-panel h-full relative self-center justify-self-center flex justify-center items-center',
          { 'mt-2': !isSidePanel() },
        )}
      >
        <div
          className={classNames(
            'relative w-full overflow-clip rounded-md border border-gray-300 dark:border-gray-900',
            { 'panel-height': isSidePanel() },
          )}
        >
          <PopupLayout
            header={
              <div className='w-[396px]'>
                <Header
                  imgSrc={chainInfo.chainSymbolImageUrl ?? GenericLight}
                  title={
                    <Buttons.Wallet
                      brandLogo={
                        isCompassWallet() ? (
                          <img
                            className='w-[24px] h-[24px] mr-1'
                            src={Images.Logos.CompassCircle}
                          />
                        ) : undefined
                      }
                      title={trim(walletName, 10)}
                      className='pr-4 cursor-default'
                    />
                  }
                />
              </div>
            }
          >
            <div className='px-7 py-3 overflow-y-auto relative h-[calc(100%-150px)]'>
              <h2 className='text-center text-lg font-bold dark:text-white-100 text-gray-900 w-full'>
                Approve Transaction
              </h2>
              <div className='flex items-center mt-3 rounded-2xl dark:bg-gray-900 bg-white-100 p-4'>
                <Avatar
                  avatarImage={siteLogo}
                  avatarOnError={imgOnError(Images.Misc.Globe)}
                  size='sm'
                  className='rounded-full overflow-hidden'
                />
                <div className='ml-3'>
                  <p className='capitalize text-gray-900 dark:text-white-100 text-base font-bold'>
                    {siteName}
                  </p>
                  <p className='lowercase text-gray-500 dark:text-gray-400 text-xs font-medium'>
                    {siteOrigin}
                  </p>
                </div>
              </div>

              <GasPriceOptions
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
                isSelectedTokenEvm={isEvmTokenExist}
                isSeiEvmTransaction={true}
                rootDenomsStore={rootDenomsStore}
                rootBalanceStore={rootBalanceStore}
              >
                <Tabs
                  className='mt-3'
                  tabsList={[
                    { id: 'fees', label: 'Fees' },
                    { id: 'details', label: 'Details' },
                  ]}
                  tabsContent={{
                    fees: (
                      <div className='rounded-2xl p-4 mt-3 dark:bg-gray-900 bg-white-100'>
                        <div className='flex items-center'>
                          <p className='text-gray-500 dark:text-gray-100 text-sm font-medium tracking-wide'>
                            Gas Fees <span className='capitalize'>({gasPriceOption.option})</span>
                          </p>
                          <Tooltip
                            content={
                              <p className='text-gray-500 dark:text-gray-100 text-sm'>
                                You can choose higher gas fees for faster transaction processing.
                              </p>
                            }
                          >
                            <div className='relative ml-2'>
                              <img src={Images.Misc.InfoCircle} alt='Hint' />
                            </div>
                          </Tooltip>
                        </div>

                        <GasPriceOptions.Selector className='mt-2' />
                        <div className='flex items-center justify-end'>
                          <GasPriceOptions.AdditionalSettingsToggle className='p-0 mt-3' />
                        </div>
                        <GasPriceOptions.AdditionalSettings
                          className='mt-2'
                          showGasLimitWarning={true}
                          rootDenomsStore={rootDenomsStore}
                          rootBalanceStore={rootBalanceStore}
                        />

                        {gasPriceError ? (
                          <p className='text-red-300 text-sm font-medium mt-2 px-1'>
                            {gasPriceError}
                          </p>
                        ) : null}
                      </div>
                    ),
                    details: (
                      <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl'>
                        {JSON.stringify(
                          txnData.signTxnData.details,
                          (_, value) => (typeof value === 'bigint' ? value.toString() : value),
                          2,
                        )}
                      </pre>
                    ),
                  }}
                />
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
            </div>

            <div className='absolute bottom-0 left-0 py-3 px-7 dark:bg-black-100 bg-gray-50 w-full'>
              <div className='flex items-center justify-center w-full space-x-3'>
                <Buttons.Generic
                  title='Reject Button'
                  color={Colors.gray900}
                  onClick={() => handleRejectClick(navigate)}
                  disabled={txStatus === 'loading'}
                >
                  Reject
                </Buttons.Generic>

                <Buttons.Generic
                  title='Approve Button'
                  color={Colors.getChainColor(activeChain)}
                  onClick={handleApproveClick}
                  disabled={isApproveBtnDisabled}
                  className={`${isApproveBtnDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {txStatus === 'loading' ? <LoaderAnimation color='white' /> : 'Approve'}
                </Buttons.Generic>
              </div>
            </div>
          </PopupLayout>
        </div>
      </div>
    )
  },
)
