/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AccountAuthenticatorEd25519,
  AptosApiError,
  Ed25519PublicKey,
  generateUserTransactionHash,
  Serializer,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk'
import { StdFee } from '@cosmjs/stargate'
import {
  CosmosTxType,
  GasOptions,
  LeapWalletApi,
  useActiveWallet,
  useChainApis,
  useChainInfo,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useNativeFeeDenom,
  useTxMetadata,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  AptosTx,
  chainIdToChain,
  DefaultGasEstimates,
  GasPrice,
  NativeDenom,
  sleep,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Avatar, Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { CheckSquare, Square } from '@phosphor-icons/react'
import { base64 } from '@scure/base'
import { captureException } from '@sentry/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Tooltip from 'components/better-tooltip'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import PopupLayout from 'components/layout/popup-layout'
import LedgerConfirmationModal from 'components/ledger-confirmation/confirmation-modal'
import { LoaderAnimation } from 'components/loader/Loader'
import SelectWalletSheet from 'components/select-wallet-sheet'
import { Tabs } from 'components/tabs'
import Text from 'components/text'
import { walletLabels } from 'config/constants'
import { MessageTypes } from 'config/message-types'
import { BG_RESPONSE } from 'config/storage-keys'
import { decodeChainIdToChain } from 'extension-scripts/utils'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { GenericDark, GenericLight } from 'images/logos'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { feeTokensStore } from 'stores/fee-store'
import { rootBalanceStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { assert } from 'utils/assert'
import { formatWalletName } from 'utils/formatWalletName'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import { trim } from 'utils/strings'
import browser from 'webextension-polyfill'

import { EventName } from '../../config/analytics'
import { isCompassWallet } from '../../utils/isCompassWallet'
import { NotAllowSignTxGasOptions } from './additional-fee-settings'
import StaticFeeDisplay from './static-fee-display'
import { mapWalletTypeToMixpanelWalletType, mixpanelTrackOptions } from './utils/mixpanel-config'
import { getAptosSignDoc } from './utils/sign-aptos'

const useGetWallet = Wallet.useGetWallet
const useAptosSigner = Wallet.useAptosSigner

type SignTransactionProps = {
  data: Record<string, any>
  chainId: string
  rootBalanceStore: RootBalanceStore
  rootDenomsStore: RootDenomsStore
  activeChain: SupportedChain
}

const SignTransaction = observer(
  ({
    data: txnSigningRequest,
    chainId,
    rootBalanceStore,
    rootDenomsStore,
    activeChain,
  }: SignTransactionProps) => {
    const isDappTxnInitEventLogged = useRef(false)
    const isRejectedRef = useRef(false)
    const isApprovedRef = useRef(false)
    const { theme } = useTheme()

    const [showWalletSelector, setShowWalletSelector] = useState(false)
    const [showLedgerPopup, setShowLedgerPopup] = useState(false)
    const [signingError, setSigningError] = useState<string | null>(null)
    const [ledgerError] = useState<string | null>(null)
    const [gasPriceError, setGasPriceError] = useState<string | null>(null)

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
    const [isLoadingGasLimit, setIsLoadingGasLimit] = useState<boolean>(false)
    const [recommendedGasLimit, setRecommendedGasLimit] = useState<number>(0)
    const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<string>('')
    const [isSigning, setIsSigning] = useState<boolean>(false)

    const chainInfo = useChainInfo(activeChain)
    const activeWallet = useActiveWallet()
    const getAptosSigner = useAptosSigner()
    const getWallet = useGetWallet(activeChain)
    const navigate = useNavigate()

    const selectedNetwork = useMemo(() => {
      return !!chainInfo?.testnetChainId && chainInfo?.testnetChainId === chainId
        ? 'testnet'
        : 'mainnet'
    }, [chainInfo?.testnetChainId, chainId])

    const denoms = rootDenomsStore.allDenoms
    const defaultGasPrice = useDefaultGasPrice(denoms, { activeChain })
    const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork)
    const txPostToDb = LeapWalletApi.useLogCosmosDappTx()
    const selectedGasOptionRef = useRef(false)
    const [isFeesValid, setIsFeesValid] = useState<boolean | null>(null)
    const [highFeeAccepted, setHighFeeAccepted] = useState<boolean>(false)
    const globalTxMeta = useTxMetadata()

    const activeChainfeeTokensStore = feeTokensStore.getStore(activeChain, selectedNetwork, false)
    const feeTokens = activeChainfeeTokensStore?.data

    const errorMessageRef = useRef<any>(null)

    useEffect(() => {
      // Check if the error message is rendered and visible
      if (!isFeesValid && errorMessageRef.current) {
        // Scroll the parent component to the error message
        setTimeout(() => {
          errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 10)
      }
    }, [isFeesValid])

    useEffect(() => {
      rootBalanceStore.loadBalances(activeChain, selectedNetwork)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChain, selectedNetwork])

    const [gasPriceOption, setGasPriceOption] = useState<{
      option: GasOptions
      gasPrice: GasPrice
    }>({ gasPrice: defaultGasPrice.gasPrice, option: GasOptions.LOW })

    assert(activeWallet !== null, 'activeWallet is null')

    const walletName = useMemo(() => {
      return activeWallet.walletType === WALLETTYPE.LEDGER
        ? `${walletLabels[activeWallet.walletType]} Wallet ${activeWallet.addressIndex + 1}`
        : formatWalletName(activeWallet.name)
    }, [activeWallet.addressIndex, activeWallet.name, activeWallet.walletType])

    const { shouldSubmit, isSignMessage, signOptions } = useMemo(() => {
      const shouldSubmit = txnSigningRequest?.submit
      const isSignMessage = txnSigningRequest?.isSignMessage
      const signOptions = txnSigningRequest?.signOptions
      return {
        shouldSubmit,
        isSignMessage,
        signOptions,
      }
    }, [txnSigningRequest])

    const { lcdUrl } = useChainApis(activeChain, selectedNetwork)

    const {
      allowSetFee,
      message,
      signDoc,
      fee,
      defaultFee,
    }: {
      allowSetFee: boolean
      message: string
      signDoc: SimpleTransaction
      fee: StdFee | undefined
      defaultFee: StdFee | undefined
    } = useMemo(() => {
      // Sign message parsing
      if (isSignMessage) {
        const message = txnSigningRequest.signDoc
          ?.split('\n')
          ?.find((line: string) => line.includes('message: '))
          ?.replace('message: ', '')
        return {
          allowSetFee: false,
          message,
          signDoc: txnSigningRequest.signDoc,
          fee: undefined,
          defaultFee: undefined,
        }
      }

      const { allowSetFee, updatedSignDoc, updatedFee, defaultFee } = getAptosSignDoc({
        signRequestData: txnSigningRequest,
        gasPrice: gasPriceOption.gasPrice,
        gasLimit: userPreferredGasLimit,
        isGasOptionSelected: selectedGasOptionRef.current,
        nativeFeeDenom: nativeFeeDenom,
      })

      return {
        allowSetFee,
        message: '',
        signDoc: updatedSignDoc,
        fee: updatedFee,
        defaultFee,
      }
    }, [
      txnSigningRequest,
      gasPriceOption.gasPrice,
      userPreferredGasLimit,
      nativeFeeDenom,
      isSignMessage,
    ])

    const siteOrigin = txnSigningRequest?.origin as string | undefined
    const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2)
    const siteLogo = useSiteLogo(siteOrigin)

    const refetchData = useCallback(() => {
      setTimeout(() => {
        rootBalanceStore.refetchBalances(activeChain, selectedNetwork)
      }, 3000)
    }, [activeChain, rootBalanceStore, selectedNetwork])

    const handleCancel = useCallback(async () => {
      if (isRejectedRef.current || isApprovedRef.current) return
      isRejectedRef.current = true

      if (!isCompassWallet()) {
        try {
          mixpanel.track(
            EventName.DappTxnRejected,
            {
              dAppURL: siteOrigin,
              signMode: 'sign-aptos',
              walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              productVersion: browser.runtime.getManifest().version,
              time: Date.now() / 1000,
            },
            mixpanelTrackOptions,
          )
        } catch (e) {
          captureException(e)
        }
      }

      browser.runtime.sendMessage({
        type: MessageTypes.signResponse,
        payload: { status: 'error', data: 'Transaction cancelled by the user.' },
      })
      if (isSidePanel()) {
        navigate('/home')
      } else {
        await sleep(100)

        setTimeout(async () => {
          window.close()
        }, 10)
      }
    }, [siteOrigin, activeWallet.walletType, chainInfo.chainId, chainInfo.chainName, navigate])

    const currentWalletInfo = useMemo(() => {
      if (!activeWallet || !chainId || !siteOrigin) return undefined
      return {
        wallets: [activeWallet] as [typeof activeWallet],
        chainIds: [chainId] as [string],
        origin: siteOrigin,
      }
    }, [activeWallet, chainId, siteOrigin])

    const dappFeeDenom = useMemo(() => {
      if (defaultFee && defaultFee?.amount[0]) {
        const { denom } = defaultFee.amount[0]
        // calculate gas price based on recommended gas limit
        return denom
      }
      return defaultGasPrice.gasPrice.denom
    }, [defaultFee, defaultGasPrice.gasPrice])

    const approveTransaction = useCallback(async () => {
      const activeAddress = activeWallet.addresses[activeChain]
      if (!activeChain || !signDoc || !activeAddress) {
        return
      }
      setIsSigning(true)
      try {
        const aptosSigner = await getAptosSigner(activeChain)
        if (isSignMessage) {
          const signature = await aptosSigner.sign(signDoc as unknown as string)
          const serializer = new Serializer()
          signature.serialize(serializer)
          const data = Buffer.from(serializer.toUint8Array()).toString('hex')
          await sleep(100)

          try {
            browser.runtime.sendMessage({
              type: MessageTypes.signResponse,
              payload: { status: 'success', data },
            })
          } catch {
            throw new Error('Could not send transaction to the dApp')
          }
          setIsSigning(false)
          if (isSidePanel()) {
            refetchData()
            navigate('/home')
          } else {
            setTimeout(async () => {
              window.close()
            }, 10)
          }
          return
        }

        const data = await aptosSigner.signTransaction(signDoc)
        const accountAuthenticator = new AccountAuthenticatorEd25519(
          new Ed25519PublicKey(aptosSigner.publicKey.toUint8Array()),
          data,
        )
        const signedTxn = {
          transaction: signDoc,
          senderAuthenticator: accountAuthenticator,
        }
        const txHash = generateUserTransactionHash(signedTxn)
        try {
          await txPostToDb({
            txHash,
            txType: CosmosTxType.Dapp,
            metadata: {
              ...globalTxMeta,
              dapp_url: siteOrigin,
            },
            feeQuantity: fee?.amount[0]?.amount,
            feeDenomination: fee?.amount[0]?.denom,
            chain: activeChain,
            chainId,
            address: activeAddress,
            network: selectedNetwork,
            isAptos: true,
          })
        } catch (e) {
          captureException(e)
        }
        const serializer = new Serializer()
        accountAuthenticator.serialize(serializer)
        const txBytes = Buffer.from(serializer.toUint8Array()).toString('hex')
        await sleep(100)

        if (!shouldSubmit) {
          try {
            browser.runtime.sendMessage({
              type: MessageTypes.signResponse,
              payload: { status: 'success', data: txBytes },
            })
          } catch {
            throw new Error('Could not send transaction to the dApp')
          }
          setIsSigning(false)
          if (isSidePanel()) {
            refetchData()
            navigate('/home')
          } else {
            setTimeout(async () => {
              window.close()
            }, 10)
          }
          return
        }

        const aptosClient = await AptosTx.getAptosClient(lcdUrl ?? '', aptosSigner)
        const committedTxn = await aptosClient.signAndBroadcastTransaction(signDoc)

        try {
          browser.runtime.sendMessage({
            type: MessageTypes.signResponse,
            payload: { status: 'success', data: committedTxn.hash },
          })
        } catch {
          throw new Error('Could not send transaction to the dApp')
        }
        setIsSigning(false)
        if (isSidePanel()) {
          refetchData()
          navigate('/home')
        } else {
          setTimeout(async () => {
            window.close()
          }, 10)
        }
      } catch (e) {
        captureException(e)
        setIsSigning(false)
        setSigningError(
          (e as AptosApiError)?.data?.error_code ?? (e as Error)?.message ?? 'Unknown error',
        )
        setTimeout(() => {
          setSigningError(null)
        }, 3000)
      }
      return

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      activeWallet.addresses,
      selectedNetwork,
      activeChain,
      refetchData,
      signDoc,
      getWallet,
      siteOrigin,
      fee,
      txPostToDb,
      handleCancel,
      lcdUrl,
    ])

    useEffect(() => {
      window.addEventListener('beforeunload', handleCancel)
      browser.storage.local.remove(BG_RESPONSE)
      return () => {
        window.removeEventListener('beforeunload', handleCancel)
      }
    }, [handleCancel])

    useEffect(() => {
      async function fetchGasEstimate() {
        if (isSignMessage) {
          return
        }
        if (!allowSetFee) {
          if (signDoc?.rawTransaction?.max_gas_amount !== undefined) {
            setRecommendedGasLimit(Number(signDoc?.rawTransaction?.max_gas_amount))
          }
          return
        }
        try {
          setIsLoadingGasLimit(true)
          let gasUsed = defaultGasLimit

          const aptosSigner = await getAptosSigner(activeChain)
          const publicKey = new Ed25519PublicKey(
            base64.decode(activeWallet?.pubKeys?.[activeChain] ?? ''),
          )
          const aptosClient = await AptosTx.getAptosClient(lcdUrl ?? '', aptosSigner)
          const { gasEstimate } = await aptosClient.simulateTransaction(signDoc, publicKey)
          if (gasEstimate) {
            gasUsed = Number(gasEstimate)
          }

          setRecommendedGasLimit(gasUsed)
        } catch (_) {
          setRecommendedGasLimit(defaultGasLimit)
        } finally {
          setIsLoadingGasLimit(false)
        }
      }

      fetchGasEstimate()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChain, activeWallet?.pubKeys, defaultGasLimit, lcdUrl])

    useEffect(() => {
      if (!siteOrigin) return

      if (isDappTxnInitEventLogged.current) return

      try {
        if (!isCompassWallet()) {
          mixpanel.track(
            EventName.DappTxnInit,
            {
              dAppURL: siteOrigin,
              signMode: 'sign-aptos',
              walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              productVersion: browser.runtime.getManifest().version,
              time: Date.now() / 1000,
            },
            mixpanelTrackOptions,
          )
        }

        isDappTxnInitEventLogged.current = true
      } catch (e) {
        captureException(e)
      }
    }, [activeWallet.walletType, chainInfo.chainId, chainInfo.chainName, siteOrigin])

    usePerformanceMonitor({
      page: 'sign-aptos-transaction',
      queryStatus: txnSigningRequest ? 'success' : 'loading',
      op: 'signAptosTransactionPageLoad',
      description: 'Load tome for sign aptos transaction page',
    })

    const disableBalanceCheck = useMemo(() => {
      return !!fee?.granter || !!fee?.payer || !!signOptions?.disableBalanceCheck
    }, [fee?.granter, fee?.payer, signOptions?.disableBalanceCheck])

    const isApproveBtnDisabled =
      !dappFeeDenom ||
      !!signingError ||
      !!gasPriceError ||
      (isFeesValid === false && !highFeeAccepted) ||
      isLoadingGasLimit ||
      isSigning

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
                  imgSrc={
                    chainInfo.chainSymbolImageUrl ??
                    (theme === ThemeName.DARK ? GenericDark : GenericLight)
                  }
                  imgOnError={imgOnError(theme === ThemeName.DARK ? GenericDark : GenericLight)}
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
            <div
              className='px-7 py-3 overflow-y-auto relative'
              style={{
                height: `calc(100% - 144px)`,
              }}
            >
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

              {!isSignMessage ? (
                <GasPriceOptions
                  initialFeeDenom={dappFeeDenom}
                  gasLimit={userPreferredGasLimit || String(recommendedGasLimit)}
                  setGasLimit={(value: string | BigNumber | number) =>
                    setUserPreferredGasLimit(value.toString())
                  }
                  recommendedGasLimit={String(recommendedGasLimit)}
                  gasPriceOption={
                    selectedGasOptionRef.current || allowSetFee
                      ? gasPriceOption
                      : { ...gasPriceOption, option: '' as GasOptions }
                  }
                  onGasPriceOptionChange={(value: any) => {
                    selectedGasOptionRef.current = true
                    setGasPriceOption(value)
                  }}
                  error={gasPriceError}
                  setError={setGasPriceError}
                  considerGasAdjustment={false}
                  disableBalanceCheck={disableBalanceCheck}
                  fee={fee}
                  chain={activeChain}
                  network={selectedNetwork}
                  validateFee={true}
                  onInvalidFees={(_: NativeDenom, isFeesValid: boolean | null) => {
                    try {
                      if (isFeesValid === false) {
                        setIsFeesValid(false)
                      }
                    } catch (e) {
                      captureException(e)
                    }
                  }}
                  hasUserTouchedFees={!!selectedGasOptionRef?.current}
                  notUpdateInitialGasPrice={!allowSetFee}
                  rootDenomsStore={rootDenomsStore}
                  rootBalanceStore={rootBalanceStore}
                >
                  <Tabs
                    className='mt-3'
                    tabsList={[
                      { id: 'fees', label: 'Fees' },
                      { id: 'data', label: 'Data' },
                    ]}
                    tabsContent={{
                      fees: allowSetFee ? (
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
                      ) : (
                        <>
                          <div className='rounded-2xl p-4 mt-3 dark:bg-gray-900 bg-white-100'>
                            <StaticFeeDisplay
                              fee={fee}
                              error={gasPriceError}
                              setError={setGasPriceError}
                              disableBalanceCheck={disableBalanceCheck}
                              rootBalanceStore={rootBalanceStore}
                              activeChain={activeChain}
                              selectedNetwork={selectedNetwork}
                              feeTokensList={feeTokens}
                            />
                            <div className='flex items-center justify-end'>
                              <GasPriceOptions.AdditionalSettingsToggle className='p-0 mt-3' />
                            </div>
                            <NotAllowSignTxGasOptions
                              gasPriceOption={gasPriceOption}
                              gasPriceError={gasPriceError}
                            />
                          </div>
                        </>
                      ),
                      data: (
                        <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl'>
                          {JSON.stringify(
                            signDoc,
                            (_, value) => {
                              if (typeof value === 'bigint') {
                                return value.toString()
                              }
                              return value
                            },
                            2,
                          )}
                        </pre>
                      ),
                    }}
                  />
                </GasPriceOptions>
              ) : (
                <pre
                  className={classNames(
                    'text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl whitespace-pre-line break-words',
                  )}
                >
                  {message}
                </pre>
              )}

              <div className='mt-3'>
                {signingError ?? ledgerError ? (
                  <ErrorCard text={signingError ?? ledgerError ?? ''} />
                ) : null}
              </div>

              <LedgerConfirmationModal
                showLedgerPopup={showLedgerPopup}
                onClose={() => {
                  setShowLedgerPopup(false)
                }}
              />
              <SelectWalletSheet
                isOpen={showWalletSelector}
                onClose={() => setShowWalletSelector(false)}
                currentWalletInfo={currentWalletInfo}
                title='Select Wallet'
                activeChain={activeChain}
              />
              {isFeesValid === false && (
                <div
                  ref={errorMessageRef}
                  className='flex dark:bg-gray-900 bg-white-100 px-4 py-3 w-full rounded-2xl items-center mt-3'
                >
                  <div className='mr-3' onClick={() => setHighFeeAccepted(!highFeeAccepted)}>
                    {!highFeeAccepted ? (
                      <Square size={16} className='text-gray-700 cursor-pointer' />
                    ) : (
                      <CheckSquare
                        size={16}
                        className='cursor-pointer'
                        color={Colors.getChainColor(activeChain)}
                      />
                    )}
                  </div>

                  <Text size='sm' color='text-gray-400'>
                    The selected fee amount is unusually high.
                    <br />I confirm and agree to proceed
                  </Text>
                </div>
              )}
            </div>

            <div className='absolute bottom-0 left-0 py-3 px-7 dark:bg-black-100 bg-gray-50 w-full'>
              <div className='flex items-center justify-center w-full space-x-3'>
                <Buttons.Generic
                  title={'Reject Button'}
                  color={Colors.gray900}
                  onClick={handleCancel}
                >
                  Reject
                </Buttons.Generic>
                <Buttons.Generic
                  title={'Approve Button'}
                  color={Colors.getChainColor(activeChain)}
                  onClick={approveTransaction}
                  disabled={isApproveBtnDisabled}
                  className={`${isApproveBtnDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {isSigning ? 'Signing...' : 'Approve'}
                </Buttons.Generic>
              </div>
            </div>
          </PopupLayout>
        </div>
      </div>
    )
  },
)

/**
 * This HOC helps makes sure that the txn signing request is decoded and the chain is set
 */
const withTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const [chain, setChain] = useState<SupportedChain>()
    const [_chainIdToChain, setChainIdToChain] = useState(chainIdToChain)

    const [txnData, setTxnData] = useState<any | null>(null)
    const [chainId, setChainId] = useState<string>()
    const [error] = useState<{
      message: string
      code: string
    } | null>(null)

    const navigate = useNavigate()

    useEffect(() => {
      decodeChainIdToChain().then(setChainIdToChain).catch(captureException)
    }, [])

    const signTxEventHandler = (message: any, sender: any) => {
      if (sender.id !== browser.runtime.id) return
      if (message.type === MessageTypes.signTransaction) {
        const txnData = message.payload
        const chainId = txnData.chainId ? txnData.chainId : txnData.signDoc?.chainId
        const chain = chainId ? (_chainIdToChain[chainId] as SupportedChain) : undefined
        if (!chain) {
          browser.runtime.sendMessage({
            type: MessageTypes.signResponse,
            payload: { status: 'error', data: `Invalid chainId ${chainId}` },
          })
          if (isSidePanel()) {
            navigate('/home')
          } else {
            setTimeout(async () => {
              window.close()
            }, 10)
          }
          return
        }
        setChain(chain)
        setChainId(chainId)
        setTxnData(txnData)
      }
    }

    useEffect(() => {
      browser.runtime.sendMessage({ type: MessageTypes.signingPopupOpen })
      browser.runtime.onMessage.addListener(signTxEventHandler)
      return () => {
        browser.runtime.onMessage.removeListener(signTxEventHandler)
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (chain && txnData && chainId) {
      return (
        <Component
          data={txnData}
          chainId={chainId}
          activeChain={chain}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        />
      )
    }

    if (error) {
      const heading = ((code) => {
        switch (code) {
          case 'no-data':
            return 'No Transaction Data'
          default:
            return 'Something Went Wrong'
        }
      })(error.code)

      return (
        <PopupLayout
          className='self-center justify-self-center'
          header={<Header title='Sign Transaction' />}
        >
          <div className='h-full w-full flex flex-col gap-4 items-center justify-center'>
            <h1 className='text-red-300 text-2xl font-bold px-4 text-center'>{heading}</h1>
            <p className='text-black-100 dark:text-white-100 text-sm font-medium px-4 text-center'>
              {error.message}
            </p>
            <button
              className='mt-8 py-1 px-4 text-center text-sm font-medium dark:text-white-100 text-black-100 bg-indigo-300 rounded-full'
              onClick={() => {
                if (isSidePanel()) {
                  navigate('/home')
                } else {
                  window.close()
                }
              }}
            >
              Close Wallet
            </button>
          </div>
        </PopupLayout>
      )
    }

    return (
      <PopupLayout
        className='self-center justify-self-center'
        header={<Header title='Sign Transaction' />}
      >
        <div className='h-full w-full flex flex-col gap-4 items-center justify-center'>
          <LoaderAnimation color='white' />
        </div>
      </PopupLayout>
    )
  }

  Wrapped.displayName = `withTxnSigningRequest(${Component.displayName})`

  return Wrapped
}

const signTxAptos = withTxnSigningRequest(React.memo(SignTransaction))

export default signTxAptos
