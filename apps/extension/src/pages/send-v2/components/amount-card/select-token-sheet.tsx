import {
  Token,
  useAutoFetchedCW20Tokens,
  useChainInfo,
  useDenoms,
} from '@leapwallet/cosmos-wallet-hooks'
import BottomModal from 'components/bottom-modal'
import NoSearchResults from 'components/no-search-results'
import { SearchInput } from 'components/search-input'
import useQuery from 'hooks/useQuery'
import { useSendContext } from 'pages/send-v2/context'
import { TokenCard } from 'pages/swaps-v2/components/TokenCard'
import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SourceToken } from 'types/swap'

type SelectTokenSheetProps = {
  assets: Token[]
  isOpen: boolean
  onClose: () => void
  selectedToken: Token
  onTokenSelect: (token: Token) => void
}

export const SelectTokenSheet = React.memo(
  ({ assets, selectedToken, isOpen, onClose, onTokenSelect }: SelectTokenSheetProps) => {
    const denoms = useDenoms()
    const [searchQuery, setSearchQuery] = useState('')
    const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens()

    const { sendActiveChain } = useSendContext()
    const locationState = useLocation().state
    const activeChainInfo = useChainInfo(sendActiveChain)

    const combinedDenoms = useMemo(() => {
      return {
        ...denoms,
        ...autoFetchedCW20Tokens,
      }
    }, [])

    let assetCoinDenom = useQuery().get('assetCoinDenom') ?? undefined
    assetCoinDenom = useMemo(() => {
      if (locationState && (locationState as Token).coinMinimalDenom) {
        const token = locationState as Token

        return token.ibcDenom || token.coinMinimalDenom
      }

      return assetCoinDenom
    }, [assetCoinDenom, locationState])

    const _assets = useMemo(() => {
      return assets.filter((token) => {
        return (
          String(token.amount) !== '0' &&
          (combinedDenoms[token.coinMinimalDenom as keyof typeof denoms] ??
            Object.values(activeChainInfo.nativeDenoms).find(
              (_denom) => _denom.coinMinimalDenom === token.coinMinimalDenom,
            ))
        )
      })
    }, [activeChainInfo.nativeDenoms, assets, combinedDenoms])

    const transferableTokens = useMemo(
      () =>
        _assets.filter((asset) =>
          asset.symbol.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        ),
      [_assets, searchQuery],
    )

    const handleSelectToken = (token: Token) => {
      onTokenSelect(token)
      onClose()
    }

    return (
      <BottomModal
        title='Select Token'
        isOpen={isOpen}
        closeOnBackdropClick={true}
        onClose={onClose}
        contentClassName='!bg-white-100 dark:!bg-gray-950'
        className='p-6'
      >
        <div className='flex flex-col items-center h-full'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder='Search tokens...'
            divClassName='rounded-2xl w-full flex gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 focus-within:border-green-600 border border-transparent'
            inputClassName='flex flex-grow text-base outline-none bg-white-0 font-bold text-black-100 dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400 !leading-[21px]'
          />

          <div
            className='bg-white-100 dark:bg-gray-950 rounded-2xl min-h-[200px] max-h-[360px] w-full mt-4'
            style={{ overflowY: 'scroll' }}
          >
            {transferableTokens.length > 0 ? (
              transferableTokens.map((asset, index) => {
                const isLast = index === transferableTokens.length - 1

                let isSelected = selectedToken?.coinMinimalDenom === asset.coinMinimalDenom
                if (selectedToken?.ibcDenom || asset.ibcDenom) {
                  isSelected = selectedToken?.ibcDenom === asset.ibcDenom
                }
                if (selectedToken?.isEvm || asset?.isEvm) {
                  isSelected = isSelected && selectedToken?.isEvm === asset?.isEvm
                }

                return (
                  <React.Fragment key={`${asset.coinMinimalDenom}-${index}`}>
                    <TokenCard
                      onTokenSelect={handleSelectToken}
                      token={asset as SourceToken}
                      hideAmount={asset.amount === '0'}
                      isSelected={isSelected}
                      selectedChain={undefined}
                      showRedirection={false}
                    />
                    {!isLast && (
                      <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <NoSearchResults searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </BottomModal>
    )
  },
)

SelectTokenSheet.displayName = 'SelectTokenSheet'
