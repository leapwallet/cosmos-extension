import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain, UnbondingDelegationEntry, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, LineDivider, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import { ErrorCard } from 'components/ErrorCard'
import ReadMoreText from 'components/read-more-text'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import React from 'react'
import { Colors } from 'theme/colors'

import {
  CancelUndelegationDetailsViewAmountCard,
  CancelUndelegationDetailsViewHeading,
} from './index'

type CancelUndelegationDetailsViewProps = {
  validator: Validator
  displayFeeText: string
  simulationError?: string
  unBoundingdelegation: UnbondingDelegationEntry
  activeChain: SupportedChain
  onClick: () => void
}

const CancelUndelegationDetailsView = React.memo(
  ({
    validator,
    unBoundingdelegation,
    activeChain,
    simulationError,
    onClick,
  }: CancelUndelegationDetailsViewProps) => {
    const [formatter] = useFormatCurrency()
    const isDark = useTheme().theme === ThemeName.DARK
    const { formatHideBalance } = useHideAssets()

    return (
      <div>
        <CancelUndelegationDetailsViewHeading validator={validator} />
        <div className='flex flex-col gap-y-4'>
          <CancelUndelegationDetailsViewAmountCard
            formatHideBalance={formatHideBalance}
            currencyAmountDelegation={formatter(
              new BigNumber(unBoundingdelegation.currencyBalance ?? ''),
            )}
            totalDelegations={unBoundingdelegation.formattedBalance ?? ''}
            validatorName={sliceWord(validator.moniker ?? validator.name ?? '', 18, 3)}
          />

          <Buttons.Generic
            onClick={onClick}
            color={isDark ? Colors.gray950 : Colors.white100}
            size='normal'
            disabled={!!simulationError}
            className='w-[344px]'
          >
            <div className={'flex justify-center dark:text-white-100 text-black-100  items-center'}>
              <span className='mr-1 material-icons-round'>do_not_disturb_off</span>
              <span>Cancel Unstake</span>
            </div>
          </Buttons.Generic>

          {!!simulationError && (
            <div className='flex text-center justify-center'>
              <ErrorCard text={simulationError} />
            </div>
          )}
          <LineDivider size='sm' />
        </div>

        <div className='rounded-[16px] my-[16px] items-center'>
          <Text size='sm' className='p-[4px] font-bold ' color='text-gray-600 dark:text-gray-200'>
            {`About ${validator.moniker ?? validator.name ?? 'Validator'}`}
          </Text>

          <div className='flex flex-col p-[4px]'>
            <ReadMoreText
              textProps={{ size: 'md', className: 'font-medium  flex flex-column' }}
              readMoreColor={Colors.getChainColor(activeChain)}
            >
              {validator.description?.details ?? ''}
            </ReadMoreText>
          </div>
        </div>
      </div>
    )
  },
)

CancelUndelegationDetailsView.displayName = 'CancelUndelegationDetailsView'
export { CancelUndelegationDetailsView }
