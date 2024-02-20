import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import classNames from 'classnames'
import currency from 'currency.js'
import React, { useState } from 'react'

import CardDivider from '~/components/card-divider'
import Text from '~/components/text'
import { Images } from '~/images'
import { formatTokenAmount, sliceWord } from '~/util/strings'

import CurrentValidatorCard from './current-validator-card'

function ValidatorCard({
  validator,
  activeChain,
  apys,
  onClick,
}: {
  validator: Validator
  activeChain: SupportedChain
  apys: Record<string, number>
  onClick: () => void
}) {
  const [showInfo, setShowInfo] = useState<boolean>(false)
  return (
    <>
      <div
        className={classNames(
          'flex justify-between h-[72px] items-center px-4 bg-white-100 dark:bg-gray-900 cursor-pointer',
        )}
      >
        <div onClick={onClick} className={classNames('flex w-[256px] items-center flex-grow')}>
          <img
            src={
              validator.image ??
              validator.keybase_image ??
              validator.mintscan_image ??
              Images.Misc.Validator
            }
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = Images.Misc.Validator
            }}
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
              validator.delegations?.total_tokens_display ?? validator.tokens,
              {
                symbol: '',
                precision: 0,
              },
            ).format()} | APY: ${currency(apys[validator.address] * 100, {
              precision: 2,
              symbol: '',
            }).format()}%`}</div>
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
              {formatTokenAmount(validator.tokens, ChainInfos[activeChain].denom, 2)}
            </Text>
          </div>
          <div className='flex flex-col grow'>
            <Text size='xs' color='dark:text-gray-400 text-gray-600'>
              Commission
            </Text>
            <Text size='xs' className='font-bold mt-1'>
              {`${currency(+validator.commission.commission_rates.rate * 100, {
                precision: 0,
                symbol: '',
              }).format()}%`}
            </Text>
          </div>
        </div>
      )}
    </>
  )
}

function Heading({ chainName }: { chainName: SupportedChain }) {
  return (
    <div className='flex flex-col pb-6'>
      <Text size='xxl' className='text-[28px] mb-1 font-black'>
        Choose a Validator
      </Text>
      <Text size='sm' color='dark:text-gray-400 text-gray-600' className='font-bold'>
        To delegate {'(stake)'} your {ChainInfos[chainName].denom} token, please select a validator
        from the list of active validators below:
      </Text>
    </div>
  )
}

function ValidatorList({
  validators,
  apys,
  activeChain,
  onShuffleClick,
  onSelectValidator,
}: {
  validators: Validator[]
  activeChain: SupportedChain
  apys: Record<string, number>
  onShuffleClick?: () => void
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
        <React.Fragment key={`validator${index}`}>
          {index !== 0 && <CardDivider />}
          <ValidatorCard
            onClick={() => onSelectValidator(v)}
            activeChain={activeChain}
            apys={apys}
            validator={v}
          />
        </React.Fragment>
      ))}
    </div>
  )
}

function ChooseValidatorView({
  validators,
  apys,
  activeChain,
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
  activeChain: SupportedChain
  searchfilter: string
  setSearchfilter: (s: string) => void
  apys: Record<string, number>
  onClickSortBy: () => void
  onShuffle: () => void
  setSelectedValidator: (v: Validator) => void
}) {
  return (
    <>
      {!(fromValidator && delegation) && <Heading chainName={activeChain} />}
      <div className='flex flex-col gap-y-4 mb-8'>
        {fromValidator && delegation && (
          <CurrentValidatorCard fromValidator={fromValidator} delegation={delegation} />
        )}
        {/* SearchBox */}
        <div className='flex justify-between items-center'>
          <div className='w-[288px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
            <input
              type={'text'}
              value={searchfilter}
              placeholder='search...'
              className='flex flex-grow font-medium text-base text-gray-600 dark:text-gray-400 outline-none bg-white-0'
              onChange={(e) => setSearchfilter(e.target?.value)}
            />
            {searchfilter.length > 0 ? (
              <span
                onClick={() => setSearchfilter('')}
                className='material-icons-round h-8 w-8 cursor-pointer text-center text-gray-400'
              >
                close
              </span>
            ) : (
              <img src={Images.Misc.SearchIcon} />
            )}
          </div>
          <div
            onClick={onClickSortBy}
            className='rounded-3xl h-10 w-10 cursor-pointer ml-3 justify-center items-center dark:bg-gray-900 bg-white-100'
          >
            <span className='material-icons-round  h-10 w-10 mt-2 text-center text-gray-400'>
              sort
            </span>
          </div>
        </div>

        <ValidatorList
          onSelectValidator={setSelectedValidator}
          activeChain={activeChain}
          validators={validators}
          apys={apys}
        />
      </div>
    </>
  )
}

export default ChooseValidatorView
