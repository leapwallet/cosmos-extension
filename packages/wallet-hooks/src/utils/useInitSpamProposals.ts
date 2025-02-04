import { initResourceFromS3 } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useSpamProposalsStore } from '../store';
import { useGetStorageLayer } from './global-vars';

const SPAM_PROPOSALS = 'spam-proposals';
const SPAM_PROPOSALS_LAST_UPDATED_AT = 'spam-proposals-last-updated-at';

const SPAM_PROPOSALS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/proposals/spam.json';
const SPAM_PROPOSALS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/proposals/spam-last-updated-at.json';

export function useInitSpamProposals() {
  const storage = useGetStorageLayer();
  const { setSpamProposals } = useSpamProposalsStore();

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource: setSpamProposals,
      resourceKey: SPAM_PROPOSALS,
      resourceURL: SPAM_PROPOSALS_URL,
      lastUpdatedAtKey: SPAM_PROPOSALS_LAST_UPDATED_AT,
      lastUpdatedAtURL: SPAM_PROPOSALS_LAST_UPDATED_AT_URL,
      defaultResourceData: {},
    });
  }, []);
}
