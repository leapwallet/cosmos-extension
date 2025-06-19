import {
  getKeyToUseForDenoms,
  Token,
  useActiveStakingDenom,
  useChainInfo,
  useFeatureFlags,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import ClickableIcon from 'components/clickable-icons'
import { useHardCodedActions } from 'components/search-modal/useHardCodedActions'
import { PageName } from 'config/analytics'
import { EventName } from 'config/analytics'
import { useChainInfos } from 'hooks/useChainInfos'
import CardIcon from 'icons/card-icon'
import { DollarIcon } from 'icons/dollar-icon'
import { SendIcon } from 'icons/send-icon'
import { SwapIcon } from 'icons/swap-icon'
import { UploadIcon } from 'icons/upload-icon'
import mixpanel from 'mixpanel-browser'
import { StakeInputPageState } from 'pages/stake-v2/StakeInputPage'
import useAssets from 'pages/swaps-v2/hooks/useAssets'
import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { rootDenomsStore } from 'stores/denoms-store-instance'

export const AssetCtas = ({
  denomInfo,
  assetsId,
}: {
  denomInfo: NativeDenom
  assetsId?: string
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const activeChain = useActiveChain()
  const activeNetwork = useSelectedNetwork()
  const chain = useChainInfo(activeChain)
  const chainInfos = useChainInfos()

  const { data: featureFlags } = useFeatureFlags()
  const { handleSwapClick } = useHardCodedActions()
  const { data: addSkipAssets } = useAssets()

  const skipAssets = addSkipAssets?.[chainInfos?.[activeChain]?.chainId ?? '']

  const portfolio = useMemo(() => {
    const navigateAssetDetailsState = JSON.parse(
      sessionStorage.getItem('navigate-assetDetails-state') ?? 'null',
    )

    return (location?.state ?? navigateAssetDetailsState) as Token
  }, [location?.state])

  const skipSupportsToken = useMemo(() => {
    return (
      skipAssets &&
      skipAssets?.length > 0 &&
      !!skipAssets?.find((skipAsset) => {
        const assetToFind = []
        if (assetsId) {
          assetToFind.push(assetsId)
        }
        if (portfolio?.coinMinimalDenom) {
          assetToFind.push(portfolio?.coinMinimalDenom)
        }
        if (portfolio?.ibcDenom) {
          assetToFind.push(portfolio?.ibcDenom)
        }
        return (
          assetToFind.includes(skipAsset.denom.replace(/(cw20:|erc20\/)/g, '')) ||
          (!!skipAsset.evmTokenContract &&
            assetToFind.includes(skipAsset.evmTokenContract.replace(/(cw20:|erc20\/)/g, '')))
        )
      })
    )
  }, [assetsId, portfolio?.coinMinimalDenom, portfolio?.ibcDenom, skipAssets])

  const isSwapDisabled = !skipSupportsToken || featureFlags?.all_chains?.swap === 'disabled'

  const [activeStakingDenom] = useActiveStakingDenom(
    rootDenomsStore.allDenoms,
    denomInfo.chain as SupportedChain,
    activeNetwork,
  )

  const handleStakeClick = () => {
    navigate('/stake/input', {
      state: {
        mode: 'DELEGATE',
        forceChain: activeChain,
        forceNetwork: activeNetwork,
      } as StakeInputPageState,
    })
  }

  const isStakeDisabled = useMemo(() => {
    return activeStakingDenom?.coinMinimalDenom !== portfolio?.coinMinimalDenom
  }, [activeStakingDenom?.coinMinimalDenom, portfolio?.coinMinimalDenom])

  return (
    <div className='flex gap-6 p-4 justify-center w-full'>
      <ClickableIcon label='Buy' icon={CardIcon} onClick={() => navigate('/buy')} />
      <ClickableIcon
        label='Send'
        icon={SendIcon}
        onClick={() => {
          navigate(`/send?assetCoinDenom=${portfolio?.ibcDenom || denomInfo?.coinMinimalDenom}`, {
            state: location.state,
          })
        }}
      />
      <ClickableIcon
        label='Swap'
        icon={SwapIcon}
        onClick={() => {
          const denomKey = getKeyToUseForDenoms(
            denomInfo?.coinMinimalDenom ?? '',
            chainInfos[(denomInfo?.chain ?? '') as SupportedChain]?.chainId,
          )
          handleSwapClick(
            `https://swapfast.app/?destinationChainId=${chainInfos[activeChain].chainId}&destinationAsset=${denomInfo?.coinMinimalDenom}`,
            `/swap?destinationChainId=${chainInfos[activeChain].chainId}&destinationToken=${denomKey}&pageSource=assetDetails`,
          )
        }}
        disabled={isSwapDisabled}
      />
      {isStakeDisabled ? null : (
        <ClickableIcon
          label='Stake'
          icon={DollarIcon}
          onClick={handleStakeClick}
          disabled={isStakeDisabled}
        />
      )}
    </div>
  )
}
