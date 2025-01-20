import {
  SelectedNetwork,
  useChainInfo,
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
import { imgOnError } from 'utils/imgOnError'

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
    const activeChainInfo = useChainInfo(activeChain)

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

    const aprValue = useMemo(() => {
      if (network?.chainApr) {
        return currency((network?.chainApr * 100).toString(), {
          precision: 2,
          symbol: '',
        }).format()
      }
    }, [network?.chainApr])

    return (
      <div className='flex justify-between w-full'>
        <div className='flex gap-x-[4px]'>
          <img
            width={24}
            height={24}
            src={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            onError={imgOnError(defaultTokenLogo)}
          />
          <Text size='md' className='font-bold'>
            {activeChainInfo.chainName}
          </Text>
        </div>

        <Text size='md' color='dark:text-gray-400 text-gray-700' className='font-medium'>
          {aprValue && `APR ${aprValue}%`}
        </Text>
      </div>
    )
  },
)

export default StakeHeading
