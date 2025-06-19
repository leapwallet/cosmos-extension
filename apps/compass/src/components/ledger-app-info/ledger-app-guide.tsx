import { CaretDown, CaretUp } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { closeSidePanel } from 'utils/closeSidePanel'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

const ListItem = ({ order, text }: { order: number; text: string }) => {
  return (
    <div className='flex items-center mb-4'>
      <Text
        size='sm'
        className='flex h-[27px] w-[27px] justify-center items-center rounded-full bg-gray-900 mr-4'
      >
        {order}
      </Text>
      <Text size='sm' className='font-medium w-[300px]'>
        {text}
      </Text>
    </div>
  )
}

export const LedgerAppGuide = () => {
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const navigate = useNavigate()
  const [showPopup, setShowPopup] = useState(false)

  const handleAccordionClick = () => {
    setShowDetails((prevShowDetails) => !prevShowDetails)
  }

  const goToImportSeiLedger = () => {
    const views = browser.extension.getViews({ type: 'popup' })
    if (views.length === 0 && !isSidePanel()) {
      navigate('/onboardingImport?walletName=ledger&app=sei')
    } else {
      window.open('index.html#/onboardingImport?walletName=ledger&app=sei')
      closeSidePanel()
    }
  }
  return (
    <>
      <Button
        className={'absolute bottom-4 left-6 w-[352px] mt-auto'}
        variant='outline'
        size='md'
        onClick={() => setShowPopup(true)}
      >
        Why can’t I send to this address?
      </Button>

      <BottomModal
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        fullScreen={true}
        title={<Text size='md'>Why can’t I send to this address?</Text>}
        contentClassName='bg-secondary-50'
      >
        <Text size='sm' className='font-medium mb-4'>
          {
            "You're using the Cosmos App on Ledger, which only supports Cosmos-style addresses (starting with sei...)"
          }
        </Text>
        <Text size='sm' className='font-medium mb-4'>
          {"Since you're trying to send to a 0x address, you'll need to:"}{' '}
        </Text>
        <ListItem order={1} text='Import your Ledger using the Sei App' />
        <ListItem
          order={2}
          text='Use your existing Cosmos wallet to send supported tokens to your new Sei address on the same chain.'
        />
        <ListItem order={3} text='Then try this transaction again from the new wallet' />
        <div className='w-full flex-col dark:bg-gray-950 bg-white-100 border border-secondary-200 flex items-center justify-between rounded-2xl overflow-hidden'>
          <div
            role='button'
            tabIndex={0}
            onClick={handleAccordionClick}
            className='w-full flex-row flex justify-between items-center gap-2 cursor-pointer p-3'
          >
            <div className='flex w-full items-center justify-end gap-1'>
              <Text size='sm' className='font-medium'>
                Why this happens?
              </Text>
              {showDetails ? (
                <CaretUp size={14} className='font-medium text-secondary-800 ml-auto' />
              ) : (
                <CaretDown size={14} className='font-medium text-secondary-800 ml-auto' />
              )}
            </div>
          </div>
          {showDetails ? (
            <AnimatePresence initial={false}>
              <motion.div
                key='more-details'
                initial={{ height: 0, opacity: 0.6 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0.6 }}
                transition={{ duration: 0.2 }}
                className='w-full p-3 border-t border-secondary-300 border-dashed'
              >
                <Text size='sm'>
                  Ledger creates different wallet addresses depending on the app (Cosmos vs. Sei),
                  even when using the same recovery phrase. The Cosmos App uses coin type 118, while
                  the Sei App uses coin type 60 for EVM-compatible addresses.
                </Text>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
        <Button
          className='absolute bottom-4 left-5 w-[360px]'
          onClick={() => goToImportSeiLedger()}
        >
          Import with Sei App
        </Button>
      </BottomModal>
    </>
  )
}
