import { formatTokenAmount } from '@leapwallet/cosmos-wallet-store/dist/utils'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { AssetProps } from 'hooks/swapped/useGetSupportedAssets'
import { PaymentMethod, Provider, ProviderQuote } from 'hooks/useGetOnramperDetails'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { cn } from 'utils/cn'

type Props = {
  isVisible: boolean
  onClose: () => void
  onProviderSelect: (val: ProviderQuote) => void
  providers: ProviderQuote[]
  selectedProvider: ProviderQuote
  asset?: AssetProps
}
const SelectProviderSheet = observer(
  ({ isVisible, onClose, onProviderSelect, providers, selectedProvider, asset }: Props) => {
    const [formatCurrency] = useFormatCurrency()
    return (
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        fullScreen
        title='Select provider'
        className='!px-6 !pb-7 !pt-8 bg-secondary-50'
      >
        <div className='flex flex-col gap-5 w-full'>
          {providers
            .sort((a, b) => (b.quote.payout ?? 0) - (a.quote.payout ?? 0))
            .map((item, index) => {
              return (
                <div
                  key={item.provider.id}
                  className={cn(
                    'flex justify-between items-center w-full bg-secondary rounded-xl p-5 cursor-pointer',
                    {
                      'border border-monochrome': item.provider.id === selectedProvider.provider.id,
                    },
                  )}
                  onClick={() => onProviderSelect(item)}
                >
                  <div className='flex gap-4 items-center'>
                    <img src={item.provider.icon} className='w-10 h-10' />
                    <div className='flex flex-col items-start gap-0.5'>
                      <Text className='text-[18px] font-bold' color='text-monochrome'>
                        {item.provider.displayName}
                      </Text>
                      {index === 0 && (
                        <Text size='xs' className='font-medium' color='text-green-500'>
                          Best Value
                        </Text>
                      )}
                    </div>
                  </div>
                  {item.quote.payout && item.quote.payout > 0 && asset ? (
                    <div className='flex flex-col items-end gap-0.5'>
                      <Text size='sm' className='font-bold' color='text-monochrome'>
                        {formatTokenAmount(item.quote.payout.toString(), asset.symbol, 6)}
                      </Text>
                      {/* <Text size='xs' className='font-medium' color='text-muted-foreground'>
                        {formatCurrency(new BigNumber(value.fiat ?? ''))}
                      </Text> */}
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

export default SelectProviderSheet
