import { sliceAddress } from '@leapwallet/cosmos-wallet-hooks'
import { CaretDown, CheckCircle } from '@phosphor-icons/react'
import { Checkbox } from 'components/ui/check-box'
import { Skeleton } from 'components/ui/skeleton'
import { AnimatePresence, motion } from 'framer-motion'
import { useDefaultTokenLogo } from 'hooks'
import { useCopy } from 'hooks/useCopy'
import { getChainImage } from 'images/logos'
import React, { HTMLAttributes, PropsWithoutRef, useEffect, useMemo, useState } from 'react'
import { getDerivationPathToShow } from 'utils'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { opacityFadeInOut, transition150, transition250 } from 'utils/motion-variants'

import { useBalances } from './use-balances'

type WalletInfoCardPrps = {
  walletName: string
  index: number
  onSelectChange: (id: number, flag: boolean) => void
  isExistingAddress: boolean
  isLedger?: boolean
  isChosen: boolean
  showDerivationPath?: boolean
  path?: string
  name?: string
  cosmosAddress?: string
  evmAddress?: string
  bitcoinAddress?: string
  moveAddress?: string
  solanaAddress?: string
  suiAddress?: string
  className?: string
} & HTMLAttributes<HTMLLabelElement>

const cardListVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' },
}

function WalletInfoCard({
  walletName,
  index,
  showDerivationPath = false,
  isExistingAddress,
  isLedger,
  isChosen,
  onSelectChange,
  path,
  cosmosAddress,
  evmAddress,
  bitcoinAddress,
  moveAddress,
  solanaAddress,
  suiAddress,
  className,
  ...props
}: PropsWithoutRef<WalletInfoCardPrps>) {
  const [isExpanded, setIsExpanded] = useState(true)

  const { data, nonZeroData, zeroBalance, isLoading } = useBalances({
    cosmosAddress,
    bitcoinAddress,
    moveAddress,
    evmAddress,
    solanaAddress,
    suiAddress,
  })

  const balances = zeroBalance ? data : nonZeroData

  const derivationPath = useMemo(() => {
    return getDerivationPathToShow(path ?? '')
  }, [path])

  useEffect(() => {
    if (zeroBalance && !isLoading) {
      setIsExpanded(false)
    }
  }, [zeroBalance, isLoading])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (isLedger && isExistingAddress) {
      onSelectChange((path || index) as any, true)
      return
    }

    onSelectChange((path || index) as any, !zeroBalance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zeroBalance, isLoading, index, isLedger, isExistingAddress])

  const addressesToShow = useMemo(() => {
    return isLedger ? data : balances
  }, [isLedger, data, balances])

  return (
    <label
      className={cn(
        'rounded-xl w-full bg-secondary-200 shrink-0 cursor-pointer',
        isExistingAddress && !isLedger && 'opacity-50',
        className,
      )}
      {...props}
    >
      <div className='flex items-center gap-2 px-5 pt-5 pb-4'>
        <div
          role='button'
          className='flex items-center gap-2'
          onClick={(e) => {
            if (!addressesToShow || !addressesToShow.length) {
              return
            }

            e.preventDefault()
            e.stopPropagation()
            setIsExpanded((prev) => !prev)
          }}
        >
          <span className='font-bold text-mdl select-none'>{walletName}</span>
          {showDerivationPath && (
            <span className='text-xs font-medium py-px px-[6px] rounded bg-secondary-300'>
              {derivationPath}
            </span>
          )}

          {!isLoading && !!addressesToShow?.length && (
            <CaretDown
              size={14}
              className={cn(
                'text-muted-foreground transition-transform',
                isExpanded && '-rotate-180',
              )}
            />
          )}
          {isExistingAddress && !isLedger && (
            <span className='text-xs font-medium py-px px-[6px] rounded bg-secondary-300'>
              Already exists
            </span>
          )}
        </div>

        <Checkbox
          disabled={isExistingAddress}
          checked={isChosen}
          onCheckedChange={(flag) =>
            onSelectChange((path || index) as any, flag !== 'indeterminate' && !!flag)
          }
          className='ml-auto'
        />
      </div>

      <AnimatePresence mode='wait'>
        {isLoading ? (
          <motion.div
            key='skeleton'
            className='flex flex-col border-t border-secondary-600/50 overflow-hidden'
            initial='hidden'
            animate='visible'
            exit='hidden'
            variants={opacityFadeInOut}
            transition={transition250}
          >
            <AddressAndBalanceSkeleton />
          </motion.div>
        ) : (
          isExpanded &&
          addressesToShow && (
            <motion.div
              key='data'
              className='flex flex-col border-t border-secondary-600/50 overflow-hidden'
              initial='hidden'
              animate='visible'
              exit='hidden'
              variants={cardListVariants}
              transition={transition250}
            >
              {addressesToShow.map((chain) => (
                <AddressAndBalanceCard
                  {...chain}
                  chainKey={chain.key}
                  name={chain.name}
                  key={chain.key}
                />
              ))}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </label>
  )
}

export default WalletInfoCard

const AddressText = ({ address }: { address: string }) => {
  const { copy, isCopied } = useCopy()

  return (
    <AnimatePresence mode='wait'>
      {isCopied ? (
        <motion.span
          key='copied'
          className='text-sm font-bold text-accent-success ml-auto flex items-center gap-1'
          initial='hidden'
          animate='visible'
          exit='hidden'
          variants={opacityFadeInOut}
          transition={transition150}
        >
          <CheckCircle size={16} /> Copied
        </motion.span>
      ) : (
        <motion.span
          key='address'
          className='text-sm font-bold text-muted-foreground ml-auto hover:text-foreground transition-colors'
          initial='hidden'
          animate='visible'
          exit='hidden'
          variants={opacityFadeInOut}
          transition={transition150}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            copy(address)
          }}
        >
          {sliceAddress(address)}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

const AddressAndBalanceCard = (props: {
  name: string
  chainKey: string
  denom: string
  address?: string
  amount: string
}) => {
  const defaultTokenLogo = useDefaultTokenLogo()
  return (
    <motion.div
      className='px-5 py-4 flex items-center gap-2.5 w-full border-b border-secondary-600/25 last:border-b-0 overflow-hidden shrink-0'
      initial='hidden'
      animate='visible'
      exit='hidden'
      variants={opacityFadeInOut}
      transition={transition250}
    >
      <img
        src={getChainImage(props.chainKey)}
        onError={imgOnError(defaultTokenLogo)}
        className='rounded-full overflow-hidden size-9'
      />

      <div className='flex flex-col gap-0.5 capitalize'>
        <span className='text-md font-bold'>{props.name}</span>
        <span className='text-xs font-medium text-muted-foreground'>
          {props.amount} {props.denom}
        </span>
      </div>

      {props.address && <AddressText address={props.address} />}
    </motion.div>
  )
}

export const AddressAndBalanceSkeleton = () => {
  return (
    <div className='px-5 py-4 flex items-center gap-2.5 w-full border-b border-secondary-600/25 last:border-b-0'>
      <Skeleton className='rounded-full size-9' />

      <div className='flex flex-col gap-2 capitalize h-[42px] justify-center'>
        <Skeleton className='w-16 h-2.5' />
        <Skeleton className='w-10 h-2' />
      </div>

      <Skeleton className='w-20 h-3 ml-auto' />
    </div>
  )
}

export const AddressAndBalanceCardSkeleton = ({ walletName }: { walletName: string }) => {
  return (
    <div className='rounded-xl w-full bg-secondary-200 shrink-0'>
      <div className='flex items-center gap-2 px-5 pt-5 pb-4'>
        <span className='font-bold text-mdl'>{walletName}</span>

        <Checkbox disabled className='ml-auto' />
      </div>

      <div className='h-[0.5px] w-full bg-secondary-600/50' />

      <AddressAndBalanceSkeleton />
    </div>
  )
}

export const SelectWalletsLabel = ({
  count,
  total,
  onSelectAllToggle,
}: {
  count: number
  total: number
  onSelectAllToggle: (flag: boolean) => void
}) => {
  return (
    <label className='bg-secondary-200 rounded-xl flex items-center justify-between p-5 select-none'>
      <span className='font-bold'>
        {count} {count === 1 ? 'wallet' : 'wallets'} selected
      </span>

      <div className='flex items-center gap-1.5'>
        <span className='text-muted-foreground text-sm font-bold'>Select All</span>
        <Checkbox checked={count === total} onCheckedChange={onSelectAllToggle} />
      </div>
    </label>
  )
}
