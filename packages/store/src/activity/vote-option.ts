import { CosmosGovVoteOption } from '@leapwallet/parser-parfait';

export const convertVoteOptionToString = (voteOption: CosmosGovVoteOption | null): string => {
  switch (voteOption) {
    case CosmosGovVoteOption.YES:
      return 'Yes';
    case CosmosGovVoteOption.ABSTAIN:
      return 'Abstain';
    case CosmosGovVoteOption.NO:
      return 'No';
    case CosmosGovVoteOption.NO_WITH_VETO:
      return 'No with Veto';
    case CosmosGovVoteOption.UNSPECIFIED:
      return 'Unspecified';
    default:
      return 'Unspecified';
  }
};
