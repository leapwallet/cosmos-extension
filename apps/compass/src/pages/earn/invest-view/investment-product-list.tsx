import type { CategoryId, DappData, ProductData } from '@leapwallet/cosmos-wallet-hooks'
import React, { useMemo } from 'react'

import { infoField } from '../types'
import { InvestmentProductItem } from './investment-product-item'

type InvestmentProductListProps = {
  dapps: DappData[]
  products: ProductData[]
  categoryId: CategoryId
  sortBy: infoField
}

export const InvestmentProductList: React.FC<InvestmentProductListProps> = ({
  products,
  dapps,
  categoryId,
  sortBy,
}) => {
  const categoryProducts = useMemo(() => {
    return products
      .filter((product) => {
        const productBelongsToCategory = product.dappCategory === categoryId
        const productIsVisible = product.visible
        const productsDappIsVisible =
          dapps.find((dapp) => {
            return product.chain === dapp.chain && product.dappName === dapp.name
          })?.visible ?? false
        return productBelongsToCategory && productIsVisible && productsDappIsVisible
      })
      .sort((a, b) => {
        return Number(b[sortBy]) - Number(a[sortBy])
      })
  }, [categoryId, dapps, products, sortBy])

  return (
    <ul className='mt-3 rounded-2xl overflow-hidden list-none dark:bg-[#212121] bg-white-100 py-[2px]'>
      {categoryProducts.map((product) => {
        const productDapp = dapps.find((dapp) => {
          return product.chain === dapp.chain && product.dappName === dapp.name
        })
        if (!productDapp) {
          return null
        }
        return (
          <InvestmentProductItem
            key={`${product.chain}_${product.dappName}_${product.productName}`}
            product={product}
            productDapp={productDapp}
          />
        )
      })}
    </ul>
  )
}
