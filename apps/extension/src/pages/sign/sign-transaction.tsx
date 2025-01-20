/* eslint-disable @typescript-eslint/no-explicit-any */
import { AminoSignResponse, OfflineAminoSigner, StdSignature, StdSignDoc } from '@cosmjs/amino'
import { DirectSignResponse, OfflineDirectSigner } from '@cosmjs/proto-signing'
import {
  convertObjectCasingFromCamelToSnake,
  DirectSignDocDecoder,
  MsgConverter,
  UnknownMessage,
} from '@leapwallet/buffer-boba'
import {
  GasOptions,
  LeapWalletApi,
  useActiveWallet,
  useChainInfo,
  useDappDefaultFeeStore,
  useDefaultGasEstimates,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  chainIdToChain,
  ethSign,
  ethSignEip712,
  GasPrice,
  LedgerError,
  NativeDenom,
  sleep,
  SupportedChain,
  transactionDeclinedError,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  EvmBalanceStore,
  RootBalanceStore,
  RootDenomsStore,
  RootStakeStore,
} from '@leapwallet/cosmos-wallet-store'
import { EthWallet } from '@leapwallet/leap-keychain'
import { Avatar, Buttons, Header } from '@leapwallet/leap-ui'
import {
  MessageParser,
  parfait,
  ParsedMessage,
  ParsedMessageType,
} from '@leapwallet/parser-parfait'
import { CheckSquare, Square } from '@phosphor-icons/react'
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
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { decodeChainIdToChain } from 'extension-scripts/utils'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import Long from 'long'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { evmBalanceStore } from 'stores/balance-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore, rootStakeStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { assert } from 'utils/assert'
import { formatWalletName } from 'utils/formatWalletName'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import { uiErrorTags } from 'utils/sentry'
import { trim } from 'utils/strings'
import { uint8ArrayToBase64 } from 'utils/uint8Utils'
import browser from 'webextension-polyfill'

import { EventName } from '../../config/analytics'
import { isCompassWallet } from '../../utils/isCompassWallet'
import { NotAllowSignTxGasOptions } from './additional-fee-settings'
import { useFeeValidation } from './fee-validation'
import { MemoInput } from './memo-input'
import MessageDetailsSheet from './message-details-sheet'
import MessageList from './message-list'
import StaticFeeDisplay from './static-fee-display'
import TransactionDetails from './transaction-details'
import { isGenericOrSendAuthzGrant } from './utils/is-generic-or-send-authz-grant'
import { mapWalletTypeToMixpanelWalletType, mixpanelTrackOptions } from './utils/mixpanel-config'
import { getAminoSignDoc } from './utils/sign-amino'
import { getDirectSignDoc, getProtoSignDocDecoder } from './utils/sign-direct'
import {
  getTxHashFromAminoSignResponse,
  getTxHashFromDirectSignResponse,
  logDirectTx,
  logSignAmino,
  logSignAminoInj,
} from './utils/tx-logger'

const useGetWallet = Wallet.useGetWallet

const messageParser = new MessageParser()

type SignTransactionProps = {
  data: Record<string, any>
  chainId: string
  isSignArbitrary: boolean
  rootBalanceStore: RootBalanceStore
  rootStakeStore: RootStakeStore
  evmBalanceStore: EvmBalanceStore
  rootDenomsStore: RootDenomsStore
  activeChain: SupportedChain
}

const SignTransaction = observer(
  ({
    data: txnSigningRequest,
    chainId,
    isSignArbitrary,
    rootBalanceStore,
    rootStakeStore,
    rootDenomsStore,
    activeChain,
  }: SignTransactionProps) => {
    const isDappTxnInitEventLogged = useRef(false)
    const isRejectedRef = useRef(false)
    const isApprovedRef = useRef(false)

    const [showWalletSelector, setShowWalletSelector] = useState(false)
    const [showMessageDetailsSheet, setShowMessageDetailsSheet] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState<{
      index: number
      parsed: ParsedMessage
      raw: null
    } | null>(null)
    const [showLedgerPopup, setShowLedgerPopup] = useState(false)
    const [ledgerError, setLedgerError] = useState<string>()
    const [signingError, setSigningError] = useState<string | null>(null)
    const [gasPriceError, setGasPriceError] = useState<string | null>(null)
    const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<string>('')
    const [userMemo, setUserMemo] = useState<string>('')

    const [checkedGrantAuthBox, setCheckedGrantAuthBox] = useState(false)
    const chainInfo = useChainInfo(activeChain)
    const activeWallet = useActiveWallet()
    const getWallet = useGetWallet(activeChain)
    const navigate = useNavigate()

    const selectedNetwork = useMemo(() => {
      return !!chainInfo?.testnetChainId && chainInfo?.testnetChainId === chainId
        ? 'testnet'
        : 'mainnet'
    }, [chainInfo?.testnetChainId, chainId])

    const allAssets = rootBalanceStore.getSpendableBalancesForChain(activeChain, selectedNetwork)
    const denoms = rootDenomsStore.allDenoms
    const defaultGasPrice = useDefaultGasPrice(denoms, { activeChain })
    const txPostToDb = LeapWalletApi.useLogCosmosDappTx()
    const defaultGasEstimates = useDefaultGasEstimates()
    const selectedGasOptionRef = useRef(false)
    const [isFeesValid, setIsFeesValid] = useState<boolean | null>(null)
    const [highFeeAccepted, setHighFeeAccepted] = useState<boolean>(false)

    const { setDefaultFee: setDappDefaultFee } = useDappDefaultFeeStore()

    const errorMessageRef = useRef<any>(null)
    const feeValidation = useFeeValidation(allAssets, denoms, activeChain)

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

    const { isAmino, isAdr36, ethSignType, signOptions, eip712Types } = useMemo(() => {
      const isAmino = !!txnSigningRequest?.isAmino
      const isAdr36 = !!txnSigningRequest?.isAdr36
      const ethSignType = txnSigningRequest?.ethSignType
      const eip712Types = txnSigningRequest?.eip712Types
      const signOptions = txnSigningRequest?.signOptions
      return { isAmino, isAdr36, ethSignType, signOptions, eip712Types }
    }, [txnSigningRequest])

    const [allowSetFee, messages, txnDoc, signDoc, fee, defaultFee, defaultMemo]: [
      boolean,
      (
        | {
            parsed: ParsedMessage
            raw: any
          }[]
        | null
      ),
      any,
      SignDoc | StdSignDoc,
      any,
      any,
      string,
    ] = useMemo(() => {
      if (isAmino) {
        const result = getAminoSignDoc({
          signRequestData: {
            'sign-request': txnSigningRequest,
          },
          gasPrice: gasPriceOption.gasPrice,
          gasLimit: userPreferredGasLimit,
          isAdr36: !!isAdr36,
          memo: userMemo,
          isGasOptionSelected: selectedGasOptionRef.current,
        })

        let parsedMessages

        if (isSignArbitrary) {
          parsedMessages = txnSigningRequest?.signOptions?.isADR36WithString
            ? Buffer.from(result.signDoc.msgs[0].value.data, 'base64').toString('utf-8')
            : result.signDoc.msgs[0].value.data
        } else if (ethSignType) {
          parsedMessages = [
            {
              raw: result.signDoc.msgs,
              parsed: {
                __type: 'sign/MsgSignData',
                message: result.signDoc.msgs[0].value.data,
              },
            },
          ]
        } else {
          parsedMessages = result.signDoc.msgs.map((msg: any) => {
            let convertedMessage
            try {
              convertedMessage = MsgConverter.convertFromAminoToDirect(msg.type, msg)
              if (!convertedMessage) throw new Error('unable to convert amino message to direct')
              return {
                raw: msg,
                parsed: messageParser.parse({
                  '@type': convertedMessage.typeUrl,
                  ...msg.value,
                }),
              }
            } catch (e) {
              return {
                raw: msg,
                parsed: {
                  __type: ParsedMessageType.Unimplemented,
                  message: msg,
                } as parfait.unimplemented,
              }
            }
          })
        }

        return [
          result.allowSetFee,
          parsedMessages,
          result.signDoc,
          result.signDoc,
          result.fee,
          result.defaultFee,
          result.defaultMemo,
        ]
      } else {
        const result = getDirectSignDoc({
          signRequestData: {
            'sign-request': txnSigningRequest,
          },
          gasPrice: gasPriceOption.gasPrice,
          gasLimit: userPreferredGasLimit,
          memo: userMemo,
          isGasOptionSelected: selectedGasOptionRef.current,
        })

        const docDecoder = getProtoSignDocDecoder({
          'sign-request': {
            signDoc: result.signDoc,
          },
        })

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const parsedMessages = docDecoder.txMsgs.map((msg: { unpacked: any; typeUrl: string }) => {
          if (msg instanceof UnknownMessage) {
            const raw = msg.toJSON()
            return {
              raw: raw,
              parsed: {
                __type: ParsedMessageType.Unimplemented,
                message: {
                  '@type': raw.type_url,
                  body: raw.value,
                },
              } as parfait.unimplemented,
            }
          }

          if (msg.unpacked.msg instanceof Uint8Array) {
            const base64String = uint8ArrayToBase64(msg.unpacked.msg)
            const decodedString = Buffer.from(base64String, 'base64').toString()
            try {
              const decodedJson = JSON.parse(decodedString)
              msg.unpacked.msg = decodedJson
            } catch {
              msg.unpacked.msg = decodedString
            }
          }

          const convertedMsg = convertObjectCasingFromCamelToSnake(
            (msg as unknown as { unpacked: any }).unpacked,
          )

          return {
            raw: {
              '@type': msg.typeUrl,
              ...convertedMsg,
            },
            parsed: messageParser.parse({
              '@type': msg.typeUrl,
              ...convertedMsg,
            }),
          }
        })
        return [
          result.allowSetFee,
          parsedMessages,
          docDecoder.toJSON(),
          result.signDoc,
          result.fee,
          result.defaultFee,
          result.defaultMemo,
        ]
      }
    }, [
      isAmino,
      txnSigningRequest,
      gasPriceOption.gasPrice,
      userPreferredGasLimit,
      isAdr36,
      userMemo,
      isSignArbitrary,
      ethSignType,
    ])

    const siteOrigin = txnSigningRequest?.origin as string | undefined
    const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2)
    const siteLogo = useSiteLogo(siteOrigin)

    const transactionTypes = useMemo(() => {
      if (Array.isArray(messages)) {
        return messages.map((msg) => msg.raw['@type'] ?? msg.raw['type']).filter(Boolean)
      }
      return undefined
    }, [messages])

    const refetchData = useCallback(() => {
      setTimeout(() => {
        rootBalanceStore.refetchBalances(activeChain, selectedNetwork)
        rootStakeStore.updateStake(activeChain, selectedNetwork, true)
      }, 3000)
    }, [activeChain, rootBalanceStore, rootStakeStore, selectedNetwork])

    const handleCancel = useCallback(async () => {
      if (isRejectedRef.current || isApprovedRef.current) return
      isRejectedRef.current = true

      if (!isCompassWallet()) {
        try {
          mixpanel.track(
            EventName.DappTxnRejected,
            {
              dAppURL: siteOrigin,
              transactionTypes,
              signMode: isAmino ? 'sign-amino' : 'sign-direct',
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
    }, [
      siteOrigin,
      transactionTypes,
      isAmino,
      activeWallet.walletType,
      chainInfo.chainId,
      chainInfo.chainName,
      navigate,
    ])

    const currentWalletInfo = useMemo(() => {
      if (!activeWallet || !chainId || !siteOrigin) return undefined
      return {
        wallets: [activeWallet] as [typeof activeWallet],
        chainIds: [chainId] as [string],
        origin: siteOrigin,
      }
    }, [activeWallet, chainId, siteOrigin])

    const recommendedGasLimit: string = useMemo(() => {
      if (defaultFee) {
        return 'gasLimit' in defaultFee ? defaultFee.gasLimit.toString() : defaultFee.gas.toString()
      }
      return defaultGasEstimates[activeChain].DEFAULT_GAS_IBC.toString()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChain, defaultFee])

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
      const skipFeeCheck = isSignArbitrary || ethSignType
      // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, no-unused-vars
      const onValidationFailed = (txFee: any) => () => {}

      if (!isAmino) {
        try {
          if (!skipFeeCheck) {
            let feeCheck: boolean | null = null
            const decodedTx = new DirectSignDocDecoder(signDoc as SignDoc)
            const fee = decodedTx.authInfo.fee
            if (!fee) {
              throw new Error('Transaction does not have fee')
            }
            try {
              feeCheck = await feeValidation(
                {
                  feeDenom: fee.amount[0].denom,
                  feeAmount: fee.amount[0].amount,
                  gaslimit: fee.gasLimit,
                  chain: activeChain,
                },
                onValidationFailed(fee),
              )
            } catch (e) {
              captureException(e)
            }
            if (feeCheck === false) {
              throw new Error(
                'Unusually high fees detected, could not process transaction. Please try again.',
              )
            }
          }

          const wallet = (await getWallet(activeChain)) as OfflineDirectSigner
          const data = await (async () => {
            try {
              if (typeof wallet.signDirect === 'function') {
                return wallet.signDirect(activeAddress, SignDoc.fromPartial(signDoc as any))
              }
              return null
            } catch (e) {
              captureException(e, {
                tags: uiErrorTags,
              })
              return null
            }
          })()

          if (!data) {
            throw new Error('Could not sign transaction')
          }

          isApprovedRef.current = true
          logDirectTx(
            data as DirectSignResponse,
            messages ?? [],
            siteOrigin ?? origin,
            fee,
            activeChain,
            activeWallet?.addresses[activeChain] as string,
            txPostToDb,
            txnDoc.chain_id,
            selectedNetwork,
          ).catch((e) => {
            captureException(e)
          })

          try {
            const txHash = getTxHashFromDirectSignResponse(data)

            if (!isCompassWallet()) {
              mixpanel.track(
                EventName.DappTxnApproved,
                {
                  dAppURL: siteOrigin,
                  transactionTypes: Array.isArray(messages)
                    ? messages?.map((msg) => msg.raw['@type'] ?? msg.raw['type']).filter(Boolean)
                    : [],
                  signMode: 'sign-direct',
                  walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
                  txHash,
                  chainId: chainInfo.chainId,
                  chainName: chainInfo.chainName,
                  productVersion: browser.runtime.getManifest().version,
                  time: Date.now() / 1000,
                },
                mixpanelTrackOptions,
              )
            }
          } catch (e) {
            captureException(e)
          }

          await sleep(100)

          try {
            browser.runtime.sendMessage({
              type: MessageTypes.signResponse,
              payload: { status: 'success', data },
            })
          } catch {
            throw new Error('Could not send transaction to the dApp')
          }
          if (isSidePanel()) {
            refetchData()
            navigate('/home')
          } else {
            setTimeout(async () => {
              window.close()
            }, 10)
          }
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === transactionDeclinedError) {
              handleCancel()
            } else {
              setSigningError(e.message)
            }
          }
        }
      } else {
        setSigningError(null)
        try {
          if (!skipFeeCheck) {
            let feeCheck = null
            try {
              const fee = (signDoc as StdSignDoc).fee
              feeCheck = await feeValidation(
                {
                  feeDenom: fee.amount[0].denom,
                  feeAmount: fee.amount[0].amount,
                  gaslimit: Long.fromString(fee.gas),
                  chain: activeChain,
                },
                onValidationFailed(fee),
              )
            } catch (e) {
              captureException(e)
            }

            if (feeCheck === false) {
              throw new Error(
                'Unusually high fees detected, could not process transaction. Please try again.',
              )
            }
          }

          const wallet = (await getWallet(
            activeChain,
            !!(ethSignType || eip712Types),
          )) as OfflineAminoSigner & {
            signAmino: (
              // eslint-disable-next-line no-unused-vars
              address: string,
              // eslint-disable-next-line no-unused-vars
              signDoc: StdSignDoc,
              // eslint-disable-next-line no-unused-vars
              options?: { extraEntropy?: boolean },
            ) => Promise<StdSignature>
          }
          if (activeWallet.walletType === WALLETTYPE.LEDGER) {
            setShowLedgerPopup(true)
          }
          const walletAccounts = await wallet.getAccounts()
          const publicKey = walletAccounts[0].pubkey

          const data = await (async () => {
            try {
              if (ethSignType) {
                return ethSign(
                  activeAddress,
                  wallet as unknown as EthWallet,
                  signDoc as StdSignDoc,
                  ethSignType,
                )
              }
              if (eip712Types) {
                return ethSignEip712(
                  activeAddress,
                  wallet as unknown as EthWallet,
                  signDoc as StdSignDoc,
                  eip712Types,
                )
              }
              return wallet.signAmino(activeAddress, signDoc as StdSignDoc, {
                extraEntropy: !signOptions?.enableExtraEntropy
                  ? false
                  : signOptions?.enableExtraEntropy,
              })
            } catch (e) {
              captureException(e, {
                tags: uiErrorTags,
              })
              return null
            }
          })()

          if (!data) {
            throw new Error('Could not sign transaction')
          }

          if (!isSignArbitrary) {
            try {
              if (chainInfo.bip44.coinType === '60' && activeChain === 'injective') {
                const evmChainId =
                  chainInfo.chainId === (signDoc as StdSignDoc).chain_id
                    ? chainInfo.evmChainId
                    : chainInfo.evmChainIdTestnet
                await logSignAminoInj(
                  data as AminoSignResponse,
                  publicKey,
                  txPostToDb,
                  evmChainId ?? '1',
                  activeChain,
                  activeAddress,
                  siteOrigin ?? origin,
                  selectedNetwork,
                )
              } else {
                await logSignAmino(
                  data as AminoSignResponse,
                  publicKey,
                  txPostToDb,
                  activeChain,
                  activeAddress,
                  siteOrigin ?? origin,
                  selectedNetwork,
                )
              }
            } catch (e) {
              captureException(e)
            }
          }

          try {
            const trackingData: Record<string, unknown> = {
              dAppURL: siteOrigin,
              transactionTypes: Array.isArray(messages)
                ? messages?.map((msg) => msg.raw['type']).filter(Boolean)
                : [],
              signMode: 'sign-amino',
              walletType: mapWalletTypeToMixpanelWalletType(activeWallet.walletType),
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              productVersion: browser.runtime.getManifest().version,
              time: Date.now() / 1000,
            }

            try {
              const txHash = getTxHashFromAminoSignResponse(data as AminoSignResponse, publicKey)
              trackingData.txHash = txHash
            } catch (_) {
              //
            }

            if (!isCompassWallet()) {
              mixpanel.track(EventName.DappTxnApproved, trackingData, mixpanelTrackOptions)
            }
          } catch (e) {
            captureException(e)
          }

          isApprovedRef.current = true
          await sleep(100)

          try {
            browser.runtime.sendMessage({
              type: MessageTypes.signResponse,
              payload: { status: 'success', data },
            })
          } catch {
            throw new Error('Could not send transaction to the dApp')
          }

          if (isSidePanel()) {
            refetchData()
            navigate('/home')
          } else {
            setTimeout(async () => {
              //await browser.storage.local.remove(SIGN_REQUEST)
              window.close()
            }, 10)
          }
        } catch (e) {
          if (e instanceof Error) {
            if (e instanceof LedgerError) {
              setLedgerError(e.message)
              e.message === transactionDeclinedError && handleCancel()
            } else {
              e.message === transactionDeclinedError ? handleCancel() : setSigningError(e.message)
            }
          }
        } finally {
          setShowLedgerPopup(false)
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      activeWallet.addresses,
      selectedNetwork,
      activeChain,
      refetchData,
      signDoc,
      isAmino,
      getWallet,
      siteOrigin,
      fee,
      txPostToDb,
      handleCancel,
      ethSignType,
    ])

    useEffect(() => {
      setDappDefaultFee(defaultFee)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultFee])

    useEffect(() => {
      window.addEventListener('beforeunload', handleCancel)
      browser.storage.local.remove(BG_RESPONSE)
      return () => {
        window.removeEventListener('beforeunload', handleCancel)
      }
    }, [handleCancel])

    useEffect(() => {
      if (!siteOrigin || !transactionTypes) return

      if (isDappTxnInitEventLogged.current) return

      try {
        if (!isCompassWallet()) {
          mixpanel.track(
            EventName.DappTxnInit,
            {
              dAppURL: siteOrigin,
              transactionTypes,
              signMode: isAmino ? 'sign-amino' : 'sign-direct',
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
    }, [
      activeWallet.walletType,
      chainInfo.chainId,
      chainInfo.chainName,
      isAmino,
      siteOrigin,
      transactionTypes,
    ])

    usePerformanceMonitor({
      page: 'sign-transaction',
      queryStatus: txnSigningRequest ? 'success' : 'loading',
      op: 'signTransactionPageLoad',
      description: 'Load tome for sign transaction page',
    })

    const hasToShowCheckbox = useMemo(() => {
      if (isSignArbitrary) {
        return ''
      }

      return Array.isArray(messages)
        ? isGenericOrSendAuthzGrant(
            Array.isArray(messages) ? messages?.map((msg) => msg.parsed) : null,
          )
        : ''
    }, [isSignArbitrary, messages])

    const disableBalanceCheck = useMemo(() => {
      return !!fee?.granter || !!fee?.payer || !!signOptions?.disableBalanceCheck
    }, [fee?.granter, fee?.payer, signOptions?.disableBalanceCheck])

    const isApproveBtnDisabled =
      !dappFeeDenom ||
      !!signingError ||
      !!gasPriceError ||
      (!!hasToShowCheckbox && checkedGrantAuthBox === false) ||
      (isFeesValid === false && !highFeeAccepted)

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
            <div
              className='px-7 py-3 overflow-y-auto relative'
              style={{
                height: `calc(100% - 72px - ${hasToShowCheckbox ? '152px' : '72px'})`,
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

              {!ethSignType && !isSignArbitrary && (
                <TransactionDetails
                  activeChain={activeChain}
                  selectedNetwork={selectedNetwork}
                  parsedMessages={
                    Array.isArray(messages) ? messages?.map((msg) => msg.parsed) : null
                  }
                />
              )}

              {!ethSignType && !isSignArbitrary ? (
                <GasPriceOptions
                  initialFeeDenom={dappFeeDenom}
                  gasLimit={userPreferredGasLimit || recommendedGasLimit}
                  setGasLimit={(value: string | BigNumber | number) =>
                    setUserPreferredGasLimit(value.toString())
                  }
                  recommendedGasLimit={recommendedGasLimit}
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
                  onInvalidFees={(feeTokenData: NativeDenom, isFeesValid: boolean | null) => {
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
                      //Hiding  memo for now.
                      //{ id: 'memo', label: 'Memo' },
                      {
                        id: 'messages',
                        label: `Messages${messages?.length ? ` (${messages.length})` : ''}`,
                      },
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
                              rootDenomsStore={rootDenomsStore}
                              rootBalanceStore={rootBalanceStore}
                              activeChain={activeChain}
                              selectedNetwork={selectedNetwork}
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
                      memo: (
                        <div className='mt-3'>
                          <MemoInput
                            disabled={!!defaultMemo}
                            memo={defaultMemo ? defaultMemo : userMemo}
                            setMemo={(memo) => {
                              setUserMemo(memo)
                            }}
                            activeChain={activeChain}
                          />
                          ) : (
                          <div>
                            <p className='text-gray-500 dark:text-gray-100 text-sm'>
                              No information available. The transaction can still be approved.
                            </p>
                          </div>
                          )
                        </div>
                      ),
                      messages: (
                        <div className='mt-3'>
                          {messages ? (
                            <MessageList
                              parsedMessages={messages.map((msg) => msg.parsed)}
                              onMessageSelect={(msg, index) => {
                                setSelectedMessage({
                                  index,
                                  parsed: messages[index].parsed,
                                  raw: messages[index].raw,
                                })
                                setShowMessageDetailsSheet(true)
                              }}
                            />
                          ) : (
                            <div>
                              <p className='text-gray-500 dark:text-gray-100 text-sm'>
                                No information available. The transaction can still be approved.
                              </p>
                            </div>
                          )}
                        </div>
                      ),
                      data: (
                        <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl'>
                          {JSON.stringify(
                            txnDoc,
                            (_, value) => (typeof value === 'bigint' ? value.toString() : value),
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
                    'text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl',
                    {
                      'whitespace-pre-line break-words': isSignArbitrary,
                    },
                  )}
                >
                  {isSignArbitrary && typeof messages === 'string'
                    ? (messages as unknown as string)
                    : JSON.stringify(
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        JSON.parse(Array.isArray(messages) ? messages?.[0].parsed?.message : null),
                        null,
                        2,
                      )}
                </pre>
              )}

              <div className='mt-3'>
                {signingError ?? ledgerError ? (
                  <ErrorCard text={signingError ?? ledgerError} />
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
              <MessageDetailsSheet
                isOpen={showMessageDetailsSheet}
                setIsOpen={setShowMessageDetailsSheet}
                onClose={() => setSelectedMessage(null)}
                message={selectedMessage}
                activeChain={activeChain}
                selectedNetwork={selectedNetwork}
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
              {hasToShowCheckbox && (
                <div className='flex flex-row items-start mb-3 border border-yellow-600 rounded-lg p-[4px]'>
                  <div
                    className='mr-2'
                    onClick={() => setCheckedGrantAuthBox(!checkedGrantAuthBox)}
                  >
                    {!checkedGrantAuthBox ? (
                      <Square size={16} className='text-gray-900 cursor-pointer relative'>
                        <span className='absolute w-[10px] h-[6px] bg-gray-900 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2' />
                      </Square>
                    ) : (
                      <CheckSquare
                        size={16}
                        className='cursor-pointer'
                        color={Colors.getChainColor(activeChain)}
                      />
                    )}
                  </div>

                  <Text color='text-gray-400 text-[15px]'>{hasToShowCheckbox}</Text>
                </div>
              )}

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
                  Approve
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
    const [isSignArbitrary, setIsSignArbitrary] = useState(false)

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
        if (txnData.signOptions.isSignArbitrary) {
          setIsSignArbitrary(true)
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
          isSignArbitrary={isSignArbitrary}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
          evmBalanceStore={evmBalanceStore}
          rootStakeStore={rootStakeStore}
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

const signTx = withTxnSigningRequest(React.memo(SignTransaction))

export default signTx
