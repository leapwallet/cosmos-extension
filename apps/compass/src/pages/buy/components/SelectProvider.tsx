import { formatTokenAmount } from '@leapwallet/cosmos-wallet-store/dist/utils'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { AssetProps } from 'hooks/kado/useGetSupportedAssets'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { cn } from 'utils/cn'

import { ProviderDetails, ProviderQuote, ServiceProviderEnum } from '..'

type Props = {
  isVisible: boolean
  onClose: () => void
  onProviderSelect: (val: ServiceProviderEnum) => void
  providersQuote: ProviderQuote
  asset?: AssetProps
}
const SelectProvider = observer(
  ({ isVisible, onClose, onProviderSelect, providersQuote, asset }: Props) => {
    const [formatCurrency] = useFormatCurrency()
    return (
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title='Select provider'
        className='!px-6 !pb-7 !pt-8 bg-secondary-50'
      >
        <div className='flex flex-col gap-5 w-full'>
          {Object.entries(providersQuote)
            .sort(([k1, v1], [k2, v2]) =>
              parseFloat(v1.crypto ?? '0') > parseFloat(v2.crypto ?? '0') ? -1 : 1,
            )
            .map(([key, value], index) => {
              return (
                <div
                  key={key}
                  className={cn(
                    'flex justify-between items-center w-full bg-secondary rounded-xl p-5 cursor-pointer',
                    { 'border border-monochrome': index === 0 },
                  )}
                  onClick={() => onProviderSelect(key as ServiceProviderEnum)}
                >
                  <div className='flex gap-4 items-center'>
                    <img
                      src={ProviderDetails[key as ServiceProviderEnum].image}
                      className='w-10 h-10'
                    />
                    <div className='flex flex-col items-start gap-0.5'>
                      <Text className='text-[18px] font-bold' color='text-monochrome'>
                        {ProviderDetails[key as ServiceProviderEnum].name}
                      </Text>
                      {index === 0 && (
                        <Text size='xs' className='font-medium' color='text-green-500'>
                          Best Value
                        </Text>
                      )}
                    </div>
                  </div>
                  {asset && value.crypto ? (
                    <div className='flex flex-col items-end gap-0.5'>
                      <Text size='sm' className='font-bold' color='text-monochrome'>
                        {formatTokenAmount(value.crypto, asset.symbol)}
                      </Text>
                      <Text size='xs' className='font-medium' color='text-muted-foreground'>
                        {formatCurrency(new BigNumber(value.fiat ?? ''))}
                      </Text>
                    </div>
                  ) : null}
                </div>
              )
            })}
        </div>
      </BottomModal>
    )
  },
)

export default SelectProvider
