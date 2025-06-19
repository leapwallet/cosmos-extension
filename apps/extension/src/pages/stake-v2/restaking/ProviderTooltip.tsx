import { Provider } from '@leapwallet/cosmos-wallet-sdk'
import Text from 'components/text'
import React from 'react'

type ProviderTooltipProps = {
  provider: Provider
}
export default function ProviderTooltip({ provider }: ProviderTooltipProps) {
  return (
    <div className='flex flex-col py-3 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg gap-y-2 w-[220px]'>
      {provider.specs.length > 0 && (
        <Text size='sm' className='font-bold text-left' color='text-gray-900 dark:text-gray-100'>
          {provider.specs
            .map((val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase())
            .join(', ')}
        </Text>
      )}

      <Text size='xs' className='font-medium text-left' color='text-gray-700 dark:text-gray-300'>
        Commission{' '}
        {parseInt(provider.delegateCommission ?? '0') > 0 ? `${provider.delegateCommission}%` : '-'}
      </Text>

      <Text size='xs' className='font-medium text-left' color='text-gray-700 dark:text-gray-300'>
        APR is estimated and influenced by various factors such as number of delegators. More
        information is available in our tokenomics: docs.lavanet.xyz/token
      </Text>
    </div>
  )
}
