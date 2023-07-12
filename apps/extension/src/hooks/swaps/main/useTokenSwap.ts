import { calculateFee } from '@cosmjs/stargate'
import { LeapWalletApi, useChainApis, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { usePendingTxState } from '@leapwallet/cosmos-wallet-hooks'
import { CosmosTxType } from '@leapwallet/cosmos-wallet-hooks'
import {
  PoolMatchForSwap,
  simulateDirectTokenSwap,
  simulatePassThroughTokenSwap,
  TokenInfo,
  transactionDeclinedError,
} from '@leapwallet/cosmos-wallet-sdk'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useCWTxHandler } from 'hooks/tx/useCWTxHandler'
import { useChainInfos } from 'hooks/useChainInfos'
import { useAddress } from 'hooks/wallet/useAddress'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'

import useActiveWallet from '../../settings/useActiveWallet'
import { Wallet } from '../../wallet/useWallet'
import { useQueryMatchingPoolForSwap } from '../useQueryMatchingPoolForSwap'
import { useTokenInfo } from '../useTokenInfo'
import { convertDenomToMicroDenom } from '../utils/conversionUtils'

type UseTokenSwapArgs = {
  tokenASymbol: string
  tokenBSymbol: string
  /* token amount in denom */
  tokenAmount: number
  tokenToTokenPrice: number
  slippage: number
}

export const useTokenSwap = ({
  tokenASymbol,
  tokenBSymbol,
  tokenAmount: providedTokenAmount,
  tokenToTokenPrice,
  slippage,
}: UseTokenSwapArgs) => {
  //   const setTransactionState = useSetRecoilState(transactionStatusState)
  const chainInfos = useChainInfos()
  const getTxHandler = useCWTxHandler()
  const { activeWallet } = useActiveWallet()
  const tokenA = useTokenInfo(tokenASymbol)
  const tokenB = useTokenInfo(tokenBSymbol)
  const [matchingPools] = useQueryMatchingPoolForSwap({
    tokenA: tokenA as TokenInfo,
    tokenB: tokenB as TokenInfo,
  })
  const address = useAddress()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [showLedgerPopup, setShowLedgerPopup] = useState(false)
  const navigate = useNavigate()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const { lcdUrl } = useChainApis()

  //   const refetchQueries = useRefetchQueries(['tokenBalance'])
  const { setPendingTx } = usePendingTxState()
  const activeChain = useActiveChain()

  const handleSwap = useCallback(async () => {
    setLoading(true)
    setError('')
    const tokenAmount = convertDenomToMicroDenom(providedTokenAmount, tokenA?.decimals as number)

    const price = convertDenomToMicroDenom(tokenToTokenPrice, tokenB?.decimals as number)
    if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
      setShowLedgerPopup(true)
    }

    const _tx = await getTxHandler()
    const { streamlinePoolAB, streamlinePoolBA, baseTokenAPool, baseTokenBPool } =
      matchingPools as PoolMatchForSwap

    if (streamlinePoolAB || streamlinePoolBA) {
      const swapDirection = streamlinePoolAB?.swap_address ? 'tokenAtoTokenB' : 'tokenBtoTokenA'
      const swapAddress = streamlinePoolAB?.swap_address ?? streamlinePoolBA?.swap_address

      const metadata: object = {
        liquidityPool: swapAddress,
        // hardcoding this for now, should update when we support more than 1 dex
        dexName: 'junoswap',
        fromToken: {
          amount: tokenAmount,
          denom: tokenA?.name,
        },
        toToken: {
          amount: price,
          denom: tokenB?.name,
        },
      }

      try {
        const { gasUsed: gasEstimation } = await simulateDirectTokenSwap(lcdUrl as string, {
          tokenA: tokenA as TokenInfo,
          swapDirection,
          tokenAmount,
          senderAddress: address,
          swapAddress: swapAddress as string,
          price,
          slippage: slippage / 100,
        })
        const gasPrice = '0.01ujuno'

        const usedFee = calculateFee(Math.round(gasEstimation * 1.3), gasPrice)

        const txHash = await _tx.directTokenSwap({
          tokenAmount,
          price,
          slippage: slippage / 100,
          senderAddress: address,
          swapAddress,
          swapDirection,
          tokenA,
          fee: usedFee,
        })

        await txPostToDB({
          txHash,
          txType: CosmosTxType.Swap,
          metadata,
          feeDenomination: 'ujuno',
          feeQuantity: usedFee.amount[0].amount,
        })
        const promise = _tx.pollForTx(txHash)

        setPendingTx({
          img: chainInfos[activeChain].chainSymbolImageUrl,
          subtitle1: '',
          title1: 'Swap ' + tokenASymbol + ' → ' + tokenBSymbol,
          txStatus: 'loading',
          txType: 'fallback',
          promise,
        })
        navigate('/activity')
      } catch (e: any) {
        if (e.message === transactionDeclinedError.message) {
          navigate('/home?txDeclined=true')
        } else {
          setError(e.message.toString())
        }
      } finally {
        setShowLedgerPopup(false)
        setLoading(false)
      }
    } else {
      try {
        const { gasUsed: gasEstimation } = await simulatePassThroughTokenSwap(lcdUrl as string, {
          tokenAmount,
          price,
          slippage: slippage / 100,
          senderAddress: address,
          tokenA: tokenA as TokenInfo,
          swapAddress: baseTokenAPool?.swap_address as string,
          outputSwapAddress: baseTokenBPool?.swap_address as string,
        })
        const gasPrice = '0.01ujuno'

        const usedFee = calculateFee(Math.round(gasEstimation * 1.3), gasPrice)
        const txHash = await _tx.passThroughTokenSwap({
          tokenAmount,
          price,
          slippage: slippage / 100,
          senderAddress: address,
          tokenA,
          swapAddress: baseTokenAPool?.swap_address,
          outputSwapAddress: baseTokenBPool?.swap_address,
          fee: usedFee,
        })
        const metadata: object = {
          liquidityPool: baseTokenAPool?.swap_address,
          // hardcoding this for now, should update when we support more than 1 dex
          dexName: 'junoswap',
          fromToken: {
            amount: tokenAmount,
            denom: tokenA?.name,
          },
          toToken: {
            amount: price,
            denom: tokenB?.name,
          },
        }
        await txPostToDB({
          txHash,
          txType: CosmosTxType.Swap,
          metadata,
          feeDenomination: 'ujuno',
          feeQuantity: usedFee.amount[0].amount,
        })
        const promise = _tx.pollForTx(txHash)

        setPendingTx({
          img: chainInfos[activeChain].chainSymbolImageUrl,
          subtitle1: '',
          title1: 'Swap ' + tokenASymbol + ' → ' + tokenBSymbol,
          txStatus: 'loading',
          txType: 'fallback',
          promise,
        })
        navigate('/activity')
      } catch (e: any) {
        if (e.message === transactionDeclinedError.message) {
          navigate('/home?txDeclined=true')
        } else {
          setError(e.message.toString())
        }
      } finally {
        setLoading(false)
      }
    }
  }, [])

  return { handleSwap, loading, error, showLedgerPopup }
}
