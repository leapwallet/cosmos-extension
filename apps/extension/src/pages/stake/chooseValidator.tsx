import {
  Token,
  useActiveStakingDenom,
  useChainInfo,
  useGetTokenBalances,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import { Card, CardDivider, GenericCard, Header, HeaderActionType } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import { SearchInput } from 'components/search-input'
import Text from 'components/text'
import currency from 'currency.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import SideNav from 'pages/home/side-nav'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { formatTokenAmount, sliceSearchWord, sliceWord } from 'utils/strings'

import InputStakeAmountView, { STAKE_MODE } from './InputStakeAmountView'

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
  // eslint-disable-next-line no-unused-vars
  setSortBy: (s: STAKE_SORT_BY) => void
  isVisible: boolean
  // eslint-disable-next-line no-unused-vars
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

export function CurrentValidatorCard({
  fromValidator,
  delegation,
}: {
  fromValidator?: Validator
  delegation?: Delegation
}) {
  const { data: keybaseImageUrl } = useValidatorImage(fromValidator)

  if (!fromValidator || !delegation) {
    return null
  }

  return (
    <div className='rounded-2xl dark:bg-gray-900 bg-white-100'>
      <GenericCard
        img={
          <img
            src={keybaseImageUrl ?? fromValidator.image ?? Images.Misc.Validator}
            onError={imgOnError(Images.Misc.Validator)}
            className={'rounded-full overflow-clip w-6 h-6'}
          />
        }
        isRounded
        title={
          <Text size='md' className='font-bold ml-3'>
            Current Validator
          </Text>
        }
        title2={
          <div className='text-right truncate w-[130px] py-2 text-ellipsis'>
            {fromValidator.moniker ?? fromValidator.name}
          </div>
        }
      />
      <CardDivider />
      <Text
        size='xs'
        className='mx-4 my-2'
        color='dark:text-gray-400 text-gray-600'
      >{`Staked: ${delegation.balance.formatted_amount}`}</Text>
    </div>
  )
}

function ValidatorCard({
  validator,
  apys,
  onClick,
}: {
  validator: Validator
  apys: Record<string, number>
  onClick: () => void
}) {
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const { data: keybaseImageUrl } = useValidatorImage(validator)
  const [activeStakingDenom] = useActiveStakingDenom()

  return (
    <>
      <div
        className={classNames(
          'flex justify-between h-[72px] items-center px-4 bg-white-100 dark:bg-gray-900 cursor-pointer',
        )}
      >
        <div onClick={onClick} className={classNames('flex w-[256px] items-center flex-grow')}>
          <img
            src={keybaseImageUrl ?? validator.image ?? Images.Misc.Validator}
            onError={imgOnError(Images.Misc.Validator)}
            className={'rounded-full mr-3 overflow-clip w-10 h-10'}
          />
          <div className={classNames('flex flex-col justify-center items-start')}>
            <div
              className={classNames(
                'text-base font-bold text-black-100 dark:text-white-100 text-left text-ellipsis overflow-hidden',
              )}
            >
              <Text size='md' className='font-bold'>
                {sliceWord(validator.moniker ?? validator.name, 15, 3)}
              </Text>
            </div>
            <div className={classNames('text-xs font-medium text-gray-400')}>{`Staked: ${currency(
              (validator.delegations?.total_tokens_display ?? validator.tokens) as string,
              {
                symbol: '',
                precision: 0,
              },
            ).format()} | APY: ${
              apys[validator.address]
                ? `${currency(apys[validator.address] * 100, {
                    precision: 2,
                    symbol: '',
                  }).format()}%`
                : 'N/A'
            }`}</div>
          </div>
          <div className='flex flex-grow' />
        </div>
        <div className={classNames('flex gap-x-2')}>
          <span
            onClick={() => setShowInfo(!showInfo)}
            className='material-icons-round w-6 text-gray-400'
          >
            info_outlined
          </span>
          <span onClick={onClick} className='material-icons-round w-6 text-gray-400'>
            keyboard_arrow_right
          </span>
        </div>
      </div>
      {showInfo && (
        <div className='flex rounded-lg flex-row justify-evenly mx-4 mb-4 p-4 dark:bg-gray-800 bg-gray-50'>
          <div className='flex flex-col grow'>
            <Text size='xs' color='dark:text-gray-400 text-gray-600'>
              Voting power
            </Text>
            <Text size='xs' className='font-bold mt-1'>
              {formatTokenAmount(validator.tokens as string, activeStakingDenom.coinDenom, 2)}
            </Text>
          </div>
          <div className='flex flex-col grow'>
            <Text size='xs' color='dark:text-gray-400 text-gray-600'>
              Commission
            </Text>
            <Text size='xs' className='font-bold mt-1'>
              {`${(+(validator.commission?.commission_rates.rate ?? '') * 100).toFixed(2)}%`}
            </Text>
          </div>
        </div>
      )}
    </>
  )
}

function ValidatorList({
  validators,
  apys,
  onShuffleClick,
  onSelectValidator,
}: {
  validators: Validator[]
  apys: Record<string, number>
  onShuffleClick?: () => void
  // eslint-disable-next-line no-unused-vars
  onSelectValidator: (v: Validator) => void
}) {
  if (!validators || validators.length === 0) return <></>

  return (
    <div className='pt-4 rounded-2xl overflow-clip dark:bg-gray-900 bg-white-100'>
      <div className='flex justify-between'>
        <Text size='xs' color='dark:text-gray-200 text-gray-600' className='font-bold py-1 px-4'>
          Validators
        </Text>
        {onShuffleClick && (
          <div className='px-4'>
            <div
              className={
                'flex justify-center text-xs text-gray-600 dark:text-gray-200 items-center cursor-pointer'
              }
              onClick={() => {
                onShuffleClick()
              }}
            >
              <span className='mr-1 text-lg material-icons-round'>shuffle</span>
              <span className='text-xs font-semibold'>Shuffle</span>
            </div>
          </div>
        )}
      </div>
      {validators.map((v, index) => (
        <React.Fragment key={`validator-${index}-${v.address}`}>
          {index !== 0 && <CardDivider />}
          <ValidatorCard onClick={() => onSelectValidator(v)} apys={apys} validator={v} />
        </React.Fragment>
      ))}
    </div>
  )
}

function Heading() {
  const [activeStakingDenom] = useActiveStakingDenom()

  return (
    <div className='flex flex-col pb-6'>
      <Text size='xxl' className='text-[28px] mb-1 font-black'>
        Choose a Validator
      </Text>
      <Text size='sm' color='dark:text-gray-400 text-gray-600' className='font-bold'>
        To delegate {'(stake)'} your {activeStakingDenom.coinDenom} token, please select a validator
        from the list of active validators below:
      </Text>
    </div>
  )
}

function ChooseValidatorView({
  validators,
  apys,
  searchfilter,
  fromValidator,
  delegation,
  onClickSortBy,
  setSearchfilter,
  setSelectedValidator,
}: {
  validators: Validator[]
  fromValidator?: Validator
  delegation?: Delegation
  searchfilter: string
  // eslint-disable-next-line no-unused-vars
  setSearchfilter: (s: string) => void
  apys: Record<string, number>
  onClickSortBy: () => void
  onShuffle: () => void
  // eslint-disable-next-line no-unused-vars
  setSelectedValidator: (v: Validator) => void
}) {
  return (
    <>
      {!(fromValidator && delegation) && <Heading />}
      <div className='flex flex-col gap-y-4 mb-8'>
        {fromValidator && delegation && (
          <CurrentValidatorCard fromValidator={fromValidator} delegation={delegation} />
        )}

        <div className='flex justify-between items-center'>
          <SearchInput
            divClassName='w-[288px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'
            placeholder='Search validators...'
            value={searchfilter}
            onChange={(e) => setSearchfilter(e.target?.value)}
            onClear={() => setSearchfilter('')}
          />

          <div
            onClick={onClickSortBy}
            className='rounded-3xl h-10 w-10 cursor-pointer ml-3 justify-center items-center dark:bg-gray-900 bg-white-100'
          >
            <span className='material-icons-round  h-10 w-10 mt-2 text-center text-gray-400'>
              sort
            </span>
          </div>
        </div>
        {validators?.length === 0 ? (
          <EmptyCard
            isRounded
            subHeading='Please try again with something else'
            heading={'No results for “' + sliceSearchWord(searchfilter) + '”'}
            src={Images.Misc.Explore}
          />
        ) : (
          <ValidatorList
            onSelectValidator={setSelectedValidator}
            validators={validators}
            apys={apys}
          />
        )}
      </div>
    </>
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

export default function ChooseValidator() {
  const state = useLocation().state
  const navigate = useNavigate()
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const { allAssets } = useGetTokenBalances()

  const activeChainInfo = chainInfos[activeChain]
  const [activeStakingDenom] = useActiveStakingDenom()

  const { validators, apy, mode, fromValidator, fromDelegation, unstakingPeriod } =
    state as ChooseValidatorProps

  const token = useMemo(() => {
    let _token = allAssets?.find((e) => e.symbol === activeStakingDenom.coinDenom)

    if (!_token) {
      const denom = Object.values(activeChainInfo.nativeDenoms)[0]

      _token = {
        amount: '0',
        symbol: denom.coinDenom,
        usdValue: '0',
        coinMinimalDenom: denom.coinMinimalDenom,
        img: activeChainInfo.chainSymbolImageUrl ?? '',
      }
    }

    return _token
  }, [
    activeChainInfo.chainSymbolImageUrl,
    activeChainInfo.nativeDenoms,
    activeStakingDenom.coinDenom,
    allAssets,
  ])

  const [showSideNav, setShowSideNav] = useState(false)
  const [sortBy, setSortBy] = useState<STAKE_SORT_BY>('Random')

  const defaultTokenLogo = useDefaultTokenLogo()
  const [showSortBy, setShowSortBy] = useState(false)
  const [searchfilter, setSearchfilter] = useState('')
  const [selectedValidator, setSelectedValidator] = useState<Validator>()

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
          v.moniker.toLowerCase().includes(searchfilter.toLowerCase()) ||
          v.address.includes(searchfilter)
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

  const chainInfo = useChainInfo()

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
            imgSrc={chainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            title={
              <>
                <Text size='lg' className='font-bold'>
                  {mode === 'REDELEGATE'
                    ? 'Switch Validator'
                    : `Stake ${activeStakingDenom.coinDenom}`}
                </Text>
              </>
            }
            topColor={Colors.getChainColor(activeChain)}
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
