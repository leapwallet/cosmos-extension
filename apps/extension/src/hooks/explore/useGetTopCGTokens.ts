import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function useGetTopCGTokens() {
  return useQuery(
    ['explore-tokens'],
    async () => {
      const res = await axios.get(
        `${process.env.LEAP_WALLET_BACKEND_API_URL}/market/changes?currency=USD&ecosystem=cosmos-ecosystem`,
      )
      return res?.data
    },
    {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  )
}
