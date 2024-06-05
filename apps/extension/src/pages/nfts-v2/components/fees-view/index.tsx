import { StdFee } from '@cosmjs/stargate'
import { GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice } from '@leapwallet/cosmos-wallet-sdk'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { useChainInfos } from 'hooks/useChainInfos'
import { NftDetailsType } from 'pages/nfts-v2/context'
import React, { useEffect, useMemo, useState } from 'react'

interface FeesViewProps {
  nftDetails: NftDetailsType
  fee: StdFee
}

export const FeesView: React.FC<FeesViewProps> = ({
  nftDetails,
  fee,
}: {
  nftDetails: NftDetailsType
  fee: StdFee
}) => {
  const collectionAddress = useMemo(() => {
    return nftDetails?.collection.address ?? nftDetails?.collection.contractAddress ?? ''
  }, [nftDetails?.collection.address, nftDetails?.collection.contractAddress])

  const [showFeesSettingSheet] = useState(false)
  const defaultGasPrice = useDefaultGasPrice({
    isSeiEvmTransaction: collectionAddress.toLowerCase().startsWith('0x'),
  })

  const chainInfos = useChainInfos()
  const activeChainInfo = chainInfos[nftDetails?.chain ?? 'sei']

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
    <div>
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
        <DisplayFee />
        {gasError && !showFeesSettingSheet ? (
          <p className='text-red-300 text-sm font-medium mt-2 text-center'>{gasError}</p>
        ) : null}
      </GasPriceOptions>
    </div>
  )
}
