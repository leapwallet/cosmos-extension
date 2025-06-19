import { Buttons } from '@leapwallet/leap-ui'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { cn } from 'utils/cn'

import { InterchangeButton } from './components'
import { SwapHeader } from './components/swap-header'

export const SwapsLoader = () => {
  const selectedNetwork = useSelectedNetwork()

  return (
    <div className='panel-width panel-height enclosing-panel'>
      <SwapHeader onSettings={() => {}} currentSlippage={0.5} />
      <div className='relative flex flex-1 flex-col justify-between w-full gap-3 relative h-[calc(100%-128px)] overflow-y-scroll'>
        {selectedNetwork === 'testnet' && (
          <div className='flex flex-col items-center justify-center px-4 py-2 bg-primary'>
            <div className='font-bold text-xs text-foreground'>Switched to mainnet for swaps</div>
          </div>
        )}
        <div
          className={cn(
            'flex flex-col w-full gap-3 relative px-6 pb-6',
            selectedNetwork === 'testnet' ? 'pt-3' : 'pt-6',
          )}
        >
          <div className='w-full flex flex-col items-center gap-y-1'>
            <div className='w-full bg-secondary-100 rounded-xl p-5 flex flex-col gap-3'>
              <p className='text-muted-foreground text-sm font-medium !leading-[22px]'>You pay</p>
              <div className='flex rounded-2xl justify-between w-full items-center gap-2 h-[34px]'>
                <div className='text-[24px] text-foreground font-bold text-monochrome !leading-[34px]'>
                  0
                </div>
                <Skeleton
                  width={90}
                  height={32}
                  containerClassName='block !leading-none overflow-hidden rounded-full shrink-0'
                />
              </div>

              <div className='flex flex-row items-center justify-between max-[399px]:!items-start text-gray-200 text-xs font-normal w-full min-h-[22px] mt-1'>
                <div className='flex items-center gap-1'>
                  <div className='text-muted-foreground font-normal text-sm !leading-[22.4px]'>
                    $0.00
                  </div>
                  <button
                    disabled={true}
                    onClick={() => {
                      //
                    }}
                    className='rounded-full h-[22px] bg-secondary-200 hover:bg-secondary-300 items-center flex gap-1 justify-center shrink-0 text-gray-600 dark:text-gray-400 dark:hover:text-white-100 hover:text-black-100 opacity-50 pointer-events-none'
                  >
                    <ArrowsLeftRight size={20} className='!leading-[12px] rotate-90 p-1' />
                  </button>
                </div>

                <div className='flex justify-end items-center min-h-[23.2px] max-[399px]:flex-col max-[399px]:justify-start max-[399px]:!items-end'>
                  <span className='text-sm font-medium !leading-[18.9px] text-muted-foreground'>
                    <Skeleton width={115} />
                  </span>
                </div>
              </div>
            </div>

            <InterchangeButton
              isSwitchOrderPossible={true}
              handleSwitchOrder={() => {
                //
              }}
            />

            <div className='w-full bg-secondary-100 rounded-xl p-5 flex flex-col gap-3'>
              <p className='text-muted-foreground text-sm font-medium !leading-[22px]'>You get</p>
              <div className='flex rounded-2xl justify-between w-full items-center gap-2 h-[34px]'>
                <div className='text-[24px] text-foreground font-bold text-monochrome !leading-[34px]'>
                  0
                </div>
                <Skeleton
                  width={90}
                  height={32}
                  containerClassName='block !leading-none overflow-hidden rounded-full shrink-0'
                />
              </div>

              <div className='flex flex-row items-center justify-end max-[399px]:!items-start text-gray-200 text-xs font-normal w-full min-h-[22px] mt-1'>
                <div className='flex justify-end items-center min-h-[23.2px] max-[399px]:flex-col max-[399px]:justify-start max-[399px]:!items-end'>
                  <span className='text-sm font-medium !leading-[18.9px] text-muted-foreground'>
                    <Skeleton width={115} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='sticky bottom-0 left-0 z-[2] right-0 bg-secondary-100 px-5 py-4'>
          <Buttons.Generic
            className='w-full  h-[52px] text-white-100 !bg-primary'
            disabled={true}
            style={{ boxShadow: 'none' }}
            onClick={() => {
              //
            }}
          >
            Enter amount
          </Buttons.Generic>
        </div>
      </div>
    </div>
  )
}
