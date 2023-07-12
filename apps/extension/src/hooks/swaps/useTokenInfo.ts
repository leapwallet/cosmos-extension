/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from 'react'
import { TokenInfo, TokenList } from 'types/swap'

import { useTokenList } from './useTokenList'

/* token selector functions */
export const getBaseTokenFromTokenList = (tokenList: {
  base_token: any
  tokens?: TokenInfo[]
  tokensBySymbol?: Map<string, TokenInfo>
}): TokenInfo | undefined => tokenList?.base_token

export const getTokenInfoFromTokenList = (
  tokenSymbol: string,
  tokensList: Array<TokenInfo>,
): TokenInfo | undefined => tokensList?.find((x) => x.symbol === tokenSymbol)
/* /token selector functions */

/* returns a selector for getting multiple tokens info at once */
export const useGetMultipleTokenInfo = () => {
  const [tokenList] = useTokenList()
  return useCallback(
    (tokenSymbols: Array<string>) =>
      tokenSymbols?.map((tokenSymbol) =>
        getTokenInfoFromTokenList(tokenSymbol, tokenList?.tokens as TokenInfo[]),
      ),
    [tokenList],
  )
}

/* hook for token info retrieval based on multiple `tokenSymbol` */
export const useMultipleTokenInfo = (tokenSymbols: Array<string>) => {
  const getMultipleTokenInfo = useGetMultipleTokenInfo()
  return useMemo(() => getMultipleTokenInfo(tokenSymbols), [tokenSymbols, getMultipleTokenInfo])
}

/* hook for token info retrieval based on `tokenSymbol` */
export const useTokenInfo = (tokenSymbol: string) => {
  return useMultipleTokenInfo(useMemo(() => [tokenSymbol], [tokenSymbol]))?.[0]
}

/* hook for base token info retrieval */
export const useBaseTokenInfo = () => {
  const [tokenList] = useTokenList()
  return useMemo(() => getBaseTokenFromTokenList(tokenList as TokenList), [tokenList])
}
