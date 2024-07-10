import { CosmosSDK } from '@leapwallet/cosmos-wallet-sdk';

import { fetchProposalMetadataFromLink, getProposalContentFromMessages, proposalHasMetadataLink } from './index';

export async function formatProposal(version: CosmosSDK, proposal: any) {
  switch (version) {
    case CosmosSDK.Version_Point_46: {
      let content;

      try {
        if (proposalHasMetadataLink(proposal)) {
          content = await fetchProposalMetadataFromLink(proposal);
        } else {
          content = JSON.parse(proposal.metadata);
          content = {
            title: content?.title,
            description: content?.summary ?? content?.description,
          };
        }
      } catch (_) {
        content = {};
      }

      try {
        if (!content?.title && proposal.messages) {
          content = getProposalContentFromMessages(proposal, content);
        }
      } catch (_) {
        content = {};
      }

      return {
        proposal_id: proposal.id,
        content,
        status: proposal.status,
        final_tally_result: {
          yes: proposal.final_tally_result.yes_count,
          abstain: proposal.final_tally_result.abstain_count,
          no: proposal.final_tally_result.no_count,
          no_with_veto: proposal.final_tally_result.no_with_veto_count,
        },
        submit_time: proposal.submit_time,
        deposit_end_time: proposal.deposit_end_time,
        total_deposit: proposal.total_deposit,
        voting_start_time: proposal.voting_start_time,
        voting_end_time: proposal.voting_end_time,
      };
    }

    case CosmosSDK.Version_Point_47: {
      return {
        proposal_id: proposal.id,
        content: {
          '@type': proposal.messages['@type'],
          title: proposal.title,
          description: proposal.summary,
        },
        status: proposal.status,
        final_tally_result: {
          yes: proposal.final_tally_result.yes_count,
          abstain: proposal.final_tally_result.abstain_count,
          no: proposal.final_tally_result.no_count,
          no_with_veto: proposal.final_tally_result.no_with_veto_count,
        },
        submit_time: proposal.submit_time,
        deposit_end_time: proposal.deposit_end_time,
        total_deposit: proposal.total_deposit,
        voting_start_time: proposal.voting_start_time,
        voting_end_time: proposal.voting_end_time,
      };
    }
  }
}
