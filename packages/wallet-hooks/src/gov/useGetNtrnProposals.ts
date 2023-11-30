import { getNeutronProposals } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { useChainApis, useGetChains, useSpamProposals } from '../store';

export function useGetNtrnProposals() {
  const { rpcUrl } = useChainApis();
  const spamProposals = useSpamProposals();
  const chains = useGetChains();

  const filterSpamProposals = (proposal: any) => {
    if (spamProposals.neutron && spamProposals.neutron.includes(Number(proposal.id))) {
      return false;
    }

    return !['airdrop', 'air drop', 'a i r d r o p'].some((text) =>
      (proposal.proposal.title ?? '').toLowerCase().trim().includes(text),
    );
  };

  return useQuery(
    ['fetch-neutron-proposals', rpcUrl, chains],
    async function () {
      if (
        chains.neutron?.comingSoonFeatures?.includes('governance') ||
        chains.neutron?.notSupportedFeatures?.includes('governance')
      ) {
        return;
      }

      const proposals = await getNeutronProposals(rpcUrl ?? '');
      return proposals.filter((proposal: any) => filterSpamProposals(proposal));
    },
    { enabled: !!rpcUrl },
  );
}
