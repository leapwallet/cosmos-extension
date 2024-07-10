import { CosmosSDK, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { AggregatedGovernance, useChainApis, useChainCosmosSDK, useSpamProposals } from '../store';
import { getPlatformType, getProposalsFromApi, getProposalsFromNodes } from '../utils';
import { useChainInfo, useIsFeatureExistForChain } from './index';

const NETWORK = 'mainnet';
const PAGINATION_LIMIT = 30;

export function useFillAggregatedGovernance(
  chain: SupportedChain,
  setAggregatedGovernance: (aggregatedGovernance: AggregatedGovernance) => void,
) {
  const chainInfo = useChainInfo(chain);
  const spamProposals = useSpamProposals();
  const { lcdUrl } = useChainApis(chain, NETWORK);
  const chainCosmosSDK = useChainCosmosSDK(chain);

  const isGovernanceComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'governance',
    platform: getPlatformType(),
    forceChain: chain,
    forceNetwork: NETWORK,
  });

  const isGovernanceNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'governance',
    platform: getPlatformType(),
    forceChain: chain,
    forceNetwork: NETWORK,
  });

  useQuery(
    [
      `query-fill-${chain}-aggregated-governance`,
      isGovernanceComingSoon,
      isGovernanceNotSupported,
      spamProposals,
      chain,
      chainInfo,
      lcdUrl,
      chainCosmosSDK,
    ],
    async function () {
      if (isGovernanceComingSoon || isGovernanceNotSupported) {
        return;
      }

      async function fetchProposals(paginationKey?: number | string) {
        try {
          if (typeof paginationKey !== 'string') {
            const { proposals, key } = await getProposalsFromApi(
              PAGINATION_LIMIT,
              paginationKey,
              [],
              chainInfo.chainId,
              spamProposals[chain],
            );

            if (proposals?.length === 0) {
              throw new Error(`No proposals found for ${chain} in in-house governance API`);
            }

            setAggregatedGovernance({
              perChainGovernance: {
                [chain]: proposals,
              },
              votingProposals: [],
              nonVotingProposals: [],
              perChainShouldUseFallback: {
                [chain]: false,
              },
            });
            key && (await fetchProposals(key));
          }
        } catch (_) {
          if (typeof paginationKey !== 'number') {
            try {
              const { proposals, key } = await getProposalsFromNodes(
                PAGINATION_LIMIT,
                paginationKey,
                [],
                lcdUrl ?? '',
                spamProposals[chain],
                chainCosmosSDK as CosmosSDK,
              );

              setAggregatedGovernance({
                perChainGovernance: {
                  [chain]: proposals,
                },
                votingProposals: [],
                nonVotingProposals: [],
                perChainShouldUseFallback: {
                  [chain]: true,
                },
              });
              key && (await fetchProposals(key));
            } catch (_) {
              return;
            }
          }
        }

        return;
      }

      await fetchProposals();
    },
  );
}
