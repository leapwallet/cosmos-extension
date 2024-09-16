import { capitalize, sliceWord, useGetExplorerAccountUrl } from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import {
  ActiveChainStore,
  AutoFetchedCW20DenomsStore,
  CW20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { CardDivider, GenericCard, ThemeName, Toggle, useTheme } from '@leapwallet/leap-ui'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { imgOnError } from 'utils/imgOnError'

import { TokenTitle } from './TokenTitle'

export type SupportedToken = NativeDenom & { enabled: boolean; verified: boolean }

type SupportedTokensProps = {
  tokens: SupportedToken[]
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>
  activeChainStore: ActiveChainStore
  cw20DenomsStore: CW20DenomsStore
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore
}

export const SupportedTokens = observer(
  ({
    tokens,
    handleToggleChange,
    activeChainStore,
    cw20DenomsStore,
    autoFetchedCW20DenomsStore,
  }: SupportedTokensProps) => {
    const { activeChain } = activeChainStore
    const { denoms: allCW20Denoms } = cw20DenomsStore
    const cw20Denoms = allCW20Denoms?.[activeChain]
    const { autoFetchedCW20Denoms } = autoFetchedCW20DenomsStore

    const defaultTokenLogo = useDefaultTokenLogo()
    const { theme } = useTheme()
    const { getExplorerAccountUrl } = useGetExplorerAccountUrl({})
    const combinedCW20Denoms = useMemo(
      () => ({ ...cw20Denoms, ...autoFetchedCW20Denoms }),
      [cw20Denoms, autoFetchedCW20Denoms],
    )

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

            const explorerURL = getExplorerAccountUrl(token.coinMinimalDenom)
            const handleRedirectionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              window.open(explorerURL, '_blank')
            }

            return (
              <React.Fragment key={`${token.coinMinimalDenom}-${index}`}>
                <GenericCard
                  title={
                    <TokenTitle
                      title={title}
                      showRedirection={
                        !!combinedCW20Denoms?.[token?.coinMinimalDenom] && !!explorerURL
                      }
                      handleRedirectionClick={handleRedirectionClick}
                    />
                  }
                  subtitle={subTitle}
                  isRounded={isLast}
                  size='md'
                  img={
                    <div className='relative mr-3'>
                      <img
                        src={token.icon ?? defaultTokenLogo}
                        className='h-7 w-7'
                        onError={imgOnError(defaultTokenLogo)}
                      />
                      {token.verified && (
                        <div className='absolute group -bottom-[5px] -right-[5px]'>
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
                        onChange={(isEnabled) =>
                          handleToggleChange(isEnabled, token.coinMinimalDenom)
                        }
                      />
                    </div>
                  }
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
