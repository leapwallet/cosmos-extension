import {
  SendTokenEthParamOptions,
  sendTokensParams,
  useAddress,
  useSendModule,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getBlockChainFromAddress,
  isAptosChain,
  isValidAddressWithPrefix,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  RootCW20DenomsStore,
  RootDenomsStore,
  RootERC20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { useTransferReturnType } from '@leapwallet/elements-hooks/dist/use-transfer'
import { EthWallet } from '@leapwallet/leap-keychain'
import { useSecretWallet } from 'hooks/wallet/useScrtWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { assert } from 'utils/assert'
import { useTxCallBack } from 'utils/txCallback'

const useGetWallet = Wallet.useGetWallet
const useAptosSigner = Wallet.useAptosSigner

export type SendContextType = ReturnType<typeof useSendModule> &
  Readonly<{
    confirmSend: (
      // eslint-disable-next-line no-unused-vars
      args: Omit<sendTokensParams, 'gasEstimate' | 'getWallet'>,
    ) => Promise<void>
    sameChain: boolean
    transferData: useTransferReturnType | null
    setTransferData: (val: useTransferReturnType) => void
    isIbcUnwindingDisabled: boolean
    setIsIbcUnwindingDisabled: (val: boolean) => void
    pfmEnabled: boolean
    setPfmEnabled: (val: boolean) => void
    ethAddress: string
    setEthAddress: React.Dispatch<React.SetStateAction<string>>
    confirmSendEth: (
      toAddress: string,
      value: string,
      gas: number,
      wallet: EthWallet,
      gasPrice?: number,
      options?: SendTokenEthParamOptions,
    ) => void
  }>

export const SendContext = createContext<SendContextType | null>(null)

type SendContextProviderProps = React.PropsWithChildren<{
  activeChain: SupportedChain
  rootDenomsStore: RootDenomsStore
  rootCW20DenomsStore: RootCW20DenomsStore
  rootERC20DenomsStore: RootERC20DenomsStore
}>

export const SendContextProvider: React.FC<SendContextProviderProps> = observer(
  ({ children, rootCW20DenomsStore, rootERC20DenomsStore, rootDenomsStore }) => {
    const allCW20Denoms = rootCW20DenomsStore.allCW20Denoms
    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms
    const {
      tokenFiatValue,
      feeTokenFiatValue,
      confirmSend,
      confirmSendEth,
      selectedToken,
      setCustomIbcChannelId,
      sendActiveChain,
      ...rest
    } = useSendModule({
      denoms: rootDenomsStore.allDenoms,
      cw20Denoms: allCW20Denoms,
      erc20Denoms: allERC20Denoms,
    })
    const txCallback = useTxCallBack()
    const getWallet = useGetWallet(sendActiveChain)
    const getAptosSigner = useAptosSigner()
    const currentWalletAddress = useAddress()
    const getSscrtWallet = useSecretWallet()
    const [transferData, setTransferData] = useState<useTransferReturnType | null>(null)
    const [isIbcUnwindingDisabled, setIsIbcUnwindingDisabled] = useState<boolean>(false)
    const [pfmEnabled, setPfmEnabled] = useState<boolean>(true)
    const [ethAddress, setEthAddress] = useState('')

    const confirmSendTx = useCallback(
      async (args: Omit<sendTokensParams, 'gasEstimate' | 'getWallet'>) => {
        await confirmSend(
          {
            ...args,
            getWallet: () => {
              const isSnip20 = isValidAddressWithPrefix(
                selectedToken?.coinMinimalDenom ?? '',
                'secret',
              )
              if (isSnip20) {
                return getSscrtWallet()
              }
              if (isAptosChain(sendActiveChain)) {
                return getAptosSigner(sendActiveChain).then((aptos) => aptos.signer)
              }
              return getWallet()
            },
          },
          txCallback,
        )
      },
      [
        confirmSend,
        getAptosSigner,
        getSscrtWallet,
        getWallet,
        selectedToken?.coinMinimalDenom,
        sendActiveChain,
        txCallback,
      ],
    )
    const confirmSendTxEth = useCallback(
      async (
        toAddress: string,
        value: string,
        gas: number,
        wallet: EthWallet,
        gasPrice?: number,
        options?: SendTokenEthParamOptions,
      ) => {
        confirmSendEth(toAddress, value, gas, wallet, txCallback, gasPrice, options)
      },
      [confirmSendEth, txCallback],
    )

    useEffect(() => {
      setIsIbcUnwindingDisabled(false)
      setCustomIbcChannelId(undefined)
    }, [selectedToken, rest?.selectedAddress])

    const value = useMemo(() => {
      const fromChain = getBlockChainFromAddress(currentWalletAddress)
      const { selectedAddress } = rest
      const toChain = getBlockChainFromAddress(selectedAddress ? selectedAddress.address ?? '' : '')

      const sameChain = fromChain === toChain

      return {
        ethAddress,
        setEthAddress,
        tokenFiatValue: tokenFiatValue ?? '',
        feeTokenFiatValue: feeTokenFiatValue ?? '',
        selectedToken,
        confirmSend: confirmSendTx,
        confirmSendEth: confirmSendTxEth,
        sameChain,
        transferData,
        setTransferData,
        isIbcUnwindingDisabled,
        setIsIbcUnwindingDisabled,
        setCustomIbcChannelId,
        pfmEnabled,
        setPfmEnabled,
        sendActiveChain,
        rootDenomsStore,
        ...rest,
      } as const
    }, [
      currentWalletAddress,
      rest,
      ethAddress,
      tokenFiatValue,
      feeTokenFiatValue,
      selectedToken,
      confirmSendTx,
      confirmSendTxEth,
      transferData,
      isIbcUnwindingDisabled,
      setIsIbcUnwindingDisabled,
      setCustomIbcChannelId,
      pfmEnabled,
      setPfmEnabled,
      rootDenomsStore,
      sendActiveChain,
    ])

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <SendContext.Provider value={value}>{children}</SendContext.Provider>
  },
)

export const useSendContext = () => {
  const context = useContext(SendContext)

  assert(context !== null, 'useSendContext must be used within SendContextProvider')

  return context
}
