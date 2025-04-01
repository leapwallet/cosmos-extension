import GasPriceOptions from 'components/gas-price-options'
import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import { TabSelectors } from 'pages/stake-v2/components/TabList/tab-list-selector'
import React, { useState } from 'react'
import { transition150 } from 'utils/motion-variants'
import { slideVariants } from 'utils/motion-variants/global-layout-motions'

enum Tab {
  FEES = 'fees',
  DETAILS = 'details',
}

const tabs = [
  {
    id: Tab.FEES,
    label: 'Fees',
  },
  {
    id: Tab.DETAILS,
    label: 'Details',
  },
]

const indicatorDefaultScale = {
  transform: 'translateX(0px) scaleX(0.161044)',
}

export const TabList = (props: { gasPriceError?: string | null; txData: unknown }) => {
  const [selectedTab, setSelectedTab] = useState(tabs[0])

  return (
    <>
      <div className='border-b border-border-bottom px-6'>
        <TabSelectors
          buttons={tabs}
          setSelectedTab={setSelectedTab}
          selectedIndex={tabs.findIndex(({ id }) => id === selectedTab.id)}
          className='gap-0.5'
          buttonClassName='px-3.5'
          indicatorDefaultScale={indicatorDefaultScale}
        />
      </div>

      <div className='flex flex-col gap-6 mx-6'>
        <AnimatePresence exitBeforeEnter initial={false}>
          {selectedTab.id === Tab.FEES && (
            <motion.div
              key={Tab.DETAILS}
              className='flex flex-col gap-7'
              transition={transition150}
              variants={slideVariants}
              initial='exit'
              animate='animate'
              exit='exit'
            >
              <GasPriceOptions.Selector />

              <div className='border border-border-bottom rounded-xl '>
                <GasPriceOptions.AdditionalSettingsToggle />
                <GasPriceOptions.AdditionalSettings showGasLimitWarning={true} />
              </div>

              {!!props.gasPriceError && (
                <p className='text-destructive-100 text-sm font-medium mt-2 px-1'>
                  {props.gasPriceError}
                </p>
              )}
            </motion.div>
          )}

          {selectedTab.id === Tab.DETAILS && (
            <motion.pre
              key={Tab.FEES}
              transition={transition150}
              variants={slideVariants}
              initial='enter'
              animate='animate'
              exit='enter'
              className='text-xs bg-secondary-100 p-5 w-full overflow-x-auto rounded-2xl'
            >
              {JSON.stringify(
                props.txData,
                (_, value) => (typeof value === 'bigint' ? value.toString() : value),
                2,
              )}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
