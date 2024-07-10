import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { Network, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar } from '@leapwallet/leap-ui'
import Text from 'components/text'
import currency from 'currency.js'
import { useDefaultTokenLogo } from 'hooks'
import { Images } from 'images'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { imgOnError } from 'utils/imgOnError'

type StakeHeadingProps = {
  chainName: SupportedChain
  network: Network
  isLoading: boolean
  minApy: number | undefined
  maxApy: number | undefined
  activeStakingCoinDenom: string
}

const StakeHeading = React.memo(
  ({
    chainName,
    network,
    isLoading,
    maxApy,
    minApy,
    activeStakingCoinDenom,
  }: StakeHeadingProps) => {
    const chains = useGetChains()
    const defaultTokenLogo = useDefaultTokenLogo()

    const minApyValue = minApy
      ? currency((minApy * 100).toString(), { precision: 2, symbol: '' }).format()
      : null

    const maxApyValue = minApy
      ? currency(((maxApy as number) * 100).toString(), { precision: 2, symbol: '' }).format()
      : null

    const apyText = useMemo(
      () =>
        network ? (
          <Text size='md' color='dark:text-gray-300 text-gray-800' className='font-bold'>
            APY:{' '}
            {minApyValue === null || maxApyValue === null
              ? 'N/A'
              : `${minApyValue} - ${maxApyValue} %`}
          </Text>
        ) : (
          <Text size='md' color='dark:text-gray-300 text-gray-800' className='font-bold'>
            APY: N/A
          </Text>
        ),
      [maxApyValue, minApyValue, network],
    )

    return (
      <div className='flex flex-col pb-4'>
        <div className='flex gap-x-[12px]'>
          <div className='h-8 w-8'>
            <Avatar
              size='sm'
              avatarImage={chains[chainName].chainSymbolImageUrl ?? defaultTokenLogo}
              avatarOnError={imgOnError(defaultTokenLogo)}
              chainIcon={Images.Activity.Delegate}
            />
          </div>

          <Text size='xxl' className='font-black'>
            Stake {activeStakingCoinDenom}
          </Text>
        </div>

        {isLoading ? <Skeleton count={1} width={200} /> : apyText}
      </div>
    )
  },
)

StakeHeading.displayName = 'StakeHeading'
export { StakeHeading }
