import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { GenericCard, HeaderActionType } from '@leapwallet/leap-ui'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router'

import BottomSheet from '~/components/bottom-sheet'
import CardDivider from '~/components/card-divider'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useCurrentNetwork, useSetCurrentNetwork } from '~/hooks/settings/use-current-network'

export default function NetworkDropUp({
  onCloseHandler,
  isVisible,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const navigate = useNavigate()
  const currentNetwork = useCurrentNetwork()
  const setCurrentNetwork = useSetCurrentNetwork()
  const activeChain = useActiveChain()

  const chains = useMemo(
    () => [
      {
        title: 'Mainnet',
        subTitle: 'Actual blockchain transactions happen here',
        isSelected: currentNetwork === 'mainnet',
        enabled: !!ChainInfos[activeChain].apis.rpc,
        onClick: () => {
          if (ChainInfos[activeChain].apis.rpc) {
            setCurrentNetwork('mainnet')
            navigate('/', { replace: true })
          }
        },
      },
      {
        title: 'Testnet',
        subTitle: 'Used as a testing service and has no actual value',
        isSelected: currentNetwork === 'testnet',
        enabled: false,
        onClick: () => {},
      },
    ],
    [currentNetwork, activeChain, setCurrentNetwork, navigate],
  )

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      headerTitle='Network'
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='flex flex-col items-center px-7 pt-7 pb-10'>
        <div className='overflow-hidden rounded-2xl bg-white-100 dark:bg-gray-900'>
          {chains.map((chain, index) => {
            const unavailable = !chain.enabled ? '(Unavailable)' : ''
            return (
              <React.Fragment key={chain.title}>
                {index !== 0 && <CardDivider />}
                <GenericCard
                  title={
                    <Text
                      size='md'
                      className='w-[420px]'
                      color={chain.enabled ? undefined : 'dark:text-gray-400 text-gray-300'}
                    >{`${chain.title} ${unavailable}`}</Text>
                  }
                  subtitle={
                    <Text
                      size='xs'
                      color={chain.enabled ? undefined : 'dark:text-gray-400 text-gray-300'}
                    >
                      {chain.subTitle}
                    </Text>
                  }
                  onClick={chain.onClick}
                  size='md'
                  icon={
                    chain.isSelected && activeChain ? (
                      <span
                        className='material-icons-round'
                        style={{ color: ChainInfos[activeChain].theme.primaryColor }}
                      >
                        check_circle
                      </span>
                    ) : (
                      <></>
                    )
                  }
                />
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </BottomSheet>
  )
}
