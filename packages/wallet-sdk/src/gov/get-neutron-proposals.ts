import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export const NTRN_GOV_CONTRACT_ADDRESS = 'neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh';

async function queryContract(rpcURL: string, queryMsg: string) {
  const client = await SigningCosmWasmClient.connect(rpcURL);
  const queryResult = await client.queryContractSmart(NTRN_GOV_CONTRACT_ADDRESS, JSON.parse(queryMsg));
  return queryResult;
}

export async function getNeutronProposals(rpcURL: string) {
  const queryMsg = JSON.stringify({
    reverse_proposals: {},
  });

  const { proposals } = await queryContract(rpcURL, queryMsg);
  return proposals;
}
export async function getNeutronProposalVote(rpcURL: string, proposalId: number, voter: string) {
  const queryMsg = JSON.stringify({
    get_vote: { proposal_id: proposalId, voter },
  });

  const { vote } = await queryContract(rpcURL, queryMsg);
  return vote;
}
