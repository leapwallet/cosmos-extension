import { Aptos, APTOS_COIN, AptosConfig } from '@aptos-labs/ts-sdk'
import {
  axiosWrapper,
  ChainInfos,
  fetchSeiEvmBalances,
  getBaseURL,
  getRestUrl,
} from '@leapwallet/cosmos-wallet-sdk'
import { BitcoinBalanceStore } from '@leapwallet/cosmos-wallet-store'
import axios from 'axios'
import { BigNumber } from 'bignumber.js'

type CosmosBalance = {
  balances: {
    denom: string
    amount: string
  }[]
  pagination: {
    next_key: string | null
    total: string
  }
}

export const getCosmosBalance = async (address: string) => {
  try {
    const baseURL = getRestUrl(ChainInfos, 'cosmos', false)

    const result = await axiosWrapper<CosmosBalance>({
      method: 'GET',
      baseURL,
      url: `/cosmos/bank/v1beta1/balances/${address}`,
    })

    const ATOM_DECIMALS = 6
    const atomDetails = result.data.balances.find((balance) => balance.denom === 'uatom')
    if (!atomDetails || isNaN(+atomDetails.amount)) {
      return new BigNumber(0)
    }

    return new BigNumber(atomDetails.amount).div(10 ** ATOM_DECIMALS)
  } catch {
    return new BigNumber(0)
  }
}

export const getCelestiaBalance = async (address: string) => {
  try {
    const baseURL = getRestUrl(ChainInfos, 'celestia', false)

    const result = await axiosWrapper<CosmosBalance>({
      method: 'GET',
      baseURL,
      url: `/cosmos/bank/v1beta1/balances/${address}`,
    })

    const CEL_DECIMALS = 6
    const celDetails = result.data.balances.find((balance) => balance.denom === 'ucel')
    if (!celDetails || isNaN(+celDetails.amount)) {
      return new BigNumber(0)
    }

    return new BigNumber(celDetails.amount).div(10 ** CEL_DECIMALS)
  } catch {
    return new BigNumber(0)
  }
}

export const getBitcoinBalance = async (address: string) => {
  const rpcUrl = ChainInfos.bitcoin.apis.rpc
  if (!rpcUrl) {
    return new BigNumber(0)
  }

  try {
    const bitcoinBalanceStore = new BitcoinBalanceStore(rpcUrl, address, 'bitcoin')
    const balanceData = await bitcoinBalanceStore.getData()

    const BITCOIN_DECIMALS = 8
    const balanceString = balanceData?.balances?.[0]?.amount
    if (isNaN(+balanceString)) {
      return new BigNumber(0)
    }

    return new BigNumber(balanceString).div(10 ** BITCOIN_DECIMALS)
  } catch {
    return new BigNumber(0)
  }
}

export const getAptosBalance = async (address: string) => {
  try {
    const config = new AptosConfig({
      fullnode: ChainInfos.aptos.apis.rest,
    })

    const aptos = new Aptos(config)
    const balance = await aptos.getAccountCoinAmount({
      accountAddress: address,
      coinType: APTOS_COIN,
    })

    const APTOS_DECIMALS = 8
    if (isNaN(+balance)) {
      return new BigNumber(0)
    }

    return new BigNumber(balance).div(10 ** APTOS_DECIMALS)
  } catch {
    return new BigNumber(0)
  }
}

export const getMovementBalance = async (address: string) => {
  try {
    const config = new AptosConfig({
      fullnode: ChainInfos.movement.apis.rest,
    })

    const aptos = new Aptos(config)
    const balance = await aptos.getAccountCoinAmount({
      accountAddress: address,
      coinType: APTOS_COIN,
    })

    const APTOS_DECIMALS = 8
    if (isNaN(+balance)) {
      return new BigNumber(0)
    }

    return new BigNumber(balance).div(10 ** APTOS_DECIMALS)
  } catch {
    return new BigNumber(0)
  }
}

export const getEvmBalance = async (address: string) => {
  try {
    const evmJsonRpc = 'https://ethereum-rpc.publicnode.com'

    const balance = await fetchSeiEvmBalances(evmJsonRpc, address)
    if (isNaN(+balance.amount)) {
      return new BigNumber(0)
    }

    return new BigNumber(balance.amount)
  } catch {
    return new BigNumber(0)
  }
}

export const getSolanaBalanceFallback = async (address: string) => {
  try {
    const { data: allBalances } = await axios({
      url: `${getBaseURL()}/v1/balances/solana/native-balance`,
      method: 'POST',
      data: {
        address,
        selectedNetwork: 'mainnet',
        chain: 'solana',
      },
      timeout: 5_000,
    })

    const nativeSolMintAddress = '11111111111111111111111111111111'
    const solToken = allBalances?.[nativeSolMintAddress]

    if (!solToken?.amount || isNaN(+solToken.amount)) {
      return new BigNumber(0)
    }

    return new BigNumber(solToken.amount)
  } catch {
    return new BigNumber(0)
  }
}

export const getSolanaBalance = async (address: string) => {
  try {
    const { data: allBalances, status } = await axios({
      url: `https://go.getblock.io/e8924dbdeef24817a1b024dc6fe4c18b`,
      method: 'POST',
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address, null],
      },
      timeout: 5_000,
    })

    if (status !== 200) {
      throw new Error('Failed to get solana balance, trying fallback')
    }

    const nativeBalance = allBalances.result.value
    if (!nativeBalance || isNaN(+nativeBalance)) {
      return new BigNumber(0)
    }

    return new BigNumber(nativeBalance).div(10 ** 9)
  } catch {
    const fallbackBalance = await getSolanaBalanceFallback(address)
    return fallbackBalance
  }
}

export const getSuiBalance = async (address: string) => {
  try {
    const { data: allBalances } = await axios({
      url: `https://fullnode.mainnet.sui.io:443`,
      method: 'POST',
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getBalance',
        params: [address],
      },
      timeout: 5_000,
    })

    const SUI_DECIMALS = 9
    const balanceString = allBalances.result.totalBalance
    if (isNaN(+balanceString)) {
      return new BigNumber(0)
    }

    return new BigNumber(balanceString).div(10 ** SUI_DECIMALS)
  } catch {
    return new BigNumber(0)
  }
}
