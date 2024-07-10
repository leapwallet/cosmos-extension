import { Key, SelectedAddress } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { useSendContext } from 'pages/send-v2/context'
import React, { useEffect, useMemo, useState } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'
import { capitalize, sliceAddress } from 'utils/strings'

import SearchChainWithWalletFilter from './SearchChainWithWalletFilter'

interface MyWalletsProps {
  setSelectedAddress: (address: SelectedAddress) => void
  skipSupportedDestinationChainsIDs: string[]
}

function MyWallets({ skipSupportedDestinationChainsIDs, setSelectedAddress }: MyWalletsProps) {
  const {
    displayAccounts: _displayMyAccounts,
    isIbcSupportDataLoading,
    sendActiveChain,
  } = useSendContext()
  const chainInfos = useChainInfos()
  const activeWallet = useActiveWallet()
  const defaultTokenLogo = useDefaultTokenLogo()

  const [selectedWallet, setSelectedWallet] = useState<Key | null>(activeWallet?.activeWallet)
  const [searchQuery, setSearchQuery] = useState('')
  const trimmedQuery = searchQuery.trim()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _displaySkipAccounts: any[][] = []
  Object.keys(chainInfos).map((chain) => {
    if (skipSupportedDestinationChainsIDs?.includes(chainInfos[chain as SupportedChain]?.chainId)) {
      _displaySkipAccounts.push([chain, selectedWallet?.addresses?.[chain as SupportedChain]])
    }
  })

  const _displayAccounts =
    _displaySkipAccounts.length > 0 ? _displaySkipAccounts : _displayMyAccounts

  const { name, colorIndex } = selectedWallet as Key

  const displayAccounts = useMemo(
    () =>
      _displayAccounts.filter(([chain]) => {
        if (isCompassWallet() && chain !== 'seiTestnet2') {
          return null
        }

        const chainName = chainInfos[chain as SupportedChain]?.chainName ?? chain
        return chainName.toLowerCase().includes(trimmedQuery.toLowerCase())
      }),
    [_displayAccounts, chainInfos, trimmedQuery],
  )

  const toChainId = useQuery().get('toChainId') ?? undefined

  useEffect(() => {
    if (toChainId && displayAccounts?.length > 0) {
      const chainKey = Object.values(chainInfos).find((chain) => chain.chainId === toChainId)?.key
      const toChain = displayAccounts.filter(([_chain]) => _chain === chainKey)?.[0]
      const img = chainInfos[chainKey as SupportedChain]?.chainSymbolImageUrl ?? defaultTokenLogo

      setSelectedAddress({
        address: toChain?.[1],
        avatarIcon: Images.Misc.getWalletIconAtIndex(colorIndex),
        chainIcon: img ?? '',
        chainName: toChain?.[0],
        emoji: undefined,
        name: `${name.length > 12 ? `${name.slice(0, 12)}...` : name} - ${capitalize(
          toChain?.[0] === 'seiTestnet2' ? 'sei' : toChain?.[0],
        )}`,
        selectionType: 'currentWallet',
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toChainId, displayAccounts?.length > 0, sendActiveChain])

  if (isIbcSupportDataLoading) {
    return (
      <div className='bg-white-100 dark:bg-gray-900 rounded-2xl p-3 relative h-48 w-full'>
        <Text size='xs' className='p-1 font-bold' color='text-gray-600 dark:text-gray-200'>
          Loading IBC Supported Chains
        </Text>
        <Loader />
      </div>
    )
  }

  return (
    <>
      <SearchChainWithWalletFilter
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        setSelectedWallet={setSelectedWallet}
        selectedWallet={selectedWallet as Key}
      />

      <div className='relative mt-4 h-[300px] overflow-auto'>
        {displayAccounts.length > 0 ? (
          displayAccounts.map(([_chain, address], index) => {
            const chain = _chain as unknown as SupportedChain
            const img = chainInfos[chain]?.chainSymbolImageUrl ?? defaultTokenLogo
            const chainName = chainInfos[chain]?.chainName ?? chain
            const isLast = index === displayAccounts.length - 1

            return (
              <React.Fragment key={_chain}>
                <div
                  className={`w-full flex items-center gap-3 py-3`}
                  onClick={() => {
                    setSelectedAddress({
                      address: address,
                      avatarIcon: Images.Misc.getWalletIconAtIndex(colorIndex),
                      chainIcon: img ?? '',
                      chainName: chain,
                      emoji: undefined,
                      name: `${name.length > 12 ? `${name.slice(0, 12)}...` : name} - ${capitalize(
                        chain === 'seiTestnet2' ? 'sei' : chain,
                      )}`,
                      selectionType: 'currentWallet',
                    })
                  }}
                >
                  <img
                    src={img}
                    alt={`${chainName} logo`}
                    className='rounded-full border border-white-30 h-10 w-10'
                  />

                  <div>
                    <p className='font-bold dark:text-white-100 text-gray-700 capitalize'>
                      {chainName}
                    </p>

                    <p className='text-sm font-medium dark:text-gray-400 text-gray-600'>
                      {sliceAddress(address)}
                    </p>
                  </div>
                </div>

                {!isLast && (
                  <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                )}
              </React.Fragment>
            )
          })
        ) : (
          <div className='py-[88px] w-full flex-col flex  justify-center items-center gap-4'>
            <div className='material-icons-round !text-[40px] !leading-[40px] dark:text-white-100'>
              help_outline
            </div>

            <div className='flex flex-col justify-start items-center w-full gap-1'>
              <div className='text-md text-center font-bold !leading-[21.5px] dark:text-white-100'>
                {trimmedQuery.length > 0
                  ? `No chains found for "${trimmedQuery}"`
                  : `No chains support IBC with ${chainInfos[sendActiveChain].chainName}`}
              </div>

              <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400'>
                Try searching for a different term
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MyWallets
