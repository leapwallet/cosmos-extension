/**
 * Note: Doing Ledger checks for Aggregated view in AggregatedNullComponents component
 */

import {
  hasToAddEvmDetails,
  Token,
  useChainInfo,
  useGetChains,
  useIsSeiEvmChain,
  useSeiLinkedAddressState,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { EvmBalanceStore, RootBalanceStore } from '@leapwallet/cosmos-wallet-store'
import { Info } from '@phosphor-icons/react'
import { QueryStatus } from '@tanstack/react-query'
import classNames from 'classnames'
import { AlertStrip, TestnetAlertStrip } from 'components/alert-strip'
import { ApiStatusWarningStrip } from 'components/alert-strip/ApiStatusWarningStrip'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { WalletButton } from 'components/button'
import { EmptyCard } from 'components/empty-card'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import { LightNodeRunningIndicator } from 'components/light-node-running-indicator/LightNodeRunningIndicator'
import ReceiveToken from 'components/Receive'
import Text from 'components/text'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { SHOW_LINK_ADDRESS_NUDGE } from 'config/storage-keys'
import { useChainPageInfo, useWalletInfo } from 'hooks'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import useQuery from 'hooks/useQuery'
import usePrevious from 'hooks/utility/usePrevious'
import { useAddress } from 'hooks/wallet/useAddress'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { ActivitySwapTxPage } from 'pages/activity/ActivitySwapTxPage'
import qs from 'qs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { aggregatedChainsStore, evmBalanceStore } from 'stores/balance-store'
import { chainTagsStore } from 'stores/chain-infos-store'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { hideSmallBalancesStore } from 'stores/hide-small-balances-store'
import { lightNodeStore } from 'stores/light-node-store'
import { manageChainsStore } from 'stores/manage-chains-store'
import { rootBalanceStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { HeaderActionType } from 'types/components'
import { AggregatedSupportedChain } from 'types/utility'
import { UserClipboard } from 'utils/clipboard'
import { getLedgerEnabledEvmChainsIds } from 'utils/getLedgerEnabledEvmChains'
import { isCompassWallet } from 'utils/isCompassWallet'
import { TxStoreObject } from 'utils/pendingSwapsTxsStore'

import PendingSwapsAlertStrip from '../PendingSwapsAlertStrip'
import PendingSwapsSheet from '../PendingSwapsSheet'
import RequestFaucet from '../RequestFaucet'
import SelectChain from '../SelectChain'
import SelectWallet from '../SelectWallet'
import SideNav from '../side-nav'
import { ChainInfoProp, GeneralHomeProps, InitialFaucetResp, initialFaucetResp } from '../utils'
import { ButtonsAndBanners } from './ButtonsAndBanners'
import { HeroSection } from './HeroSection'
import {
  AggregatedCopyAddressSheet,
  BitcoinDeposit,
  CopyAddressSheet,
  LinkAddressesSheet,
  WalletNotConnected,
} from './index'
import { TokensSection } from './TokensSection'

export const TotalBalance = observer(
  ({ balances, evmBalances }: { balances: RootBalanceStore; evmBalances: EvmBalanceStore }) => {
    const [formatCurrency] = useFormatCurrency()
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const getWallet = Wallet.useGetWallet()
    const { addressLinkState } = useSeiLinkedAddressState(
      getWallet,
      activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : undefined,
    )

    const chains = useGetChains()
    const evmBalance = evmBalances.evmBalance
    const isEvmOnlyChain = chains?.[activeChain as SupportedChain]?.evmOnlyChain
    const isSeiEvmChain = useIsSeiEvmChain(
      activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : activeChain,
    )

    const countRef = useRef(0)
    const [timedBalancesFiatValue, setTimedBalancesFiatValue] = useState(balances.totalFiatValue)

    const totalFiatValue = useMemo(() => {
      const addEvmDetails = hasToAddEvmDetails(
        isSeiEvmChain,
        addressLinkState,
        isEvmOnlyChain ?? false,
      )

      if (addEvmDetails) {
        return balances.totalFiatValue.plus(evmBalance.currencyInFiatValue)
      }

      return balances.totalFiatValue
    }, [
      addressLinkState,
      balances.totalFiatValue,
      evmBalance.currencyInFiatValue,
      isEvmOnlyChain,
      isSeiEvmChain,
    ])

    useEffect(() => {
      if (totalFiatValue.toString() !== timedBalancesFiatValue.toString()) {
        if (totalFiatValue.toNumber() === 0 || timedBalancesFiatValue.toNumber() === 0) {
          setTimedBalancesFiatValue(totalFiatValue)
        } else {
          const timeoutId = setTimeout(() => {
            setTimedBalancesFiatValue(totalFiatValue)
            clearTimeout(timeoutId)
          }, 1000 + countRef.current * 2000)
          countRef.current = Math.min(countRef.current + 1, 2)
        }
      }
    }, [totalFiatValue, timedBalancesFiatValue])

    return (
      <div className='flex items-center justify-center gap-2'>
        <span className='text-xxl text-gray-900 dark:text-white-100 font-black'>
          {hideAssetsStore.formatHideBalance(formatCurrency(totalFiatValue, false))}
        </span>
      </div>
    )
  },
)

export function tokenHasBalance(token: Token | undefined) {
  return !!token?.amount && !isNaN(parseFloat(token?.amount)) && parseFloat(token.amount) > 0
}

export const GeneralHome = observer(
  ({ _allAssets, refetchBalances, isAggregateLoading = false }: GeneralHomeProps) => {
    const txDeclined = useQuery().get('txDeclined') ?? undefined
    const walletAvatarChanged = useQuery().get('walletAvatarChanged') ?? undefined

    /**
     * Custom hooks
     */
    const navigate = useNavigate()
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const prevActiveChain = usePrevious(activeChain)

    const { headerChainImgSrc, topChainColor } = useChainPageInfo()
    const chains = useGetChains()

    const selectedNetwork = useSelectedNetwork()
    const { walletAvatar, walletName } = useWalletInfo()
    const dontShowSelectChain = useDontShowSelectChain(manageChainsStore)

    const address = useAddress()
    const isSeiEvmChain = useIsSeiEvmChain(activeChain as SupportedChain)
    const { activeWallet } = useActiveWallet()
    const prevWallet = usePrevious(activeWallet)

    const chain: ChainInfoProp = useChainInfo()
    const walletAddresses = useGetWalletAddresses()
    const getWallet = Wallet.useGetWallet()
    const { addressLinkState } = useSeiLinkedAddressState(
      getWallet,
      activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : undefined,
    )

    const evmStatus = evmBalanceStore.evmBalanceForChain(activeChain as SupportedChain)?.status
    const balanceError =
      activeChain !== 'aggregated' &&
      rootBalanceStore.getErrorStatusForChain(activeChain, selectedNetwork)

    /**
     * Local states
     */

    const [showWalletAvatarMsg, setShowWalletAvatarMsg] = useState(!!walletAvatarChanged)
    const [showChainSelector, setShowChainSelector] = useState(false)
    const [defaultFilter, setDefaultFilter] = useState('All')
    const [showSelectWallet, setShowSelectWallet] = useState(false)
    const [showSideNav, setShowSideNav] = useState(false)
    const [sideNavDefaults, setSideNavDefaults] = useState({
      openLightNodePage: false,
    })
    const [showReceiveSheet, setShowReceiveSheet] = useState(false)

    const [showFaucetResp, setShowFaucetResp] = useState<InitialFaucetResp>(initialFaucetResp)
    const [showMantraFaucetResp, setShowMantraFaucetResp] = useState('')
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(!!txDeclined)

    const [showSwapTxPageFor, setShowSwapTxPageFor] = useState<TxStoreObject>()
    const [showPendingSwapsSheet, setShowPendingSwapsSheet] = useState<boolean>(false)
    const [pendingSwapTxs, setPendingSwapTxs] = useState<TxStoreObject[]>([])
    const [handlePendingAlertStrip, setHandlePendingAlertStrip] = useState<boolean>(false)
    const [isThisALinkEvmAddressNudge, setIsThisALinkEvmAddressNudge] = useState(false)
    const [showBitcoinDepositSheet, setShowBitcoinDepositSheet] = useState(false)
    const [showCopyAddressSheet, setShowCopyAddressSheet] = useState(false)

    const [isToAddLinkAddressNudgeText, setIsToAddLinkAddressNudgeText] = useState(false)
    const [isWalletAddressCopied, setIsWalletAddressCopied] = useState(false)
    const query = useQuery()

    /**
     * Local effects
     */

    useEffect(() => {
      refetchBalances && refetchBalances()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      if (!showChainSelector) {
        setDefaultFilter('All')
      }
    }, [showChainSelector])

    useEffect(() => {
      if (
        isSeiEvmChain &&
        !['done', 'unknown', 'loading'].includes(addressLinkState) &&
        evmStatus === 'success' &&
        localStorage.getItem(SHOW_LINK_ADDRESS_NUDGE) !== 'false'
      ) {
        setIsThisALinkEvmAddressNudge(true)
      }
    }, [addressLinkState, evmStatus, isSeiEvmChain])

    useEffect(() => {
      if (
        isCompassWallet() &&
        !['done', 'unknown', 'loading', 'success'].includes(addressLinkState)
      ) {
        return setIsToAddLinkAddressNudgeText(true)
      }

      return setIsToAddLinkAddressNudgeText(false)
    }, [addressLinkState])

    /**
     * Memoized values
     */

    const ledgerEnabledEvmChainsIds = useMemo(() => {
      return getLedgerEnabledEvmChainsIds(Object.values(chains))
    }, [chains])

    const atLeastOneTokenIsLoading = rootBalanceStore.loading

    const noAddress = useMemo(() => {
      return activeChain !== AGGREGATED_CHAIN_KEY && !activeWallet?.addresses[activeChain]
    }, [activeChain, activeWallet?.addresses])

    const connectEVMLedger = useMemo(() => {
      return (
        noAddress &&
        ledgerEnabledEvmChainsIds.includes(chain?.chainId) &&
        activeWallet?.walletType === WALLETTYPE.LEDGER
      )
    }, [activeWallet?.walletType, chain?.chainId, ledgerEnabledEvmChainsIds, noAddress])

    const isTokenLoading = useMemo(
      () => atLeastOneTokenIsLoading || isAggregateLoading,
      [atLeastOneTokenIsLoading, isAggregateLoading],
    )

    /**
     * Memoized functions
     */

    const handleCopyAddressSheetClose = useCallback(
      (refetch?: boolean) => {
        setShowCopyAddressSheet(false)
        setIsThisALinkEvmAddressNudge(false)
        localStorage.setItem(SHOW_LINK_ADDRESS_NUDGE, 'false')

        if (refetch && refetchBalances) {
          refetchBalances()
        }
      },
      [refetchBalances],
    )

    const handleCopyClick = useCallback(() => {
      if (walletAddresses?.length > 1 || activeChain === AGGREGATED_CHAIN_KEY) {
        setShowCopyAddressSheet(true)
        return
      }

      setIsWalletAddressCopied(true)
      setTimeout(() => setIsWalletAddressCopied(false), 2000)

      UserClipboard.copyText(walletAddresses?.[0])
    }, [activeChain, walletAddresses])

    const onImgClick = useCallback(
      (event?: React.MouseEvent<HTMLDivElement>, props?: { defaultFilter?: string }) => {
        setShowChainSelector(true)
        if (props?.defaultFilter) {
          setDefaultFilter(props.defaultFilter)
        }
      },
      [],
    )

    const handleOpenSideNavSheet = useCallback(() => setShowSideNav(true), [])
    const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])
    const handleBtcBannerClick = useCallback(() => {
      setShowBitcoinDepositSheet(true)
    }, [])

    const handleLightNodeIndicatorClick = useCallback(() => {
      setSideNavDefaults({
        openLightNodePage: true,
      })
      handleOpenSideNavSheet()
    }, [setSideNavDefaults, handleOpenSideNavSheet])

    const sideNavToggler = () => {
      setSideNavDefaults({
        openLightNodePage: false,
      })
      setShowSideNav(!showSideNav)
    }

    useEffect(() => {
      if (isCompassWallet() && query.get('openLinkAddress')) {
        navigate('/home')
        setShowCopyAddressSheet(true)
      } else if (query.get('openChainSwitch')) {
        const _defaultFilter = query.get('defaultFilter')
        navigate('/home')
        setShowChainSelector(true)
        if (_defaultFilter) {
          setDefaultFilter(_defaultFilter)
        }
      } else if (query.get('openLightNode')) {
        navigate('/home')
        handleLightNodeIndicatorClick()
      } else if (query.get('openBitcoinDepositSheet')) {
        setShowBitcoinDepositSheet(true)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, query])

    const queryStatus: QueryStatus = rootBalanceStore.loading ? 'loading' : 'success'

    usePerformanceMonitor({
      page: 'home',
      op: 'homePageLoad',
      queryStatus,
      description: 'loading state on home page',
    })

    usePerformanceMonitor({
      page: 'wallet-switch',
      op: 'walletSwitchLoadTime',
      queryStatus,
      description: 'loading state on wallet switch page',
      enabled: !!prevWallet && prevWallet.id !== activeWallet?.id,
    })

    usePerformanceMonitor({
      page: 'chain-switch',
      op: 'chainSwitchLoadTime',
      queryStatus,
      description: 'loading state on chain switch page',
      enabled: !!prevActiveChain && prevActiveChain !== activeChain,
    })

    /**
     * Early returns
     */
    if (!activeWallet) {
      return (
        <div className='relative w-full overflow-clip panel-height'>
          <PopupLayout>
            <div>
              <EmptyCard src={Images.Logos.LeapCosmos} heading='No wallet found' />
            </div>
          </PopupLayout>
        </div>
      )
    }

    if (!chain && activeChain !== AGGREGATED_CHAIN_KEY) {
      return null
    }

    /**
     * Render
     */

    return (
      <div className='relative w-full overflow-clip panel-height'>
        <SideNav isShown={showSideNav} toggler={sideNavToggler} defaults={sideNavDefaults} />
        <PopupLayout
          header={
            <PageHeader
              title={
                <WalletButton
                  walletName={walletName}
                  showWalletAvatar={true}
                  walletAvatar={walletAvatar}
                  showDropdown={true}
                  handleDropdownClick={handleOpenWalletSheet}
                  giveCopyOption={true}
                  handleCopyClick={handleCopyClick}
                  isAddressCopied={isWalletAddressCopied}
                />
              }
              imgSrc={headerChainImgSrc}
              onImgClick={dontShowSelectChain ? undefined : onImgClick}
              action={{
                onClick: handleOpenSideNavSheet,
                type: HeaderActionType.NAVIGATION,
                className: 'min-w-[48px] h-[36px] px-2 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
              }}
            />
          }
        >
          <WalletNotConnected chain={chain} visible={connectEVMLedger} />

          <div
            className={classNames(
              'w-full flex flex-col justify-center items-center mb-20 relative',
              {
                hidden: connectEVMLedger,
                '!mb-[136px]': handlePendingAlertStrip,
              },
            )}
          >
            {isToAddLinkAddressNudgeText ? (
              <AlertStrip
                message={
                  <p>
                    Recommended: To use SEI, first{' '}
                    <span className='underline'>Link your address</span>
                  </p>
                }
                bgColor={topChainColor}
                alwaysShow={true}
                onClick={() => setShowCopyAddressSheet(true)}
              />
            ) : (
              <TestnetAlertStrip />
            )}

            {balanceError && <ApiStatusWarningStrip />}

            {showErrorMessage ? (
              <AlertStrip
                message='Transaction declined'
                bgColor={Colors.red300}
                alwaysShow={false}
                onHide={() => setShowErrorMessage(false)}
                className='absolute top-[80px] rounded-2xl w-80 h-auto p-2'
              />
            ) : null}

            {showFaucetResp.msg ? (
              <AlertStrip
                message={showFaucetResp.msg}
                bgColor={showFaucetResp.status === 'success' ? Colors.green600 : Colors.red300}
                alwaysShow={false}
                onHide={() => setShowFaucetResp(initialFaucetResp)}
                className='absolute bottom-[80px] rounded-xl w-80 h-auto p-2'
                timeOut={6000}
              />
            ) : null}

            {showMantraFaucetResp ? (
              <AlertStrip
                message={
                  <div className='flex gap-x-2 items-center'>
                    <Info size={16} className='text-lg text-red-600' />
                    <Text size='xs' className='font-light'>
                      {showMantraFaucetResp}
                    </Text>
                  </div>
                }
                alwaysShow={false}
                onHide={() => setShowMantraFaucetResp('')}
                className='absolute top-[80px] bg-gray-900 z-10 rounded-full !w-auto max-w-[24rem] h-auto py-2 px-4'
                timeOut={5000}
              />
            ) : null}

            {showWalletAvatarMsg ? (
              <AlertStrip
                message='Profile picture changed successfully'
                bgColor={Colors.green600}
                alwaysShow={false}
                onHide={() => setShowWalletAvatarMsg(false)}
                className='absolute top-[80px] rounded-2xl w-80 h-auto p-2'
                timeOut={1000}
              />
            ) : null}

            {lightNodeStore.isLightNodeRunning ? (
              <div className='absolute top-12 right-0' onClick={handleLightNodeIndicatorClick}>
                <LightNodeRunningIndicator />
              </div>
            ) : null}

            <HeroSection
              handleBtcBannerClick={handleBtcBannerClick}
              rootBalanceStore={rootBalanceStore}
              isTokenLoading={isTokenLoading}
            />

            <ButtonsAndBanners
              handleBtcBannerClick={handleBtcBannerClick}
              rootBalanceStore={rootBalanceStore}
              isTokenLoading={isTokenLoading}
              setShowReceiveSheet={setShowReceiveSheet}
              setShowMantraFaucetResp={setShowMantraFaucetResp}
            />

            {selectedNetwork === 'testnet' && (
              <RequestFaucet
                address={address}
                setShowFaucetResp={(data) => {
                  setShowFaucetResp(data)
                }}
                rootBalanceStore={rootBalanceStore}
              />
            )}

            <TokensSection
              noAddress={noAddress}
              _allAssets={_allAssets}
              handleCopyClick={handleCopyClick}
              balanceError={balanceError}
              evmStatus={evmStatus}
              hideSmallBalancesStore={hideSmallBalancesStore}
              setShowSideNav={setShowSideNav}
              rootBalanceStore={rootBalanceStore}
              evmBalanceStore={evmBalanceStore}
              isTokenLoading={isTokenLoading}
              connectEVMLedger={connectEVMLedger}
            />
          </div>
        </PopupLayout>

        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
          defaultFilter={defaultFilter}
        />

        <SelectWallet
          isVisible={showSelectWallet}
          onClose={() => setShowSelectWallet(false)}
          title='Wallets'
        />

        {showSwapTxPageFor ? (
          <ActivitySwapTxPage
            onClose={(
              sourceChainId?: string,
              sourceToken?: string,
              destinationChainId?: string,
              destinationToken?: string,
            ) => {
              setShowSwapTxPageFor(undefined)
              let queryStr = ''
              if (sourceChainId || sourceToken || destinationChainId || destinationToken) {
                queryStr = `?${qs.stringify({
                  sourceChainId,
                  sourceToken,
                  destinationChainId,
                  destinationToken,
                  pageSource: 'swapAgain',
                })}`
              }
              navigate(`/swap${queryStr}`)
            }}
            {...showSwapTxPageFor}
          />
        ) : null}

        <ReceiveToken
          isVisible={showReceiveSheet}
          onCloseHandler={() => {
            setShowReceiveSheet(false)
          }}
          handleBtcBannerClick={
            activeChain === AGGREGATED_CHAIN_KEY
              ? undefined
              : () => setShowBitcoinDepositSheet(true)
          }
        />

        {activeChain !== AGGREGATED_CHAIN_KEY ? (
          <BitcoinDeposit
            chainTagsStore={chainTagsStore}
            isVisible={showBitcoinDepositSheet}
            onCloseHandler={() => {
              setShowBitcoinDepositSheet(false)
            }}
          />
        ) : null}

        {!['done', 'unknown', 'loading'].includes(addressLinkState) &&
        isToAddLinkAddressNudgeText ? (
          <LinkAddressesSheet
            isVisible={isThisALinkEvmAddressNudge || showCopyAddressSheet}
            onClose={handleCopyAddressSheetClose}
            walletAddresses={walletAddresses}
            setIsToAddLinkAddressNudgeText={setIsToAddLinkAddressNudgeText}
          />
        ) : (
          <>
            {activeChain === AGGREGATED_CHAIN_KEY ? (
              <AggregatedCopyAddressSheet
                isVisible={showCopyAddressSheet}
                onClose={handleCopyAddressSheetClose}
                aggregatedChainsStore={aggregatedChainsStore}
              />
            ) : (
              <CopyAddressSheet
                isVisible={showCopyAddressSheet}
                onClose={handleCopyAddressSheetClose}
                walletAddresses={walletAddresses}
              />
            )}
          </>
        )}

        <PendingSwapsAlertStrip
          setShowSwapTxPageFor={setShowSwapTxPageFor}
          setShowPendingSwapsSheet={setShowPendingSwapsSheet}
          setPendingSwapTxs={setPendingSwapTxs}
          pendingSwapTxs={pendingSwapTxs}
          setHandlePendingAlertStrip={setHandlePendingAlertStrip}
        />

        <PendingSwapsSheet
          pendingSwapTxs={pendingSwapTxs}
          isOpen={showPendingSwapsSheet}
          setShowSwapTxPageFor={setShowSwapTxPageFor}
          onClose={() => {
            setShowPendingSwapsSheet(false)
          }}
        />

        {!connectEVMLedger ? (
          <BottomNav
            label={BottomNavLabel.Home}
            disabled={activeChain !== AGGREGATED_CHAIN_KEY && !activeWallet.addresses[activeChain]}
          />
        ) : null}
      </div>
    )
  },
)
