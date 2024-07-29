import {
  useActiveStakingDenom,
  useLiquidStakingProviders,
  useStaking,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import { Buttons, HeaderActionType, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { WalletButton } from 'components/button'
import { EmptyCard } from 'components/empty-card'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import { AmountCardSkeleton } from 'components/Skeletons/StakeSkeleton'
import Text from 'components/text'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { walletLabels } from 'config/constants'
import { decodeChainIdToChain } from 'extension-scripts/utils'
import { useChainPageInfo } from 'hooks'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import useQuery from 'hooks/useQuery'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import SelectWallet from 'pages/home/SelectWallet'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { isCompassWallet } from 'utils/isCompassWallet'

import ClaimInfo from './components/ClaimInfo'
import NotStakedCard from './components/NotStakedCard'
import ReviewClaimAndStakeTx from './components/ReviewClaimAndStakeTx'
import ReviewClaimTx from './components/ReviewClaimTx'
import SelectLSProvider from './components/SelectLSProvider'
import StakeAmountCard from './components/StakeAmountCard'
import StakeHeading from './components/StakeHeading'
import TabList from './components/TabList'
import { StakeInputPageState } from './StakeInputPage'

export default function StakePage() {
  const { headerChainImgSrc } = useChainPageInfo()
  const dontShowSelectChain = useDontShowSelectChain()
  const walletAddresses = useGetWalletAddresses()
  const setActiveChain = useSetActiveChain()

  const query = useQuery()
  const paramValidatorAddress = query.get('validatorAddress') ?? undefined
  const paramChainId = query.get('chainId') ?? undefined
  const paramAction = query.get('action') ?? undefined

  const navigate = useNavigate()
  const { activeWallet } = useActiveWallet()
  const {
    network,
    rewards,
    delegations,
    loadingDelegations,
    loadingNetwork,
    loadingRewards,
    loadingUnboundingDelegations,
  } = useStaking()

  const isLoadingAll = useMemo(() => {
    return loadingDelegations || loadingNetwork || loadingRewards || loadingUnboundingDelegations
  }, [loadingDelegations, loadingNetwork, loadingRewards, loadingUnboundingDelegations])

  const [activeStakingDenom] = useActiveStakingDenom()
  const { theme } = useTheme()

  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [showSideNav, setShowSideNav] = useState(false)
  const [showReviewClaimTx, setShowReviewClaimTx] = useState(false)
  const [showReviewClaimAndStakeTx, setShowReviewClaimAndStakeTx] = useState(false)
  const [showClaimInfo, setShowClaimInfo] = useState(false)
  const [showSelectLSProvider, setShowSelectLSProvider] = useState(false)
  const [isWalletAddressCopied, setIsWalletAddressCopied] = useState(false)

  const { isLoading: isLSProvidersLoading, data: lsProviders } = useLiquidStakingProviders()

  const handleOpenSelectChainSheet = useCallback(() => setShowChainSelector(true), [])
  const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])
  const handleCopyClick = useCallback(() => {
    setIsWalletAddressCopied(true)
    setTimeout(() => setIsWalletAddressCopied(false), 2000)

    UserClipboard.copyText(walletAddresses?.[0])
  }, [walletAddresses])

  const tokenLSProviders = useMemo(() => {
    const _sortedTokenProviders = lsProviders[activeStakingDenom.coinDenom]?.sort((a, b) => {
      const priorityA = a.priority
      const priorityB = b.priority

      if (priorityA !== undefined && priorityB !== undefined) {
        return priorityA - priorityB
      } else if (priorityA !== undefined) {
        return -1
      } else if (priorityB !== undefined) {
        return 1
      } else {
        return 0
      }
    })
    return _sortedTokenProviders
  }, [activeStakingDenom.coinDenom, lsProviders])

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar
    }

    if (isCompassWallet()) {
      return Images.Logos.CompassCircle
    }

    return Images.Logos.LeapLogo28
  }, [activeWallet?.avatar])

  const chainRewards = useMemo(() => {
    const rewardMap: Record<string, any> = {}

    rewards?.rewards?.forEach((rewardObj: any) => {
      const validatorAddress = rewardObj.validator_address

      if (!rewardMap[validatorAddress]) {
        rewardMap[validatorAddress] = {
          validator_address: validatorAddress,
          reward: [],
        }
      }
      const accumulatedAmounts: any = {}
      rewardObj.reward.forEach((reward: any) => {
        const { denom, amount, tokenInfo } = reward
        const numAmount = parseFloat(amount)

        if (accumulatedAmounts[denom]) {
          accumulatedAmounts[denom] += numAmount * Math.pow(10, tokenInfo?.coinDecimals ?? 6)
        } else {
          accumulatedAmounts[denom] = numAmount * Math.pow(10, tokenInfo?.coinDecimals ?? 6)
        }
      })
      rewardMap[validatorAddress].reward.push(
        ...Object.keys(accumulatedAmounts).map((denom) => ({
          denom,
          amount: accumulatedAmounts[denom],
        })),
      )
    })

    const totalRewards = rewards?.total.find(
      (reward) => reward.denom === activeStakingDenom.coinMinimalDenom,
    )

    const rewardsStatus = ''
    const usdValueStatus = ''
    return {
      rewardsUsdValue: new BigNumber(totalRewards?.currenyAmount ?? '0'),
      rewardsStatus,
      usdValueStatus,
      denom: totalRewards?.denom,
      rewardsDenomValue: new BigNumber(totalRewards?.amount ?? '0'),
      rewards: {
        rewardMap,
      },
    }
  }, [activeStakingDenom, rewards])

  useEffect(() => {
    async function updateChain() {
      if (paramChainId) {
        const chainIdToChain = await decodeChainIdToChain()
        const chain = chainIdToChain[paramChainId] as SupportedChain
        setActiveChain(chain)
      }
    }
    updateChain()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramChainId])

  const redirectToInputPage = useCallback(() => {
    const validators = network?.getValidators() as Record<string, Validator>
    navigate('/stakeInput', {
      state: {
        mode: 'DELEGATE',
        toValidator: paramValidatorAddress ? validators[paramValidatorAddress] : undefined,
      } as StakeInputPageState,
      replace: true,
    })
  }, [navigate, network, paramValidatorAddress])

  useEffect(() => {
    switch (paramAction) {
      case 'CLAIM_REWARDS':
        setShowReviewClaimTx(true)
        break
      case 'OPEN_LIQUID_STAKING':
        setShowSelectLSProvider(true)
        break
      case 'DELEGATE':
        redirectToInputPage()
        break
      default:
        break
    }
  }, [paramAction, redirectToInputPage])

  const handleCloseLSProviderSheet = useCallback(() => {
    setShowSelectLSProvider(false)
  }, [])

  const walletName = useMemo(() => {
    if (!activeWallet) {
      return '-'
    }
    return activeWallet.walletType === WALLETTYPE.LEDGER &&
      !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(activeWallet.name)
      ? `${walletLabels[activeWallet.walletType]} Wallet ${activeWallet.addressIndex + 1}`
      : formatWalletName(activeWallet.name)
  }, [activeWallet])

  if (!activeWallet) {
    return (
      <div className='relative w-full overflow-clip'>
        <PopupLayout>
          <div>
            <EmptyCard src={Images.Logos.LeapCosmos} heading='No wallet found' />
          </div>
        </PopupLayout>
      </div>
    )
  }

  return (
    <div className='relative w-full overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <PageHeader
            action={{
              onClick: () => setShowSideNav(true),
              type: HeaderActionType.NAVIGATION,
              className: 'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
            }}
            imgSrc={headerChainImgSrc}
            onImgClick={dontShowSelectChain ? undefined : handleOpenSelectChainSheet}
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
          />
        }
      >
        <div className='flex flex-col gap-y-6 p-6 mb-10 overflow-scroll'>
          <StakeHeading />
          {isLoadingAll && <AmountCardSkeleton />}
          {!isLoadingAll &&
            (Object.values(delegations ?? {}).length > 0 ? (
              <StakeAmountCard
                onClaim={() => setShowReviewClaimTx(true)}
                onClaimAndStake={() => setShowClaimInfo(true)}
              />
            ) : (
              <NotStakedCard />
            ))}
          <div className='flex gap-x-4 w-full'>
            {isLSProvidersLoading && <Skeleton width={352} borderRadius={100} height={50} />}
            {!isLSProvidersLoading && (
              <>
                {tokenLSProviders?.length > 0 && (
                  <Buttons.Generic
                    size='normal'
                    className='w-full'
                    color={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray200}
                    disabled={isLSProvidersLoading}
                    onClick={() => setShowSelectLSProvider(true)}
                  >
                    <Text color='dark:text-white-100 text-black-100'>Liquid Stake</Text>
                  </Buttons.Generic>
                )}
                <Buttons.Generic
                  size='normal'
                  className='w-full'
                  color={Colors.green600}
                  onClick={async () => {
                    navigate('/stakeInput', {
                      state: {
                        mode: 'DELEGATE',
                      } as StakeInputPageState,
                    })
                  }}
                >
                  Stake
                </Buttons.Generic>
              </>
            )}
          </div>
          <TabList />
        </div>
      </PopupLayout>
      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => setShowSelectWallet(false)}
        title='Wallets'
      />
      {!loadingNetwork && (
        <>
          <ReviewClaimTx
            isOpen={showReviewClaimTx}
            onClose={() => setShowReviewClaimTx(false)}
            validators={network?.getValidators({}) as Record<string, Validator>}
          />
          <ClaimInfo
            isOpen={showClaimInfo}
            onClose={() => setShowClaimInfo(false)}
            onClaim={() => {
              setShowClaimInfo(false)
              setShowReviewClaimTx(true)
            }}
            onClaimAndStake={() => {
              setShowClaimInfo(false)
              setShowReviewClaimAndStakeTx(true)
            }}
          />
          {chainRewards && (
            <ReviewClaimAndStakeTx
              isOpen={showReviewClaimAndStakeTx}
              onClose={() => setShowReviewClaimAndStakeTx(false)}
              validators={network?.getValidators({}) as Record<string, Validator>}
              chainRewards={chainRewards}
            />
          )}
        </>
      )}
      {tokenLSProviders && (
        <SelectLSProvider
          isVisible={showSelectLSProvider}
          onClose={handleCloseLSProviderSheet}
          providers={tokenLSProviders}
        />
      )}
      <BottomNav label={BottomNavLabel.Stake} />
    </div>
  )
}
