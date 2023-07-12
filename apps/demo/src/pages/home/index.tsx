import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import {
  Buttons,
  GenericCard,
  Header,
  HeaderActionType,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { IBCTokenBadge } from '~/components/badge'
import BottomNav, { BottomNavLabel } from '~/components/bottom-nav'
import CardDivider from '~/components/card-divider'
import ClickableIcon from '~/components/clickable-icon'
import PopupLayout from '~/components/popup-layout'
import ReceiveToken from '~/components/receive-token'
import SelectChain from '~/components/select-chain'
import SideNav from '~/components/side-nav'
import Text from '~/components/text'
import useTracking from '~/hooks/mix-panel/use-tracking'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useFormatCurrency, usePreferredCurrency } from '~/hooks/settings/use-currency'
import {
  useHideSmallBalances,
  useSetHideSmallBalances,
} from '~/hooks/settings/use-hide-small-balances'
import { useRewardsBalance } from '~/hooks/staking/use-rewards-balance'
import { useDelegations } from '~/hooks/staking/use-staking'
import { useShowChainAlert } from '~/hooks/use-show-chain-alert'
import useAssetsValue from '~/hooks/wallet/use-assets-value'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'
import { ChainLogos } from '~/images/logos'
import { Colors } from '~/theme/colors'
import { convertFromUsdToRegional } from '~/util/currency-conversion'
import showOrHideBalances from '~/util/show-or-hide-balances'
import { formatTokenAmount, sliceAddress } from '~/util/strings'

import PortfolioDistribution from './widgets/portfolio-distribution'
import SelectWallet from './widgets/select-wallet'

const chainsWithSwapping = ['juno']

const HomePage = () => {
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [showSideNav, setShowSideNav] = useState(false)
  const [showReceiveSheet, setShowReceiveSheet] = useState(false)

  const activeChain = useActiveChain()
  const activeWallet = useActiveWallet()
  const balancesHidden = useHideSmallBalances()
  const setBalancesHidden = useSetHideSmallBalances()
  const formatCurrency = useFormatCurrency()
  const chain = useActiveChain()
  const preferredCurrency = usePreferredCurrency()
  const walletBalance = useAssetsValue()
  const navigate = useNavigate()
  const { currencyAmountDelegation } = useDelegations()
  const darkTheme = useTheme().theme === ThemeName.DARK

  const trackSendToken = useTracking('Send Tokens')
  const trackReceiveToken = useTracking('Receive Tokens')

  const handleSendClick = () => {
    if (process.env.NODE_ENV === 'production') {
      trackSendToken({
        chain,
        walletId: activeWallet.addresses[chain],
      })
    }
    navigate('/send')
  }

  const handleReceiveClick = () => {
    if (process.env.NODE_ENV === 'production') {
      trackReceiveToken({
        chain,
        walletId: activeWallet.addresses[chain],
      })
    }
    setShowReceiveSheet(true)
  }

  const stakeBalance = useMemo(
    () => new BigNumber(currencyAmountDelegation),
    [currencyAmountDelegation],
  )
  const rewardsBalance = useRewardsBalance()

  const portfolioTotal = walletBalance.plus(stakeBalance).plus(rewardsBalance)

  return (
    <div className='relative w-full overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        showBetaTag
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                setShowSideNav(true)
              },
              type: HeaderActionType.NAVIGATION,
            }}
            imgSrc={ChainLogos[activeChain]}
            onImgClick={function noRefCheck() {
              setShowChainSelector(true)
            }}
            title={
              <Buttons.Wallet
                onClick={function noRefCheck() {
                  setShowSelectWallet(true)
                }}
                title={activeWallet.name}
              />
            }
            topColor={ChainInfos[activeChain].theme.primaryColor}
          />
        }
      >
        <div className='w-full flex flex-col justify-center items-center mb-20'>
          <div
            className='w-full flex-col items-center justify-center px-7 pt-7'
            style={{ background: ChainInfos[activeChain].theme.gradient }}
          >
            <div className='flex justify-center mb-1 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase'>
              Your portfolio
            </div>
            <div className='flex justify-center mb-2 text-xxl font-black text-gray-900 dark:text-white-100'>
              {balancesHidden ? '••••••••' : formatCurrency(portfolioTotal)}
            </div>
            <div
              onClick={async () => {
                await navigator.clipboard.writeText(activeWallet.addresses[chain])
              }}
              className='flex justify-center mb-6'
            >
              <Buttons.CopyWalletAddress
                textOnCopied={'Copied wallet address'}
                walletAddress={sliceAddress(activeWallet.addresses[chain])}
                color={Colors.green600}
              />
            </div>

            {chainsWithSwapping.includes(activeChain) ? (
              <div className='flex flex-row justify-evenly mb-6'>
                <ClickableIcon
                  image={{ src: 'download', alt: 'Receive' }}
                  onClick={handleReceiveClick}
                />
                <ClickableIcon
                  image={{ src: 'file_upload', alt: 'Send' }}
                  onClick={handleSendClick}
                />
                <ClickableIcon image={{ src: 'swap_horiz', alt: 'Swap' }} />
              </div>
            ) : (
              <div className='flex justify-between mb-6 home-cta-btns'>
                <Buttons.Generic
                  size='sm'
                  disabled={false}
                  color={darkTheme ? undefined : Colors.white100}
                  onClick={handleReceiveClick}
                >
                  <div className={'flex justify-center text-black-100  items-center'}>
                    <span className='mr-2 material-icons-round'>download</span>
                    <span>Receive</span>
                  </div>
                </Buttons.Generic>
                <Buttons.Generic
                  size='sm'
                  disabled={false}
                  color={darkTheme ? undefined : Colors.white100}
                  onClick={handleSendClick}
                >
                  <div className={'flex justify-center text-black-100  items-center'}>
                    <span className='mr-2 material-icons-round'>file_upload</span>
                    <span>Send</span>
                  </div>
                </Buttons.Generic>
              </div>
            )}
          </div>

          <PortfolioDistribution
            walletBalance={walletBalance}
            stakeBalance={stakeBalance}
            rewardsBalance={rewardsBalance}
          />

          <div className='rounded-2xl dark:bg-gray-900 bg-white-100 mt-4 mx-7 all-assets'>
            <div className='flex justify-between'>
              <Text size='sm' color='dark:text-gray-200 text-gray-600 font-medium px-5 pt-4'>
                Available Tokens
              </Text>
              <div className='px-5 pt-4'>
                <div
                  className={
                    'flex justify-center text-xs text-gray-600 dark:text-gray-200 items-center cursor-pointer'
                  }
                  onClick={() => setBalancesHidden(!balancesHidden)}
                >
                  <span className='mr-2 text-sm material-icons-round'>
                    {balancesHidden ? 'visibility' : 'visibility_off'}
                  </span>
                  <span className='text-sm'>{balancesHidden ? 'Show' : 'Hide'}</span>
                </div>
              </div>
            </div>
            {activeWallet.assets[activeChain]?.map(
              (
                { symbol, amount, usdPrice, percentChange, img, ibcChainInfo, coinMinimalDenom },
                index,
                array,
              ) => {
                const usdValue = new BigNumber(amount).multipliedBy(usdPrice)
                const isLast = index === array.length - 1
                const subtitle2 = (
                  <div className='text-gray-600 dark:text-gray-200'>
                    <span className='text-[10px] text-gray-600 dark:text-gray-200 font-medium'>
                      {balancesHidden
                        ? '••••••••'
                        : formatCurrency(convertFromUsdToRegional(usdValue, preferredCurrency))}
                    </span>
                    {percentChange ? <span className='text-gray-400 mx-2'>|</span> : null}
                    {percentChange ? showOrHideBalances(balancesHidden, percentChange) : ''}
                  </div>
                )

                return (
                  <React.Fragment key={`${symbol}${index}`}>
                    <GenericCard
                      title={symbol}
                      title2={
                        <div className='text-md text-gray-600 dark:text-gray-200 font-medium'>
                          {balancesHidden ? '••••••••' : formatTokenAmount(amount, symbol, 3)}
                        </div>
                      }
                      subtitle={
                        ibcChainInfo ? (
                          <IBCTokenBadge
                            image={ibcChainInfo?.icon}
                            text={`${ibcChainInfo.pretty_name} / ${ibcChainInfo?.channelId}`}
                          />
                        ) : (
                          ''
                        )
                      }
                      subtitle2={subtitle2}
                      img={<img src={img} className='w-[28px] h-[28px] mr-2' />}
                      isRounded={isLast}
                      className='my-2'
                      icon={
                        <span className='material-icons-round text-gray-400'>
                          keyboard_arrow_right
                        </span>
                      }
                      onClick={() => {
                        navigate(`/asset-details?assetName=${coinMinimalDenom}`, {
                          state: {
                            symbol: symbol,
                            amount: amount,
                            usdValue: usdValue.toString(),
                            percentChange: percentChange,
                            img: img,
                            coinMinimalDenom: coinMinimalDenom,
                            ibcChainInfo: ibcChainInfo,
                          },
                        })
                      }}
                    />
                    {!isLast ? <CardDivider /> : null}
                  </React.Fragment>
                )
              },
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
      <ReceiveToken
        isVisible={showReceiveSheet}
        onCloseHandler={() => {
          setShowReceiveSheet(false)
        }}
      />
      <BottomNav label={BottomNavLabel.Home} disabled={false} />
    </div>
  )
}

export default HomePage
