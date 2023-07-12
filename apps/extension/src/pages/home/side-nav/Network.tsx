import { CardDivider, GenericCard, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork, useSetNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'

import Text from '../../../components/text'

export default function NetworkDropUp({
  onCloseHandler,
  isVisible,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const chainInfos = useChainInfos()
  const navigate = useNavigate()
  const adjustedSetCurrentChainName = useSetNetwork()
  const currentChainName = useSelectedNetwork()
  const activeChain = useActiveChain()

  const chains = useMemo(
    () => [
      {
        title: 'Mainnet',
        subTitle: 'Actual blockchain transactions happen here',
        isSelected: currentChainName === 'mainnet',
        enabled: !!chainInfos[activeChain].apis.rpc,
        onClick: () => {
          if (chainInfos[activeChain].apis.rpc) {
            adjustedSetCurrentChainName('mainnet')
            navigate('/', { replace: true })
          }
        },
      },
      {
        title: 'Testnet',
        subTitle: 'Used as a testing service and has no actual value',
        isSelected: currentChainName === 'testnet',
        enabled: !!chainInfos[activeChain].apis.rpcTest,
        onClick: () => {
          if (chainInfos[activeChain].apis.rpcTest) {
            adjustedSetCurrentChainName('testnet')
            navigate('/', { replace: true })
          }
        },
      },
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain, currentChainName],
  )

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      headerTitle='Network'
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='flex flex-col items-center px-7 pt-7 pb-10'>
        <div className='overflow-hidden rounded-2xl'>
          {chains.map((chain, index) => {
            const unavailable = !chain.enabled ? '(Unavailable)' : ''
            return (
              <React.Fragment key={chain.title}>
                {index !== 0 && <CardDivider />}
                <GenericCard
                  data-testing-id={chain.title === 'Testnet' ? 'network-testnet-option' : ''}
                  title={
                    <Text
                      size='md'
                      className='w-[400px]'
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
                        style={{
                          color: Colors.getChainColor(activeChain),
                        }}
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
