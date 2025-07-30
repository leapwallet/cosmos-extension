import { formatTokenAmount } from '@leapwallet/cosmos-wallet-store/dist/utils'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { PaymentMethod } from 'hooks/useGetOnramperDetails'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { cn } from 'utils/cn'

type Props = {
  isVisible: boolean
  onClose: () => void
  onPaymentSelect: (val: PaymentMethod) => void
  paymentMethods: PaymentMethod[]
  selectedPaymentMethod: PaymentMethod
}
const SelectPaymentSheet = observer(
  ({ isVisible, onClose, onPaymentSelect, paymentMethods, selectedPaymentMethod }: Props) => {
    const [formatCurrency] = useFormatCurrency()
    return (
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title='Pay using'
        fullScreen
        className='!px-6 !pb-7 !pt-8 bg-secondary-50'
      >
        <div className='flex flex-col gap-5 w-full'>
          {paymentMethods.map((item, index) => {
            return (
              <div
                key={item.paymentTypeId}
                className={cn(
                  'flex justify-between items-center w-full bg-secondary rounded-xl p-5 cursor-pointer',
                  {
                    'border border-monochrome':
                      item.paymentTypeId === selectedPaymentMethod.paymentTypeId,
                  },
                )}
                onClick={() => onPaymentSelect(item)}
              >
                <div className='flex gap-4 items-center'>
                  <img src={item.icon} className='w-10 h-10' />
                  <div className='flex flex-col items-start gap-0.5'>
                    <Text className='text-[18px] font-bold' color='text-monochrome'>
                      {item.name}
                    </Text>
                    {index === 0 && (
                      <Text size='xs' className='font-medium' color='text-green-500'>
                        Recommended
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </BottomModal>
    )
  },
)

export default SelectPaymentSheet
