import { StdFee } from '@cosmjs/stargate'
import { GasOptions, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice } from '@leapwallet/cosmos-wallet-sdk'
import { CaretDown, GasPump } from '@phosphor-icons/react'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import Text from 'components/text'
import { observer } from 'mobx-react-lite'
import { NftDetailsType } from 'pages/nfts-v2/context'
import React, { useEffect, useMemo, useState } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { isCompassWallet } from 'utils/isCompassWallet'

interface FeesViewProps {
  nftDetails: NftDetailsType
  fee: StdFee
}

export const FeesView: React.FC<FeesViewProps> = observer(({ nftDetails, fee }) => {
  const collectionAddress = useMemo(() => {
    return nftDetails?.collection.address ?? ''
  }, [nftDetails?.collection.address])
  const [displayFeeValue, setDisplayFeeValue] = useState<DisplayFeeValue | undefined>()
  const denoms = rootDenomsStore.allDenoms
  const defaultGasPrice = useDefaultGasPrice(denoms, {
    isSeiEvmTransaction: isCompassWallet() && collectionAddress.toLowerCase().startsWith('0x'),
  })

  const activeChainInfo = useChainInfo()

  const gasOption = GasOptions.LOW
  const userPreferredGasPrice = GasPrice.fromUserInput(
    String(fee.amount[0].amount),
    Object.keys(activeChainInfo.nativeDenoms)[0],
  )

  const [gasError, setGasError] = useState<string | null>(null)
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  })

  // initialize gasPriceOption with correct defaultGasPrice.gasPrice
  useEffect(() => {
    setGasPriceOption({
      option: gasOption,
      gasPrice: defaultGasPrice.gasPrice,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

  return (
    <div className='w-full'>
      <GasPriceOptions
        recommendedGasLimit={String(fee.gas)}
        gasLimit={String(fee.gas)}
        setGasLimit={() => {
          //
        }}
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={() => {
          //
        }}
        error={gasError}
        setError={setGasError}
        isSeiEvmTransaction={collectionAddress.toLowerCase().startsWith('0x')}
      >
        <DisplayFee setDisplayFeeValue={setDisplayFeeValue} className='hidden' />
        {displayFeeValue?.fiatValue && (
          <div className='w-full flex justify-between'>
            <Text color='text-muted-foreground' size='sm' className='font-medium'>
              Fees
            </Text>
            <div className='flex gap-x-1 items-center hover:cursor-pointer ml-auto'>
              <GasPump size={16} className='text-monochrome' />
              <span className='text-secondary-800 text-xs font-medium'>
                {displayFeeValue?.fiatValue}
              </span>
              {/* <CaretDown size={16} className='text-secondary-600' /> */}
            </div>
          </div>
        )}
        {gasError ? (
          <p className='text-red-300 text-sm font-medium mt-2 text-center'>{gasError}</p>
        ) : null}
      </GasPriceOptions>
    </div>
  )
})
