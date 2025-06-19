import { Faders, X } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { AnimatePresence } from 'framer-motion'
import { motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { SearchIcon } from 'icons/search-icon'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AggregatedSupportedChain } from 'types/utility'
import { transition250 } from 'utils/motion-variants'

const searchButtonVariants = {
  hidden: { opacity: 0, scale: 0.95, rotate: 90 },
  visible: { opacity: 1, scale: 1, rotate: 0 },
}

export const TokenSectionHeader = ({
  showSearch,
  toggleSearchTokensInput,
}: {
  showSearch: boolean
  toggleSearchTokensInput: () => void
}) => {
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const selectedNetwork = useSelectedNetwork()

  const navigate = useNavigate()

  const handleGearActionButtonClick = useCallback(() => {
    if (activeChain === 'secret' && selectedNetwork === 'mainnet') {
      navigate('/snip20-manage-tokens?')
      return
    }

    navigate('/manage-tokens')
  }, [activeChain, navigate, selectedNetwork])

  return (
    <>
      <header className='flex items-center justify-between mb-3'>
        <span className='text-sm font-bold'>Your tokens</span>

        <div className='flex items-center gap-3'>
          <Button
            variant='secondary'
            size='icon'
            onClick={toggleSearchTokensInput}
            className='p-1.5 h-auto bg-secondary-100 hover:bg-secondary-200'
          >
            <AnimatePresence mode='wait'>
              {showSearch ? (
                <motion.div
                  key='search'
                  initial='hidden'
                  animate='visible'
                  variants={searchButtonVariants}
                  transition={transition250}
                >
                  <X className='size-4' />
                </motion.div>
              ) : (
                <motion.div
                  key='clear'
                  initial='hidden'
                  animate='visible'
                  variants={searchButtonVariants}
                  transition={transition250}
                >
                  <SearchIcon className='size-4' />
                </motion.div>
              )}
            </AnimatePresence>
            <span className='sr-only'>Search tokens</span>
          </Button>

          {activeChain !== AGGREGATED_CHAIN_KEY && (
            <Button
              variant='secondary'
              size='icon'
              onClick={handleGearActionButtonClick}
              className='p-1.5 h-auto bg-secondary-100 hover:bg-secondary-200'
            >
              <Faders size={16} className='-rotate-90' />
              <span className='sr-only'>Manage tokens</span>
            </Button>
          )}
        </div>
      </header>
    </>
  )
}
