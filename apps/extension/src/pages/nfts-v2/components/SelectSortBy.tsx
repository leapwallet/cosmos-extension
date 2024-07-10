import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Card, CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React from 'react'
import { getChainName } from 'utils/getChainName'
import { imgOnError } from 'utils/imgOnError'

import { useNftContext } from '../context'

type SelectSortByProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly selectedSortsBy: SupportedChain[]
  readonly setSelectedSortsBy: React.Dispatch<React.SetStateAction<SupportedChain[]>>
}

export function SelectSortBy({
  isVisible,
  onClose,
  selectedSortsBy,
  setSelectedSortsBy,
}: SelectSortByProps) {
  const { sortedCollectionChains } = useNftContext()
  const defaultTokenLogo = useDefaultTokenLogo()
  const chainInfos = useChainInfos()

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      title={'Filter by Chain'}
      closeOnBackdropClick={true}
    >
      <div className='flex flex-col gap-y-1'>
        <div className='dark:bg-gray-900 overflow-clip bg-white-100 rounded-2xl max-h-[300px] overflow-y-scroll'>
          {sortedCollectionChains.map((chain, index) => {
            const chainInfo = chainInfos[chain as SupportedChain]

            return (
              <React.Fragment key={`${chain}-${index}`}>
                {index !== 0 && <CardDivider />}
                <Card
                  iconSrc={selectedSortsBy.includes(chain) ? Images.Misc.CheckCosmos : undefined}
                  size='sm'
                  title={getChainName(chainInfo.chainName)}
                  onClick={() =>
                    setSelectedSortsBy((prevValue) => [
                      ...(prevValue ?? []).filter((prevChain) => prevChain !== chain),
                      chain,
                    ])
                  }
                  avatar={
                    <img
                      src={chainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
                      onError={imgOnError(defaultTokenLogo)}
                      alt={`${chainInfo.chainName} logo`}
                      className='rounded-full w-[24px] h-[24px]'
                    />
                  }
                />
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </BottomModal>
  )
}
