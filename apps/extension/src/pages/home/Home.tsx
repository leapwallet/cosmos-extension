import {
  SecretToken,
  useGetTokenBalances,
  useSendIbcChains,
  useSnipDenomsStore,
  useSnipGetSnip20TokenBalances,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  Buttons,
  CardDivider,
  GenericCard,
  HeaderActionType,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import { QueryStatus } from '@tanstack/react-query'
import { selectedChainAlertState } from 'atoms/selected-chain-alert'
import AlertStrip from 'components/alert-strip/AlertStrip'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import ClickableIcon from 'components/clickable-icons'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import ReceiveToken from 'components/Receive'
import TokenCardSkeleton from 'components/Skeletons/TokenCardSkeleton'
import Text from 'components/text'
import { ButtonName, EventName, PageName } from 'config/analytics'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX, ON_RAMP_SUPPORT_CHAINS } from 'config/config'
import { chainsWithSwapSupport, walletLabels } from 'config/constants'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useHideSmallBalances } from 'hooks/settings/useHideSmallBalances'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useAddress } from 'hooks/wallet/useAddress'
import { Images } from 'images'
import { NftLogo } from 'images/logos'
import mixpanel from 'mixpanel-browser'
import React, { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { isCompassWallet } from 'utils/isCompassWallet'
import { sliceAddress, trim } from 'utils/strings'

import { searchModalState } from '../../atoms/search-modal'
import AssetCard from './AssetCard'
import { BitcoinDeposit, DepositBTCBanner } from './DepositBTCBanner'
import GlobalBannersAD from './GlobalBannersAD'
import { ManageTokens, SecretManageTokens } from './manage-tokens'
import NftV2Header from './NftV2Header'
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
  const darkTheme = (useTheme()?.theme ?? '') === ThemeName.DARK

  const defaultTokenLogo = useDefaultTokenLogo()
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [showSideNav, setShowSideNav] = useState(false)
  const [showReceiveSheet, setShowReceiveSheet] = useState(false)

  const [showFaucetResp, setShowFaucetResp] = useState<InitialFaucetResp>(initialFaucetResp)
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(!!txDeclined)
  const [showManageTokens, setShowManageTokens] = useState<boolean>(false)
  const [scrtToken, setScrtToken] = useState<SecretToken & { contractAddr: string }>()

  const selectedNetwork = useSelectedNetwork()
  const {
    snip20Tokens,
    snip20TokensStatus,
    enabled: snip20Enabled,
  } = useSnipGetSnip20TokenBalances()

  const address = useAddress()
  const [formatCurrency] = useFormatCurrency()
  const { denoms: SecretTokens } = useSnipDenomsStore()

  const [areSmallBalancesHidden] = useHideSmallBalances()
  const { formatHideBalance } = useHideAssets()
  const [showSelectedChainAlert, setShowSelectedChainAlert] =
    useRecoilState(selectedChainAlertState)
  const setShowSearchModal = useSetRecoilState(searchModalState)
  const [showBitcoinDepositSheet, setShowBitcoinDepositSheet] = useState(false)
  const sendIbcChains = useSendIbcChains()

  const {
    allAssets,
    totalCurrencyInPreferredFiatValue,
    ibcTokensStatus,
    nativeTokensStatus,
    cw20TokensStatus,
    cw20TokensBalances,
    erc20TokensStatus,
  } = useGetTokenBalances()
  const activeChain = useActiveChain()
  const isNomicChain = activeChain === 'nomic'
  const chain = chainInfos[activeChain]
  const { activeWallet } = useActiveWallet()
  const isTestnet = useSelectedNetwork() === 'testnet'

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar
    }

    if (isCompassWallet()) {
      return Images.Logos.CompassCircle
    }

    return
  }, [activeWallet?.avatar])

  const queryStatus = useMemo(() => {
    let status =
      erc20TokensStatus !== 'success' &&
      cw20TokensStatus !== 'success' &&
      ibcTokensStatus !== 'success' &&
      nativeTokensStatus !== 'success'
        ? 'loading'
        : ''

    status =
      erc20TokensStatus === 'success' &&
      cw20TokensStatus == 'success' &&
      ibcTokensStatus === 'success' &&
      nativeTokensStatus === 'success'
        ? 'success'
        : status

    status =
      erc20TokensStatus === 'error' &&
      cw20TokensStatus === 'error' &&
      ibcTokensStatus === 'error' &&
      nativeTokensStatus === 'error'
        ? 'error'
        : status

    return status
  }, [cw20TokensStatus, erc20TokensStatus, ibcTokensStatus, nativeTokensStatus])

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
    ibcTokensStatus !== 'success' &&
    nativeTokensStatus !== 'success'

  const disabled =
    activeWallet.walletType === WALLETTYPE.LEDGER &&
    (chain?.bip44.coinType === '60' || chain?.bip44.coinType === '931')

  const walletName =
    activeWallet.walletType === WALLETTYPE.LEDGER &&
    !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(activeWallet.name)
      ? `${walletLabels[activeWallet.walletType]} Wallet ${activeWallet.addressIndex + 1}`
      : formatWalletName(activeWallet.name)

  const atLeastOneTokenIsLoading =
    erc20TokensStatus === 'loading' ||
    nativeTokensStatus === 'loading' ||
    cw20TokensStatus === 'loading' ||
    ibcTokensStatus === 'loading'

  const activeChainInfo = chainInfos[activeChain]

  if (!activeChainInfo) {
    return null
  }

  const handleQuickSearchIconClick = () => {
    setShowSearchModal(true)

    mixpanel.track(EventName.QuickSearchOpen, {
      chainId: chain.chainId,
      chainName: chain.chainName,
      openMode: 'Icon',
    })
  }

  return (
    <div className='relative w-[400px] overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <NftV2Header
            action={{
              onClick: () => setShowSideNav(true),
              type: HeaderActionType.NAVIGATION,
              'data-testing-id': 'home-sidenav-hamburger-btn',
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              className: isCompassWallet()
                ? 'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full'
                : '',
            }}
            nftAction={{
              onClick: () => navigate('/nfts'),
              imgSrc: NftLogo,
            }}
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            onImgClick={
              isCompassWallet()
                ? undefined
                : function noRefCheck() {
                    setShowChainSelector(true)
                  }
            }
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
        <div className='w-full flex flex-col justify-center items-center mb-20'>
          {isCompassWallet() && isTestnet && (
            <AlertStrip
              message='You are on Sei Testnet'
              bgColor={Colors.getChainColor(activeChain)}
              alwaysShow={isTestnet}
            />
          )}

          {showSelectedChainAlert && !showErrorMessage && !isCompassWallet() && (
            <AlertStrip
              message={`You are on ${chain?.chainName}${
                isTestnet && !chain?.chainName.includes('Testnet') ? ' Testnet' : ''
              }`}
              bgColor={chain?.theme?.primaryColor}
              alwaysShow={isTestnet}
              onHide={() => {
                setShowSelectedChainAlert(false)
              }}
              data-testing-id='home-alertstrip-chainname'
            />
          )}

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
                <Text size='xs'>{`Ledger not supported for ${chain?.chainName} chain`}</Text>
              </div>
            ) : (
              <div className='flex justify-center items-start mb-6'>
                <Buttons.CopyWalletAddress
                  textOnCopied={'Copied Address'}
                  walletAddress={sliceAddress(address)}
                  color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                  onCopy={() => {
                    UserClipboard.copyText(address)
                  }}
                  data-testing-id='home-copy-address-btn'
                />
                <button
                  className='flex ml-2 h-9 w-9 dark:bg-gray-900 bg-white-100 justify-center text-xs text-gray-600 dark:text-gray-200 items-center cursor-pointer rounded-full'
                  onClick={handleQuickSearchIconClick}
                  title='Search'
                >
                  <span className='text-base material-icons-round'>search</span>
                </button>
              </div>
            )}

            {!isCompassWallet() && (
              <DepositBTCBanner handleClick={() => setShowBitcoinDepositSheet(true)} />
            )}

            {!isTestnet && !isCompassWallet() ? (
              <div className='flex flex-row justify-evenly mb-6 w-full'>
                <ClickableIcon
                  image={{
                    src: 'download',
                    alt: ON_RAMP_SUPPORT_CHAINS.includes(activeChain) ? 'Deposit' : 'Receive',
                  }}
                  onClick={() => setShowReceiveSheet(true)}
                  disabled={isNomicChain}
                />
                <ClickableIcon
                  image={{ src: 'file_upload', alt: 'Send' }}
                  onClick={() => navigate('/send')}
                  disabled={isNomicChain}
                />
                <ClickableIcon
                  image={{ src: Images.Misc.IbcUnion, alt: 'IBC' }}
                  onClick={() => navigate('/ibc')}
                  disabled={isNomicChain || sendIbcChains.length === 0}
                />
                <ClickableIcon
                  image={{ src: 'swap_horiz', alt: 'Swap' }}
                  disabled={isNomicChain}
                  onClick={() => {
                    if (chainsWithSwapSupport.includes(activeChain) && !isTestnet) {
                      navigate('/swap')
                    } else {
                      const chain = chainInfos[activeChain]
                      const redirectUrl = `https://cosmos.leapwallet.io/transact/swap?sourceChainId=${chain.chainId}`
                      try {
                        mixpanel.track(EventName.ButtonClick, {
                          buttonName: ButtonName.IBC_SWAP,
                          redirectUrl,
                          chainId: chain.chainId,
                          chainName: chain.chainName,
                        })
                      } catch (e) {
                        // ignore
                      }
                      window.open(redirectUrl, '_blank')
                    }
                  }}
                />
              </div>
            ) : (
              <div className='flex justify-between mb-6 w-full'>
                <Buttons.Generic
                  size='sm'
                  disabled={disabled || isNomicChain}
                  color={darkTheme ? undefined : Colors.white100}
                  onClick={() => {
                    setShowReceiveSheet(true)
                  }}
                >
                  <div className={'flex justify-center text-black-100  items-center'}>
                    <span className='mr-2 material-icons-round'>download</span>
                    {ON_RAMP_SUPPORT_CHAINS.includes(activeChain) ? (
                      <span>Deposit</span>
                    ) : (
                      <span>Receive</span>
                    )}
                  </div>
                </Buttons.Generic>
                <Buttons.Generic
                  size='sm'
                  disabled={disabled || isNomicChain}
                  color={darkTheme ? undefined : Colors.white100}
                  onClick={() => {
                    navigate('/send')
                  }}
                  data-testing-id='home-generic-send-btn'
                >
                  <div className={'flex justify-center text-black-100  items-center'}>
                    <span className='mr-2 material-icons-round'>file_upload</span>
                    <span>Send</span>
                  </div>
                </Buttons.Generic>
              </div>
            )}
          </div>

          {showQuickOptionDiv ? (
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

          {!isCompassWallet() && (
            <GlobalBannersAD handleBtcBannerClick={() => setShowBitcoinDepositSheet(true)} />
          )}

          <div className='rounded-2xl dark:bg-gray-900 bg-white-100 mx-7'>
            <Text size='sm' color='dark:text-gray-200 text-gray-600 font-medium px-5 pt-4'>
              Available Tokens {(assets?.length ?? 0) > 0 ? `(${assets.length})` : ''}
            </Text>

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
                    onClick={() => {
                      setScrtToken({
                        ...SecretTokens[token.coinMinimalDenom],
                        contractAddr: token.coinMinimalDenom,
                      })
                    }}
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
            {ibcTokensStatus !== 'success' ? <TokenCardSkeleton /> : null}
            {cw20TokensStatus !== 'success' ? <TokenCardSkeleton /> : null}
            {activeChain === 'secret' && snip20TokensStatus !== 'success' && snip20Enabled ? (
              <TokenCardSkeleton />
            ) : null}
            {erc20TokensStatus !== 'success' ? <TokenCardSkeleton /> : null}

            {cw20TokensStatus === 'success' && (
              <div
                className='px-4 py-3 border-t-[1px] dark:border-gray-800 border-gray-100 cursor-pointer'
                onClick={() => setShowManageTokens(true)}
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
        </div>
      </PopupLayout>

      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => setShowSelectWallet(false)}
        title='Wallets'
      />

      {activeChain === 'secret' && selectedNetwork === 'mainnet' ? (
        <SecretManageTokens
          isVisible={showManageTokens}
          onClose={() => setShowManageTokens(false)}
          token={scrtToken}
        />
      ) : (
        <ManageTokens
          isVisible={showManageTokens}
          onClose={() => setShowManageTokens(false)}
          tokens={cw20TokensBalances}
        />
      )}

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
      <BottomNav label={BottomNavLabel.Home} disabled={disabled} />
    </div>
  )
}
