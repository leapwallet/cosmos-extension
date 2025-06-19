import { sliceAddress } from '@leapwallet/cosmos-wallet-hooks'
import { generateWalletFromPrivateKey, getFullHDPath } from '@leapwallet/leap-keychain'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import React, { useMemo } from 'react'
import { chainInfoStore } from 'stores/chain-infos-store'
import { transition150 } from 'utils/motion-variants'
import { validatePrivateKey } from 'utils/validateSeedPhrase'

import { TextareaWithPaste } from './textarea-with-paste'

type PrivateKeyInputProps = {
  onChange: (value: string) => void
  value: string
  error?: string
}

const variants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
}

export const PrivateKeyInput = ({ onChange, value, error }: PrivateKeyInputProps) => {
  const addressToDisplay = useMemo(() => {
    if (!value) return ''

    const { valid, correctedSecret } = validatePrivateKey(value)
    if (!valid) return ''

    const chain = chainInfoStore.chainInfos.seiTestnet2
    if (!chain) return ''

    try {
      const wallet = generateWalletFromPrivateKey(
        correctedSecret,
        getFullHDPath(chain?.useBip84 ? '84' : '44', chain?.bip44.coinType, '0'),
        'cosmos',
        chain.btcNetwork,
      )

      const account = wallet?.getAccounts?.()?.[0]
      if (!account) return ''

      return sliceAddress(account.address)
    } catch (error) {
      return ''
    }
  }, [value])

  return (
    <div className='w-full'>
      <TextareaWithPaste
        autoFocus
        placeholder='Enter private key'
        className='w-full h-[9.375rem] resize-none'
        value={value}
        onChange={onChange}
        error={error}
      />

      <AnimatePresence>
        {error ? (
          <motion.span
            className='text-xs font-medium text-destructive-100 block text-center mt-4'
            data-testing-id='error-text-ele'
            transition={transition150}
            variants={variants}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            {error}
          </motion.span>
        ) : addressToDisplay ? (
          <motion.div
            className='flex items-center justify-between text-sm font-medium mt-3'
            transition={transition150}
            variants={variants}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            <span className='text-muted-foreground'>Account address</span>
            <span className='text-secondary-foreground'>{addressToDisplay}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
