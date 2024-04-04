import { NftAttribute, NftDetails } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import { ProposalDescription } from 'components/proposal-description'
import React from 'react'

export type NonFractionalizedNftDescriptionProps = {
  nftDetails: NftDetails
  color: string
}

export function NonFractionalizedNftDescription({
  nftDetails,
  color,
}: NonFractionalizedNftDescriptionProps) {
  return (
    <>
      <ProposalDescription
        title={`About ${nftDetails?.name ?? ''}`}
        description={
          nftDetails?.description ??
          nftDetails?.extension?.description ??
          `${nftDetails?.collection?.name ?? ''} - ${nftDetails?.name}`
        }
        btnColor={color}
        className='my-4'
      />

      {nftDetails?.attributes && nftDetails.attributes.length && (
        <>
          <CardDivider />
          <h3 className='w-100 font-bold text-left text-gray-400 text-sm mt-6 mb-2'>Features</h3>
          <div className='flex flex-wrap gap-[10px]'>
            {nftDetails.attributes.map((m: NftAttribute, index: number) => {
              if (!m.trait_type || !m.value) {
                return null
              }

              return (
                <div
                  key={index}
                  className='rounded-xl px-3 py-2 dark:bg-gray-900 bg-gray-100 mr-2 min-w-[80px]'
                >
                  <div className='text-gray-400 text-sm capitalize'>
                    {(m.trait_type ?? '').toLowerCase()}
                  </div>
                  <div className='text-gray-900 text-sm dark:text-white-100 font-bold'>
                    {m.value ?? ''}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
