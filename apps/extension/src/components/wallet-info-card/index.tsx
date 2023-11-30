import { axiosWrapper, ChainInfos, getRestUrl, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { OnboardCard as Card } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import bech32 from 'bech32'
import Tooltip from 'components/better-tooltip'
import Text from 'components/text'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { getChainImage } from 'images/logos'
import { getWalletIconAtIndex } from 'images/misc'
import React, { PropsWithoutRef, useEffect, useMemo, useRef } from 'react'
import Skeleton from 'react-loading-skeleton'
import { isCompassWallet } from 'utils/isCompassWallet'
import { sliceAddress } from 'utils/strings'

const getBalance = async ({
  address,
  lcdUrl,
  chain,
}: {
  address: string
  lcdUrl: string
  chain: string
}) => {
  try {
    const result = await axiosWrapper({
      baseURL: lcdUrl,
      method: 'get',
      url: `/cosmos/bank/v1beta1/balances/${address}`,
    })

    return { balances: result.data.balances ?? [], chain }
  } catch (error) {
    captureException(error)
    return { balances: [], chain }
  }
}

type WalletInfoCardPrps = {
  cosmosAddress: string
  id: number
  onClick: () => void
  isExistingAddress: boolean
  isChosen: boolean
  hidden: boolean
}

function WalletInfoCard({
  cosmosAddress,
  id,
  onClick,
  isExistingAddress,
  isChosen,
  hidden,
  ...rest
}: PropsWithoutRef<WalletInfoCardPrps>) {
  const chainInfos = useChainInfos()
  const controller = useRef(new AbortController())

  const { isLoading, error, data } = useQuery<string[]>({
    queryKey: [cosmosAddress],
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    queryFn: async () => {
      const { words } = bech32.decode(cosmosAddress)

      const promises = Object.values(chainInfos)
        .filter((c) => !c.beta)
        .map((chainInfo) => {
          const accountAddress = bech32.encode(chainInfo.addressPrefix, words)
          const lcdUrl = getRestUrl(chainInfos, chainInfo.key, false)

          if (!lcdUrl) {
            return Promise.reject(new Error('No rest endpoint'))
          }
          return getBalance({
            address: accountAddress,
            lcdUrl,
            chain: chainInfo.key,
          })
        })

      const results = await Promise.allSettled(promises)

      const chainsWithBalances: string[] = []

      results.forEach((response) => {
        if (response.status === 'fulfilled') {
          const { balances, chain } = response.value
          if (
            balances.length > 0 &&
            balances.some(({ amount }: { amount: string }) => Number(amount) > 0)
          ) {
            chainsWithBalances.push(chain)
          }
        }
      })

      return chainsWithBalances
    },
  })

  const copiedIcon = isCompassWallet() ? Images.Misc.CompassCopied : Images.Misc.Copied
  const iconSrc = useMemo(
    () => (isChosen || isExistingAddress ? copiedIcon : Images.Misc.RadioButtonUnchecked),
    [copiedIcon, isChosen, isExistingAddress],
  )

  useEffect(() => {
    const _controller = controller.current
    return () => _controller.abort()
  }, [])

  const imgSrc = useMemo(() => getWalletIconAtIndex(id), [id])
  error && captureException(error)

  return (
    <div className={`rounded-xl w-[376px] shrink-0 ${hidden ? 'hidden' : ''}`}>
      <Card
        imgSrc={imgSrc}
        title={'Wallet ' + (id + 1)}
        subTitle={sliceAddress(cosmosAddress)}
        isRounded={false}
        size={'lg'}
        onClick={onClick}
        iconSrc={iconSrc}
        className={`rounded-t-lg ${!isLoading && !data ? 'rounded-b-lg' : ''}`}
        {...rest}
      />

      {!isCompassWallet() && !error && (
        <>
          <div className='h-[1px] bg-gray-100 dark:bg-gray-600' />
          <div className='w-[376px] bg-white-100 dark:bg-gray-900 px-6 py-2 rounded-b-lg'>
            {isLoading ? (
              <Skeleton className='light:bg-gray-200 bg-gray-800' />
            ) : (
              data && (
                <div className='flex rounded-b-lg'>
                  <div className='flex items-center'>
                    {data.slice(0, 3).map((chain) => (
                      <img
                        key={chain}
                        src={getChainImage(chain)}
                        className='block w-5 h-5 rounded-full shadow ml-1.5'
                      />
                    ))}
                    {data.length > 3 && (
                      <>
                        <Tooltip
                          content={
                            <li className='list-none space-y-3 w-full'>
                              {data.slice(3).map((chain) => (
                                <ul key={chain} className='flex'>
                                  <img
                                    src={getChainImage(chain)}
                                    className='block w-5 h-5 rounded-full shadow mr-3'
                                  />
                                  <Text size='sm' className='capitalize'>
                                    {ChainInfos[chain as SupportedChain]?.chainName ?? chain}
                                  </Text>
                                </ul>
                              ))}
                            </li>
                          }
                        >
                          <div className='relative cursor-pointer'>
                            <Text
                              size='xs'
                              className='ml-2 font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-sm inline-block p-[2px]'
                            >
                              +{data.length - 3}
                            </Text>
                          </div>
                        </Tooltip>
                      </>
                    )}
                  </div>
                  <Text size='sm' className='ml-4 text-gray-600 dark:text-gray-300'>
                    Funds on {data.length} network{data.length > 1 ? 's' : ''}
                  </Text>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default WalletInfoCard
