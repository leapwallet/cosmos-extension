import { useGetExplorerAccountUrl } from '@leapwallet/cosmos-wallet-hooks'
import {
  ActiveChainStore,
  AutoFetchedCW20DenomsStore,
  CW20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { GenericCard, ThemeName, Toggle, useTheme } from '@leapwallet/leap-ui'
import { useDefaultTokenLogo } from 'hooks'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo } from 'react'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { capitalize, sliceWord } from 'utils/strings'

import { SupportedToken } from './SupportedTokens'
import { TokenTitle } from './TokenTitle'

type SupportedTokenCardProps = {
  token: SupportedToken
  tokensLength: number
  index: number
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>
  activeChainStore: ActiveChainStore
  cw20DenomsStore: CW20DenomsStore
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore
}

export const SupportedTokenCard = observer(
  ({
    token,
    tokensLength,
    index,
    handleToggleChange,
    cw20DenomsStore,
    autoFetchedCW20DenomsStore,
  }: SupportedTokenCardProps) => {
    const { cw20Denoms } = cw20DenomsStore
    const { autoFetchedCW20Denoms } = autoFetchedCW20DenomsStore

    const defaultTokenLogo = useDefaultTokenLogo()
    const { theme } = useTheme()
    const { getExplorerAccountUrl } = useGetExplorerAccountUrl({})
    const combinedCW20Denoms = useMemo(
      () => ({ ...cw20Denoms, ...autoFetchedCW20Denoms }),
      [cw20Denoms, autoFetchedCW20Denoms],
    )

    const isLast = index === tokensLength - 1
    const isFirst = index === 0
    const title = sliceWord(token?.name ?? capitalize(token.coinDenom.toLowerCase()) ?? '', 7, 4)
    const subTitle = sliceWord(token.coinDenom, 4, 4)

    const explorerURL = getExplorerAccountUrl(token.coinMinimalDenom)
    const handleRedirectionClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        window.open(explorerURL, '_blank')
      },
      [explorerURL],
    )

    return (
      <>
        <GenericCard
          title={
            <TokenTitle
              title={title}
              showRedirection={!!combinedCW20Denoms?.[token?.coinMinimalDenom] && !!explorerURL}
              handleRedirectionClick={handleRedirectionClick}
            />
          }
          subtitle={subTitle}
          isRounded={isLast}
          size='md'
          img={
            <div className='relative mr-3 !h-10 !w-10 !shrink-0 flex items-center justify-center'>
              <img
                src={token.icon ?? defaultTokenLogo}
                className='h-8 rounded-full w-8'
                onError={imgOnError(defaultTokenLogo)}
              />
              {token.verified && (
                <div className='absolute group -bottom-[2px] -right-[2px]'>
                  <img
                    src={
                      theme === ThemeName.DARK
                        ? Images.Misc.VerifiedWithBgStarDark
                        : Images.Misc.VerifiedWithBgStar
                    }
                    alt='verified-token'
                    className='h-4 w-4'
                  />
                  <div className='group-hover:!block hidden absolute bottom-0 right-0 translate-x-full bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded-lg text-xs dark:text-white-100'>
                    Whitelisted
                  </div>
                </div>
              )}
            </div>
          }
          icon={
            <div className='flex items-center gap-[8px]'>
              <Toggle
                checked={token.enabled}
                onChange={(isEnabled) => handleToggleChange(isEnabled, token.coinMinimalDenom)}
              />
            </div>
          }
          className={cn(
            '!bg-secondary-100 hover:!bg-secondary-200 rounded-xl mb-4 w-full !h-[66px]',
            isFirst ? 'mt-6' : '',
          )}
        />
        {isLast ? <div className='h-[1px] bg-transparent mt-6' /> : null}
      </>
    )
  },
)
