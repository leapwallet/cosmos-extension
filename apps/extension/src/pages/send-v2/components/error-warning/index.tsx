/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useAddress, useAddressPrefixes, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { getBlockChainFromAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  CosmosChainData,
  Prettify,
  SupportedChain as SupportedChains,
} from '@leapwallet/elements-core'
import { SkipCosmosMsg, useSkipSupportedChains } from '@leapwallet/elements-hooks'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useSendContext } from 'pages/send-v2/context'
import React, { useEffect, useMemo, useState } from 'react'

import IBCSettings from '../IBCSettings'

function ErrorWarning() {
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
    selectedToken,
    customIbcChannelId,
    sendActiveChain,
  } = useSendContext()

  const currentWalletAddress = useAddress(sendActiveChain)
  const { chains } = useChainsStore()
  const addressPrefixes = useAddressPrefixes()

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
        <span className='!text-lg material-icons-round text-red-400 dark:text-red-300'>
          warning
        </span>
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
      <div className='p-4 rounded-2xl bg-orange-200 dark:bg-orange-900 items-center flex gap-2'>
        <span className='material-icons-round text-[#FFB33D] dark:text-orange-300 self-start'>
          info
        </span>
        <Text size='xs' className='flex-1 font-medium'>
          You will have to send this token to {assetChain?.chainName} first to able to use it.
        </Text>
        <button
          title='Autofill address'
          onClick={onAutoFillAddress}
          className='text-xs font-bold text-black-100 bg-white-100 py-2 px-4 rounded-3xl'
        >
          Autofill address
        </button>
      </div>
    )
  }

  // warning to show if sending to same wallet address
  if (currentWalletAddress === selectedAddress?.address) {
    return (
      <div className='p-4 rounded-2xl bg-orange-200 dark:bg-orange-900 items-center flex gap-2'>
        <span className='material-icons-round text-[#FFB33D] dark:text-orange-300 self-start'>
          info
        </span>
        <Text size='xs' className='font-medium'>
          You&apos;re transferring funds to the same address within your own wallet
        </Text>
      </div>
    )
  }

  // warning to show if USD value cannot be calculated
  if (switchToUSDDisabled && selectedToken?.chain) {
    return (
      <div className='py-3 px-4 rounded-2xl bg-orange-200 dark:bg-orange-900 items-center flex gap-2'>
        <span className='material-icons-round text-[#FFB33D] dark:text-orange-300 self-start'>
          warning
        </span>
        <Text size='xs' className='font-medium'>
          USD value cannot be calculated for this transaction
        </Text>
      </div>
    )
  }

  return null
}

export default ErrorWarning
