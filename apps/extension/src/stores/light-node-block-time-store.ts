import { getFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk'
import { BaseQueryStore } from '@leapwallet/cosmos-wallet-store/dist/base/base-data-store'
import { makeObservable } from 'mobx'
import { getStorageAdapter } from 'utils/storageAdapter'

type Proposer = {
  id: number
  cons_address: string
  moniker: string
}

type BlockStats = {
  tx_count: number
  events_count: number
  blobs_size: number
  blobs_count: number
  fee: string
  supply_change: string
  inflation_rate: string
  fill_rate: string
  rewards: string
  commissions: string
  block_time: number
  gas_limit: number
  gas_used: number
  bytes_in_block: number
  square_size: number
}

type BlockData = {
  id: number
  height: number
  time: string
  version_block: string
  version_app: string
  hash: string
  parent_hash: string
  last_commit_hash: string
  data_hash: string
  validators_hash: string
  next_validators_hash: string
  consensus_hash: string
  app_hash: string
  last_results_hash: string
  evidence_hash: string
  proposer: Proposer
  message_types: string[]
  stats: BlockStats
}

export class LightNodeBlockTimeStore extends BaseQueryStore<BlockData[]> {
  data: BlockData[] = []
  defaultBlockTime = 1

  constructor() {
    super()
    makeObservable(this)

    this.initDefaultBlockTime()
  }

  get averageBlockTime() {
    if (!this.data?.length) {
      return this.defaultBlockTime
    }

    const blockTimes = this.data.map((block) => block.stats.block_time)
    const blockTimeInMilliseconds = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length
    return Math.ceil(blockTimeInMilliseconds / 1000)
  }

  async fetchData() {
    const res = await axiosWrapper<BlockData[]>({
      baseURL: 'https://api.celenium.io/v1/block?stats=true&sort=desc&limit=3',
      method: 'get',
    })

    return res.data
  }

  private async initDefaultBlockTime() {
    const storageAdapter = getStorageAdapter()
    const featureFlags = await getFeatureFlags(storageAdapter, false)

    this.defaultBlockTime = featureFlags?.light_node.default_block_time_in_seconds ?? 6
  }
}
