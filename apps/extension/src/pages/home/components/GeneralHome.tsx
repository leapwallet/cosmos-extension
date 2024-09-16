/**
 * Note: Doing Ledger checks for Aggregated view in AggregatedNullComponents component
 */

import {
  hasToAddEvmDetails,
  Token,
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
import { Info, WarningCircle } from '@phosphor-icons/react'
import { QueryStatus } from '@tanstack/react-query'
import classNames from 'classnames'
import { AggregatedBalanceLoading, AggregatedLoading } from 'components/aggregated'
import { AlertStrip, TestnetAlertStrip } from 'components/alert-strip'
import RewardStrip from 'components/alert-strip/RewardStrip'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { WalletButton } from 'components/button'
import { EmptyCard } from 'components/empty-card'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import ReceiveToken from 'components/Receive'
import Text from 'components/text'
import WarningCard from 'components/WarningCard'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { SHOW_LINK_ADDRESS_NUDGE } from 'config/storage-keys'
import { motion } from 'framer-motion'
import { useChainPageInfo, useWalletInfo } from 'hooks'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useHideSmallBalances } from 'hooks/settings/useHideSmallBalances'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import useQuery from 'hooks/useQuery'
import { useAddress } from 'hooks/wallet/useAddress'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { ActivitySwapTxPage } from 'pages/activity/ActivitySwapTxPage'
import qs from 'qs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { activeChainStore } from 'stores/active-chain-store'
import { evmBalanceStore } from 'stores/balance-store'
import { chainInfoStore, chainTagsStore } from 'stores/chain-infos-store'
import { rootBalanceStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { HeaderActionType } from 'types/components'
import { AggregatedSupportedChain } from 'types/utility'
import { UserClipboard } from 'utils/clipboard'
import { closeSidePanel } from 'utils/closeSidePanel'
import { getLedgerEnabledEvmChainsIds } from 'utils/getLedgerEnabledEvmChains'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import Browser from 'webextension-polyfill'

import PendingSwapsAlertStrip from '../PendingSwapsAlertStrip'
import PendingSwapsSheet from '../PendingSwapsSheet'
import RequestFaucet from '../RequestFaucet'
import SelectChain from '../SelectChain'
import SelectWallet from '../SelectWallet'
import SideNav from '../side-nav'
import { ChainInfoProp, GeneralHomeProps, InitialFaucetResp, initialFaucetResp } from '../utils'
import {
  AggregatedCopyAddressSheet,
  BitcoinDeposit,
  CopyAddressSheet,
  DepositBTCBanner,
  FundBanners,
  GlobalBannersAD,
  HomeButtons,
  IconActionButton,
  LinkAddressesSheet,
  ListTokens,
  WalletNotConnected,
} from './index'

const TotalBalance = observer(
  ({ balances, evmBalances }: { balances: RootBalanceStore; evmBalances: EvmBalanceStore }) => {
    const { formatHideBalance } = useHideAssets()
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
          }, 2000 + countRef.current * 100)
          countRef.current += 1
        }
      }
    }, [totalFiatValue, timedBalancesFiatValue])

    return (
      <div className='flex items-center justify-center gap-2'>
        <span className='text-xxl text-gray-900 dark:text-white-100 font-black'>
          {formatHideBalance(formatCurrency(timedBalancesFiatValue, false))}
        </span>
      </div>
    )
  },
)

function tokenHasBalance(token: Token | undefined) {
  return !!token?.amount && !isNaN(parseFloat(token?.amount)) && parseFloat(token.amount) > 0
}

export const GeneralHome = observer(
  ({
    _allAssets,
    s3IbcTokensStatus = 'success',
    nonS3IbcTokensStatus = 'success',
    nativeTokensStatus = 'success',
    cw20TokensStatus = 'success',
    erc20TokensStatus = 'success',
    refetchBalances,
    isAggregateLoading = false,
  }: GeneralHomeProps) => {
    const txDeclined = useQuery().get('txDeclined') ?? undefined
    const walletAvatarChanged = useQuery().get('walletAvatarChanged') ?? undefined

    /**
     * Custom hooks
     */

    const navigate = useNavigate()
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const { headerChainImgSrc, gradientChainColor } = useChainPageInfo()
    const chains = useGetChains()

    const initialRef = useRef<Record<string, never | number>>(
      [AGGREGATED_CHAIN_KEY, 'seiTestnet2'].includes(activeChain) ? {} : { opacity: 0, y: 50 },
    )
    useEffect(() => {
      const timeoutMilliSecond = [AGGREGATED_CHAIN_KEY, 'seiTestnet2'].includes(activeChain)
        ? 0
        : 300
      const timeoutId = setTimeout(() => {
        initialRef.current = {}
      }, timeoutMilliSecond)

      return () => clearTimeout(timeoutId)
    }, [activeChain])

    const {
      snip20Tokens,
      snip20TokensStatus,
      enabled: snip20Enabled,
    } = useSnipGetSnip20TokenBalances()
    const selectedNetwork = useSelectedNetwork()
    const { walletAvatar, walletName } = useWalletInfo()
    const dontShowSelectChain = useDontShowSelectChain()

    const address = useAddress()
    const isSeiEvmChain = useIsSeiEvmChain(activeChain as SupportedChain)
    const [areSmallBalancesHidden] = useHideSmallBalances()
    const { activeWallet } = useActiveWallet()

    const chain: ChainInfoProp = useChainInfo()
    const walletAddresses = useGetWalletAddresses()
    const getWallet = Wallet.useGetWallet()
    const { addressLinkState } = useSeiLinkedAddressState(
      getWallet,
      activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : undefined,
    )
    const { data: evmBalance } = useGetEvmBalance(
      activeChain as SupportedChain,
      undefined,
      selectedNetwork,
    )

    const evmStatus = evmBalanceStore.evmBalanceForChain(activeChain as SupportedChain)?.status
    const isWalletHasFunds = !!rootBalanceStore?.allTokens?.some((token) => tokenHasBalance(token))

    /**
     * Local states
     */

    const [showWalletAvatarMsg, setShowWalletAvatarMsg] = useState(!!walletAvatarChanged)
    const [showChainSelector, setShowChainSelector] = useState(false)
    const [showSelectWallet, setShowSelectWallet] = useState(false)
    const [showSideNav, setShowSideNav] = useState(false)
    const [showReceiveSheet, setShowReceiveSheet] = useState(false)

    const [showFaucetResp, setShowFaucetResp] = useState<InitialFaucetResp>(initialFaucetResp)
    const [showMantraFaucetResp, setShowMantraFaucetResp] = useState('')
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(!!txDeclined)
    const [scrtTokenContractAddress, setScrtTokenContractAddress] = useState<string>('')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [showSwapTxPageFor, setShowSwapTxPageFor] = useState<any>()
    const [showPendingSwapsSheet, setShowPendingSwapsSheet] = useState<boolean>(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pendingSwapTxs, setPendingSwapTxs] = useState<any[]>([])

    const [isThisALinkEvmAddressNudge, setIsThisALinkEvmAddressNudge] = useState(false)
    const [showBitcoinDepositSheet, setShowBitcoinDepositSheet] = useState(false)
    const [showCopyAddressSheet, setShowCopyAddressSheet] = useState(false)

    const [isToAddLinkAddressNudgeText, setIsToAddLinkAddressNudgeText] = useState(false)
    const [isWalletAddressCopied, setIsWalletAddressCopied] = useState(false)
    const isEvmOnlyChain = chains?.[activeChain as SupportedChain]?.evmOnlyChain

    /**
     * Local effects
     */

    useEffect(() => {
      refetchBalances && refetchBalances()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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

    const queryStatus = useMemo(() => {
      let status =
        erc20TokensStatus !== 'success' &&
        cw20TokensStatus !== 'success' &&
        s3IbcTokensStatus !== 'success' &&
        nonS3IbcTokensStatus !== 'success' &&
        nativeTokensStatus !== 'success' &&
        evmStatus !== 'success'
          ? 'loading'
          : ''

      status =
        erc20TokensStatus === 'success' &&
        cw20TokensStatus == 'success' &&
        s3IbcTokensStatus === 'success' &&
        nonS3IbcTokensStatus === 'success' &&
        nativeTokensStatus === 'success' &&
        evmStatus === 'success'
          ? 'success'
          : status

      status =
        erc20TokensStatus === 'error' &&
        cw20TokensStatus === 'error' &&
        s3IbcTokensStatus === 'error' &&
        nonS3IbcTokensStatus === 'error' &&
        nativeTokensStatus === 'error' &&
        // asteroidsTokensStatus === 'error' &&
        evmStatus === 'error'
          ? 'error'
          : status

      return status
    }, [
      cw20TokensStatus,
      erc20TokensStatus,
      nativeTokensStatus,
      nonS3IbcTokensStatus,
      s3IbcTokensStatus,
      evmStatus,
    ])

    const smallBalanceAssets = useMemo(() => {
      let assetsToShow = allAssets

      if (allAssets && snip20Tokens) {
        assetsToShow = assetsToShow.concat(
          snip20Tokens.filter((token) => {
            return !token.invalidKey
          }),
        )
      }

      if (areSmallBalancesHidden) {
        return assetsToShow.filter((asset) => Number(asset.usdValue) < 0.1)
      }

      return []
    }, [allAssets, snip20Tokens, areSmallBalancesHidden])

    const invalidKeyTokens = useMemo(() => {
      if (snip20Tokens) {
        return snip20Tokens.filter((token) => token.invalidKey === true)
      }
      return []
    }, [snip20Tokens])

    const atLeastOneTokenIsLoading = rootBalanceStore.loading

    const noAddress = useMemo(() => {
      return activeChain !== AGGREGATED_CHAIN_KEY && !activeWallet?.addresses[activeChain]
    }, [activeChain, activeWallet?.addresses])

    const apiUnavailable = useMemo(() => {
      return (
        activeChain !== AGGREGATED_CHAIN_KEY &&
        atLeastOneTokenIsLoading &&
        chain?.apiStatus === false
      )
    }, [activeChain, atLeastOneTokenIsLoading, chain?.apiStatus])

    const connectEVMLedger = useMemo(() => {
      return (
        noAddress &&
        ledgerEnabledEvmChainsIds.includes(chain?.chainId) &&
        activeWallet?.walletType === WALLETTYPE.LEDGER
      )
    }, [activeWallet?.walletType, chain?.chainId, ledgerEnabledEvmChainsIds, noAddress])

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

    const disabled = useMemo(() => {
      return (
        activeChain !== AGGREGATED_CHAIN_KEY &&
        activeWallet?.walletType === WALLETTYPE.LEDGER &&
        !isLedgerEnabled(
          activeChain as SupportedChain,
          chain?.bip44.coinType,
          Object.values(chains),
        )
      )
    }, [activeChain, activeWallet?.walletType, chain?.bip44.coinType, chains])

    const isTokenLoading = useMemo(
      () => atLeastOneTokenIsLoading || isAggregateLoading,
      [atLeastOneTokenIsLoading, isAggregateLoading],
    )

    const showFundBanners = useMemo(() => {
      return (
        !isCompassWallet() &&
        !chains?.[activeChain as SupportedChain]?.evmOnlyChain &&
        !isWalletHasFunds &&
        !isTokenLoading
      )
    }, [activeChain, chains, isTokenLoading, isWalletHasFunds])

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

    const handleGearActionButtonClick = useCallback(() => {
      if (activeChain === 'secret' && selectedNetwork === 'mainnet') {
        navigate('/snip20-manage-tokens?contractAddress=' + scrtTokenContractAddress)
      } else {
        navigate('/manage-tokens')
      }
    }, [activeChain, navigate, scrtTokenContractAddress, selectedNetwork])

    const handleCopyClick = useCallback(() => {
      if (walletAddresses?.length > 1 || activeChain === AGGREGATED_CHAIN_KEY) {
        setShowCopyAddressSheet(true)
        return
      }

      setIsWalletAddressCopied(true)
      setTimeout(() => setIsWalletAddressCopied(false), 2000)

      UserClipboard.copyText(walletAddresses?.[0])
    }, [activeChain, walletAddresses])

    const handleOpenSelectChainSheet = useCallback(() => setShowChainSelector(true), [])
    const handleOpenSideNavSheet = useCallback(() => setShowSideNav(true), [])
    const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])
    const handleConnectEvmWalletClick = useCallback(() => {
      window.open(Browser.runtime.getURL('index.html#/onboardEvmLedger'))
      closeSidePanel()
    }, [])

    /**
     * Early returns
     */

    usePerformanceMonitor({
      page: 'home',
      queryStatus: queryStatus as QueryStatus,
      op: 'homePageLoad',
      description: 'loading state on home page',
    })

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
        <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
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
                  isToAddLinkAddressNudgeText={isToAddLinkAddressNudgeText}
                />
              }
              imgSrc={headerChainImgSrc}
              onImgClick={dontShowSelectChain ? undefined : handleOpenSelectChainSheet}
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
            className={classNames('w-full flex flex-col justify-center items-center mb-20', {
              hidden: connectEVMLedger,
            })}
          >
            <TestnetAlertStrip />
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

            <div
              className='w-full flex flex-col items-center justify-center px-7'
              style={{ background: gradientChainColor }}
            >
              <motion.div
                initial={initialRef.current}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeIn' }}
                className='flex flex-col items-center justify-center my-6'
              >
                {activeChain !== 'nomic' ? (
                  isTokenLoading ? (
                    <AggregatedBalanceLoading />
                  ) : (
                    <TotalBalance balances={rootBalanceStore} evmBalances={evmBalanceStore} />
                    //   <div className='flex items-center justify-center gap-2'>
                    //   <span className='text-xxl text-gray-900 dark:text-white-100 font-black'>
                    //     {totalCurrencyInPreferredFiatValue.toNumber() == 0 && assets.length > 0
                    //       ? '-'
                    //       : formatHideBalance(
                    //         formatCurrency(totalCurrencyInPreferredFiatValue, true),
                    //       )}
                    //   </span>
                    // </div>
                  )
                ) : null}

                {/* Handle Ledger */}
                {activeChain !== AGGREGATED_CHAIN_KEY ? (
                  <>
                    {disabled ? (
                      <div className='flex items-center bg-red-300 rounded-2xl py-1 px-4 w-fit self-center mx-auto mt-[12px]'>
                        <WarningCircle size={16} className='text-white-100 mr-[5px]' />
                        <Text size='sm'>Ledger not supported for {chain?.chainName}</Text>
                      </div>
                    ) : !walletAddresses?.[0]?.length ? (
                      <div className='mt-[12px]'>
                        <Text size='md' className='mb-3'>
                          EVM wallets not connected
                        </Text>

                        <div onClick={handleConnectEvmWalletClick}>
                          <Text
                            size='sm'
                            className='font-bold bg-gray-800 rounded-2xl py-1 px-3 w-fit mx-auto cursor-pointer'
                          >
                            Connect EVM wallet
                          </Text>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {activeChain !== AGGREGATED_CHAIN_KEY && (
                  <Text
                    size='xs'
                    color='dark:text-gray-200 text-gray-800'
                    className='font-medium mt-1'
                  >
                    You are on {chains[activeChain]?.chainName}
                  </Text>
                )}

                {activeChain !== AGGREGATED_CHAIN_KEY ? (
                  <DepositBTCBanner handleClick={() => setShowBitcoinDepositSheet(true)} />
                ) : null}
              </motion.div>
            </div>

            <motion.div
              initial={initialRef.current}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: 'easeIn' }}
              className='w-full flex flex-col items-center justify-center'
            >
              <div className='px-7 w-full'>
                <HomeButtons setShowReceiveSheet={() => setShowReceiveSheet(true)} />
              </div>
              {activeChain === 'mantra' && (
                <RewardStrip
                  activeChainStore={activeChainStore}
                  chainInfosStore={chainInfoStore}
                  rootBalanceStore={rootBalanceStore}
                  setShowMantraFaucetResp={setShowMantraFaucetResp}
                />
              )}
              {selectedNetwork !== 'testnet' && !isTokenLoading && (
                <GlobalBannersAD handleBtcBannerClick={() => setShowBitcoinDepositSheet(true)} />
              )}
            </motion.div>

            {selectedNetwork === 'testnet' && (
              <RequestFaucet
                address={address}
                setShowFaucetResp={(data) => {
                  setShowFaucetResp(data)
                }}
                rootBalanceStore={rootBalanceStore}
              />
            )}

            <motion.div
              initial={initialRef.current}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5, ease: 'easeIn' }}
              className='px-7'
            >
              {noAddress || apiUnavailable ? (
                <WarningCard text={disabledCardMessage} />
              ) : showFundBanners ? (
                <FundBanners handleCopyClick={handleCopyClick} />
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
                        disabled={cw20TokensStatus === 'loading'}
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

                      {nativeTokensStatus !== 'success' ? (
                        <AggregatedLoading className='mb-[12px]' />
                      ) : null}

                      {s3IbcTokensStatus !== 'success' ? (
                        <AggregatedLoading className='mb-[12px]' />
                      ) : null}
                      {nonS3IbcTokensStatus !== 'success' ? (
                        <AggregatedLoading className='mb-[12px]' />
                      ) : null}

                      {cw20TokensStatus !== 'success' ? (
                        <AggregatedLoading className='mb-[12px]' />
                      ) : null}
                      {erc20TokensStatus !== 'success' ? (
                        <AggregatedLoading className='mb-[12px]' />
                      ) : null}

                      {evmStatus !== 'success' ? <AggregatedLoading className='mb-[12px]' /> : null}
                      {activeChain === 'secret' &&
                      snip20TokensStatus !== 'success' &&
                      snip20Enabled ? (
                        <AggregatedLoading className='mb-[12px]' />
                      ) : null}

                      {areSmallBalancesHidden && smallBalanceAssets?.length !== 0 ? (
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
          </div>
        </PopupLayout>

        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
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
