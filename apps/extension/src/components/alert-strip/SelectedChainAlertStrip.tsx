import { selectedChainAlertState } from 'atoms/selected-chain-alert'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork, useSetNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import React from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState } from 'recoil'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import AlertStrip from './AlertStrip'

const SelectedChainAlertStrip = () => {
  const [showSelectedChainAlert, setShowSelectedChainAlert] =
    useRecoilState(selectedChainAlertState)

  const activeChain = useActiveChain()
  const selectedNetwork = useSelectedNetwork()
  const adjustedSetCurrentChainName = useSetNetwork()
  const navigate = useNavigate()
  const chainInfos = useChainInfos()

  const isTestnet = selectedNetwork === 'testnet'
  const chain = chainInfos[activeChain]
  const isOnTestnetWithNewMainnet = ['pryzmtestnet']?.includes(chain?.key) && isTestnet

  return (
    <>
      {isCompassWallet() && isTestnet && activeChain !== 'seiDevnet' && (
        <AlertStrip
          message='You are on Sei Testnet'
          bgColor={Colors.getChainColor(activeChain)}
          alwaysShow={isTestnet}
        />
      )}

      {showSelectedChainAlert && !isCompassWallet() && (
        <AlertStrip
          childComponent={
            isOnTestnetWithNewMainnet ? (
              <>
                {chain?.chainName} mainnet is now live.
                <span className='underline ml-1'>Switch to mainnet!</span>
              </>
            ) : undefined
          }
          message={`You are on ${chain?.chainName}${
            isTestnet && !chain?.chainName.includes('Testnet') ? ' Testnet' : ''
          }`}
          className={isOnTestnetWithNewMainnet ? 'cursor-pointer' : ''}
          onClick={
            isOnTestnetWithNewMainnet
              ? () => {
                  adjustedSetCurrentChainName('mainnet')
                  navigate('/', { replace: true })
                }
              : undefined
          }
          bgColor={chain?.theme?.primaryColor}
          alwaysShow={isTestnet}
          onHide={() => {
            setShowSelectedChainAlert(false)
          }}
        />
      )}
    </>
  )
}

export default SelectedChainAlertStrip
