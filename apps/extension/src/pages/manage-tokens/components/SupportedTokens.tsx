import { capitalize, sliceWord, useDisabledCW20Tokens } from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, ToggleCard } from '@leapwallet/leap-ui'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React from 'react'
import { imgOnError as imgError } from 'utils/imgOnError'

type SupportedTokensProps = {
  tokens: NativeDenom[]
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>
}

export function SupportedTokens({ tokens, handleToggleChange }: SupportedTokensProps) {
  const defaultTokenLogo = useDefaultTokenLogo()
  const disabledCW20Tokens = useDisabledCW20Tokens()

  return (
    <div>
      <div className='font-bold text-sm text-gray-600 dark:text-gray-200 mb-2'>
        Supported tokens
      </div>

      <div className='rounded-2xl flex flex-col items-center justify-center dark:bg-gray-900 bg-white-100 overflow-hidden'>
        {tokens.map((token, index, array) => {
          const isLast = index === array.length - 1

          const title = sliceWord(token?.name ?? capitalize(token.coinDenom.toLowerCase()), 7, 4)
          const subTitle = sliceWord(token.coinDenom, 4, 4)

          return (
            <React.Fragment key={`${token.coinMinimalDenom}-${index}`}>
              <ToggleCard
                title={title}
                subtitle={subTitle}
                isRounded={isLast}
                size='md'
                imgSrc={token.icon ?? defaultTokenLogo}
                imgOnError={imgError(defaultTokenLogo)}
                imgClassName='h-8 w-8 mr-3'
                isEnabled={!disabledCW20Tokens.includes(token.coinMinimalDenom)}
                onClick={(isEnabled) => handleToggleChange(isEnabled, token.coinMinimalDenom)}
              />

              {!isLast ? <CardDivider /> : null}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
