import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Card, CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { Images } from 'images'
import React from 'react'

type STAKE_SORT_BY = 'Amount staked' | 'Commission' | 'Alphabetical' | 'APY' | 'Random'

type SelectSortByProps = {
  activeChain: SupportedChain
  sortBy: STAKE_SORT_BY
  setSortBy: (s: STAKE_SORT_BY) => void
  isVisible: boolean
  setVisible: (v: boolean) => void
}

const SelectSortBy = React.memo(
  ({ activeChain, sortBy, setSortBy, isVisible, setVisible }: SelectSortByProps) => {
    return (
      <BottomModal
        isOpen={isVisible}
        onClose={() => setVisible(false)}
        title='Sort by'
        closeOnBackdropClick={true}
        contentClassName='[&>div:first-child>div:last-child]:-mt-[2px]'
      >
        <div className='flex flex-col gap-y-1'>
          <div className='dark:bg-gray-950 overflow-clip bg-white-100 rounded-2xl'>
            {(['Amount staked', 'Alphabetical', 'APY'] as STAKE_SORT_BY[]).map((v, index) => (
              <React.Fragment key={v}>
                {index !== 0 && (
                  <div className='[&>div]:dark:!bg-gray-950'>
                    <CardDivider />
                  </div>
                )}

                <Card
                  iconSrc={
                    sortBy === (v as STAKE_SORT_BY)
                      ? Images.Misc.ChainChecks[activeChain]
                      : undefined
                  }
                  size='md'
                  title={v}
                  onClick={() => {
                    setVisible(false)
                    setSortBy(((v as STAKE_SORT_BY) === sortBy ? 'Random' : v) as STAKE_SORT_BY)
                  }}
                  className='dark:!bg-gray-950'
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </BottomModal>
    )
  },
)

SelectSortBy.displayName = 'SelectSortBy'
export { SelectSortBy, SelectSortByProps, STAKE_SORT_BY }
