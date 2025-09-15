import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { fromBase64, toHex } from '@cosmjs/encoding';
import BigNumber from 'bignumber.js';
import { QuerySmartContractStateRequest, QuerySmartContractStateResponse } from 'cosmjs-types/cosmwasm/wasm/v1/query';

import { axiosWrapper } from '../healthy-nodes';

/**
 * Fetch CW20 balances using CosmWasmClient, this is the fallback method if the protobuf batch query fails.
 * Here we send a separate query for each token to the RPC.
 * @param rpcUrl
 * @param address
 * @param cw20Tokens
 * @returns Array of { denom: string, amount: BigNumber }
 */
export async function fetchCW20BalancesFallback(rpcUrl: string, address: string, cw20Tokens: Array<string>) {
  const client = await CosmWasmClient.connect(rpcUrl);
  const promises = cw20Tokens.map(async (tokenAddress) => {
    const balance = await client.queryContractSmart(tokenAddress, { balance: { address } });
    return { denom: tokenAddress, amount: new BigNumber(balance.balance) };
  });
  const balances = await Promise.allSettled(promises);

  const fulfilledBalances = balances.reduce(
    (fulfilledBalances: Array<{ denom: string; amount: BigNumber }>, currentBalance) => {
      if (currentBalance.status === 'fulfilled') {
        return [...fulfilledBalances, { ...currentBalance.value }];
      }

      return fulfilledBalances;
    },
    [],
  );

  return fulfilledBalances;
}

/**
 * Fetch CW20 balances using RPC with protobuf encoding to combine multiple queries into a single request.
 * Here we send a single query to the RPC for all tokens.
 * @param rpcUrl
 * @param address
 * @param cw20Tokens
 * @returns Object with successful balances and failed token addresses
 */
export async function fetchCW20BalancesRPCProtobuf(
  rpcUrl: string,
  address: string,
  cw20Tokens: Array<string>,
): Promise<{ balances: Array<{ denom: string; amount: BigNumber }>; failedTokens: Array<string> }> {
  // Create batch requests with proper protobuf encoding
  const batchRequests = cw20Tokens.map((tokenAddress, index) => {
    const queryMsg = { balance: { address } };
    const queryData = Buffer.from(JSON.stringify(queryMsg));

    // Create protobuf request
    const protoRequest = QuerySmartContractStateRequest.fromPartial({
      address: tokenAddress,
      queryData: queryData,
    });

    // Encode as protobuf bytes
    const encodedRequest = QuerySmartContractStateRequest.encode(protoRequest).finish();

    return {
      jsonrpc: '2.0',
      id: index,
      method: 'abci_query',
      params: {
        path: '/cosmwasm.wasm.v1.Query/SmartContractState',
        data: toHex(encodedRequest), // Proper hex encoding
        prove: false,
      },
    };
  });

  console.log('Sending protobuf batch request...');

  // Send batch request
  const response = await axiosWrapper({
    baseURL: rpcUrl,
    url: '',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    data: JSON.stringify(batchRequests),
  });

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const results = response.data;

  // Process results and track failed tokens
  const balances: Array<{ denom: string; amount: BigNumber }> = [];
  const failedTokens: Array<string> = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const tokenAddress = cw20Tokens[i];

    try {
      if (result.error) {
        console.error(`RPC error for ${tokenAddress}:`, result.error);
        failedTokens.push(tokenAddress);
        continue;
      }

      const abciResponse = result.result.response;

      if (abciResponse.code !== 0) {
        console.error(`Query failed for ${tokenAddress} (code: ${abciResponse.code}):`, abciResponse.log);
        failedTokens.push(tokenAddress);
        continue;
      }

      if (!abciResponse.value) {
        console.error(`No value returned for ${tokenAddress}`);
        failedTokens.push(tokenAddress);
        continue;
      }

      // Decode base64 ABCI response value
      const responseBytes = fromBase64(abciResponse.value);

      // Decode protobuf response
      const protoResponse = QuerySmartContractStateResponse.decode(responseBytes);

      // Parse the actual contract response JSON
      const contractResponse = JSON.parse(Buffer.from(protoResponse.data).toString('utf-8'));

      if (!('balance' in contractResponse) || isNaN(Number(contractResponse.balance))) {
        console.error(`No balance found for ${tokenAddress}`);
        failedTokens.push(tokenAddress);
        continue;
      }

      balances.push({
        denom: tokenAddress,
        amount: new BigNumber(contractResponse.balance),
      });
    } catch (error) {
      console.error(`Failed to process response for ${tokenAddress}:`, error);
      console.error('Raw result:', JSON.stringify(result, null, 2));
      failedTokens.push(tokenAddress);
    }
  }

  return { balances, failedTokens };
}

/**
 * Enhanced method with partial success handling. It will try to fetch balances using protobuf batch query first.
 * For successful subqueries, uses the batch results. For failed subqueries, retries individually using fallback method.
 * Finally combines all successful results from both approaches.
 * @param rpcUrl
 * @param address
 * @param cw20Tokens
 * @returns Array of { denom: string, amount: BigNumber }
 */
export async function fetchCW20Balances(
  rpcUrl: string,
  address: string,
  cw20Tokens: Array<string>,
): Promise<Array<{ denom: string; amount: BigNumber }>> {
  try {
    if (cw20Tokens.length === 0) {
      return [];
    }

    console.log('Attempting protobuf batch query...');
    const { balances, failedTokens } = await fetchCW20BalancesRPCProtobuf(rpcUrl, address, cw20Tokens);

    console.log(`Batch query: ${balances.length} successful, ${failedTokens.length} failed`);

    // If all tokens succeeded in batch, return immediately
    if (failedTokens.length === 0) {
      console.log('All tokens fetched successfully via batch query');
      return balances;
    }

    // If we have some successful results but some failed, retry failed ones individually
    if (balances.length > 0 && failedTokens.length > 0) {
      console.log(`Retrying ${failedTokens.length} failed tokens individually...`);
      try {
        const fallbackResults = await fetchCW20BalancesFallback(rpcUrl, address, failedTokens);
        const combinedResults = [...balances, ...fallbackResults];
        console.log(`Combined results: ${combinedResults.length} total balances`);
        return combinedResults;
      } catch (fallbackError) {
        console.warn('Individual fallback queries also failed:', fallbackError);
        // Return partial results from batch query
        return balances;
      }
    }

    // If all batch queries failed, fall back to individual queries for all tokens
    if (balances.length === 0) {
      console.log('All batch queries failed, falling back to individual queries for all tokens');
      return fetchCW20BalancesFallback(rpcUrl, address, cw20Tokens);
    }

    return balances;
  } catch (error) {
    console.warn('Protobuf batch query completely failed, falling back to individual queries:', error);
    return fetchCW20BalancesFallback(rpcUrl, address, cw20Tokens);
  }
}
