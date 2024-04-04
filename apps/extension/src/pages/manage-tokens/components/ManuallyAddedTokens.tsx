import {
  capitalize,
  sliceWord,
  useBetaCW20Tokens,
  useChainInfo,
  useDisabledCW20Tokens,
} from '@leapwallet/cosmos-wallet-hooks'
import { DenomsRecord, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider } from '@leapwallet/leap-ui'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import React, { useMemo } from 'react'

import { CustomToggleCard, TokenType } from './index'
import { TokenTitle } from './TokenTitle'

type ManuallyAddedTokensProps = {
  tokens: NativeDenom[]
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>
  fetchedTokens: string[]
  onDeleteClick: (token: NativeDenom) => void
}

export function ManuallyAddedTokens({
  tokens,
  handleToggleChange,
  fetchedTokens,
  onDeleteClick,
}: ManuallyAddedTokensProps) {
  const betaCw20Tokens = useBetaCW20Tokens()
  const disabledCW20Tokens = useDisabledCW20Tokens()

  const activeChainInfo = useChainInfo()
  const selectedNetwork = useSelectedNetwork()

  const explorerURL = useMemo(() => {
    if (!activeChainInfo) return undefined
    if (!activeChainInfo.txExplorer) return undefined
    return activeChainInfo.txExplorer?.[selectedNetwork]?.accountUrl
  }, [activeChainInfo, selectedNetwork])

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

          if (betaCw20Tokens[token.coinMinimalDenom]) {
            _TokenType = <TokenType type='cw20' className='bg-[#29A8741A] text-green-600' />
          } else if (token.coinMinimalDenom.trim().toLowerCase().startsWith('factory')) {
            _TokenType = <TokenType type='factory' className='bg-[#0AB8FF1A] text-teal-500' />
          }

          const handleRedirectionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            window.open(`${explorerURL}/${token.coinMinimalDenom}`, '_blank')
          }

          return (
            <React.Fragment key={`${token.coinMinimalDenom}-${index}`}>
              <CustomToggleCard
                title={
                  <TokenTitle
                    title={title}
                    showRedirection={!!betaCw20Tokens[token.coinMinimalDenom] && !!explorerURL}
                    handleRedirectionClick={handleRedirectionClick}
                  />
                }
                subtitle={subTitle}
                isRounded={isLast}
                imgSrc={token.icon}
                TokenType={_TokenType}
                isToggleChecked={
                  !disabledCW20Tokens.includes(token.coinMinimalDenom) &&
                  !fetchedTokens.includes(token.coinMinimalDenom)
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
}
