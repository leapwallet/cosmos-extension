import { useEffect } from 'react'
import { ClientIdStore } from 'stores/client-id-store'

export function useInitClientId(store: ClientIdStore) {
  useEffect(() => {
    store.initClientId()
  }, [store])
}
