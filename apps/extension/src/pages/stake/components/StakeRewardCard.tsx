import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar, GenericCard } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import TokenCardSkeleton from 'components/Skeletons/TokenCardSkeleton'
import Text from 'components/text'
import { useDefaultTokenLogo } from 'hooks'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import { Images } from 'images'
import React from 'react'
import { hex2rgba } from 'utils/hextorgba'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

type StakeRewardCardProps = {
  rewardsAmount: string
  validatorIcon?: string
  onClaim?: () => void
  isLoading: boolean
  rewardsTokens: string
  forceChain?: SupportedChain
}

const StakeRewardCard = React.memo(
  ({
    rewardsAmount,
    onClaim,
    isLoading,
    validatorIcon,
    rewardsTokens,
    forceChain,
  }: StakeRewardCardProps) => {
    const defaultTokenLogo = useDefaultTokenLogo()
    const themeColor = useThemeColor(forceChain)
    const [formatCurrency] = useFormatCurrency()
    const { formatHideBalance } = useHideAssets()

    if (isLoading) {
      return (
        <div className='rounded-2xl py-3 dark:bg-gray-950 bg-white-100 justify-center'>
          <TokenCardSkeleton />
        </div>
      )
    }

    return (
      <div className='relative rounded-2xl items-center py-3 dark:bg-gray-950 bg-white-100 justify-center'>
        <GenericCard
          img={
            <div className='mr-3'>
              <Avatar
                size='sm'
                avatarImage={
                  (isCompassWallet() ? Images.Misc.CompassReward : Images.Misc.LeapReward) ??
                  defaultTokenLogo
                }
                chainIcon={validatorIcon}
                avatarOnError={imgOnError(defaultTokenLogo)}
              />
            </div>
          }
          isRounded
          className='hover:cursor-default dark:!bg-gray-950'
          title='Your Rewards'
          subtitle={`${formatHideBalance(
            rewardsAmount ? formatCurrency(new BigNumber(rewardsAmount)) : '-',
          )} | ${rewardsTokens}`}
        />

        {onClaim && (
          <div
            onClick={onClaim}
            className='absolute hover:cursor-pointer rounded-2xl px-3 py-1 right-6 top-[28px]'
            style={{ backgroundColor: hex2rgba(themeColor, 0.1) }}
          >
            <Text size='sm' className='font-bold' style={{ color: themeColor }}>
              Claim
            </Text>
          </div>
        )}
      </div>
    )
  },
)

StakeRewardCard.displayName = 'StakeRewardCard'
export { StakeRewardCard }
