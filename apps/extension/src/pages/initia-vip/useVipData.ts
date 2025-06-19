import { useIsMinitia, useSelectedNetwork } from '@leapwallet/cosmos-wallet-hooks'
import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
const INITIA_VIP_API = 'https://vip-api.initia.xyz'

type VotingResponse = {
  current_cycle: number
  cycle_start_time: string
  cycle_end_time: string
  voting_end_time: string
  total_voting_power: number
  voting_powers: {
    bridge_id: number
    voting_power: number
  }[]
}

type ProfileResponse = {
  name: string
  pretty_name: string
  l2: boolean
  logo: string
  social: {
    website: string
    twitter: string
  }
}[]

type VestingResponse = {
  bridge_id: number
  total_claimable_reward: number
  data: {
    user_score: number
  }[]
}

type ChainsResponse = {
  chain_id: string
  chain_name: string
  pretty_name: string
  metadata: {
    op_bridge_id?: string
  }
}[]

type RollupInfo = {
  chainId: string
  name: string
  prettyName: string
  bridgeId: string
  logo: string
  website: string
  claimableReward: number
  lastUpdatedScore: number
  votePercent: number
}

function formatTimeDifference(targetTimeISO: string): string {
  const now = new Date()
  const target = new Date(targetTimeISO)

  let diffMs = target.getTime() - now.getTime()

  if (diffMs < 0) diffMs = 0

  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(days)}d:${pad(hours)}h:${pad(minutes)}m`
}

export const useVipData = () => {
  const { activeWallet } = useActiveWallet()
  const activeChain = useActiveChain()
  const selectedNetwork = useSelectedNetwork()
  const isMinitia = useIsMinitia(activeChain, selectedNetwork)
  const address = activeWallet?.addresses.initiaEvm

  const queryResult = useQuery({
    queryKey: ['vip-data', address],
    refetchOnWindowFocus: false,
    initialData: {
      rollupList: [],
      totalClaimableReward: -1,
      votingEndsIn: '',
    },
    enabled: !!address && isMinitia,
    cacheTime: 1000 * 60 * 5,
    queryFn: async (): Promise<{
      rollupList: RollupInfo[]
      totalClaimableReward: number
      votingEndsIn: string
    }> => {
      try {
        const votePromise = axiosWrapper<VotingResponse>({
          url: `${INITIA_VIP_API}/weight_vote/status`,
        })
        const chainsPromise = axiosWrapper<ChainsResponse>({
          url: 'https://registry.initia.xyz/chains.json',
        })
        const profilesPromise = axiosWrapper<ProfileResponse>({
          url: 'https://registry.initia.xyz/profiles.json',
        })
        const [voteResult, chainsResult, profilesResult] = await Promise.allSettled([
          votePromise,
          chainsPromise,
          profilesPromise,
        ])
        const voteData = voteResult.status === 'fulfilled' ? voteResult.value?.data : null
        const chainsData = chainsResult.status === 'fulfilled' ? chainsResult.value?.data : null
        const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value?.data : null

        if (!voteData || !chainsData || !profiles) {
          throw new Error('Failed to fetch data')
        }

        const rollups = chainsData
          .filter((chain) => !!chain.metadata?.op_bridge_id)
          .map((chain) => {
            return {
              chainId: chain.chain_id,
              name: chain.chain_name,
              bridgeId: chain.metadata.op_bridge_id as string,
              prettyName: chain.pretty_name,
            }
          })

        const rollupList: RollupInfo[] = []
        const vestingPromises = rollups.map(async (rollup) => {
          const profile = profiles.find((item) => item.name === rollup.name)
          if (!profile) return null
          const voting = voteData.voting_powers.find((item) => item.bridge_id === +rollup.bridgeId)
          const { data: vestingData } = await axiosWrapper<VestingResponse>({
            baseURL: INITIA_VIP_API,
            url: `/vesting/positions/${address}/${rollup.bridgeId}/1`,
          })

          return {
            chainId: rollup.chainId,
            logo: profile?.logo,
            website: profile?.social?.website,
            bridgeId: rollup.bridgeId,
            name: rollup.name,
            prettyName: rollup.prettyName,
            claimableReward: vestingData.total_claimable_reward / 10 ** 6,
            lastUpdatedScore: vestingData.data[vestingData.data.length - 1]?.user_score ?? 0,
            votePercent: (voting?.voting_power ?? 0) / voteData?.total_voting_power,
          } as RollupInfo
        })
        const results = await Promise.allSettled(vestingPromises)
        results.forEach((item) => {
          if (item.status === 'fulfilled' && item.value !== null) {
            rollupList.push(item.value)
          }
        })
        rollupList.sort((a, b) => b.votePercent - a.votePercent)
        return {
          rollupList,
          totalClaimableReward: rollupList.reduce((acc, item) => acc + item.claimableReward, 0),
          votingEndsIn: voteData?.voting_end_time
            ? formatTimeDifference(voteData.voting_end_time)
            : '',
        }
      } catch (error) {
        return { rollupList: [], totalClaimableReward: 0, votingEndsIn: '' }
      }
    },
  })
  return {
    ...queryResult,
    isLoading: queryResult.isLoading || queryResult.data.totalClaimableReward < 0,
  }
}
