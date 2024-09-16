import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

export default function useQuery(): URLSearchParams {
  const location = useLocation()
  return useMemo(() => {
    return new URLSearchParams(location.search)
  }, [location])
}
