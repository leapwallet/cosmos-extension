import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export const useTxCallBack = () => {
  const navigate = useNavigate()
  return useMemo(() => {
    return (status: 'success' | 'txDeclined') => {
      if (status === 'success') {
        navigate('/activity', { state: { fromTx: true } })
      } else {
        navigate('/home?txDeclined=true')
      }
    }
  }, [navigate])
}
