import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import { Card, CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import BottomNav, { BottomNavLabel } from '~/components/bottom-nav'
import BottomSheet from '~/components/bottom-sheet'
import PopupLayout from '~/components/popup-layout'
import SideNav from '~/components/side-nav'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'
import { Images } from '~/images'
import { ChainLogos } from '~/images/logos'
import { tokensByChain } from '~/util/tokens'

import ChooseValidatorView from './widgets/choose-validator-view'
import InputStakeAmountView, { STAKE_MODE } from './widgets/input-stake-amount-view'

type STAKE_SORT_BY = 'Amount staked' | 'Commission' | 'Alphabetical' | 'APY' | 'Random'

function SelectSortBy({
  activeChain,
  sortBy,
  setSortBy,
  isVisible,
  setVisible,
}: {
  activeChain: SupportedChain
  sortBy: STAKE_SORT_BY
  setSortBy: (s: STAKE_SORT_BY) => void
  isVisible: boolean
  setVisible: (v: boolean) => void
}) {
  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => setVisible(false)}
      headerTitle={'Sort by'}
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='flex flex-col p-7 gap-y-1'>
        <div className='dark:bg-gray-900 overflow-clip bg-white-100 rounded-2xl'>
          {(['Amount staked', 'Alphabetical', 'APY'] as STAKE_SORT_BY[]).map((v, index) => (
            <React.Fragment key={v}>
              {index !== 0 && <CardDivider />}
              <Card
                iconSrc={
                  sortBy === (v as STAKE_SORT_BY) ? Images.Misc.ChainChecks[activeChain] : undefined
                }
                size='md'
                title={v}
                onClick={() => {
                  setVisible(false)
                  setSortBy(((v as STAKE_SORT_BY) === sortBy ? 'Random' : v) as STAKE_SORT_BY)
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}

export type ChooseValidatorProps = {
  validators: Record<string, Validator>
  apy: Record<string, number>
  mode: STAKE_MODE
  fromValidator?: string
  unstakingPeriod: string
  fromDelegation?: Delegation
}

export default function ChooseStakingValidator() {
  const state = useLocation().state
  const navigate = useNavigate()

  const { validators, apy, mode, fromValidator, fromDelegation, unstakingPeriod } =
    state as ChooseValidatorProps

  const activeChain = useActiveChain()
  const wallet = useActiveWallet()
  const token = wallet.assets[activeChain].find(
    (asset) => asset.symbol === tokensByChain[activeChain].symbol,
  )
  const [showSideNav, setShowSideNav] = useState(false)
  const [sortBy, setSortBy] = useState<STAKE_SORT_BY>('Random')
  const [showSortBy, setShowSortBy] = useState(false)
  const [searchfilter, setSearchfilter] = useState('')
  const [selectedValidator, setSelectedValidator] = useState<Validator>()

  const activeValidators = useMemo(
    () =>
      Object.values(validators ?? {}).filter((v) => !v.jailed && v.status === 'BOND_STATUS_BONDED'),
    [validators],
  )

  const filterValidators = useMemo(
    () =>
      Object.values(activeValidators ?? {}).filter(
        (v) =>
          v.moniker.toLowerCase().includes(searchfilter.toLowerCase()) ||
          v.address.includes(searchfilter),
      ),
    [searchfilter, activeValidators],
  )

  filterValidators.sort((a, b) => {
    switch (sortBy) {
      case 'Alphabetical':
        return (a?.moniker ?? a?.name ?? 'z').trim().toLowerCase() >
          (b?.moniker ?? a?.name ?? 'z').trim().toLowerCase()
          ? 1
          : -1
      case 'Amount staked':
        return +a.tokens < +b.tokens ? 1 : -1
      case 'Commission':
        return a.commission.commission_rates.rate < b.commission.commission_rates.rate ? 1 : -1
      case 'APY':
        return apy[a.address] < apy[b.address] ? 1 : -1
      case 'Random':
        return 0
    }
  })

  return (
    <div className='relative w-[400px] overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                if (selectedValidator) {
                  setSelectedValidator(undefined)
                } else navigate(-1)
              },
              type: HeaderActionType.BACK,
            }}
            imgSrc={ChainLogos[activeChain]}
            title={
              <>
                <Text size='lg' className='font-bold'>
                  `Stake ${ChainInfos[activeChain].denom}
                </Text>
              </>
            }
            topColor={ChainInfos[activeChain].theme.primaryColor}
          />
        }
      >
        <div className='flex flex-col p-7 overflow-scroll'>
          {!selectedValidator && (
            <ChooseValidatorView
              activeChain={activeChain}
              validators={filterValidators}
              apys={apy}
              searchfilter={searchfilter}
              delegation={fromDelegation}
              fromValidator={validators[fromValidator]}
              onClickSortBy={() => setShowSortBy(true)}
              onShuffle={() => setSortBy('Random')}
              setSearchfilter={setSearchfilter}
              setSelectedValidator={setSelectedValidator}
            />
          )}
          {selectedValidator && (
            <InputStakeAmountView
              onClickNewValidator={() => setSelectedValidator(undefined)}
              mode={mode}
              fromValidator={validators[fromValidator]}
              delegation={fromDelegation}
              toValidator={selectedValidator}
              unstakingPeriod={unstakingPeriod}
              activeChain={activeChain}
              token={token}
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
