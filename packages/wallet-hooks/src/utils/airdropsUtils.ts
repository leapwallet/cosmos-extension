import axios from 'axios';

async function queryCollection(addresses: string[], airdropIds: number[]) {
  try {
    const res = await axios.post(
      'https://us-central1-leap-393508.cloudfunctions.net/airdropsV2',
      {
        addresses,
        airdropIds,
      },
      { timeout: 10000 },
    );
    return res?.data?.data;
  } catch (error) {
    console.error(error);
  }
}

function getNoneEligibleAirdrops(allAirdropIds: number[], airdropIdsPresent: string[]) {
  const notEligibleAirdropInfo: Record<number, any> = {};
  allAirdropIds.map((airdropId) => {
    if (!airdropIdsPresent.includes(String(airdropId))) {
      notEligibleAirdropInfo[airdropId] = {
        success: true,
        airdrop_id: airdropId,
        data: [],
        error: null,
      };
    }
  });
  return notEligibleAirdropInfo;
}

function formatQueryResults(queryResults: unknown[], airdropIds: number[]) {
  let formattedResults: Record<string, any> = queryResults.reduce((acc: Record<string, any>, result: any) => {
    if (result.success === false) {
      acc[result.airdrop_id] = result;
    } else {
      if (!Object.prototype.hasOwnProperty.call(acc, result.airdrop_id)) {
        acc[result.airdrop_id] = result;
      } else {
        acc[result.airdrop_id].data = [...(acc[result.airdrop_id].data ?? []), ...(result.data ?? [])];
      }
    }
    return acc;
  }, {});
  const airdropIdsPresent = Object.keys(formattedResults);
  formattedResults = {
    ...formattedResults,
    ...getNoneEligibleAirdrops(airdropIds, airdropIdsPresent),
  };
  return formattedResults;
}

async function queryAddresses(addresses: string[], airdropIds: number[]) {
  const queryResults = await queryCollection(addresses, airdropIds);
  if (!queryResults || queryResults?.length === 0) {
    return {};
  }
  const formattedResults: Record<string, any> = formatQueryResults(queryResults, airdropIds);
  return formattedResults;
}

export { queryAddresses };
