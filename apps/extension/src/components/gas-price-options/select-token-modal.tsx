import {
  currencyDetail,
  formatTokenAmount,
  sliceWord,
  sortTokens,
  Token,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { BigNumber } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/utils/classes'
import Badge from 'components/badge/Badge'
import BottomModal from 'components/new-bottom-modal'
import NoSearchResults from 'components/no-search-results'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import React, { useCallback, useMemo, useState } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { cn } from 'utils/cn'

type SelectTokenSheetProps = {
  assets: Token[]
  isOpen: boolean
  onClose: () => void
  selectedToken?: Token
  // eslint-disable-next-line no-unused-vars
  onTokenSelect: (baseDenom: string, ibcDenom?: string) => void
}

const TokenCard = ({
  asset,
  onSelect,
  hasToShowIbcTag,
  hasToShowEvmTag,
  usdValue,
  amount,
  symbol,
  isSelected,
}: {
  asset: Token
  onSelect: (token: Token) => void
  hasToShowIbcTag?: boolean
  hasToShowEvmTag?: boolean
  usdValue?: string
  amount: string
  symbol: string
  isSelected: boolean
}) => {
  const [formatCurrency] = useFormatCurrency()

  const [preferredCurrency] = useUserPreferredCurrency()
  const formattedFiatValue = usdValue ? formatCurrency(new BigNumber(usdValue)) : '-'
  const ibcInfo = useMemo(() => {
    if (!asset.ibcChainInfo) return ''

    return `${asset.ibcChainInfo.pretty_name} / ${sliceWord(
      asset.ibcChainInfo?.channelId ?? '',
      7,
      5,
    )}`
  }, [asset.ibcChainInfo])

  const handleTokenSelect = useCallback(() => {
    if (isSelected) return
    onSelect(asset)
  }, [isSelected, onSelect, asset])

  return (
    <div
      className={cn(
        'flex gap-3 items-center mt-4 rounded-xl px-4 py-3 border border-transparent',
        isSelected
          ? 'bg-secondary-200 hover:bg-secondary-200 cursor-not-allowed border-secondary-600'
          : 'bg-secondary-100 hover:bg-secondary-200 cursor-pointer',
      )}
      onClick={handleTokenSelect}
    >
      <img src={asset.img} alt={asset.symbol} className='w-8 h-8 rounded-full' />
      <Text className='font-bold flex-grow' color='text-foreground'>
        {asset.symbol}
        {asset.ibcChainInfo && hasToShowIbcTag ? <Badge text='IBC' title={ibcInfo} /> : null}
        {asset.isEvm && hasToShowEvmTag ? <Badge text='EVM' /> : null}
      </Text>
      <div className='flex flex-col items-end'>
        {formattedFiatValue && formattedFiatValue !== '-' && (
          <Text size='sm' className='font-bold' color='text-foreground'>
            {hideAssetsStore.formatHideBalance(formattedFiatValue)}
          </Text>
        )}
        <Text size='xs' className='font-medium' color='text-secondary-800'>
          {hideAssetsStore.formatHideBalance(
            formatTokenAmount(
              amount,
              sliceWord(symbol, 4, 4),
              3,
              currencyDetail[preferredCurrency].locale,
            ),
          )}
        </Text>
      </div>
    </div>
  )
}

export const SelectTokenModal: React.FC<SelectTokenSheetProps> = React.memo(
  ({ assets, selectedToken, isOpen, onClose, onTokenSelect }: SelectTokenSheetProps) => {
    const [searchQuery, setSearchQuery] = useState('')
    const input = useMemo(() => searchQuery.trim(), [searchQuery])

    const choiceOfTokens = useMemo(() => {
      return (
        assets
          // filter by search query
          .filter((asset) => asset.symbol.toLowerCase().includes(input.toLowerCase()))
          // sort the tokens
          .sort(sortTokens)
      )
    }, [assets, input])

    const handleSelectToken = useCallback(
      (token: Token) => {
        if (token) {
          onTokenSelect(token.coinMinimalDenom, token.ibcDenom)
          onClose()
        }
      },
      [onClose, onTokenSelect],
    )

    return (
      <BottomModal isOpen={isOpen} onClose={onClose} title='Select fees token' fullScreen>
        <div className='flex flex-col h-full w-full gap-7'>
          <SearchInput
            value={input}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder='Search by token name'
          />
          <div className='flex flex-col w-full h-full overflow-y-auto'>
            <Text size='xs' className='font-bold' color='text-muted-foreground'>
              Select token
            </Text>
            <div className='w-full'>
              {choiceOfTokens.length > 0 ? (
                choiceOfTokens.map((asset, index) => {
                  const isFirst = index === 0
                  const isLast = index === choiceOfTokens.length - 1

                  let isSelected = false
                  if (selectedToken) {
                    isSelected = selectedToken?.ibcDenom
                      ? selectedToken?.ibcDenom === asset.ibcDenom
                      : selectedToken?.coinMinimalDenom === asset.coinMinimalDenom
                  }

                  return (
                    <React.Fragment
                      key={`${asset.symbol}-${asset?.coinMinimalDenom}-${asset?.ibcDenom}-${asset?.amount}-${index}`}
                    >
                      <TokenCard
                        amount={asset.amount}
                        symbol={asset.symbol}
                        usdValue={asset.usdValue}
                        asset={asset}
                        onSelect={handleSelectToken}
                        isSelected={isSelected}
                      />
                    </React.Fragment>
                  )
                })
              ) : (
                <NoSearchResults searchQuery={searchQuery} />
              )}
            </div>
          </div>
        </div>
      </BottomModal>
    )
  },
)

SelectTokenModal.displayName = 'SelectTokenModal'
