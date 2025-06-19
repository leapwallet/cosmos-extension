import { getKeyToUseForDenoms } from '@leapwallet/cosmos-wallet-hooks'
import { observer } from 'mobx-react-lite'
import React, { ReactNode, useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { TokenCard } from './TokenCard'

export const TokenCardWrapper = observer(
  ({
    tokensLength,
    index,
    token,
    selectedToken,
    selectedChain,
    onTokenSelect,
    verified,
    isChainAbstractionView,
    showChainNames,
  }: {
    index: number
    tokensLength: number
    selectedChain: SourceChain | undefined
    token: SourceToken
    verified: boolean
    onTokenSelect: (token: SourceToken) => void
    selectedToken: SourceToken | null
    isChainAbstractionView?: boolean
    showChainNames?: boolean
  }) => {
    const isLast = index === tokensLength - 1
    const isFirst = index === 0

    const isSelected = useMemo(() => {
      let _isSelected =
        getKeyToUseForDenoms(token.skipAsset.denom, token.skipAsset.originChainId) ===
        getKeyToUseForDenoms(
          selectedToken?.skipAsset?.denom ?? '',
          selectedToken?.skipAsset?.originChainId ?? '',
        )

      if (token.ibcDenom !== undefined && selectedToken?.ibcDenom !== undefined) {
        _isSelected = _isSelected && token.ibcDenom === selectedToken.ibcDenom
      }
      return _isSelected
    }, [selectedToken, token])

    return (
      <>
        <TokenCard
          onTokenSelect={onTokenSelect}
          token={token}
          isSelected={isSelected}
          verified={verified}
          selectedChain={selectedChain}
          showRedirection={false}
          isChainAbstractionView={isChainAbstractionView}
          showChainNames={showChainNames}
          isLast={isLast}
          isFirst={isFirst}
        />
      </>
    )
  },
)
