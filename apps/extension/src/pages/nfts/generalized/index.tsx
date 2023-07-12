import {
  TokensListByCollection,
  useDisabledNFTsCollections,
  useGetAllNFTsList,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import React, { useMemo, useState } from 'react'

import NFTDetails from './details'
import NFTGallery from './gallery'
import { NFTDetailedInformation } from './types'

type GeneralizedNFTsViewProps = {
  forceChain?: SupportedChain
  forceContractsListChain?: SupportedChain
}

const GeneralizedNFTsView: React.FC<GeneralizedNFTsViewProps> = ({
  forceChain,
  forceContractsListChain,
}) => {
  const [NFTDetailsProp, setNFTDetailsProp] = useState<NFTDetailedInformation>()
  const disabledNFTsCollections = useDisabledNFTsCollections()

  const { isLoading, data, error } = useGetAllNFTsList({
    forceChain,
    forceContractsListChain,
  }) ?? { isLoading: false }

  const totalNFTs: number | undefined = useMemo(
    () =>
      data
        ?.filter((nft) => !disabledNFTsCollections.includes(nft.collection.address))
        .reduce((acc, cur) => acc + cur.tokens.length, 0),
    [data, disabledNFTsCollections],
  )

  const nfts = useMemo(
    () => data?.filter((nft) => !disabledNFTsCollections.includes(nft.collection.address)),
    [data, disabledNFTsCollections],
  )

  return (
    <>
      {NFTDetailsProp === undefined ? (
        <NFTGallery
          isLoading={isLoading}
          data={data as TokensListByCollection[]}
          nfts={nfts as TokensListByCollection[]}
          error={error}
          totalNFTs={totalNFTs}
          setNFTDetailsProp={setNFTDetailsProp}
          forceChain={forceChain}
        />
      ) : (
        <NFTDetails info={NFTDetailsProp} setNFTDetailsProp={setNFTDetailsProp} />
      )}
    </>
  )
}

export default GeneralizedNFTsView
