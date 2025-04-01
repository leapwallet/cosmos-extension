import { capitalize, sliceWord, useGetExplorerAccountUrl } from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import {
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { CardDivider } from '@leapwallet/leap-ui'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { CustomToggleCard, TokenType } from './index'
import { TokenTitle } from './TokenTitle'

type ManuallyAddedTokensProps = {
  tokens: NativeDenom[]
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>
  fetchedTokens: string[]
  onDeleteClick: (token: NativeDenom) => void
  betaERC20DenomsStore: BetaERC20DenomsStore
  betaCW20DenomsStore: BetaCW20DenomsStore
  disabledCW20DenomsStore: DisabledCW20DenomsStore
  enabledCW20DenomsStore: EnabledCW20DenomsStore
}

export const ManuallyAddedTokens = observer(
  ({
    tokens,
    handleToggleChange,
    fetchedTokens,
    onDeleteClick,
    betaCW20DenomsStore,
    disabledCW20DenomsStore,
    enabledCW20DenomsStore,
    betaERC20DenomsStore,
  }: ManuallyAddedTokensProps) => {
    const { betaCW20Denoms } = betaCW20DenomsStore
    const { betaERC20Denoms } = betaERC20DenomsStore
    const { disabledCW20Denoms } = disabledCW20DenomsStore
    const { enabledCW20Denoms } = enabledCW20DenomsStore
    const { getExplorerAccountUrl } = useGetExplorerAccountUrl({})

    return (
      <div>
        <div className='font-bold text-sm text-gray-600 dark:text-gray-200 mb-2'>
          Manually added tokens
        </div>

        <div className='rounded-2xl flex flex-col items-center justify-center dark:bg-gray-900 bg-white-100 overflow-hidden'>
          {tokens.map((token, index, array) => {
            const isLast = index === array.length - 1
            let _TokenType = <TokenType type='native' className='bg-[#ff9f0a1a] text-orange-500' />

            const title = sliceWord(token?.name ?? capitalize(token.coinDenom.toLowerCase()), 7, 4)
            const subTitle = sliceWord(token.coinDenom, 4, 4)

            if (betaCW20Denoms[token.coinMinimalDenom]) {
              _TokenType = <TokenType type='cw20' className='bg-[#29A8741A] text-green-600' />
            } else if (betaERC20Denoms[token.coinMinimalDenom]) {
              _TokenType = <TokenType type='erc20' className='bg-[#A52A2A1A] text-[#a52a2a]' />
            } else if (token.coinMinimalDenom.trim().toLowerCase().startsWith('factory')) {
              _TokenType = <TokenType type='factory' className='bg-[#0AB8FF1A] text-teal-500' />
            }

            const explorerURL = getExplorerAccountUrl(token.coinMinimalDenom)
            const handleRedirectionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              window.open(explorerURL, '_blank')
            }

            return (
              <React.Fragment key={`${token.coinMinimalDenom}-${index}`}>
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
                  TokenType={_TokenType}
                  isToggleChecked={
                    !disabledCW20Denoms.includes(token.coinMinimalDenom) &&
                    !fetchedTokens.includes(token.coinMinimalDenom) &&
                    enabledCW20Denoms.includes(token.coinMinimalDenom)
                  }
                  onToggleChange={(isEnabled) =>
                    handleToggleChange(isEnabled, token.coinMinimalDenom)
                  }
                  onDeleteClick={() => onDeleteClick(token)}
                />

                {!isLast ? <CardDivider /> : null}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  },
)
