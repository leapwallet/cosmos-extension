import {
  Token,
  useActiveChain,
  useAutoFetchedCW20Tokens,
  useChainInfo,
  useDenoms,
} from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import NoSearchResults from 'components/no-search-results'
import { SearchInput } from 'components/search-input'
import { TokenCard } from 'components/token-card/TokenCard'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'

type SelectTokenSheetProps = {
  assets: Token[]
  isOpen: boolean
  onClose: () => void
  selectedToken: Token
  // eslint-disable-next-line no-unused-vars
  onTokenSelect: (token: Token) => void
}

export const SelectTokenSheet: React.FC<SelectTokenSheetProps> = ({
  assets,
  selectedToken,
  isOpen,
  onClose,
  onTokenSelect,
}) => {
  const activeChain = useActiveChain()
  const activeChainInfo = useChainInfo()
  const denoms = useDenoms()
  const [searchQuery, setSearchQuery] = useState('')
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens()

  const combinedDenoms = useMemo(() => {
    return {
      ...denoms,
      ...autoFetchedCW20Tokens,
    }
  }, [denoms, autoFetchedCW20Tokens])

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
    <BottomModal title='Select Token' isOpen={isOpen} closeOnBackdropClick={true} onClose={onClose}>
      <div className='flex flex-col items-center h-full'>
        <SearchInput
          placeholder='Search tokens...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />

        <div
          className='bg-white-100 dark:bg-gray-900 rounded-2xl min-h-[200px] max-h-[400px] w-fit'
          style={{ overflowY: 'scroll' }}
        >
          {transferableTokens.length > 0 ? (
            transferableTokens.map((asset, index) => {
              const isFirst = index === 0
              const isLast = index === transferableTokens.length - 1

              let isSelected = selectedToken?.coinMinimalDenom === asset.coinMinimalDenom
              if (selectedToken?.ibcDenom || asset.ibcDenom) {
                isSelected = selectedToken?.ibcDenom === asset.ibcDenom
              }
              if (selectedToken?.isEvm || asset?.isEvm) {
                isSelected = isSelected && selectedToken?.isEvm === asset?.isEvm
              }

              return (
                <React.Fragment key={`${asset.symbol}-${index}`}>
                  <div className='relative' onClick={() => handleSelectToken(asset)}>
                    <TokenCard
                      assetImg={asset.img}
                      title={asset?.name ?? asset.symbol}
                      ibcChainInfo={asset.ibcChainInfo}
                      amount={asset.amount}
                      symbol={asset.symbol}
                      isIconVisible={isSelected}
                      iconSrc={
                        Images.Misc.ChainChecks[activeChain] ?? Images.Misc.ChainChecks['cosmos']
                      }
                      isRounded={isFirst || isLast}
                      size='md'
                      usdValue={asset.usdValue}
                      isEvm={asset?.isEvm}
                      hasToShowEvmTag={asset?.isEvm}
                    />
                  </div>
                  {!isLast && <CardDivider />}
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
}
