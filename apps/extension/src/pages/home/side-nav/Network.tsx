import { useChainId } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, GenericCard } from '@leapwallet/leap-ui'
import { CheckCircle } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork, useSetNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'
import { sendMessageToTab } from 'utils'
import { isSidePanel } from 'utils/isSidePanel'

import Text from '../../../components/text'

export default function NetworkDropUp({
  onCloseHandler,
  isVisible,
}: {
  isVisible: boolean
  onCloseHandler: () => void
}) {
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const setNetwork = useSetNetwork()

  const navigate = useNavigate()
  const currentChainName = useSelectedNetwork()
  const mainnetEvmChainId = useChainId(activeChain, 'mainnet', true)
  const testnetEvmChainId = useChainId(activeChain, 'testnet', true)

  const chains = useMemo(
    () => [
      {
        title: 'Mainnet',
        subTitle: 'Actual blockchain transactions happen here',
        isSelected: currentChainName === 'mainnet',
        enabled: !!chainInfos[activeChain]?.apis?.rpc,
        onClick: async () => {
          if (chainInfos[activeChain]?.apis?.rpc) {
            setNetwork('mainnet')
            navigate('/', { replace: true })
            try {
              await sendMessageToTab({ event: 'chainChanged', data: mainnetEvmChainId })
            } catch (_) {
              //
            }
          }
        },
      },
      {
        title: 'Testnet',
        subTitle: 'Used as a testing service and has no actual value',
        isSelected: currentChainName === 'testnet',
        enabled: !!chainInfos[activeChain]?.apis?.rpcTest,
        onClick: async () => {
          if (chainInfos[activeChain]?.apis?.rpcTest) {
            setNetwork('testnet')
            navigate('/', { replace: true })

            try {
              await sendMessageToTab({ event: 'chainChanged', data: testnetEvmChainId })
            } catch (_) {
              //
            }
          }
        },
      },
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeChain, currentChainName],
  )

  return (
    <BottomModal isOpen={isVisible} closeOnBackdropClick onClose={onCloseHandler} title={'Network'}>
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
                    className={classNames({ 'w-[400px]': !isSidePanel() })}
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
                    <CheckCircle
                      weight='fill'
                      size={24}
                      className='text-gray-600 dark:text-gray-400'
                      style={{
                        color: Colors.getChainColor(activeChain),
                      }}
                    />
                  ) : null
                }
              />
            </React.Fragment>
          )
        })}
      </div>
    </BottomModal>
  )
}
