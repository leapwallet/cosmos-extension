import type { DappData, ProductData } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { RightArrow } from 'images/misc'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

type InvestmentProductItemProps = {
  product: ProductData
  productDapp: DappData
}

export const InvestmentProductItem: React.FC<InvestmentProductItemProps> = ({
  product,
  productDapp,
}) => {
  const defaultLogo = useDefaultTokenLogo()

  return (
    <li className='!m-0 px-4 group/item'>
      <a
        className='flex justify-start items-center py-3 gap-2 border-b border-b-gray-100 dark:border-b-gray-800 group-last-of-type/item:border-b-0'
        target='_blank'
        rel='noopener noreferrer'
        href={product.productWebsite}
      >
        <div
          className='flex items-center flex-[6] flex-grow-0 gap-2'
          title={`${product.dappName}: ${product.productName}`}
        >
          <img
            src={productDapp.logo}
            onError={imgOnError(defaultLogo)}
            className='h-8 w-8'
            title={productDapp.name}
          />
          <p className='text-gray-900 dark:text-white-100 font-bold text-xs leading-3 w-[160px] whitespace-normal'>
            {product.productName}
          </p>
        </div>
        <p className='flex-[1] text-center font-bold text-orange-300 text-xs'>
          {Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
          }).format(product.tvl)}
        </p>
        <p
          className={`flex-[1] text-center font-bold text-xs ${
            product.apr > 0 ? 'text-green-500' : 'text-red-300'
          }`}
        >
          {new BigNumber(product.apr * 100).toFixed(2)}%
        </p>
        <img src={RightArrow} alt='right arrow' className='ml-2 justify-self-end opacity-50' />
      </a>
    </li>
  )
}
