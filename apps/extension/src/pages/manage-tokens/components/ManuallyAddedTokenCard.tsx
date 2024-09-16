import { useGetExplorerAccountUrl } from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import {
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { CardDivider } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo } from 'react'
import { capitalize, sliceWord } from 'utils/strings'

import { CustomToggleCard } from './CustomToggleCard'
import { TokenTitle } from './TokenTitle'
import { TokenType } from './TokenType'

type ManuallyAddedTokenCardProps = {
  index: number
  token: NativeDenom
  tokensLength: number
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>
  fetchedTokens: string[]
  onDeleteClick: (token: NativeDenom) => void
  betaERC20DenomsStore: BetaERC20DenomsStore
  betaCW20DenomsStore: BetaCW20DenomsStore
  disabledCW20DenomsStore: DisabledCW20DenomsStore
  enabledCW20DenomsStore: EnabledCW20DenomsStore
  hasSupportedTokens: boolean
}

export const ManuallyAddedTokenCard = observer(
  ({
    index,
    token,
    tokensLength,
    handleToggleChange,
    fetchedTokens,
    onDeleteClick,
    betaCW20DenomsStore,
    disabledCW20DenomsStore,
    enabledCW20DenomsStore,
    betaERC20DenomsStore,
    hasSupportedTokens,
  }: ManuallyAddedTokenCardProps) => {
    const { betaCW20Denoms } = betaCW20DenomsStore
    const { betaERC20Denoms } = betaERC20DenomsStore
    const disabledCW20Denoms = disabledCW20DenomsStore.disabledCW20Denoms
    const enabledCW20Denoms = enabledCW20DenomsStore.enabledCW20Denoms
    const { getExplorerAccountUrl } = useGetExplorerAccountUrl({})

    const isFirst = index === 0
    const isLast = index === tokensLength - 1

    const title = sliceWord(token?.name ?? capitalize(token.coinDenom.toLowerCase()) ?? '', 7, 4)
    const subTitle = sliceWord(token.coinDenom, 4, 4)
    const explorerURL = getExplorerAccountUrl(token.coinMinimalDenom)

    const tokenType = useMemo(() => {
      let _TokenType = <TokenType type='native' className='bg-[#ff9f0a1a] text-orange-500' />

      if (betaCW20Denoms[token.coinMinimalDenom]) {
        _TokenType = <TokenType type='cw20' className='bg-[#29A8741A] text-green-600' />
      } else if (betaERC20Denoms[token.coinMinimalDenom]) {
        _TokenType = <TokenType type='erc20' className='bg-[#A52A2A1A] text-[#a52a2a]' />
      } else if (token.coinMinimalDenom.trim().toLowerCase().startsWith('factory')) {
        _TokenType = <TokenType type='factory' className='bg-[#0AB8FF1A] text-teal-500' />
      }
      return _TokenType
    }, [betaCW20Denoms, betaERC20Denoms, token.coinMinimalDenom])

    const handleRedirectionClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        window.open(explorerURL, '_blank')
      },
      [explorerURL],
    )

    return (
      <>
        {isFirst && (
          <div
            className={classNames('font-bold text-sm text-gray-600 dark:text-gray-200 mb-2', {
              'mt-4': hasSupportedTokens,
            })}
          >
            Manually added tokens
          </div>
        )}

        <CustomToggleCard
          title={
            <TokenTitle
              title={title}
              showRedirection={!!betaCW20Denoms[token.coinMinimalDenom] && !!explorerURL}
              handleRedirectionClick={handleRedirectionClick}
            />
          }
          subtitle={subTitle}
          isRounded={isLast}
          imgSrc={token.icon}
          TokenType={tokenType}
          isToggleChecked={
            !disabledCW20Denoms.includes(token.coinMinimalDenom) &&
            !fetchedTokens.includes(token.coinMinimalDenom) &&
            enabledCW20Denoms.includes(token.coinMinimalDenom)
          }
          onToggleChange={(isEnabled) => handleToggleChange(isEnabled, token.coinMinimalDenom)}
          onDeleteClick={() => onDeleteClick(token)}
          className={classNames({
            '!rounded-t-2xl !rounded-b-none': isFirst && !isLast,
            '!rounded-t-none !rounded-b-2xl': !isFirst && isLast,
            '!rounded-2xl': isFirst && isLast,
            '!rounded-none': !isFirst && !isLast,
          })}
        />

        {!isLast ? <CardDivider /> : null}
      </>
    )
  },
)
