import {
  SelectedNetwork,
  useChainInfo,
  useDualStaking,
  useFeatureFlags,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import Text from 'components/text'
import currency from 'currency.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'

type StakeHeadingProps = {
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const StakeHeading = observer(
  ({
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
  }: StakeHeadingProps) => {
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const defaultTokenLogo = useDefaultTokenLogo()
    const { apy: providersApy } = useDualStaking()
    const activeChainInfo = useChainInfo(activeChain)
    const { data: featureFlags } = useFeatureFlags()

    const denoms = rootDenomsStore.allDenoms
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const { network } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )

    const apyValue = useMemo(() => {
      if (network?.chainApy) {
        return currency((network?.chainApy * 100).toString(), {
          precision: 2,
          symbol: '',
        }).format()
      }
    }, [network?.chainApy])

    const providersApyValue = useMemo(() => {
      if (providersApy) {
        return currency((providersApy * 100).toString(), { precision: 0, symbol: '' }).format()
      }
      return null
    }, [providersApy])

    return (
      <div className='flex justify-between w-full'>
        <div className='flex gap-x-[4px]'>
          <img
            width={24}
            height={24}
            src={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
          />
          <Text size='md' className='font-bold'>
            {activeChainInfo.chainName}
          </Text>
        </div>
        {activeChain === 'lava' && featureFlags?.restaking?.extension === 'active' ? (
          <div className='flex gap-x-[18px] items-center'>
            {apyValue && (
              <div className='flex flex-col items-center gap-y-0.5'>
                <Text size='xs' color='dark:text-gray-400 text-gray-700' className='font-medium'>
                  Validator
                </Text>
                <Text size='md' color='dark:text-gray-400 text-gray-700' className='font-medium'>
                  {`APY ${apyValue}%`}
                </Text>
              </div>
            )}
            {apyValue && providersApyValue && (
              <div className='w-0.5 h-8 bg-gray-50 dark:bg-gray-900' />
            )}
            {providersApyValue && (
              <div className='flex flex-col items-center gap-y-0.5'>
                <Text size='xs' color='dark:text-gray-400 text-gray-700' className='font-medium'>
                  Provider
                </Text>
                <Text size='md' color='dark:text-gray-400 text-gray-700' className='font-medium'>
                  {`APY ${providersApyValue}%`}
                </Text>
              </div>
            )}
          </div>
        ) : (
          <Text size='md' color='dark:text-gray-400 text-gray-700' className='font-medium'>
            {apyValue && `APY ${apyValue}%`}
          </Text>
        )}
      </div>
    )
  },
)

export default StakeHeading
