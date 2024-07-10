import {
  STAKE_MODE,
  Token,
  useActiveStakingDenom,
  useChainInfo,
  useGetTokenSpendableBalances,
} from '@leapwallet/cosmos-wallet-hooks'
import { Delegation, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { useChainPageInfo } from 'hooks'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HeaderActionType } from 'types/components'

import {
  ChooseValidatorView,
  InputStakeAmountView,
  SelectSortBy,
  STAKE_SORT_BY,
} from './components'

export type ChooseValidatorProps = {
  validators: Record<string, Validator>
  apy: Record<string, number>
  mode: STAKE_MODE
  fromValidator?: string
  unstakingPeriod: string
  fromDelegation?: Delegation
  activeChain: SupportedChain
  activeNetwork: SelectedNetwork
}

export default function ChooseValidator() {
  const navigate = useNavigate()
  const state = useLocation().state
  const {
    validators,
    apy,
    mode,
    fromValidator,
    fromDelegation,
    unstakingPeriod,
    activeChain,
    activeNetwork,
  } = state as ChooseValidatorProps

  const { headerChainImgSrc } = useChainPageInfo()
  const { allAssets } = useGetTokenSpendableBalances(activeChain, activeNetwork)
  const [activeStakingDenom] = useActiveStakingDenom(activeChain, activeNetwork)
  const activeChainInfo = useChainInfo(activeChain)

  const [showSideNav, setShowSideNav] = useState(false)
  const [sortBy, setSortBy] = useState<STAKE_SORT_BY>('Random')
  const [showSortBy, setShowSortBy] = useState(false)
  const [searchfilter, setSearchfilter] = useState('')
  const [selectedValidator, setSelectedValidator] = useState<Validator>()

  const token = useMemo(() => {
    let _token = allAssets?.find((e) => e.symbol === activeStakingDenom.coinDenom)

    if (!_token) {
      _token = {
        amount: '0',
        symbol: activeStakingDenom.coinDenom,
        usdValue: '0',
        coinMinimalDenom: activeStakingDenom.coinMinimalDenom,
        img: activeChainInfo.chainSymbolImageUrl ?? '',
      }
    }

    return _token
  }, [
    activeChainInfo.chainSymbolImageUrl,
    activeStakingDenom.coinDenom,
    activeStakingDenom.coinMinimalDenom,
    allAssets,
  ])

  useEffect(() => {
    if (validators === undefined) {
      navigate('/stake', { replace: true })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validators])

  const activeValidators = useMemo(
    () =>
      Object.values(validators ?? {}).filter(
        (v) =>
          (mode === 'REDELEGATE' ? v.address !== fromValidator : true) &&
          !v.jailed &&
          v.status === 'BOND_STATUS_BONDED',
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validators],
  )

  const filterValidators = useMemo(
    () => {
      return Object.values(activeValidators ?? {}).filter((v) => {
        return (
          v.moniker.toLowerCase().includes(searchfilter.toLowerCase()) || v.address === searchfilter
        )
      })
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchfilter, sortBy],
  )

  filterValidators.sort((a, b) => {
    switch (sortBy) {
      case 'Alphabetical':
        return (a?.moniker ?? a?.name ?? 'z').trim().toLowerCase() >
          (b?.moniker ?? a?.name ?? 'z').trim().toLowerCase()
          ? 1
          : -1
      case 'Amount staked':
        return +(a.tokens ?? '') < +(b.tokens ?? '') ? 1 : -1
      case 'Commission':
        return (a.commission?.commission_rates.rate ?? '') <
          (b.commission?.commission_rates.rate ?? '')
          ? 1
          : -1
      case 'APY':
        return apy[a.address] < apy[b.address] ? 1 : -1
      case 'Random':
        return 0
    }
  })

  const handleBackClick = useCallback(() => {
    if (selectedValidator) {
      setSelectedValidator(undefined)
    } else {
      navigate(-1)
    }
  }, [navigate, selectedValidator])

  return (
    <div className='relative w-[400px] overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <PageHeader
            title={
              <>
                <Text size='lg' className='font-bold'>
                  {mode === 'REDELEGATE'
                    ? 'Switch Validator'
                    : `Stake ${activeStakingDenom.coinDenom}`}
                </Text>
              </>
            }
            imgSrc={headerChainImgSrc}
            action={{
              onClick: handleBackClick,
              type: HeaderActionType.BACK,
            }}
          />
        }
      >
        <div className='flex flex-col p-7 overflow-scroll'>
          {!selectedValidator && validators && (
            <ChooseValidatorView
              validators={filterValidators}
              apys={apy}
              searchfilter={searchfilter}
              delegation={fromDelegation}
              fromValidator={validators[fromValidator as string]}
              onClickSortBy={() => setShowSortBy(true)}
              onShuffle={() => setSortBy('Random')}
              setSearchfilter={setSearchfilter}
              setSelectedValidator={setSelectedValidator}
              activeStakingCoinDenom={activeStakingDenom.coinDenom}
            />
          )}

          {selectedValidator && validators && (
            <InputStakeAmountView
              mode={mode}
              fromValidator={validators[fromValidator as string]}
              delegation={fromDelegation}
              toValidator={selectedValidator}
              unstakingPeriod={unstakingPeriod}
              activeChain={activeChain}
              token={token as Token}
              activeNetwork={activeNetwork}
            />
          )}
        </div>
      </PopupLayout>

      <SelectSortBy
        activeChain={activeChain}
        isVisible={showSortBy}
        setVisible={setShowSortBy}
        setSortBy={setSortBy}
        sortBy={sortBy}
      />
      <BottomNav label={BottomNavLabel.Stake} />
    </div>
  )
}
