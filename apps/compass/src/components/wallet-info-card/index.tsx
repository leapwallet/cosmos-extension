import { axiosWrapper, getRestUrl } from '@leapwallet/cosmos-wallet-sdk'
import { captureException } from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import { bech32 } from 'bech32'
import Text from 'components/text'
import { Checkbox } from 'components/ui/check-box'
import { Skeleton } from 'components/ui/skeleton'
import { REMOVED_CHAINS_FROM_ONBOARDING } from 'config/constants'
import { AnimatePresence, motion } from 'framer-motion'
import { useChainInfos } from 'hooks/useChainInfos'
import { getWalletIconAtIndex } from 'images/misc'
import React, { PropsWithoutRef, useEffect, useMemo, useRef } from 'react'
import { getDerivationPathToShow } from 'utils'
import { cn } from 'utils/cn'
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

type WalletInfoCardProps = {
  id: number
  address: string
  isChosen: boolean
  onClick: () => void
  className?: string
  evmAddress?: string | null
  isExistingAddress: boolean
  showDerivationPath: boolean
  name: string | undefined
  path: string | undefined
}

const chainDetails = {
  chainId: 'seiTestnet2',
  decimals: 6,
  symbol: 'SEI',
}

const animationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  exitWithNoData: { opacity: 0, height: 0, margin: 0 },
}

const WalletInfoCard = ({
  address,
  id,
  className,
  onClick,
  isChosen,
  evmAddress,
  isExistingAddress,
  showDerivationPath,
  name,
  path,
  ...props
}: PropsWithoutRef<WalletInfoCardProps>) => {
  const chainInfos = useChainInfos()
  const controller = useRef(new AbortController())

  const { data, isLoading } = useQuery({
    queryKey: [address],
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    queryFn: async () => {
      const { words } = bech32.decode(address)

      const promises = Object.values(chainInfos)
        .filter((c) => !c.beta && !REMOVED_CHAINS_FROM_ONBOARDING.includes(c.chainId))
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

      return results.reduce((acc, response) => {
        if (response.status === 'fulfilled') {
          const { balances, chain } = response.value
          if (chain === chainDetails.chainId) {
            acc += Number(balances?.[0].amount) / 10 ** chainDetails.decimals
          }
        }
        return acc
      }, 0)
    },
    retry: false,
    onError: (error) => {
      captureException(error)
    },
  })

  useEffect(() => {
    const _controller = controller.current
    return () => _controller.abort()
  }, [])

  const imgSrc = useMemo(() => getWalletIconAtIndex(id), [id])

  const derivationPath = useMemo(() => {
    return getDerivationPathToShow(path ?? '')
  }, [path])

  return (
    <label
      {...props}
      htmlFor={`${path}-${id}`}
      className={cn(
        'flex flex-row gap-3 items-center p-5 w-full cursor-pointer select-none',
        className,
      )}
    >
      <img src={imgSrc} alt='wallet-icon' className='size-10' />
      <div className='flex flex-col w-full justify-center h-11'>
        <div className='flex gap-2 items-center'>
          <span className='text-md font-bold'>{name || sliceAddress(evmAddress || address)}</span>
          {showDerivationPath && derivationPath && (
            <Text className='text-xs font-medium mb-[1px] pt-[1px] pb-[2px] px-[6px] bg-secondary-300 rounded-[4px]'>
              {derivationPath}
            </Text>
          )}
        </div>
        <AnimatePresence>
          {isLoading ? (
            <Skeleton className={'bg-secondary-400 w-20 h-4 mt-1'} asChild>
              <motion.div
                variants={animationVariants}
                initial='initial'
                animate='animate'
                exit={data ? 'exit' : 'exitWithNoData'}
              />
            </Skeleton>
          ) : data ? (
            <motion.span
              variants={animationVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              className='text-sm font-medium text-muted-foreground'
            >
              {data} {chainDetails.symbol}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <Checkbox
        onCheckedChange={onClick}
        checked={isExistingAddress || isChosen}
        disabled={isExistingAddress}
        id={`${path}-${id}`}
      />
    </label>
  )
}

export default WalletInfoCard
