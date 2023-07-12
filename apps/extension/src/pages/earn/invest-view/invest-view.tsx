import type { CategoryId, InvestData } from '@leapwallet/cosmos-wallet-hooks'
import BottomModal from 'components/bottom-modal'
import { TxFee } from 'images/activity'
import { HelpIcon } from 'images/misc'
import React, { useMemo, useState } from 'react'

import { DisplaySettings } from '../types'
import { InvestmentProductList } from './investment-product-list'

type InvestViewProps = {
  data: InvestData
  displaySettings: DisplaySettings
}

export const InvestView: React.FC<InvestViewProps> = ({ data, displaySettings }) => {
  const [showDescription, setShowDescription] = useState<CategoryId>()

  const { dappCategories, dapps: _dapps, products: _products, disclaimer } = data

  const dapps = useMemo(() => {
    return Object.values(_dapps)
  }, [_dapps])

  const products = useMemo(() => {
    return Object.values(_products)
  }, [_products])

  const visibleDappCategories = useMemo(() => {
    return Object.entries(dappCategories)
      .filter(([categoryId, categoryData]) => {
        // if category is disabled, don't show it
        if (!categoryData.visible) {
          return false
        }
        // if category is not disabled, but there are not products with the given category id, don't show it
        if (
          !products.some((product) => {
            const productBelongsToCategory = product.dappCategory === categoryId
            const productIsVisible = product.visible
            const productsDappIsVisible =
              dapps.find((dapp) => {
                return product.chain === dapp.chain && product.dappName === dapp.name
              })?.visible ?? false
            return productBelongsToCategory && productIsVisible && productsDappIsVisible
          })
        ) {
          return false
        }
        return true
      })
      .sort(([, a], [, b]) => {
        return a.position - b.position
      })
  }, [dappCategories, dapps, products])

  return (
    <>
      <div className='space-y-5'>
        {visibleDappCategories.map(([categoryId, categoryData], index) => {
          const isFirstOfList = index === 0

          return (
            <div key={categoryId}>
              {isFirstOfList ? (
                <div className='flex-[6] flex items-center pr-10 gap-2 my-3'>
                  <div className='flex w-[184px] items-center'>
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-400'>
                      {categoryData.label}
                    </h3>
                    <button
                      className='ml-2 opacity-40'
                      onClick={() => {
                        setShowDescription(categoryId)
                      }}
                    >
                      <img src={HelpIcon} alt='help' className='h-[14px] w-[14px]' />
                    </button>
                  </div>
                  <p className='flex-[1] flex-shrink-0 dark:text-[#858585] text-gray-400 font-bold text-sm text-center'>
                    TVL
                  </p>
                  <p className='flex-[1] flex-shrink-0 dark:text-[#858585] text-gray-400 font-bold text-sm text-center'>
                    APR
                  </p>
                </div>
              ) : (
                <div className='flex items-center'>
                  <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {categoryData.label}
                  </h3>
                  <button
                    className='ml-2 opacity-40'
                    onClick={() => {
                      setShowDescription(categoryId)
                    }}
                  >
                    <img src={HelpIcon} alt='help' className='h-[14px] w-[14px]' />
                  </button>
                </div>
              )}
              <InvestmentProductList
                dapps={dapps}
                products={products}
                categoryId={categoryId}
                sortBy={displaySettings.sortBy}
              />
            </div>
          )
        })}
      </div>
      <div className='mt-4'>
        <h4 className='text-gray-400 dark:text-gray-700 font-bold text-xs'>Disclaimer</h4>
        <p className='text-gray-400 dark:text-gray-700 text-[10px] mt-1'>{disclaimer}</p>
      </div>
      <BottomModal
        title='Earn Section Help'
        isOpen={!!showDescription}
        onClose={() => setShowDescription(undefined)}
        closeOnBackdropClick={true}
      >
        {showDescription ? (
          <div className='dark:bg-gray-900 bg-white-100 rounded-2xl flex flex-col justify-center p-4'>
            <img src={TxFee} alt='dollar icon' className='h-12 w-12 filter grayscale opacity-50' />
            <h2 className='text-gray-900 dark:text-white-100 font-bold mt-4'>
              What are {dappCategories[showDescription].label}?
            </h2>
            <p className='text-gray-500 dark:text-gray-400 text-sm mt-2'>
              {dappCategories[showDescription].description}
            </p>
          </div>
        ) : null}
      </BottomModal>
    </>
  )
}
