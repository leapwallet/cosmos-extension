import {
  sliceWord,
  useIsCancleUnstakeSupported,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { UnbondingDelegation, UnbondingDelegationEntry } from '@leapwallet/cosmos-wallet-sdk'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import BigNumber from 'bignumber.js'
import { ValidatorListItemSkeleton } from 'components/Skeletons/ValidatorListSkeleton'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { Images } from 'images'
import React, { useState } from 'react'
import { imgOnError } from 'utils/imgOnError'
import { timeLeft } from 'utils/timeLeft'

import UnstakedValidatorDetails from './UnstakedValidatorDetails'

export default function PendingUnstakeList() {
  const { isCancleUnstakeSupported } = useIsCancleUnstakeSupported()
  const { unboundingDelegationsInfo, network, loadingUnboundingDelegations } = useStaking()
  const isLoading = loadingUnboundingDelegations
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()
  const [showUnstakeValidatorDetails, setShowUnstakeValidatorDetails] = useState(false)
  const [selectedUnbondingDelegation, setSelectedUnbondingDelegation] = useState<
    UnbondingDelegation | undefined
  >()
  const [selectedDelegationEntry, setSelectedDelegationEntry] = useState<
    UnbondingDelegationEntry | undefined
  >()
  const validators = network?.getValidators({}) as Record<string, Validator>

  if (!isLoading && (Object.values(unboundingDelegationsInfo ?? {}).length === 0 || !validators)) {
    return <></>
  }

  return (
    <>
      {isLoading && <ValidatorListItemSkeleton />}
      {!isLoading && validators && unboundingDelegationsInfo && (
        <div className='flex flex-col w-full gap-y-2'>
          <div className='flex justify-between'>
            <Text size='xs' color='text-gray-700 dark:text-gray-400'>
              Validator
            </Text>
            <Text size='xs' color='text-gray-700 dark:text-gray-400'>
              Amount Staked
            </Text>
          </div>
          {Object.values(unboundingDelegationsInfo ?? {}).map((uds) => {
            const validator = validators[uds?.validator_address]
            return uds.entries.map((ud, idx) => {
              const timeLeftText = timeLeft(ud.completion_time)
              const Component = () => {
                const { data: imageUrl } = useValidatorImage(validator)
                return (
                  <div
                    onClick={() => {
                      if (isCancleUnstakeSupported) {
                        setShowUnstakeValidatorDetails(true)
                        setSelectedUnbondingDelegation(uds)
                        setSelectedDelegationEntry(ud)
                      }
                    }}
                    className={`flex justify-between items-center px-4 py-3 bg-white-100 dark:bg-gray-950 cursor-pointer rounded-xl ${
                      isCancleUnstakeSupported && 'cursor-pointer'
                    }`}
                  >
                    <div className='flex items-center w-full'>
                      <img
                        src={imageUrl ?? validator?.image ?? Images.Misc.Validator}
                        onError={imgOnError(Images.Misc.Validator)}
                        width={28}
                        height={28}
                        className='mr-4 rounded-full'
                      />
                      <div className='flex justify-between items-center w-full'>
                        <div className='flex flex-col'>
                          <Text
                            size='sm'
                            color='text-black-100 dark:text-white-100'
                            className='font-bold  overflow-hidden'
                          >
                            {sliceWord(validator.moniker, 10, 3)}
                          </Text>
                          <Text
                            size='xs'
                            color='dark:text-gray-400 text-gray-600'
                            className='font-medium'
                          >
                            {timeLeftText}
                          </Text>
                        </div>
                        <div className='flex flex-col items-end'>
                          <Text
                            size='sm'
                            color='text-black-100 dark:text-white-100'
                            className='font-bold'
                          >
                            {formatCurrency(new BigNumber(ud.currencyBalance ?? ''))}
                          </Text>
                          <Text
                            size='xs'
                            color='dark:text-gray-400 text-gray-600'
                            className='font-medium'
                          >
                            {formatHideBalance(ud.formattedBalance ?? '')}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              return <Component key={`${validator.address} ${idx}`} />
            })
          })}
        </div>
      )}
      {selectedUnbondingDelegation && selectedDelegationEntry && validators && (
        <UnstakedValidatorDetails
          isOpen={showUnstakeValidatorDetails}
          onClose={() => setShowUnstakeValidatorDetails(false)}
          unbondingDelegation={selectedUnbondingDelegation}
          unbondingDelegationEntry={selectedDelegationEntry}
          validator={validators[selectedUnbondingDelegation.validator_address]}
        />
      )}
    </>
  )
}
