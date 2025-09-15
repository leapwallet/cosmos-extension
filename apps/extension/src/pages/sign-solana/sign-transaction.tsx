/* eslint-disable @typescript-eslint/no-explicit-any */
import { AptosApiError } from '@aptos-labs/ts-sdk'
import { StdFee } from '@cosmjs/stargate'
import {
  CosmosTxType,
  GasOptions,
  Key,
  LeapWalletApi,
  useActiveWallet,
  useChainApis,
  useChainInfo,
  useChainsStore,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useNativeFeeDenom,
  useTxMetadata,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  chainIdToChain,
  ChainInfo,
  DefaultGasEstimates,
  GasPrice,
  NativeDenom,
  sleep,
  SolanaAccount,
  SolanaTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Avatar, Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { CheckSquare, Square } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import { QueryStatus } from '@tanstack/react-query'
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
import { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { GenericDark, GenericLight } from 'images/logos'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import { addToConnections } from 'pages/ApproveConnection/utils'
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
import { NotAllowSignTxGasOptions } from './additional-fee-settings'
import StaticFeeDisplay from './static-fee-display'
import { mapWalletTypeToMixpanelWalletType, mixpanelTrackOptions } from './utils/mixpanel-config'
//   import { NotAllowSignTxGasOptions } from './additional-fee-settings'
//   import StaticFeeDisplay from './static-fee-display'
import { getOriginalSignDoc, getSolanaSignDoc } from './utils/sign-solana'

const useGetWallet = Wallet.useGetWallet
const useSolanaSigner = Wallet.useSolanaSigner

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
    const addressGenerationDone = useRef<boolean>(false)
    const { theme } = useTheme()

    const [showWalletSelector, setShowWalletSelector] = useState(false)
    const [showLedgerPopup, setShowLedgerPopup] = useState(false)
    const [signingError, setSigningError] = useState<string | null>(null)
    const [ledgerError] = useState<string | null>(null)
    const [gasPriceError, setGasPriceError] = useState<string | null>(null)
    const [selectedWallets, setSelectedWallets] = useState<[Key] | [] | Key[]>([])

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
    const solanaChainIds = ['101', '103']

    const chainInfo = useChainInfo(activeChain)
    const activeWallet = useActiveWallet()
    const getSolanaSigner = useSolanaSigner()
    const getWallet = useGetWallet(activeChain)
    const navigate = useNavigate()
    const { chains } = useChainsStore()
    const updateKeyStore = useUpdateKeyStore()

    const selectedNetwork = useMemo(() => {
      return chainId === 'solana:devnet' ? 'testnet' : 'mainnet'
    }, [chainId])

    const denoms = rootDenomsStore.allDenoms
    const defaultGasPrice = useDefaultGasPrice(denoms, { activeChain })
    const nativeFeeDenom = useNativeFeeDenom(denoms, activeChain, selectedNetwork)
    const txPostToDb = LeapWalletApi.useLogCosmosDappTx()
    const selectedGasOptionRef = useRef(false)
    const [isFeesValid, setIsFeesValid] = useState<boolean | null>(null)
    const [highFeeAccepted, setHighFeeAccepted] = useState<boolean>(false)
    const globalTxMeta = useTxMetadata()
    const { lcdUrl, rpcUrl } = useChainApis(activeChain, selectedNetwork)
    const activeChainfeeTokensStore = feeTokensStore.getStore(activeChain, selectedNetwork, false)
    const feeTokens = activeChainfeeTokensStore?.data

    const errorMessageRef = useRef<any>(null)

    useEffect(() => {
      async function generateAddresses() {
        const wallet = activeWallet
        if (!wallet || addressGenerationDone.current) return

        const chainsToGenerateAddresses = ['solana'].filter((chain) => {
          const hasAddress = selectedWallets?.[0]?.addresses?.[chain as SupportedChain]
          const hasPubKey = selectedWallets?.[0]?.pubKeys?.[chain as SupportedChain]
          return (chains[chain as SupportedChain] && !hasAddress) || !hasPubKey
        })

        if (!chainsToGenerateAddresses?.length) {
          return
        }

        const _chainInfos: Partial<Record<SupportedChain, ChainInfo>> = {}

        for await (const chain of chainsToGenerateAddresses) {
          _chainInfos[chain as SupportedChain] = chains[chain as SupportedChain]
        }
        const keyStore = await updateKeyStore(
          wallet,
          chainsToGenerateAddresses as SupportedChain[],
          'UPDATE',
          undefined,
          _chainInfos,
        )
        addressGenerationDone.current = true
        const newSelectedWallets = selectedWallets.map((wallet) => {
          if (!keyStore) return wallet
          const newWallet = keyStore[wallet.id]
          if (!newWallet) {
            return wallet
          }
          return newWallet
        })
        setSelectedWallets(newSelectedWallets)
      }

      generateAddresses()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const solanaClientPromise = useMemo(async () => {
      const solana = await getSolanaSigner(activeChain)
      const solanaClient = await SolanaTx.getSolanaClient(
        rpcUrl ?? '',
        solana as unknown as SolanaAccount,
        selectedNetwork,
        activeChain,
      )
      return solanaClient
    }, [activeChain, rpcUrl, getSolanaSigner, selectedNetwork])

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

    const {
      allowSetFee,
      message,
      signDoc,
      fee,
      defaultFee,
    }: {
      allowSetFee: boolean
      message: string
      signDoc: string | null | Uint8Array
      fee: StdFee | undefined
      defaultFee: StdFee | undefined
    } = useMemo(() => {
      if (isSignMessage) {
        const message = txnSigningRequest.signDoc.replace(
          'SIGNINMESSAGESOLANA',
          activeWallet.addresses[activeChain],
        )
        return {
          allowSetFee: false,
          message,
          signDoc: txnSigningRequest.signDoc.replace(
            'SIGNINMESSAGESOLANA',
            activeWallet.addresses[activeChain],
          ),
          fee: undefined,
          defaultFee: undefined,
        }
      }

      const { allowSetFee, updatedSignDoc, updatedFee, defaultFee } = getSolanaSignDoc({
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
      isSignMessage,
      txnSigningRequest,
      gasPriceOption.gasPrice,
      userPreferredGasLimit,
      nativeFeeDenom,
      activeWallet.addresses,
      activeChain,
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

      // try {
      //     mixpanel.track(
      //         EventName.DappTxnRejected,
      //         {
      //             dAppURL: siteOrigin,
      //             signMode: 'sign-solana',
      //             walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
      //             chainId: chainInfo.chainId,
      //             chainName: chainInfo.chainName,
      //             productVersion: browser.runtime.getManifest().version,
      //             time: Date.now() / 1000,
      //         },
      //         mixpanelTrackOptions,
      //     )
      // } catch (e) {
      //     captureException(e)
      // }

      await browser.runtime.sendMessage({
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

      const solanaClient = await solanaClientPromise
      setIsSigning(true)
      try {
        if (isSignMessage) {
          const signedTxData = await solanaClient.signMessage(signDoc as string)

          await sleep(100)

          try {
            // Check if there's an active connection for this dApp
            const storage = await browser.storage.local.get(['CONNECTIONS'])
            const connections = storage['CONNECTIONS'] || []
            const origin = siteOrigin || ''

            const isConnected = connections.some(
              (conn: any) =>
                conn.origin === origin &&
                conn.walletIds.includes(activeWallet.id) &&
                conn.chainIds.includes('101') &&
                conn.chainIds.includes('103'),
            )

            if (!isConnected && origin) {
              const selectedWalletIds = [activeWallet.id]
              await addToConnections(['101', '103'], selectedWalletIds, origin)
            }

            browser.runtime.sendMessage({
              type: MessageTypes.signResponse,
              payload: { status: 'success', data: { signedTxData, activeAddress } },
            })
          } catch (error) {
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
        const { tx: signedTxData, signature: txhash } = await solanaClient.signTransaction(signDoc)

        try {
          const feeQuantity =
            fee?.amount?.[0]?.amount && !new BigNumber(fee.amount[0].amount).isNaN()
              ? new BigNumber(fee.amount[0].amount).plus(5000).toString()
              : fee?.amount?.[0]?.amount
          await txPostToDb({
            txHash: txhash,
            txType: CosmosTxType.Dapp,
            metadata: {
              ...globalTxMeta,
              dapp_url: siteOrigin,
            },
            feeQuantity,
            feeDenomination: fee?.amount[0]?.denom ?? 'lamports',
            chain: activeChain,
            chainId,
            address: activeAddress,
            network: selectedNetwork,
            isSolana: true,
          })
        } catch (e) {
          captureException(e)
        }
        await sleep(100)

        if (!shouldSubmit) {
          try {
            // Check if there's an active connection for this dApp
            const storage = await browser.storage.local.get(['CONNECTIONS'])
            const connections = storage['CONNECTIONS'] || []
            const origin = siteOrigin || ''

            // Check if this origin is already connected to the active wallet
            solanaChainIds.every(async (chainId) => {
              const isConnected = connections.some(
                (conn: any) =>
                  conn.origin === origin &&
                  conn.walletIds.includes(activeWallet.id) &&
                  conn.chainIds.includes(chainId),
              )

              // If not connected, add the connection
              if (!isConnected && origin) {
                const selectedWalletIds = [activeWallet.id]
                await addToConnections([chainId], selectedWalletIds, origin)
                // Connection added successfully
              }
            })

            browser.runtime.sendMessage({
              type: MessageTypes.signResponse,
              payload: { status: 'success', data: signedTxData },
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

        const broadcastedTxn = await solanaClient.broadcastTransaction(signedTxData)

        try {
          const storage = await browser.storage.local.get(['CONNECTIONS'])
          const connections = storage['CONNECTIONS'] || []
          const origin = siteOrigin || ''

          const isConnected = connections.some(
            (conn: any) =>
              conn.origin === origin &&
              conn.walletIds.includes(activeWallet.id) &&
              conn.chainIds.includes('101'),
          )

          if (!isConnected && origin) {
            const selectedWalletIds = [activeWallet.id]
            await addToConnections(['101', '103'], selectedWalletIds, origin)
          }

          browser.runtime.sendMessage({
            type: MessageTypes.signResponse,
            payload: { status: 'success', data: broadcastedTxn },
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
        // if (!allowSetFee) {
        //     if (signDoc?.rawTransaction?.max_gas_amount !== undefined) {
        //         setRecommendedGasLimit(Number(signDoc?.rawTransaction?.max_gas_amount))
        //     }
        //     return
        // }
        try {
          setIsLoadingGasLimit(true)
          let gasUsed = defaultGasLimit

          const solana = await getSolanaSigner(activeChain)
          const solanaClient = await SolanaTx.getSolanaClient(
            rpcUrl ?? '',
            solana as unknown as SolanaAccount,
            selectedNetwork,
            activeChain,
          )

          const { unitsConsumed } = await solanaClient.simulateTx(signDoc as string)
          if (unitsConsumed) {
            gasUsed = Number(unitsConsumed)
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
    }, [activeChain, activeWallet?.pubKeys, defaultGasLimit, rpcUrl])

    //   useEffect(() => {
    //     if (!siteOrigin) return

    //     if (isDappTxnInitEventLogged.current) return

    //     try {
    //       if (!isCompassWallet()) {
    //         mixpanel.track(
    //           EventName.DappTxnInit,
    //           {
    //             dAppURL: siteOrigin,
    //             signMode: 'sign-solana',
    //             walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
    //             chainId: chainInfo.chainId,
    //             chainName: chainInfo.chainName,
    //             productVersion: browser.runtime.getManifest().version,
    //             time: Date.now() / 1000,
    //           },
    //           mixpanelTrackOptions,
    //         )
    //       }

    //       isDappTxnInitEventLogged.current = true
    //     } catch (e) {
    //       captureException(e)
    //     }
    //   }, [activeWallet.walletType, chainInfo.chainId, chainInfo.chainName, siteOrigin])

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

    const performMonitorProps = useMemo(() => {
      return {
        page: 'sign-solana-transaction',
        queryStatus: isApproveBtnDisabled ? 'loading' : ('success' as QueryStatus),
        op: 'signSolanaTransactionPageApproveBtnLoad',
        description: "Load time for solana sign transaction page's approve button",
        terminateProps: {
          maxDuration: 5000,
          logData: {
            tags: {
              isApproveBtnDisabled: isApproveBtnDisabled,
              dappFeeDenom: dappFeeDenom,
              signingError: !!signingError,
              gasPriceError: !!gasPriceError,
              isFeesValid: !!isFeesValid,
              highFeeAccepted: highFeeAccepted,
              isSigning: isSigning,
              isLoadingGasLimit: isLoadingGasLimit,
            },
            context: {
              dappFeeDenom: dappFeeDenom,
              signingError: signingError,
              gasPriceError: gasPriceError,
            },
          },
        },
      }
    }, [
      isApproveBtnDisabled,
      dappFeeDenom,
      signingError,
      gasPriceError,
      isFeesValid,
      highFeeAccepted,
      isSigning,
      isLoadingGasLimit,
    ])

    usePerformanceMonitor(performMonitorProps)

    return (
      <div
        className={classNames(
          'panel-width enclosing-panel h-full relative self-center justify-self-center flex justify-center items-center',
        )}
      >
        <div
          className={classNames(
            'relative w-full overflow-clip rounded-md border border-gray-300 dark:border-gray-900',
            { 'panel-height': isSidePanel() },
          )}
        >
          <PopupLayout
            className='flex flex-col'
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
                      // brandLogo={
                      //     isCompassWallet() ? (
                      //         <img
                      //             className='w-[24px] h-[24px] mr-1'
                      //             src={Images.Logos.CompassCircle}
                      //         />
                      //     ) : undefined
                      // }
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
                maxHeight: `calc(100% - 144px)`,
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
                          </div>
                        </>
                      ),
                      data: (
                        <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl'>
                          {JSON.stringify(
                            getOriginalSignDoc(signDoc, true).signDoc,
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

            <div className='py-3 px-7 dark:bg-black-100 bg-gray-50 w-full mt-auto'>
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
                  color={Colors.green600}
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
        const chainId = txnData.chainId ? txnData.chainId : '101'
        const chain = chainId ? (_chainIdToChain['101'] as SupportedChain) : undefined
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

const signTxSolana = withTxnSigningRequest(React.memo(SignTransaction))

export default signTxSolana
