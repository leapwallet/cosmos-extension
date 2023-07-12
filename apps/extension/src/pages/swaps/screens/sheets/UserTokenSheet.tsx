import { Avatar, Card, HeaderActionType } from '@leapwallet/leap-ui'
import Badge from 'components/badge/Badge'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import NoSearchResults from 'components/no-search-results'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useTokenList } from 'hooks/swaps/useTokenList'
import { Images } from 'images'
import React, { useEffect, useMemo } from 'react'
import { Token } from 'types/bank'
import { capitalize } from 'utils/strings'

interface propTypes {
  isVisible: boolean
  onCloseHandler: () => void
  setTokenData: (id: string, tokenName: string, tokenIcon: string, tokenBalance: string) => void
  selectedTokenName: string
  selectedTokenId: string
  allAssets: Token[]
}

const getTokenId = (token: Token): string => {
  const tokenId = token.ibcDenom != '' ? token.ibcDenom : token.coinMinimalDenom
  return tokenId ?? ''
}

const UserTokensSheet = (props: propTypes) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const activeChain = useActiveChain()
  const [tokenList] = useTokenList()
  const input = useMemo(() => searchQuery.trim(), [searchQuery])

  const [swappableAssets, setSwappableAssets] = React.useState<Token[]>([])

  useEffect(() => {
    if (tokenList) {
      const swappableAssets = props.allAssets.filter((asset) =>
        tokenList.tokens.find((token) => token.denom === getTokenId(asset)),
      )
      const filteredAssets = swappableAssets.filter((asset) =>
        asset.symbol.toLowerCase().includes(input.toLowerCase()),
      )

      setSwappableAssets(filteredAssets)
    }
  }, [tokenList, input, props.allAssets])

  return (
    <BottomSheet
      isVisible={props.isVisible}
      onClose={props.onCloseHandler}
      headerTitle='Swap from'
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='pb-5'>
        <div className='flex flex-col items-center px-[28px] h-full'>
          <div className='mx-auto mt-[28px] w-[344px] mb-[16px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
            <input
              placeholder='search tokens...'
              className='flex flex-grow text-base text-gray-400 outline-none bg-white-0'
              value={input}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {input.length === 0 ? (
              <img src={Images.Misc.SearchIcon} />
            ) : (
              <img
                className='cursor-pointer'
                src={Images.Misc.CrossFilled}
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
          <div
            className='bg-white-100 dark:bg-gray-900 rounded-2xl min-h-[200px] max-h-[400px] w-fit'
            style={{ overflowY: 'scroll' }}
          >
            {swappableAssets.length > 0 ? (
              swappableAssets.map((asset, index) => {
                const title = (
                  <div className='flex  hover:overflow-visible items-center'>
                    <div className='mr-2'>{asset.symbol}</div>
                  </div>
                )
                return (
                  <div
                    key={index}
                    className='relative'
                    onClick={() => {
                      props.setTokenData(getTokenId(asset), asset.symbol, asset.img, asset.amount)
                      props.onCloseHandler()
                    }}
                  >
                    {asset.ibcChainInfo && (
                      <div className='absolute flex top-[16px] left-[68px] items-center'>
                        <div className='mr-2 text-md invisible font-bold'>{asset.symbol}</div>
                        <Badge
                          image={asset.ibcChainInfo.icon}
                          text={`${asset.ibcChainInfo.pretty_name} / ${asset.ibcChainInfo.channelId}`}
                        />
                      </div>
                    )}
                    <Card
                      key={index}
                      avatar={<Avatar avatarImage={asset.img} size='sm' />}
                      isRounded
                      iconSrc={
                        props.selectedTokenId === getTokenId(asset)
                          ? Images.Misc.ChainChecks[activeChain]
                          : undefined
                      }
                      size='md'
                      subtitle={<>Balance: {asset.amount + ' ' + capitalize(asset.symbol)} </>}
                      title={title}
                    />
                  </div>
                )
              })
            ) : (
              <NoSearchResults searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default UserTokensSheet
