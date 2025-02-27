import { LSProvider, SelectedNetwork } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ThemeName } from '@leapwallet/leap-ui'
import { Buttons } from '@leapwallet/leap-ui'
import { useTheme } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import { StakeInputPageState } from '../StakeInputPage'

const StakingCTAs = observer(
  ({
    tokenLSProviders,
    isLSProvidersLoading,
    setShowSelectLSProvider,
    activeChain,
    activeNetwork,
  }: {
    tokenLSProviders: LSProvider[]
    isLSProvidersLoading: boolean
    setShowSelectLSProvider: (show: boolean) => void
    activeChain: SupportedChain
    activeNetwork: SelectedNetwork
  }) => {
    const { theme } = useTheme()
    const navigate = useNavigate()

    return (
      <>
        {tokenLSProviders?.length > 0 && (
          <Buttons.Generic
            size='normal'
            className='w-full'
            color={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray200}
            disabled={isLSProvidersLoading}
            onClick={() => setShowSelectLSProvider(true)}
          >
            <Text color='dark:text-white-100 text-black-100'>Liquid Stake</Text>
          </Buttons.Generic>
        )}
        <Buttons.Generic
          size='normal'
          className='w-full'
          color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
          onClick={async () => {
            navigate('/stake/input', {
              state: {
                mode: 'DELEGATE',
                forceChain: activeChain,
                forceNetwork: activeNetwork,
              } as StakeInputPageState,
            })
          }}
        >
          Stake
        </Buttons.Generic>
      </>
    )
  },
)

export default StakingCTAs
