import { useCustomChains } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import useNewChainTooltip from 'hooks/useNewChainTooltip'
import AddFromChainStore from 'pages/home/AddFromChainStore'
import React, { useState } from 'react'
import { PageHeaderProps } from 'types/components'
import { cn } from 'utils/cn'

import NewChainSupportTooltip from './NewChainSupportTooltip'

const PageHeader = React.memo(({ children, className }: PageHeaderProps) => {
  const { showToolTip: _showToolTip, toolTipData, handleToolTipClose } = useNewChainTooltip()
  const showToolTip = _showToolTip && !!toolTipData
  const [newChain, setNewChain] = useState<string | null>(null)
  const customChains = useCustomChains()

  return (
    <header
      className={cn(
        'sticky top-0 z-10 backdrop-blur-lg isolate border-b border-border-bottom/50 panel-width flex items-center justify-between px-3 py-2',
        className,
      )}
    >
      {showToolTip && (
        <div
          onClick={handleToolTipClose}
          className='cursor-pointer panel-height panel-width absolute top-0 left-0'
        />
      )}

      {children}

      {showToolTip && (
        <NewChainSupportTooltip
          toolTipData={toolTipData}
          handleToolTipClose={handleToolTipClose}
          setNewChain={setNewChain}
        />
      )}

      <AddFromChainStore
        isVisible={!!newChain}
        onClose={() => setNewChain(null)}
        newAddChain={customChains.find((d) => d.chainName === newChain) as ChainInfo}
      />
    </header>
  )
})

PageHeader.displayName = 'PageHeader'
export { PageHeader }
