import { useStaking } from '@leapwallet/cosmos-wallet-hooks'
import Text from 'components/text'
import currency from 'currency.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useMemo } from 'react'

export default function StakeHeading() {
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()
  const defaultTokenLogo = useDefaultTokenLogo()
  const activeChainInfo = chainInfos[activeChain]
  const { network } = useStaking()

  const apyValue = useMemo(() => {
    if (network?.chainApy) {
      return currency((network?.chainApy * 100).toString(), {
        precision: 2,
        symbol: '',
      }).format()
    }
  }, [network?.chainApy])

  return (
    <div className='flex justify-between w-full'>
      <div className='flex gap-x-[4px]'>
        <img width={24} height={24} src={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo} />
        <Text size='md' className='font-bold'>
          {activeChainInfo.chainName}
        </Text>
      </div>
      <Text size='md' color='dark:text-gray-400 text-gray-700' className='font-medium'>
        {apyValue ? `APY ${apyValue}%` : '-'}
      </Text>
    </div>
  )
}
