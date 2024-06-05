import {
  useGetAsteroidTokens,
  useGetSeiEvmBalance,
  useGetTokenBalances,
  useIsSeiEvmChain,
  useSeiLinkedAddressState,
  useSnipGetSnip20TokenBalances,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, CardDivider, GenericCard, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { QueryStatus } from '@tanstack/react-query'
import classNames from 'classnames'
import AlertStrip from 'components/alert-strip/AlertStrip'
import SelectedChainAlertStrip from 'components/alert-strip/SelectedChainAlertStrip'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { EmptyCard } from 'components/empty-card'
import { EthCopyWalletAddress } from 'components/eth-copy-wallet-address'
import PopupLayout from 'components/layout/popup-layout'
import ReceiveToken from 'components/Receive'
import TokenCardSkeleton from 'components/Skeletons/TokenCardSkeleton'
import Text from 'components/text'
import WarningCard from 'components/WarningCard'
import { PageName } from 'config/analytics'
import { LEDGER_ENABLED_EVM_CHAIN_IDS, LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { walletLabels } from 'config/constants'
import { SHOW_LINK_ADDRESS_NUDGE } from 'config/storage-keys'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets, useSetHideAssets } from 'hooks/settings/useHideAssets'
import { useHideSmallBalances } from 'hooks/settings/useHideSmallBalances'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useAddress } from 'hooks/wallet/useAddress'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { ActivitySwapTxPage } from 'pages/activity/ActivitySwapTxPage'
import qs from 'qs'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import { sliceAddress, trim } from 'utils/strings'
import Browser from 'webextension-polyfill'

import { searchModalState } from '../../atoms/search-modal'
import AssetCard from './AssetCard'
import { CopyAddressSheet, HomeButtons, LinkAddressesSheet, WalletNotConnected } from './components'
import { BitcoinDeposit, DepositBTCBanner } from './DepositBTCBanner'
import FundBanners from './FundBanners'
import GlobalBannersAD from './GlobalBannersAD'
import PendingSwapsAlertStrip from './PendingSwapsAlertStrip'
import PendingSwapsSheet from './PendingSwapsSheet'
import RequestFaucet from './RequestFaucet'
import SelectChain from './SelectChain'
import SelectWallet from './SelectWallet'
import SideNav from './side-nav'

type InitialFaucetResp = {
  msg: string
  status: 'success' | 'fail' | null
}

const initialFaucetResp: InitialFaucetResp = {
  msg: '',
  status: null,
}

interface ChainInfoProp extends ChainInfo {
  apiStatus?: boolean
}

export default function Home() {
  usePageView(PageName.Home)

  const chainInfos = useChainInfos()
  const txDeclined = useQuery().get('txDeclined') ?? undefined
  const walletAvatarChanged = useQuery().get('walletAvatarChanged') ?? undefined
  const [showWalletAvatarMsg, setShowWalletAvatarMsg] = useState(!!walletAvatarChanged)
  const [showQuickOptionDiv, setShowQuickOptionDiv] = useState(
    localStorage.getItem('showQuickOptionDiv') ? false : true,
  )

  const navigate = useNavigate()

  const defaultTokenLogo = useDefaultTokenLogo()
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [showSideNav, setShowSideNav] = useState(false)
  const [showReceiveSheet, setShowReceiveSheet] = useState(false)

  const [showFaucetResp, setShowFaucetResp] = useState<InitialFaucetResp>(initialFaucetResp)
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(!!txDeclined)
  const [scrtTokenContractAddress, setScrtTokenContractAddress] = useState<string>('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [showSwapTxPageFor, setShowSwapTxPageFor] = useState<any>()
  const [showPendingSwapsSheet, setShowPendingSwapsSheet] = useState<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingSwapTxs, setPendingSwapTxs] = useState<any[]>([])

  const selectedNetwork = useSelectedNetwork()
  const {
    snip20Tokens,
    snip20TokensStatus,
    enabled: snip20Enabled,
  } = useSnipGetSnip20TokenBalances()

  const address = useAddress()
  const [formatCurrency] = useFormatCurrency()
  const isSeiEvmChain = useIsSeiEvmChain()

  const [areSmallBalancesHidden] = useHideSmallBalances()
  const { hideBalances: balancesHidden, formatHideBalance } = useHideAssets()
  const setBalancesVisibility = useSetHideAssets()

  const setShowSearchModal = useSetRecoilState(searchModalState)
  const [showBitcoinDepositSheet, setShowBitcoinDepositSheet] = useState(false)

  const {
    isWalletHasFunds,
    allAssets: _allAssets,
    totalCurrencyInPreferredFiatValue: _allAssetsCurrencyInFiat,
    s3IbcTokensStatus,
    nonS3IbcTokensStatus,
    nativeTokensStatus,
    cw20TokensStatus,
    erc20TokensStatus,
    refetchBalances,
  } = useGetTokenBalances()

  // refetch balances
  useEffect(() => {
    refetchBalances()
  }, [])

  const getWallet = Wallet.useGetWallet()
  const { addressLinkState } = useSeiLinkedAddressState(getWallet)
  const { data: seiEvmBalance, status: seiEvmStatus } = useGetSeiEvmBalance()
  const { status: asteroidsTokensStatus, data: asteroidTokenBalance } = useGetAsteroidTokens()

  const allAssets = useMemo(() => {
    let allAssets = [..._allAssets, ...(asteroidTokenBalance?.asteroidTokens ?? [])]

    if (!['done', 'unknown'].includes(addressLinkState)) {
      const firstElement = allAssets?.[0]

      if (firstElement) {
        allAssets = [
          firstElement,
          ...(seiEvmBalance?.seiEvmBalance ?? []),
          ...(allAssets ?? []).slice(1),
        ]
      } else {
        allAssets = [...(seiEvmBalance?.seiEvmBalance ?? []), ...(allAssets ?? []).slice(1)]
      }
    }

    return allAssets
  }, [
    _allAssets,
    addressLinkState,
    asteroidTokenBalance?.asteroidTokens,
    seiEvmBalance?.seiEvmBalance,
  ])

  const totalCurrencyInPreferredFiatValue = useMemo(() => {
    let totalCurrencyInPreferredFiatValue = _allAssetsCurrencyInFiat.plus(
      asteroidTokenBalance?.currencyInFiatValue ?? 0,
    )

    if (!['done', 'unknown'].includes(addressLinkState)) {
      totalCurrencyInPreferredFiatValue = totalCurrencyInPreferredFiatValue.plus(
        seiEvmBalance?.currencyInFiatValue ?? 0,
      )
    }

    return totalCurrencyInPreferredFiatValue
  }, [
    _allAssetsCurrencyInFiat,
    addressLinkState,
    asteroidTokenBalance?.currencyInFiatValue,
    seiEvmBalance?.currencyInFiatValue,
  ])

  const activeChain = useActiveChain()
  const [showCopyAddressSheet, setShowCopyAddressSheet] = useState(false)
  const [isThisALinkEvmAddressNudge, setIsThisALinkEvmAddressNudge] = useState(false)
  const { activeWallet } = useActiveWallet()

  const chain: ChainInfoProp = chainInfos[activeChain]
  const walletAddresses = useGetWalletAddresses()

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar
    }

    if (isCompassWallet()) {
      return Images.Logos.CompassCircle
    }

    return Images.Logos.LeapLogo28
  }, [activeWallet?.avatar])

  const queryStatus = useMemo(() => {
    let status =
      erc20TokensStatus !== 'success' &&
      cw20TokensStatus !== 'success' &&
      s3IbcTokensStatus !== 'success' &&
      nonS3IbcTokensStatus !== 'success' &&
      nativeTokensStatus !== 'success' &&
      asteroidsTokensStatus !== 'success' &&
      seiEvmStatus !== 'success'
        ? 'loading'
        : ''

    status =
      erc20TokensStatus === 'success' &&
      cw20TokensStatus == 'success' &&
      s3IbcTokensStatus === 'success' &&
      nonS3IbcTokensStatus === 'success' &&
      nativeTokensStatus === 'success' &&
      asteroidsTokensStatus === 'success' &&
      seiEvmStatus === 'success'
        ? 'success'
        : status

    status =
      erc20TokensStatus === 'error' &&
      cw20TokensStatus === 'error' &&
      s3IbcTokensStatus === 'error' &&
      nonS3IbcTokensStatus === 'error' &&
      nativeTokensStatus === 'error' &&
      asteroidsTokensStatus === 'error' &&
      seiEvmStatus === 'error'
        ? 'error'
        : status

    return status
  }, [
    asteroidsTokensStatus,
    cw20TokensStatus,
    erc20TokensStatus,
    nativeTokensStatus,
    nonS3IbcTokensStatus,
    s3IbcTokensStatus,
    seiEvmStatus,
  ])

  const handleCopyAddressSheetClose = useCallback(
    (refetch?: boolean) => {
      setShowCopyAddressSheet(false)
      setIsThisALinkEvmAddressNudge(false)
      localStorage.setItem(SHOW_LINK_ADDRESS_NUDGE, 'false')

      if (refetch) {
        refetchBalances()
      }
    },
    [refetchBalances],
  )

  useEffect(() => {
    if (
      isSeiEvmChain &&
      !['done', 'unknown', 'loading'].includes(addressLinkState) &&
      seiEvmStatus === 'success' &&
      localStorage.getItem(SHOW_LINK_ADDRESS_NUDGE) !== 'false'
    ) {
      setIsThisALinkEvmAddressNudge(true)
    } else {
      setIsThisALinkEvmAddressNudge(false)
    }
  }, [addressLinkState, isSeiEvmChain, seiEvmStatus])

  usePerformanceMonitor({
    page: 'home',
    queryStatus: queryStatus as QueryStatus,
    op: 'homePageLoad',
    description: 'loading state on home page',
  })

  const [assets, smallBalanceAssets] = useMemo(() => {
    let assetsToShow = allAssets

    if (allAssets && snip20Tokens) {
      assetsToShow = assetsToShow.concat(
        snip20Tokens.filter((token) => {
          return !token.invalidKey
        }),
      )
    }

    if (areSmallBalancesHidden) {
      return [
        assetsToShow.filter((asset) => Number(asset.usdValue) >= 0.1),
        assetsToShow.filter((asset) => Number(asset.usdValue) < 0.1),
      ]
    }

    return [assetsToShow, []]
  }, [allAssets, snip20Tokens, areSmallBalancesHidden])

  const invalidKeyTokens = useMemo(() => {
    if (snip20Tokens) {
      return snip20Tokens.filter((token) => token.invalidKey === true)
    }
    return []
  }, [snip20Tokens])

  if (!activeWallet) {
    return (
      <div className='relative w-[400px] overflow-clip'>
        <PopupLayout>
          <div>
            <EmptyCard src={Images.Logos.LeapCosmos} heading='No wallet found' />
          </div>
        </PopupLayout>
      </div>
    )
  }

  const loading =
    erc20TokensStatus !== 'success' &&
    cw20TokensStatus !== 'success' &&
    s3IbcTokensStatus !== 'success' &&
    nonS3IbcTokensStatus !== 'success' &&
    nativeTokensStatus !== 'success' &&
    asteroidsTokensStatus !== 'success' &&
    seiEvmStatus !== 'success'

  const disabled =
    activeWallet.walletType === WALLETTYPE.LEDGER &&
    !isLedgerEnabled(activeChain, chain?.bip44.coinType)

  const walletName =
    activeWallet.walletType === WALLETTYPE.LEDGER &&
    !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(activeWallet.name)
      ? `${walletLabels[activeWallet.walletType]} Wallet ${activeWallet.addressIndex + 1}`
      : formatWalletName(activeWallet.name)

  const atLeastOneTokenIsLoading =
    erc20TokensStatus === 'loading' ||
    nativeTokensStatus === 'loading' ||
    cw20TokensStatus === 'loading' ||
    s3IbcTokensStatus === 'loading' ||
    nonS3IbcTokensStatus === 'loading' ||
    asteroidsTokensStatus === 'loading' ||
    seiEvmStatus === 'loading'

  const activeChainInfo = chainInfos[activeChain]

  if (!activeChainInfo) {
    return null
  }

  const handleQuickSearchIconClick = () => {
    setShowSearchModal(true)
  }

  const noAddress = !activeWallet.addresses[activeChain]
  const apiUnavailable = atLeastOneTokenIsLoading && chain?.apiStatus === false
  const showDisabledCard = noAddress || apiUnavailable
  const connectEVMLedger =
    noAddress &&
    LEDGER_ENABLED_EVM_CHAIN_IDS.includes(chain.chainId) &&
    activeWallet.walletType === WALLETTYPE.LEDGER
  const ledgerNoSupported =
    noAddress &&
    !LEDGER_ENABLED_EVM_CHAIN_IDS.includes(chain.chainId) &&
    activeWallet.walletType === WALLETTYPE.LEDGER
  let disabledCardMessage = ''
  if (connectEVMLedger) {
    disabledCardMessage = `Please import your ${chain.chainName} wallet by connecting EVM Ledger app.`
  } else if (ledgerNoSupported) {
    disabledCardMessage = `Ledger support coming soon for ${chain.chainName}`
  } else if (apiUnavailable) {
    disabledCardMessage = `The ${chain.chainName} network is currently experiencing issues. Please try again later.`
  }

  return (
    <div className='relative w-[400px] overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => setShowSideNav(true),
              type: HeaderActionType.NAVIGATION,
              'data-testing-id': 'home-sidenav-hamburger-btn',
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              className:
                'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full',
            }}
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            onImgClick={() => setShowChainSelector(true)}
            title={
              <Buttons.Wallet
                brandLogo={
                  walletAvatar ? (
                    <img className='w-[24px] h-[24px] mr-2 rounded-full' src={walletAvatar} />
                  ) : undefined
                }
                onClick={function noRefCheck() {
                  setShowSelectWallet(true)
                }}
                title={trim(walletName, 10)}
                data-testing-id='home-create-wallet-btn'
              />
            }
            topColor={Colors.getChainColor(activeChain, activeChainInfo)}
            data-testing-id='home-switch-chain-btn'
          />
        }
      >
        <WalletNotConnected chain={chain} visible={connectEVMLedger} />
        <div
          className={classNames('w-full flex flex-col justify-center items-center mb-20', {
            hidden: connectEVMLedger,
          })}
        >
          {!showErrorMessage && <SelectedChainAlertStrip />}

          {showErrorMessage && (
            <AlertStrip
              message={'Transaction declined'}
              bgColor={Colors.red300}
              alwaysShow={false}
              onHide={() => setShowErrorMessage(false)}
            />
          )}

          {showFaucetResp.msg && (
            <AlertStrip
              message={showFaucetResp.msg}
              bgColor={showFaucetResp.status === 'success' ? Colors.green600 : Colors.red300}
              alwaysShow={false}
              onHide={() => setShowFaucetResp(initialFaucetResp)}
              className='absolute bottom-[80px] rounded-xl w-80 h-auto p-2'
              timeOut={6000}
            />
          )}

          {showWalletAvatarMsg && (
            <AlertStrip
              message='Profile picture changed successfully'
              bgColor={Colors.green600}
              alwaysShow={false}
              onHide={() => setShowWalletAvatarMsg(false)}
              className='absolute top-[80px] rounded-2xl w-80 h-auto p-2'
              timeOut={1000}
            />
          )}

          <div
            className='w-full flex flex-col items-center justify-center px-7 pt-7'
            style={{
              background: isCompassWallet() ? Colors.compassGradient : chain?.theme?.gradient,
            }}
          >
            <div className='flex justify-center mb-1 text-sm font-bold text-gray-800 dark:text-gray-300 uppercase'>
              Your portfolio
            </div>
            <div className='flex justify-center mb-2 text-xxl font-black text-gray-900 dark:text-white-100'>
              {!loading ? (
                formatHideBalance(formatCurrency(totalCurrencyInPreferredFiatValue))
              ) : (
                <Skeleton
                  count={1}
                  style={{ borderRadius: '50px' }}
                  containerClassName='flex-1 max-w-[135px] z-0'
                />
              )}
            </div>
            {disabled ? (
              <div className='flex items-center bg-red-300 rounded-2xl py-1 px-4 w-fit self-center mx-auto mb-[24px]'>
                <span className='material-icons-round text-white-100 mr-[5px]'>error</span>{' '}
                <Text size='xs'>Ledger not supported for {chain?.chainName}</Text>
              </div>
            ) : !walletAddresses?.[0]?.length ? (
              <div className='mb-[24px]'>
                <Text size='md' className='mb-3'>
                  EVM wallets not connected
                </Text>

                <div
                  onClick={() =>
                    window.open(Browser.runtime.getURL('index.html#/onboardEvmLedger'))
                  }
                >
                  <Text
                    size='sm'
                    className='font-bold bg-gray-800 rounded-2xl py-1 px-3 w-fit mx-auto cursor-pointer'
                  >
                    Connect EVM wallet
                  </Text>
                </div>
              </div>
            ) : (
              <div className='flex justify-center items-start mb-6'>
                <EthCopyWalletAddress
                  textOnCopied={'Copied Address'}
                  walletAddresses={walletAddresses.map((address) => sliceAddress(address))}
                  color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                  onCopy={() => UserClipboard.copyText(walletAddresses[0])}
                  data-testing-id='home-copy-address-btn'
                  onTextClick={
                    walletAddresses.length > 1 ? () => setShowCopyAddressSheet(true) : undefined
                  }
                />

                {isCompassWallet() ? (
                  <button
                    className={
                      'flex ml-2 h-9 w-9 dark:bg-gray-900 bg-white-100 justify-center text-xs text-gray-600 dark:text-gray-200 items-center cursor-pointer rounded-full'
                    }
                    onClick={() => setBalancesVisibility(!balancesHidden)}
                    title={balancesHidden ? 'Show Balances' : 'Hide Balances'}
                  >
                    <span className='text-sm material-icons-round'>
                      {balancesHidden ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                ) : (
                  <button
                    className='flex ml-2 h-9 w-9 dark:bg-gray-900 bg-white-100 justify-center text-xs text-gray-600 dark:text-gray-200 items-center cursor-pointer rounded-full'
                    onClick={handleQuickSearchIconClick}
                    title='Search'
                  >
                    <span className='text-base material-icons-round'>search</span>
                  </button>
                )}
              </div>
            )}

            {!isCompassWallet() ? (
              <DepositBTCBanner handleClick={() => setShowBitcoinDepositSheet(true)} />
            ) : null}
            <HomeButtons setShowReceiveSheet={() => setShowReceiveSheet(true)} />
          </div>

          {showQuickOptionDiv && !isCompassWallet() ? (
            <div className='flex dark:bg-gray-900 bg-white-100 dark:text-gray-200 text-gray-600 rounded-full w-[344px] p-2 mb-4'>
              <p className='flex-1 text-center'>
                Press {navigator.userAgent.toLowerCase().includes('windows') ? 'ctrl' : 'cmd'} + k
                for quick actions ✨
              </p>
              <button
                className='mr-2'
                onClick={() => {
                  setShowQuickOptionDiv(false)
                  localStorage.setItem('showQuickOptionDiv', 'false')
                }}
              >
                <img className='w-[8px] h-[8px]' src={Images.Misc.Cross} alt='close' />
              </button>
            </div>
          ) : null}

          {(isCompassWallet() ? true : selectedNetwork !== 'testnet') &&
            isWalletHasFunds &&
            !atLeastOneTokenIsLoading && (
              <GlobalBannersAD handleBtcBannerClick={() => setShowBitcoinDepositSheet(true)} />
            )}

          {selectedNetwork === 'testnet' && (
            <RequestFaucet
              address={address}
              setShowFaucetResp={(data) => {
                setShowFaucetResp(data)
              }}
            />
          )}

          {showDisabledCard ? (
            <WarningCard text={disabledCardMessage} />
          ) : !isCompassWallet() && !isWalletHasFunds && !atLeastOneTokenIsLoading ? (
            <FundBanners />
          ) : (
            <div className='rounded-2xl dark:bg-gray-900 bg-white-100 mx-7'>
              {!atLeastOneTokenIsLoading && (
                <Text size='sm' color='dark:text-gray-200 text-gray-600 font-medium px-5 pt-4'>
                  Available Tokens {(assets?.length ?? 0) > 0 ? `(${assets.length})` : ''}
                </Text>
              )}

              {!atLeastOneTokenIsLoading && assets.length === 0 ? (
                <Text size='sm' className='dark:text-gray-400 text-gray-400 px-5 mt-2'>
                  You don&apos;t have any tokens yet.
                </Text>
              ) : null}

              {assets?.map((asset, index, array) => (
                <AssetCard
                  key={`${asset.symbol}-${index}-${asset.ibcChainInfo?.pretty_name}`}
                  isLast={index === array.length - 1}
                  asset={array[index]}
                />
              ))}

              {!atLeastOneTokenIsLoading &&
              areSmallBalancesHidden &&
              smallBalanceAssets?.length !== 0 ? (
                <p className='text-xs px-4 my-4 text-gray-300 dark:text-gray-600'>
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
                      subtitle2={<span className='material-icons-round text-red-300'>error</span>}
                    />
                    <div className='bg-gray-100 dark:bg-gray-800 px-4 py-2 mx-4 rounded mb-4'>
                      <Text size='xs' color={'text-gray-400'} className='font-bold'>
                        Wrong Key or Key not set
                      </Text>
                    </div>
                  </React.Fragment>
                )
              })}

              {nativeTokensStatus !== 'success' ? <TokenCardSkeleton /> : null}
              {s3IbcTokensStatus !== 'success' ? <TokenCardSkeleton /> : null}
              {nonS3IbcTokensStatus !== 'success' ? <TokenCardSkeleton /> : null}

              {cw20TokensStatus !== 'success' ? <TokenCardSkeleton /> : null}
              {erc20TokensStatus !== 'success' ? <TokenCardSkeleton /> : null}
              {asteroidsTokensStatus !== 'success' ? <TokenCardSkeleton /> : null}
              {seiEvmStatus !== 'success' ? <TokenCardSkeleton /> : null}
              {activeChain === 'secret' && snip20TokensStatus !== 'success' && snip20Enabled ? (
                <TokenCardSkeleton />
              ) : null}

              {!atLeastOneTokenIsLoading && cw20TokensStatus === 'success' && (
                <div
                  className='px-4 py-3 border-t-[1px] dark:border-gray-800 border-gray-100 cursor-pointer'
                  onClick={() => {
                    if (activeChain === 'secret' && selectedNetwork === 'mainnet') {
                      navigate('/snip20-manage-tokens?contractAddress=' + scrtTokenContractAddress)
                    } else {
                      navigate('/manage-tokens')
                    }
                  }}
                >
                  <Text
                    size='md'
                    className='font-bold'
                    style={{
                      color: Colors.getChainColor(activeChain, chain),
                    }}
                  >
                    Manage Tokens
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>
      </PopupLayout>

      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
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
        handleBtcBannerClick={() => setShowBitcoinDepositSheet(true)}
      />
      <BitcoinDeposit
        isVisible={showBitcoinDepositSheet}
        onCloseHandler={() => {
          setShowBitcoinDepositSheet(false)
        }}
      />

      {!['done', 'unknown'].includes(addressLinkState) ? (
        <LinkAddressesSheet
          isVisible={isThisALinkEvmAddressNudge || showCopyAddressSheet}
          onClose={handleCopyAddressSheetClose}
          walletAddresses={walletAddresses}
        />
      ) : (
        <CopyAddressSheet
          isVisible={showCopyAddressSheet}
          onClose={handleCopyAddressSheetClose}
          walletAddresses={walletAddresses}
        />
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
        <BottomNav label={BottomNavLabel.Home} disabled={!activeWallet.addresses[activeChain]} />
      ) : null}
    </div>
  )
}
