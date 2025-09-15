import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { useSendContext } from 'pages/send/context'
import { ibcDataStore } from 'stores/chains-api-store'

export const useChannelError = () => {
  const { customIbcChannelId, selectedAddress, sendActiveChain } = useSendContext()

  return useQuery({
    queryKey: ['channel-error', customIbcChannelId, selectedAddress?.chainName, sendActiveChain],
    queryFn: async () => {
      const ibcChannelId = ibcDataStore.getChannelIds(
        sendActiveChain,
        selectedAddress?.chainName as SupportedChain,
      )?.[0]
      const channelId = customIbcChannelId ?? ibcChannelId ?? ''
      if (!channelId) return
      const res = await ibcDataStore.validateIbcChannelId(
        channelId,
        sendActiveChain,
        selectedAddress?.chainName as SupportedChain,
      )
      if (!res.success) {
        return res.message
      }
    },
    enabled: !!selectedAddress?.address && !!sendActiveChain && !!selectedAddress?.chainName,
  })
}
