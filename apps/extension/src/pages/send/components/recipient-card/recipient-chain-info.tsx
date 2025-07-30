import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import {
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Info } from '@phosphor-icons/react'
import { SHOW_ETH_ADDRESS_CHAINS } from 'config/constants'
import { useSendContext } from 'pages/send/context'
import { handleTestnetChainName } from 'pages/send/utils'
import React, { useMemo } from 'react'

export function RecipientChainInfo() {
  const { sendActiveChain, addressError, selectedAddress, sendSelectedNetwork } = useSendContext()
  const chains = useGetChains()

  const sendChainEcosystem = useMemo(() => {
    if (
      isAptosChain(sendActiveChain) ||
      isSuiChain(sendActiveChain) ||
      chains?.[sendActiveChain]?.evmOnlyChain ||
      isSolanaChain(sendActiveChain)
    ) {
      return handleTestnetChainName(
        chains?.[sendActiveChain]?.chainName ?? sendActiveChain,
        sendSelectedNetwork,
      )
    }
    if (
      SHOW_ETH_ADDRESS_CHAINS.includes(sendActiveChain) &&
      (!!selectedAddress?.ethAddress?.startsWith('0x') ||
        !!selectedAddress?.address?.startsWith('0x'))
    ) {
      return handleTestnetChainName(
        chains?.[sendActiveChain]?.chainName ?? sendActiveChain,
        sendSelectedNetwork,
      )
    }
    if (!!selectedAddress?.address?.startsWith('init') && selectedAddress?.chainName) {
      return handleTestnetChainName(
        chains?.[selectedAddress?.chainName as SupportedChain]?.chainName ?? sendActiveChain,
        sendSelectedNetwork,
      )
    }
    return undefined
  }, [
    sendSelectedNetwork,
    sendActiveChain,
    chains,
    selectedAddress?.ethAddress,
    selectedAddress?.address,
    selectedAddress?.chainName,
  ])

  if (!sendChainEcosystem || addressError) {
    return null
  }

  return (
    <div className='flex flex-col gap-3 mb-3'>
      <div className='bg-secondary-300 h-[1px] w-full' />
      <div className='flex flex-row gap-2 items-center justify-start px-4'>
        <Info height={16} width={16} className='text-accent-blue min-w-4 shrink-0' />
        <div className='text-xs text-accent-blue font-medium !leading-[19px]'>
          This token will be sent to &ldquo;{sendChainEcosystem}&rdquo;
        </div>
      </div>
    </div>
  )
}
