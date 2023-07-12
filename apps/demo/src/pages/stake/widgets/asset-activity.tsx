import { ActivityCardContent } from '@leapwallet/cosmos-wallet-hooks'
import { ParsedTx } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider } from '@leapwallet/leap-ui'
import React, { ReactElement } from 'react'
import { useNavigate } from 'react-router'

import { useActiveChain } from '~/hooks/settings/use-active-chain'
import ActivityCard from '~/pages/activity/widgets/activity-card'
import { Colors } from '~/theme/colors'

type AssetActivityProps = {
  activityList: {
    parsedTx: ParsedTx
    content: ActivityCardContent
  }[]
  isActivityLoading: boolean
}

function AssetActivity({ activityList, isActivityLoading }: AssetActivityProps): ReactElement {
  const chain = useActiveChain()
  const navigate = useNavigate()
  return (
    <div className='mb-8'>
      <div className='font-bold text-gray-400 text-sm mb-2'>Recent Activity</div>
      <div className='rounded-t-2xl overflow-hidden bg-white-100 dark:bg-gray-900'>
        {!isActivityLoading &&
          activityList.map((tx, index) => (
            <>
              {index !== 0 && <CardDivider />}
              <ActivityCard
                content={tx.content}
                key={tx.parsedTx.txhash}
                onClick={() => navigate('/activity')}
              />
            </>
          ))}
      </div>
      <div
        style={{ color: Colors.getChainColor(chain) }}
        className='text-sm font-bold px-4 py-3 rounded-b-2xl bg-white-100 dark:bg-gray-900 border-t-2 border-gray-50 dark:border-gray-800 cursor-pointer'
        onClick={() => navigate('/activity')}
      >
        Show more
      </div>
    </div>
  )
}

export default AssetActivity
