import {
  Token,
  useChainId,
  useChainInfo,
  useGetChains,
  useGetEvmBalance,
  useIsSeiEvmChain,
  useSeiLinkedAddressState,
  useSnipGetSnip20TokenBalances,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { EvmBalanceStore, RootBalanceStore } from '@leapwallet/cosmos-wallet-store'
import { CardDivider, GenericCard } from '@leapwallet/leap-ui'
import { WarningCircle } from '@phosphor-icons/react'
import { AggregatedLoading } from 'components/aggregated'
import Text from 'components/text'
import WarningCard from 'components/WarningCard'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { HideSmallBalancesStore } from 'stores/hide-small-balances-store'
import { zeroStateBannerStore } from 'stores/zero-state-banners'
import { AggregatedSupportedChain } from 'types/utility'
import { getLedgerEnabledEvmChainsIds } from 'utils/getLedgerEnabledEvmChains'
import { isCompassWallet } from 'utils/isCompassWallet'

import { useHandleInitialAnimation } from '../hooks'
import { ChainInfoProp } from '../utils'
import { tokenHasBalance } from './GeneralHome'
import { IconActionButton, ListTokens } from './index'
import { NativeTokenPlaceholder } from './NativeTokenPlaceholder'
import { ZeroStateBanner } from './ZeroStateBanner'

export const TokensSection = observer(
  ({
    noAddress,
    _allAssets,
    handleCopyClick,
    balanceError,
    evmStatus,
    hideSmallBalancesStore,
    setShowSideNav,
    rootBalanceStore,
    evmBalanceStore,
    isTokenLoading,
    connectEVMLedger,
  }: {
    noAddress: boolean
    _allAssets: Token[]
    handleCopyClick: () => void
    balanceError: boolean
    evmStatus: string
    hideSmallBalancesStore: HideSmallBalancesStore
    setShowSideNav: (show: boolean) => void
    rootBalanceStore: RootBalanceStore
    evmBalanceStore: EvmBalanceStore
    isTokenLoading: boolean
    connectEVMLedger: boolean
  }) => {
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const chains = useGetChains()
    const chain: ChainInfoProp = useChainInfo()
    const { activeWallet } = useActiveWallet()
    const [scrtTokenContractAddress, setScrtTokenContractAddress] = useState<string>('')
    const isWalletHasFunds = !!rootBalanceStore?.allTokens?.some((token) => tokenHasBalance(token))
    const navigate = useNavigate()
    const selectedNetwork = useSelectedNetwork()
    const getWallet = Wallet.useGetWallet()
    const initialRef = useHandleInitialAnimation(activeChain)
    const atLeastOneTokenIsLoading = rootBalanceStore.loading
    const {
      snip20Tokens,
      snip20TokensStatus,
      enabled: snip20Enabled,
    } = useSnipGetSnip20TokenBalances()
    const { data: evmBalance } = useGetEvmBalance(
      activeChain as SupportedChain,
      undefined,
      selectedNetwork,
    )
    const isSeiEvmChain = useIsSeiEvmChain(
      activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : activeChain,
    )
    const isEvmOnlyChain = chains?.[activeChain as SupportedChain]?.evmOnlyChain
    const { addressLinkState } = useSeiLinkedAddressState(
      getWallet,
      activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : undefined,
    )

    const handleGearActionButtonClick = useCallback(() => {
      if (activeChain === 'secret' && selectedNetwork === 'mainnet') {
        navigate('/snip20-manage-tokens?contractAddress=' + scrtTokenContractAddress)
      } else {
        navigate('/manage-tokens')
      }
    }, [activeChain, navigate, scrtTokenContractAddress, selectedNetwork])

    const allAssets = useMemo(() => {
      if (!isCompassWallet()) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        _allAssets = _allAssets?.filter(tokenHasBalance)
      }

      let allAssets = _allAssets ?? []

      if (isSeiEvmChain && !['done', 'unknown'].includes(addressLinkState)) {
        const firstElement = allAssets?.[0]

        if (firstElement) {
          allAssets = [
            firstElement,
            ...(evmBalance?.evmBalance ?? []),
            ...(allAssets ?? []).slice(1),
          ]
        } else {
          allAssets = [...(evmBalance?.evmBalance ?? []), ...(allAssets ?? []).slice(1)]
        }
      }

      if (isEvmOnlyChain) {
        allAssets = [...(allAssets ?? []), ...(evmBalance?.evmBalance ?? [])]
      }

      return allAssets
    }, [_allAssets, addressLinkState, evmBalance?.evmBalance, isSeiEvmChain, isEvmOnlyChain])

    const smallBalanceAssets = useMemo(() => {
      let assetsToShow = allAssets

      if (allAssets && snip20Tokens) {
        assetsToShow = assetsToShow.concat(
          snip20Tokens.filter((token) => {
            return !token.invalidKey
          }),
        )
      }

      if (hideSmallBalancesStore.isHidden) {
        return assetsToShow.filter((asset) => Number(asset.usdValue) < 0.1)
      }

      return []
    }, [allAssets, snip20Tokens, hideSmallBalancesStore.isHidden])

    const invalidKeyTokens = useMemo(() => {
      if (snip20Tokens) {
        return snip20Tokens.filter((token) => token.invalidKey === true)
      }
      return []
    }, [snip20Tokens])

    const apiUnavailable = useMemo(() => {
      return (
        activeChain !== AGGREGATED_CHAIN_KEY &&
        atLeastOneTokenIsLoading &&
        chain?.apiStatus === false
      )
    }, [activeChain, atLeastOneTokenIsLoading, chain?.apiStatus])

    const ledgerEnabledEvmChainsIds = useMemo(() => {
      return getLedgerEnabledEvmChainsIds(Object.values(chains))
    }, [chains])

    const ledgerNoSupported = useMemo(() => {
      return (
        noAddress &&
        !ledgerEnabledEvmChainsIds.includes(chain?.chainId) &&
        activeWallet?.walletType === WALLETTYPE.LEDGER
      )
    }, [activeWallet?.walletType, chain?.chainId, ledgerEnabledEvmChainsIds, noAddress])

    const disabledCardMessage = useMemo(() => {
      if (connectEVMLedger) {
        return `Please import your ${chain?.chainName} wallet by connecting EVM Ledger app.`
      } else if (ledgerNoSupported) {
        return `Ledger support coming soon for ${chain?.chainName}`
      } else if (apiUnavailable) {
        return `The ${chain?.chainName} network is currently experiencing issues. Please try again later.`
      }

      return ''
    }, [apiUnavailable, chain?.chainName, connectEVMLedger, ledgerNoSupported])

    const activeChainId = useChainId(
      activeChain === AGGREGATED_CHAIN_KEY ? undefined : activeChain,
      selectedNetwork,
      isEvmOnlyChain,
    )
    const zeroStateBanner = zeroStateBannerStore.getBannerForChain(
      activeChain === AGGREGATED_CHAIN_KEY ? undefined : activeChainId,
    )

    const showFundBanners =
      !isCompassWallet() &&
      (!chains?.[activeChain as SupportedChain]?.evmOnlyChain || !!zeroStateBanner) &&
      !isWalletHasFunds &&
      !isTokenLoading &&
      !balanceError

    return (
      <motion.div
        initial={initialRef.current}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5, ease: 'easeIn' }}
        className='px-6'
      >
        {noAddress || apiUnavailable ? (
          <WarningCard text={disabledCardMessage} />
        ) : showFundBanners ? (
          <ZeroStateBanner handleCopyClick={handleCopyClick} zeroStateBanner={zeroStateBanner} />
        ) : balanceError ? (
          <NativeTokenPlaceholder />
        ) : (
          <div className='flex flex-col'>
            <div className='flex items-center justify-between mb-[12px]'>
              <Text size='sm' color='text-black-100 dark:text-white-100 font-medium'>
                Your tokens
              </Text>

              {activeChain !== AGGREGATED_CHAIN_KEY && (
                <IconActionButton
                  title='Manage Tokens'
                  onClick={handleGearActionButtonClick}
                  className='dark:!bg-gray-900'
                >
                  <img
                    className='w-[12px] h-[12px] invert dark:invert-0'
                    src={Images.Misc.GearWhiteIcon}
                    alt='gear'
                  />
                </IconActionButton>
              )}
            </div>

            {isTokenLoading ? (
              <div className='flex flex-col gap-3 w-[352px]'>
                <AggregatedLoading />
              </div>
            ) : (
              <>
                <ListTokens balances={rootBalanceStore} evmBalances={evmBalanceStore} />

                {evmStatus !== 'success' ? <AggregatedLoading className='mb-[12px]' /> : null}
                {activeChain === 'secret' && snip20TokensStatus !== 'success' && snip20Enabled ? (
                  <AggregatedLoading className='mb-[12px]' />
                ) : null}

                {hideSmallBalancesStore.isHidden && smallBalanceAssets?.length !== 0 ? (
                  <p className='text-xs px-4 text-gray-300 dark:text-gray-600 text-center w-[352px]'>
                    Tokens with small balances hidden (&lt;$0.1). Customize settings{' '}
                    <button className='inline underline' onClick={() => setShowSideNav(true)}>
                      here
                    </button>
                    .
                  </p>
                ) : null}

                {invalidKeyTokens?.map((token) => {
                  return (
                    <React.Fragment key={token.symbol + token?.ibcDenom}>
                      <CardDivider />
                      <GenericCard
                        onClick={() => setScrtTokenContractAddress(token.coinMinimalDenom)}
                        title={token.symbol}
                        img={<img src={token.img} className='w-[28px] h-[28px] mr-2' />}
                        subtitle2={<WarningCircle size={16} className='text-red-300' />}
                      />
                      <div className='bg-gray-100 dark:bg-gray-800 px-4 py-2 mx-4 rounded mb-4'>
                        <Text size='xs' color={'text-gray-400'} className='font-bold'>
                          Wrong Key or Key not set
                        </Text>
                      </div>
                    </React.Fragment>
                  )
                })}
              </>
            )}
          </div>
        )}
      </motion.div>
    )
  },
)
