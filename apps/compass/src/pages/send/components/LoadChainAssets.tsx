import { Token, useGetTokenSpendableBalances } from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'

export type LoadChainAssetsProps = {
  setAllAssets: React.Dispatch<React.SetStateAction<Token[]>>
  setIsAllAssetsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export function LoadChainAssets({ setAllAssets, setIsAllAssetsLoading }: LoadChainAssetsProps) {
  const { allAssets, nativeTokensStatus, s3IbcTokensStatus } = useGetTokenSpendableBalances()

  useEffect(() => {
    setAllAssets(allAssets)
    setIsAllAssetsLoading(
      [nativeTokensStatus, s3IbcTokensStatus].some((status) => status === 'loading'),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAssets, nativeTokensStatus, s3IbcTokensStatus])

  return null
}
