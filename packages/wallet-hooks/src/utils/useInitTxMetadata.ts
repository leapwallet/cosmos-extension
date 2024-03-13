import { useEffect } from 'react';

import { useTxMetadataStore } from '../store';

export function useInitTxMetadata(metadata: Record<string, any>) {
  const { setTxMetadata } = useTxMetadataStore();

  useEffect(() => {
    setTxMetadata({ ...metadata });
  }, []);
}
