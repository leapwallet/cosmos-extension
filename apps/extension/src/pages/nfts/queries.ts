/* eslint-disable @typescript-eslint/no-explicit-any */
import { fromSmall } from '@leapwallet/cosmos-wallet-sdk/dist/utils/token-converter'
import { useQuery } from '@tanstack/react-query'
import { useChainInfos } from 'hooks/useChainInfos'

import { NFTObjectProps } from './index'

export function useGetNFTDetails({ metadataUri }: { metadataUri: string }) {
  return useQuery(['nft-details', metadataUri], async () => {
    try {
      const response = await fetch(metadataUri)
      const data = await response.json()
      return data
    } catch (e: any) {
      throw new Error(e)
    }
  })
}

export function useGetNFTGallerydata({
  metadataUri,
  favList,
}: {
  metadataUri: string
  favList: string[]
}) {
  return useQuery(['nft-metadata', metadataUri], async () => {
    try {
      const res = await fetch(metadataUri)
      const nftData = await res.json()
      const temp1 = [...nftData]
      const temp2 = temp1.map((t) => {
        return {
          name: t.collection.name,
          contractAddr: t.collection.contractAddress,
          items: [] as any[],
        }
      })
      const collectionData = [
        ...new Map(temp2.map((item) => [item['contractAddr'], item])).values(),
      ]
      collectionData.forEach((c) => {
        c.items = temp1.filter((t) => {
          if (t.collection.contractAddress === c.contractAddr) return t
        })
      })
      const favData = temp1.filter((t: NFTObjectProps) => {
        return favList.indexOf(t.tokenUri) > -1
      })
      return { nftData, collectionData, favData }
    } catch (e: any) {
      throw new Error(e)
    }
  })
}

export function useGetCollectionFloorPrice({ collectionAddr }: { collectionAddr: string }) {
  const chainInfos = useChainInfos()
  return useQuery(['collection-floor-price', collectionAddr], async () => {
    try {
      const stargazeMarketPlaceContract =
        'stars1fvhcnyddukcqfnt7nlwv3thm5we22lyxyxylr9h77cvgkcn43xfsvgv0pl'
      const query = Buffer.from(
        JSON.stringify({ asks_sorted_by_price: { collection: collectionAddr } }),
      ).toString('base64')
      const res = await fetch(
        `${chainInfos.stargaze.apis.rest}cosmwasm/wasm/v1/contract/${stargazeMarketPlaceContract}/smart/${query}`,
      )
      const collectionData = await res.json()
      const floorPrice = fromSmall(collectionData.data.asks[0].price, 6)
      return floorPrice
    } catch (e: any) {
      throw new Error(e)
    }
  })
}
