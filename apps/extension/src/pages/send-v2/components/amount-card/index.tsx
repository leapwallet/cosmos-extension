/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  formatTokenAmount,
  sliceWord,
  Token,
  useformatCurrency,
  useGasAdjustmentForChain,
  useGetSeiEvmBalance,
  useGetTokenSpendableBalances,
  useIsCW20Token,
  useSeiLinkedAddressState,
  useSnipGetSnip20TokenBalances,
} from '@leapwallet/cosmos-wallet-hooks'
import { isValidAddressWithPrefix, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain as SupportedChains } from '@leapwallet/elements-core'
import {
  CosmosChainData,
  Prettify,
  SkipCosmosMsg,
  useSkipSupportedChains,
} from '@leapwallet/elements-hooks'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import { calculateFeeAmount } from 'components/gas-price-options'
import Text from 'components/text'
import { motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation } from 'react-router'
import { imgOnError } from 'utils/imgOnError'

import { SelectTokenSheet } from './select-token-sheet'

type AmountCardProps = {
  themeColor: string
}

export const AmountCard: React.FC<AmountCardProps> = ({ themeColor }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const defaultTokenLogo = useDefaultTokenLogo()
  const locationState = useLocation().state

  const [showTokenSelectSheet, setShowTokenSelectSheet] = useState<boolean>(false)
  const [isMaxClicked, setIsMaxClicked] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assetChain, setAssetChain] = useState<any>(null)
  const [amount, setAmount] = useState('')

  const { allAssets, nativeTokensStatus, s3IbcTokensStatus } = useGetTokenSpendableBalances()
  const getWallet = Wallet.useGetWallet()
  const { addressLinkState } = useSeiLinkedAddressState(getWallet)
  const { data: seiEvmBalance, status: seiEvmStatus } = useGetSeiEvmBalance()
  const { snip20Tokens } = useSnipGetSnip20TokenBalances()

  const [formatCurrency] = useformatCurrency()
  const chainInfos = useChainInfos()
  const isCW20Token = useIsCW20Token()
  const activeChain = useActiveChain()

  const assetCoinDenom = useQuery().get('assetCoinDenom') ?? undefined

  const {
    inputAmount,
    setInputAmount,
    selectedToken,
    setSelectedToken,
    tokenFiatValue,
    setAmountError,
    amountError,
    userPreferredGasPrice,
    userPreferredGasLimit,
    gasEstimate,
    selectedAddress,
    allGasOptions,
    gasOption,
    fee,
    feeDenom,
    sameChain,
    setFeeDenom,
    addressWarning,
    transferData,
    pfmEnabled,
    setPfmEnabled,
    setSelectedAddress,
    isIbcUnwindingDisabled,
    setGasError,
  } = useSendContext()
  const gasAdjustment = useGasAdjustmentForChain()

  const handleMaxClick = () => {
    setIsMaxClicked(true)
  }

  function getFlooredFixed(v: number, d: number) {
    return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)
  }

  useEffect(() => {
    const amountDecimals = amount.split('.')?.[1]?.length
    const coinDecimals = selectedToken?.coinDecimals ?? 6
    if (amountDecimals > coinDecimals) {
      setInputAmount(getFlooredFixed(Number(amount), coinDecimals) as string)
    } else {
      setInputAmount(amount)
    }
  }, [amount])

  const isSecretChainTargetAddress = useMemo(
    () => selectedAddress && isValidAddressWithPrefix(selectedAddress.address ?? '', 'secret'),
    [selectedAddress],
  )

  const assets = useMemo(() => {
    let _assets = allAssets

    if (snip20Tokens && isSecretChainTargetAddress) {
      _assets = [..._assets, ...snip20Tokens]
    }

    if (!['done', 'unknown'].includes(addressLinkState)) {
      _assets = [..._assets, ...(seiEvmBalance?.seiEvmBalance ?? [])].filter((token) =>
        new BigNumber(token.amount).gt(0),
      )
    }

    return _assets
  }, [
    addressLinkState,
    allAssets,
    isSecretChainTargetAddress,
    seiEvmBalance?.seiEvmBalance,
    snip20Tokens,
  ])

  const isTokenStatusSuccess = useMemo(() => {
    let status = nativeTokensStatus === 'success' && s3IbcTokensStatus === 'success'

    if (!['done', 'unknown'].includes(addressLinkState)) {
      status = status && seiEvmStatus === 'success'
    }

    return status
  }, [addressLinkState, nativeTokensStatus, s3IbcTokensStatus, seiEvmStatus])

  const updateSelectedToken = useCallback(
    (token) => {
      setSelectedToken(token)

      if (token?.isEvm) {
        setFeeDenom({
          coinMinimalDenom: token.coinMinimalDenom,
          coinDecimals: token.coinDecimals ?? 6,
          coinDenom: token.symbol,
          icon: token.img,
          coinGeckoId: token.coinGeckoId ?? '',
          chain: token.chain ?? '',
        })
      }
    },
    [setFeeDenom, setSelectedToken],
  )

  useEffect(() => {
    if (!selectedToken && !assetCoinDenom) {
      if (locationState && (locationState as Token).coinMinimalDenom) {
        const token = locationState as Token
        updateSelectedToken(token)
      } else if (assets.length > 0) {
        const tokensWithBalance = assets.filter((token) => new BigNumber(token.amount).gt(0))
        const token = tokensWithBalance[0] as Token
        updateSelectedToken(token)
      }
    }
  }, [
    assets,
    locationState,
    isTokenStatusSuccess,
    selectedToken,
    updateSelectedToken,
    assetCoinDenom,
  ])

  useEffect(() => {
    if (addressLinkState === 'done' && selectedToken && selectedToken?.isEvm) {
      const tokensWithBalance = assets.filter((token) => new BigNumber(token.amount).gt(0))
      const token = tokensWithBalance[0] as Token
      updateSelectedToken(token)
    }
  }, [addressLinkState, assets, selectedToken, updateSelectedToken])

  useEffect(() => {
    if (assetCoinDenom) {
      const tokenFromParams: Token | null =
        assets.find((asset) => asset.ibcDenom === assetCoinDenom) ||
        assets.find((asset) => asset.coinMinimalDenom === assetCoinDenom) ||
        null

      updateSelectedToken(tokenFromParams)
    }
  }, [assetCoinDenom, activeChain, assets, updateSelectedToken])

  useEffect(() => {
    if (addressWarning.type === 'link') {
      setInputAmount('0.0001')
      return
    }

    const isNativeToken =
      !!chainInfos[activeChain].nativeDenoms[selectedToken?.coinMinimalDenom ?? '']

    if (!allGasOptions || !gasOption) {
      return
    }

    if (isMaxClicked && isNativeToken) {
      const feeValue = parseFloat(allGasOptions[gasOption])

      if (new BigNumber(selectedToken?.amount ?? 0).isGreaterThan(new BigNumber(feeValue))) {
        setAmount(
          new BigNumber(selectedToken?.amount ?? 0)
            .minus(new BigNumber(feeValue))
            .toFixed(6, BigNumber.ROUND_DOWN),
        )
      } else {
        setAmount(new BigNumber(selectedToken?.amount ?? 0).toFixed(6, BigNumber.ROUND_DOWN))
      }
    }

    if (isMaxClicked && !isNativeToken) {
      setAmount(new BigNumber(selectedToken?.amount ?? 0).toFixed(6, BigNumber.ROUND_DOWN))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasOption, isMaxClicked, selectedToken])

  useEffect(() => {
    const check = () => {
      if (selectedAddress?.address && !sameChain && selectedToken && isCW20Token(selectedToken)) {
        return 'IBC transfers not supported for cw20 tokens.'
      }

      if (inputAmount === '') {
        return ''
      }
      // check if input is a valid digit
      if (isNaN(Number(inputAmount))) {
        return 'Please enter a valid amount'
      }
      // if input is negative
      if (new BigNumber(inputAmount).lt(0)) {
        return 'Please enter a positive amount'
      }
      // check if user has balance
      if (new BigNumber(inputAmount).gt(new BigNumber(selectedToken?.amount ?? ''))) {
        return 'Insufficient balance'
      }

      const feeDenomValue = assets.find((asset) => {
        if (selectedToken?.isEvm && asset?.isEvm) {
          return asset.coinMinimalDenom === feeDenom?.coinMinimalDenom
        }

        return (
          asset.ibcDenom === feeDenom.coinMinimalDenom ||
          asset.coinMinimalDenom === feeDenom.coinMinimalDenom
        )
      })

      if (!fee || !userPreferredGasPrice || !feeDenomValue) {
        return ''
      }

      const { amount } = calculateFeeAmount({
        gasPrice: userPreferredGasPrice.amount.toFloatApproximation(),
        gasLimit: userPreferredGasLimit ?? gasEstimate,
        feeDenom: feeDenom,
        gasAdjustment,
      })

      if (amount.gt(feeDenomValue.amount)) {
        return 'Insufficient funds for fees.'
      }
    }

    setAmountError(check())

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    assets,
    fee?.amount,
    feeDenom?.coinMinimalDenom,
    inputAmount,
    selectedToken,
    selectedAddress,
    gasAdjustment,
  ])

  const { data: skipSupportedChains } = useSkipSupportedChains()

  // checking if the token selected is pfmEnbled
  useEffect(() => {
    if (transferData?.isSkipTransfer && transferData?.routeResponse) {
      const allMessages = transferData?.messages?.[1] as SkipCosmosMsg

      const _skipChain = skipSupportedChains?.find(
        (d) => d.chainId === allMessages?.multi_chain_msg?.chain_id,
      ) as Prettify<CosmosChainData & SupportedChains>
      setAssetChain(
        _skipChain?.addressPrefix === 'sei'
          ? {
              ..._skipChain,
              addressPrefix: 'seiTestnet2',
            }
          : _skipChain,
      )
      setPfmEnabled(_skipChain?.pfmEnabled === false ? false : true)
    } else {
      setAssetChain(null)
      setPfmEnabled(true)
    }

    return () => {
      setPfmEnabled(true)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    skipSupportedChains,
    transferData?.isSkipTransfer,
    // @ts-ignore
    transferData?.routeResponse,
    // @ts-ignore
    transferData?.messages,
  ])

  // getting the wallet address from the assets for auto fill
  const wallet = useActiveWallet().activeWallet
  const asssetChainKey = Object.values(chainInfos).find(
    (chain) => chain.chainId === assetChain?.chainId,
  )?.key
  const autoFillAddress = wallet?.addresses?.[asssetChainKey as SupportedChain]

  const onAutoFillAddress = () => {
    setSelectedAddress({
      address: autoFillAddress,
      name: autoFillAddress?.slice(0, 5) + '...' + autoFillAddress?.slice(-5),
      avatarIcon: assetChain?.icon,
      emoji: undefined,
      chainIcon: assetChain?.icon,
      chainName: assetChain?.addressPrefix,
      selectionType: 'notSaved',
      information: { autofill: true },
    })
  }

  return (
    <motion.div
      className={classNames('card-container', {
        'opacity-50 pointer-events-none': addressWarning.type === 'link',
      })}
      style={{ overflow: 'hidden' }}
    >
      <div className='flex w-full items-center justify-between mb-3'>
        <Text size='sm' className='text-gray-600 dark:text-gray-200 font-bold'>
          Amount to Send
        </Text>

        {isTokenStatusSuccess ? (
          selectedToken && (
            <button
              className='bg-gray-50 dark:bg-gray-800 rounded-full flex items-center py-2 pl-3 pr-2 cursor-pointer'
              onClick={() => {
                setShowTokenSelectSheet(true)
              }}
            >
              <img
                src={selectedToken.img ?? defaultTokenLogo}
                onError={imgOnError(defaultTokenLogo)}
                className='h-5 w-5 mr-1'
              />
              <div className='text-black-100 dark:text-white-100 font-bold text-sm'>
                {sliceWord(selectedToken.symbol)}
              </div>
              <img src={Images.Misc.ArrowDown} className='ml-2' />
            </button>
          )
        ) : (
          <div className='w-24 z-0'>
            <Skeleton className='rounded-full h-9 w-24 bg-gray-50 dark:bg-gray-800' />
          </div>
        )}
      </div>

      {isTokenStatusSuccess ? (
        <>
          {selectedToken ? (
            <>
              <ActionInputWithPreview
                action={amount ? 'none' : 'max'}
                buttonText='Max'
                buttonTextColor={themeColor}
                value={amount}
                rightElement={
                  amount && tokenFiatValue ? (
                    <p className='text-sm text-gray-400'>
                      ~ {formatCurrency(new BigNumber(tokenFiatValue).times(amount))}
                    </p>
                  ) : undefined
                }
                onAction={(e, action) => {
                  if (action === 'max') {
                    handleMaxClick()
                  }
                }}
                onChange={(e) => {
                  setIsMaxClicked(false)
                  setAmount(e.target.value)
                }}
                placeholder='Enter amount'
                preview={undefined}
                invalid={!!amountError}
                ref={inputRef}
              />

              {amountError ? (
                <p
                  className='text-xs text-red-300 font-bold ml-1 mt-2'
                  data-testing-id='send-amount-error-ele'
                >
                  {amountError}
                </p>
              ) : null}

              <p
                className='text-xs text-gray-700 dark:text-gray-400 font-medium ml-1 mt-2'
                title={formatTokenAmount(selectedToken.amount, selectedToken.symbol)}
                data-testing-id='send-amount-token-balance'
              >
                Balance: {formatTokenAmount(selectedToken.amount, selectedToken.symbol)}
              </p>
            </>
          ) : (
            <p className='text-sm text-red-300 font-bold' data-testing-id='send-no-tokens-ele'>
              You have no tokens
            </p>
          )}
        </>
      ) : (
        <div className='w-full z-0'>
          <Skeleton className='rounded-lg h-10 bg-gray-50 dark:bg-gray-800 w-full' />
          <div className='w-24'>
            <Skeleton className='rounded-lg h-5 w-24 bg-gray-50 dark:bg-gray-800 mt-2' />
          </div>
        </div>
      )}

      {/* warning to show if PFM is not enabled on the chain */}
      {!pfmEnabled && !isIbcUnwindingDisabled ? (
        <div
          className='py-2 px-4 bg-[#FFEDD1] items-center flex gap-2'
          style={{ margin: '20px -16px -16px' }}
        >
          <span className='material-icons-round text-[#704400]'>info</span>
          <p className='text-xs text-[#422800] font-medium'>
            You will have to send this token to {assetChain?.chainName} first to able to use
            it.&nbsp;
            <span className='font-bold cursor-pointer' onClick={onAutoFillAddress}>
              Autofill {assetChain?.chainName} address
            </span>
          </p>
        </div>
      ) : null}

      <SelectTokenSheet
        isOpen={showTokenSelectSheet}
        assets={assets}
        selectedToken={selectedToken as Token}
        onClose={() => {
          setShowTokenSelectSheet(false)
        }}
        onTokenSelect={(token) => {
          updateSelectedToken(token)
          setGasError('')
          setAmount('')
          setIsMaxClicked(false)
          inputRef.current?.focus()
        }}
      />
    </motion.div>
  )
}
