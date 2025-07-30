/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useAddress, useIsSeiEvmChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  CosmosChainData,
  Prettify,
  SupportedChain as SupportedChains,
} from '@leapwallet/elements-core'
import { SkipCosmosMsg, useSkipSupportedChains } from '@leapwallet/elements-hooks'
import { Info, Warning } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { useSendContext } from 'pages/send/context'
import React, { useEffect, useMemo, useState } from 'react'

function ErrorWarning() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assetChain, setAssetChain] = useState<any>(null)

  const {
    amountError,
    addressWarning,
    setPfmEnabled,
    transferData,
    setSelectedAddress,
    selectedAddress,
    selectedToken,
    sendActiveChain,
  } = useSendContext()

  const currentWalletAddress = useAddress(sendActiveChain)
  const walletAddresses = useGetWalletAddresses()

  const selectedAssetUSDPrice = useMemo(() => {
    if (selectedToken && selectedToken.usdPrice && selectedToken.usdPrice !== '0') {
      return selectedToken.usdPrice
    }

    return undefined
  }, [selectedToken])

  const switchToUSDDisabled = useMemo(() => {
    return !selectedAssetUSDPrice || new BigNumber(selectedAssetUSDPrice ?? 0).isLessThan(10 ** -6)
  }, [selectedAssetUSDPrice])

  // getting the wallet address from the assets for auto fill
  const chainInfos = useChainInfos()
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

  const isSeiEvmChain = useIsSeiEvmChain()
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

  const isSendingToSameWallet = useMemo(() => {
    if (isSeiEvmChain && selectedAddress?.address?.toLowerCase().startsWith('0x')) {
      return walletAddresses[0].toLowerCase() === selectedAddress?.address?.toLowerCase()
    }

    return currentWalletAddress === selectedAddress?.address
  }, [currentWalletAddress, isSeiEvmChain, selectedAddress?.address, walletAddresses])

  const cw20Error = (amountError || '').includes('IBC transfers are not supported')
  const isAddressNotSupported = (amountError || '').includes(
    'You can only send this token to a SEI address',
  )

  if (cw20Error || isAddressNotSupported) {
    return (
      <div className='p-4 rounded-b-xl bg-red-100 dark:bg-red-900 items-center flex gap-2'>
        <Warning size={24} className='text-red-400 dark:text-red-300' />
        <Text size='xs' className='font-medium'>
          {amountError}
        </Text>
      </div>
    )
  }

  // warning to show if sending to same wallet address
  if (isSendingToSameWallet) {
    return (
      <div className='px-3 py-2.5 rounded-b-xl bg-accent-warning-800 items-center flex gap-1.5'>
        <Info size={16} className='text-accent-warning self-start min-w-4' />
        <Text size='xs' className='font-medium' color='text-accent-warning'>
          You&apos;re transferring funds to the same address within your own wallet
        </Text>
      </div>
    )
  }

  if (addressWarning.message) {
    return (
      <div className='px-3 py-2.5 rounded-b-xl bg-accent-warning-800 items-center flex gap-1.5'>
        <Info size={16} className='text-accent-warning self-start min-w-4' />
        <Text size='xs' className='font-medium' color='text-accent-warning'>
          {addressWarning.message}
        </Text>
      </div>
    )
  }

  if (selectedToken && selectedToken?.coinMinimalDenom !== 'usei') {
    return (
      <div className='px-3 py-2.5 rounded-b-xl bg-accent-warning-800 items-center flex gap-1.5'>
        <Info size={16} className='text-accent-warning self-start min-w-4' />
        <Text size='xs' className='font-medium' color='text-accent-warning'>
          Avoid transferring IBC/Non-native tokens to centralised exchanges.
        </Text>
      </div>
    )
  }

  // warning to show if USD value cannot be calculated
  if (switchToUSDDisabled && selectedToken?.chain) {
    return (
      <div className='px-3 py-2.5 rounded-b-xl bg-accent-warning-800 items-center flex gap-1.5'>
        <Info size={16} className='text-accent-warning self-start min-w-4' />
        <Text size='xs' className='font-medium' color='text-accent-warning'>
          USD value cannot be calculated for this transaction
        </Text>
      </div>
    )
  }

  return null
}

export default ErrorWarning
