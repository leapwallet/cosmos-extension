/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useAddress, useAddressPrefixes, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { getBlockChainFromAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  CosmosChainData,
  Prettify,
  SupportedChain as SupportedChains,
} from '@leapwallet/elements-core'
import { SkipCosmosMsg, useSkipSupportedChains } from '@leapwallet/elements-hooks'
import { Info, Warning } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useSendContext } from 'pages/send/context'
import React, { useEffect, useMemo, useState } from 'react'

import IBCSettings from '../IBCSettings'

export function ErrorChannel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assetChain, setAssetChain] = useState<any>(null)

  const {
    amountError,
    addressError,
    pfmEnabled,
    setPfmEnabled,
    transferData,
    isIbcUnwindingDisabled,
    setSelectedAddress,
    selectedAddress,
    customIbcChannelId,
    sendActiveChain,
  } = useSendContext()
  const { chains } = useChainsStore()
  const addressPrefixes = useAddressPrefixes()

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

  const cw20Error = (amountError || '').includes('IBC transfers are not supported')
  const isAddressNotSupported = (amountError || '').includes(
    'You can only send this token to a SEI address',
  )

  if (cw20Error || isAddressNotSupported) {
    return (
      <div className='p-4 rounded-2xl bg-red-100 dark:bg-red-900 items-center flex gap-2'>
        <Warning size={24} className='text-red-400 dark:text-red-300' />
        <Text size='xs' className='font-medium'>
          {amountError}
        </Text>
      </div>
    )
  }

  const isIBCError = (addressError || '').includes('IBC transfers are not supported')

  // Error warning for IBC transfers
  if (isIBCError || customIbcChannelId) {
    const destChainInfo = () => {
      if (!selectedAddress?.address) {
        return null
      }

      const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address)
      if (!destChainAddrPrefix) {
        return null
      }

      const destinationChainKey = addressPrefixes[destChainAddrPrefix] as SupportedChain | undefined
      if (!destinationChainKey) {
        return null
      }

      // we are sure that the key is there in the chains object due to previous checks
      return chains[destinationChainKey]
    }

    return (
      <IBCSettings
        targetChain={destChainInfo()?.key as SupportedChain}
        sourceChain={sendActiveChain}
      />
    )
  }

  // warning to show if PFM is not enabled on the chain
  if (!pfmEnabled && !isIbcUnwindingDisabled) {
    return (
      <div className='px-3 py-2.5 rounded-2xl items-center flex bg-accent-warning-800 gap-1.5'>
        <Info size={16} className='text-accent-warning self-start min-w-4' />
        <Text size='xs' className='font-medium' color='text-accent-warning'>
          You will have to send this token to {assetChain?.chainName} first to able to use it.
        </Text>
        <Button variant='mono' size='sm' className='py-2 px-4' onClick={onAutoFillAddress}>
          Autofill address
        </Button>
      </div>
    )
  }
  return null
}

export function useSwitchToUSDDisabled() {
  const { selectedToken } = useSendContext()

  const selectedAssetUSDPrice = useMemo(() => {
    if (selectedToken && selectedToken.usdPrice && selectedToken.usdPrice !== '0') {
      return selectedToken.usdPrice
    }

    return undefined
  }, [selectedToken])

  const switchToUSDDisabled = useMemo(() => {
    return !selectedAssetUSDPrice || new BigNumber(selectedAssetUSDPrice ?? 0).isLessThan(10 ** -6)
  }, [selectedAssetUSDPrice])

  return switchToUSDDisabled
}

export function ErrorWarning() {
  const { isCexIbcTransferWarningNeeded, selectedAddress, sendActiveChain } = useSendContext()
  const currentWalletAddress = useAddress(sendActiveChain)
  const isSendingToSameWallet = currentWalletAddress === selectedAddress?.address

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

  if (isCexIbcTransferWarningNeeded) {
    return (
      <div className='px-3 py-2.5 rounded-b-xl bg-accent-warning-800 items-center flex gap-1.5'>
        <Info size={16} className='text-accent-warning self-start min-w-4' />
        <Text size='xs' className='font-medium' color='text-accent-warning'>
          Avoid transferring IBC tokens to centralised exchanges.
        </Text>
      </div>
    )
  }

  return null
}
