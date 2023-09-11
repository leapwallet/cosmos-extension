import { coin, StdFee } from '@cosmjs/amino'
import { calculateFee, GasPrice } from '@cosmjs/stargate'
import {
  currencyDetail,
  fetchCurrency,
  GasOptions,
  LeapWalletApi,
  sendTokensParams,
  Token,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useDenoms,
  useGasRateQuery,
  useGetIbcChannelId,
  useGetIBCSupport,
  useNativeFeeDenom,
  usePendingTxState,
  useSelectedNetwork,
  useSimpleSend,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  DefaultGasEstimates,
  fromSmall,
  getSimulationFee,
  NativeDenom,
  simulateIbcTransfer,
  simulateSend,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import bech32 from 'bech32'
import { BigNumber } from 'bignumber.js'
import { useChainInfos } from 'hooks/useChainInfos'
import { useSecretWallet } from 'hooks/wallet/useScrtWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { SelectedAddress } from './types'

const useGetWallet = Wallet.useGetWallet

type SendContextType = Readonly<{
  selectedAddress: SelectedAddress | null
  setSelectedAddress: React.Dispatch<React.SetStateAction<SelectedAddress | null>>
  memo: string
  setMemo: React.Dispatch<React.SetStateAction<string>>
  inputAmount: string
  setInputAmount: React.Dispatch<React.SetStateAction<string>>
  ibcSupportData: ReturnType<typeof useGetIBCSupport>['data']
  isIbcSupportDataLoading: ReturnType<typeof useGetIBCSupport>['isLoading']
  tokenFiatValue: string
  feeTokenFiatValue: string
  selectedToken: Token | null
  setSelectedToken: React.Dispatch<React.SetStateAction<Token | null>>
  feeDenom: NativeDenom
  fee: StdFee
  gasOption: GasOptions
  setGasOption: React.Dispatch<React.SetStateAction<GasOptions>>
  allGasOptions: Record<GasOptions, string>
  addressError: string | undefined
  amountError: string | undefined
  txError: string | undefined
  setAddressError: React.Dispatch<React.SetStateAction<string | undefined>>
  setAmountError: React.Dispatch<React.SetStateAction<string | undefined>>
  isIBCTransfer: boolean
  sendDisabled: boolean
  isSending: boolean
  showLedgerPopup: boolean
  // eslint-disable-next-line no-unused-vars
  confirmSend: (args: Omit<sendTokensParams, 'getWallet'>) => Promise<void>
  clearTxError: () => void
}>

export const SendContext = createContext<SendContextType | null>(null)

type SendContextProviderProps = {
  activeChain: SupportedChain
} & React.PropsWithChildren

export const SendContextProvider: React.FC<SendContextProviderProps> = ({
  children,
  activeChain,
}) => {
  const [inputAmount, setInputAmount] = useState<string>('')
  const [memo, setMemo] = useState<string>('')
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.MEDIUM)
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [addressError, setAddressError] = useState<string | undefined>(undefined)
  const [amountError, setAmountError] = useState<string | undefined>(undefined)
  const [txError, setTxError] = useState<string | undefined>(undefined)

  const defaultGasEstimates = useDefaultGasEstimates()
  const [gasEstimate, setGasEstimate] = useState<number>(
    defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ??
      DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
  )

  const selectedNetwork = useSelectedNetwork()
  const [preferredCurrency] = useUserPreferredCurrency()
  const { setPendingTx } = usePendingTxState()
  const navigate = useNavigate()
  const getWallet = useGetWallet()
  const getSscrtWallet = useSecretWallet()
  const { lcdUrl } = useChainApis()
  const fromAddress = useAddress()
  const getIbcChannelId = useGetIbcChannelId()
  const chainInfos = useChainInfos()
  const denoms = useDenoms()

  const txPostToDB = LeapWalletApi.useOperateCosmosTx()

  const { data: ibcChannelId } = useQuery(
    ['ibc-channel-id', 'send', selectedAddress?.address],
    async () => {
      if (!selectedAddress) return undefined
      const ibcChannelIds = await getIbcChannelId(selectedAddress.address ?? '')
      return (ibcChannelIds ?? [])[0]
    },
  )

  const feeDenom = useNativeFeeDenom()

  const { data: tokenFiatValue } = useQuery(
    ['input-token-fiat-value', selectedToken],
    async () => {
      const denom = denoms[selectedToken?.coinMinimalDenom ?? '']
      return fetchCurrency(
        '1',
        denom.coinGeckoId,
        denom.chain as unknown as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
      )
    },
    { enabled: !!selectedToken },
  )

  const { data: feeTokenFiatValue } = useQuery(
    ['fee-token-fiat-value', selectedToken],
    async () => {
      return fetchCurrency(
        '1',
        feeDenom.coinGeckoId,
        feeDenom.chain as unknown as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
      )
    },
    { enabled: !!selectedToken },
  )

  const { data: ibcSupportData, isLoading: isIbcSupportDataLoading } = useGetIBCSupport(activeChain)

  const { isSending, sendTokens, showLedgerPopup } = useSimpleSend()

  const isIBCTransfer = useMemo(() => {
    if (selectedAddress) {
      const { prefix: fromAddressPrefix } = bech32.decode(fromAddress)
      const { prefix: toAddressPrefix } = bech32.decode(selectedAddress.address ?? '')

      return fromAddressPrefix !== toAddressPrefix
    }
    return false
  }, [selectedAddress, fromAddress])

  const gasPriceOptions = (useGasRateQuery(activeChain, selectedNetwork) ?? {})[
    feeDenom.coinMinimalDenom
  ]

  // all gas options are used to display fees in big denom to the user. These values should not be used for calculations
  const allGasOptions = useMemo(() => {
    const getFeeValue = (gasPriceOption: GasPrice) => {
      const stdFee = calculateFee(Math.ceil(gasEstimate * 1.4), gasPriceOption)

      return fromSmall(stdFee.amount[0].amount, feeDenom.coinDecimals)
    }
    return {
      low: getFeeValue(gasPriceOptions.low),
      medium: getFeeValue(gasPriceOptions.medium),
      high: getFeeValue(gasPriceOptions.high),
    }
  }, [gasEstimate, gasPriceOptions, feeDenom.coinDecimals])

  // This is the fee used in the transaction.
  const fee = useMemo(() => {
    return calculateFee(Math.ceil(gasEstimate * 1.4), gasPriceOptions[gasOption])
  }, [gasPriceOptions, gasOption, gasEstimate])

  const sendDisabled =
    !!addressError ||
    !!amountError ||
    !selectedAddress ||
    !selectedToken ||
    new BigNumber(inputAmount.trim() || 0).lte(0)

  const confirmSend = useCallback(
    async (args: Omit<sendTokensParams, 'getWallet'>) => {
      const result = await sendTokens({
        ...args,
        getWallet: () => {
          if (activeChain === 'secret') {
            return getSscrtWallet()
          }
          return getWallet()
        },
      })
      if (result.success === true) {
        txPostToDB(result.data as LeapWalletApi.LogInfo)
        setPendingTx(result.pendingTx)
        navigate('/activity')
      } else {
        setTxError(result.errors.join(',\n'))
      }
    },
    [activeChain, getSscrtWallet, getWallet, navigate, sendTokens, setPendingTx, txPostToDB],
  )

  const clearTxError = useCallback(() => {
    setTxError(undefined)
  }, [])

  useEffect(() => {
    const fn = async () => {
      const inputAmountNumber = new BigNumber(inputAmount)

      if (
        !selectedAddress ||
        !selectedToken ||
        inputAmountNumber.isNaN() ||
        inputAmountNumber.lte(0)
      ) {
        return
      }

      const normalizedAmount = inputAmountNumber
        .multipliedBy(10 ** (selectedToken.coinDecimals ?? 0))
        .toFixed(0, BigNumber.ROUND_DOWN)

      const amountOfCoins = coin(
        normalizedAmount,
        isIBCTransfer
          ? selectedToken.ibcDenom || selectedToken.coinMinimalDenom
          : selectedToken.coinMinimalDenom,
      )

      const ibcChannelIds = [ibcChannelId] ?? (await getIbcChannelId(selectedAddress.address ?? ''))

      try {
        const fee = getSimulationFee(feeDenom.coinMinimalDenom)
        const { gasUsed, gasWanted } = isIBCTransfer
          ? await simulateIbcTransfer(
              lcdUrl ?? '',
              fromAddress,
              selectedAddress.address ?? '',
              amountOfCoins,
              ibcChannelIds[0] ?? '',
              'transfer',
              Math.floor(Date.now() / 1000) + 60,
              undefined,
              fee,
            )
          : await simulateSend(
              lcdUrl ?? '',
              fromAddress,
              selectedAddress.address ?? '',
              [amountOfCoins],
              fee,
            )

        if (activeChain === chainInfos.chihuahua.key) {
          setGasEstimate(gasWanted)
        } else {
          setGasEstimate(gasUsed)
        }
      } catch (err) {
        setGasEstimate(
          isIBCTransfer
            ? defaultGasEstimates[activeChain]?.DEFAULT_GAS_IBC ??
                DefaultGasEstimates.DEFAULT_GAS_IBC
            : defaultGasEstimates[activeChain]?.DEFAULT_GAS_TRANSFER ??
                DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
        )
      }
    }

    fn()
  }, [
    activeChain,
    chainInfos.chihuahua.key,
    defaultGasEstimates,
    fromAddress,
    getIbcChannelId,
    ibcChannelId,
    inputAmount,
    isIBCTransfer,
    lcdUrl,
    selectedAddress,
    selectedToken,
    feeDenom,
  ])

  const value = useMemo(() => {
    return {
      selectedAddress,
      setSelectedAddress,
      memo,
      setMemo,
      inputAmount,
      setInputAmount,
      ibcSupportData,
      isIbcSupportDataLoading,
      tokenFiatValue: tokenFiatValue ?? '',
      feeTokenFiatValue: feeTokenFiatValue ?? '',
      selectedToken,
      setSelectedToken,
      feeDenom,
      gasOption,
      setGasOption,
      fee,
      allGasOptions,
      addressError,
      amountError,
      setAddressError,
      setAmountError,
      isIBCTransfer,
      sendDisabled,
      isSending,
      confirmSend,
      showLedgerPopup,
      txError,
      clearTxError,
    } as const
  }, [
    selectedAddress,
    memo,
    inputAmount,
    ibcSupportData,
    isIbcSupportDataLoading,
    tokenFiatValue,
    feeTokenFiatValue,
    selectedToken,
    feeDenom,
    gasOption,
    fee,
    allGasOptions,
    addressError,
    amountError,
    isIBCTransfer,
    sendDisabled,
    isSending,
    confirmSend,
    showLedgerPopup,
    txError,
    clearTxError,
  ])

  return <SendContext.Provider value={value}>{children}</SendContext.Provider>
}

export const useSendContext = () => {
  const context = useContext(SendContext)
  if (context === undefined) {
    throw new Error('useSendContext must be used within a SendContextProvider')
  }
  return context
}
