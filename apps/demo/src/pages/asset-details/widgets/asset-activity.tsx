import { ActivityCardContent } from '@leapwallet/cosmos-wallet-hooks'
import { ParsedTx } from '@leapwallet/cosmos-wallet-sdk'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import React, { ReactElement } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'

import CardDivider from '~/components/card-divider'
import EmptyCard from '~/components/empty-card'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { Images } from '~/images'
import ActivityCard from '~/pages/activity/widgets/activity-card'
import { Colors } from '~/theme/colors'

type AssetActivityProps = {
  activityList:
    | {
        title: string
        data: {
          parsedTx: ParsedTx
          content: ActivityCardContent
        }[]
      }[]
    | undefined
  isActivityLoading: boolean
}

function AssetActivity({ activityList, isActivityLoading }: AssetActivityProps): ReactElement {
  const isDark = useTheme().theme === ThemeName.DARK
  const chain = useActiveChain()
  const navigate = useNavigate()

  return (
    <div>
      {isActivityLoading ? (
        <Skeleton count={2} />
      ) : activityList?.length === 0 || activityList[0] == undefined ? (
        <EmptyCard
          src={isDark ? Images.Misc.FlashOn : Images.Misc.FlashOn}
          heading='No activity'
          subHeading={`Your activity will appear here`}
          className='mb-8'
        />
      ) : (
        <div>
          <div className='font-bold text-gray-400 text-sm mb-2'>Recent Activity</div>
          <div className='rounded-t-2xl overflow-hidden bg-white-100 dark:bg-gray-900'>
            {!isActivityLoading &&
              activityList.map(({ data, title }) => {
                return (
                  <div key={title} id='activity-list'>
                    <div className='rounded-2xl overflow-hidden'>
                      {data.map((tx, index) => (
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
                  </div>
                )
              })}
          </div>
          <div
            style={{ color: Colors.getChainColor(chain) }}
            className='text-sm font-bold px-4 py-3 rounded-b-2xl bg-white-100 dark:bg-gray-900 border-t-2 border-gray-50 dark:border-gray-800 cursor-pointer'
            onClick={() => navigate('/activity')}
          >
            Show more
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetActivity
