import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { BTC_CHAINS, isAptosChain, isSolanaChain, isSuiChain } from '@leapwallet/cosmos-wallet-sdk'
import { Plus } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import { useSendContext } from 'pages/send/context'
import React from 'react'

export const Memo = ({ containerClassname }: { containerClassname?: string }) => {
  const { memo, setMemo, addressWarning, sendActiveChain } = useSendContext()
  const chains = useGetChains()

  if (
    isAptosChain(sendActiveChain) ||
    chains?.[sendActiveChain]?.evmOnlyChain ||
    BTC_CHAINS.includes(sendActiveChain) ||
    isSolanaChain(sendActiveChain) ||
    isSuiChain(sendActiveChain)
  ) {
    return null
  }

  return (
    <div
      className={classNames(
        'mx-6 p-5 rounded-xl border border-secondary-100 flex justify-between items-center focus-within:border-secondary-400 hover:border-secondary-400',
        containerClassname,
      )}
    >
      <input
        type='text'
        value={memo}
        placeholder='Add memo'
        className='!leading-[22.4px] bg-transparent font-medium text-sm text-monochrome placeholder:text-muted-foreground outline-none w-full'
        onChange={(e) => setMemo(e.target?.value)}
      />
      {memo.length === 0 ? (
        <Plus className='w-5 h-5 p-[2px] shrink-0 text-muted-foreground' />
      ) : (
        <div onClick={() => setMemo('')}>
          <Text size='xs' color='text-muted-foreground' className=' font-bold cursor-pointer ml-2'>
            Clear
          </Text>
        </div>
      )}
    </div>
  )
}
