import { getEvmError } from '@leapwallet/cosmos-wallet-provider'
import {
  ETHEREUM_METHOD_TYPE,
  ETHEREUM_RPC_ERROR,
  WalletAddEthereumChainParams,
} from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { formatNewEvmChainInfo, NewEvmChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { NEW_CHAIN_REQUEST } from 'config/storage-keys'
import { isNotValidURL } from 'utils/regex'
import browser from 'webextension-polyfill'

import { awaitEnableChainResponse, Page } from '../utils'

export async function addLeapEthereumChain(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  evmChainIdMap: Record<
    string,
    {
      key: string
      isTestnet: boolean
    }
  >,
  evmCustomOpenPopup: (page: Page, queryString?: string) => Promise<void>,
) {
  const chainInfo: WalletAddEthereumChainParams = payload.params[0]
  const validChainInfo: NewEvmChainInfo = {
    chainId: Number(chainInfo.chainId),
    chainName: chainInfo.chainName,
    nativeCurrency: chainInfo.nativeCurrency,
    rpcUrl: '',
    blockExplorerUrl: '',
    iconUrl: '',
  }

  if (!chainInfo.chainId) {
    return {
      error: getEvmError(
        ETHEREUM_RPC_ERROR.INVALID_PARAMS,
        `ChainId is required'. Received: ${chainInfo.chainId}`,
      ),
    }
  } else if (evmChainIdMap[Number(chainInfo.chainId).toString()]) {
    return {
      error: getEvmError(
        ETHEREUM_RPC_ERROR.INVALID_PARAMS,
        `ChainId ${chainInfo.chainId} already exists.`,
      ),
    }
  }

  if (!chainInfo.nativeCurrency) {
    return {
      error: getEvmError(
        ETHEREUM_RPC_ERROR.INVALID_PARAMS,
        `Expected an object with 'name', 'symbol', and 'decimals'. Received: ${chainInfo.nativeCurrency}`,
      ),
    }
  }

  if (chainInfo.rpcUrls?.length > 0) {
    const validRpcUrls = chainInfo.rpcUrls.filter((rpcUrl: string) => {
      if (isNotValidURL(rpcUrl)) {
        return false
      }

      return true
    })

    if (validRpcUrls.length === 0) {
      return {
        error: getEvmError(
          ETHEREUM_RPC_ERROR.INVALID_PARAMS,
          `Expected an array with at least one valid string HTTPS URL 'rpcUrls'. Received: ${chainInfo.rpcUrls}`,
        ),
      }
    } else {
      validChainInfo.rpcUrl = validRpcUrls[0]
    }
  } else {
    return {
      error: getEvmError(
        ETHEREUM_RPC_ERROR.INVALID_PARAMS,
        `Expected an array with at least one valid string HTTPS URL 'rpcUrls'. Received: ${chainInfo.rpcUrls}`,
      ),
    }
  }

  if (chainInfo.blockExplorerUrls?.length ?? 0 > 0) {
    const validBlockExplorerUrls = chainInfo.blockExplorerUrls?.filter(
      (blockExplorerUrl: string) => {
        if (isNotValidURL(blockExplorerUrl)) {
          return false
        }

        return true
      },
    )

    if (validBlockExplorerUrls?.length === 0) {
      return {
        error: getEvmError(
          ETHEREUM_RPC_ERROR.INVALID_PARAMS,
          `Expected undefined or array with at least one valid string HTTPS URL 'blockExplorerUrl'. Received: ${chainInfo.blockExplorerUrls}`,
        ),
      }
    } else {
      validChainInfo.blockExplorerUrl = validBlockExplorerUrls?.[0]
    }
  }

  if (chainInfo.iconUrls?.length ?? 0 > 0) {
    const validIconUrls = chainInfo.iconUrls?.filter((iconUrl: string) => {
      if (isNotValidURL(iconUrl)) {
        return false
      }

      return true
    })

    if (validIconUrls?.length === 0) {
      return {
        error: getEvmError(
          ETHEREUM_RPC_ERROR.INVALID_PARAMS,
          `Expected undefined or array with at least one valid string HTTPS URL 'iconUrls'. Received: ${chainInfo.iconUrls}`,
        ),
      }
    } else {
      validChainInfo.iconUrl = validIconUrls?.[0]
    }
  }

  const newChainInfo = formatNewEvmChainInfo(validChainInfo)
  await browser.storage.local.set({
    [NEW_CHAIN_REQUEST]: {
      type: ETHEREUM_METHOD_TYPE.WALLET__ADD_ETHEREUM_CHAIN,
      msg: {
        chainInfo: newChainInfo,
        origin: payload.origin,
      },
    },
  })

  await evmCustomOpenPopup('suggest-ethereum-chain')

  try {
    await awaitEnableChainResponse()
    return { success: { chainId: chainInfo.chainId } }
  } catch (_) {
    return { error: getEvmError(ETHEREUM_RPC_ERROR.USER_REJECTED_REQUEST) }
  }
}
