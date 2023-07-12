import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import {
  GetToken1ForToken2PriceInput,
  GetToken2ForToken1PriceInput,
  GetTokenForTokenPriceInput,
  InfoResponse,
} from 'types/swap';

export const getToken1ForToken2Price = async ({ nativeAmount, swapAddress, client }: GetToken1ForToken2PriceInput) => {
  try {
    const response = await client.queryContractSmart(swapAddress, {
      token1_for_token2_price: {
        token1_amount: `${nativeAmount}`,
      },
    });
    return response.token2_amount;
  } catch (e) {
    console.error('err(getToken1ForToken2Price):', e);
  }
};

export const getToken2ForToken1Price = async ({ tokenAmount, swapAddress, client }: GetToken2ForToken1PriceInput) => {
  try {
    const query = await client.queryContractSmart(swapAddress, {
      token2_for_token1_price: {
        token2_amount: `${tokenAmount}`,
      },
    });
    return query.token1_amount;
  } catch (e) {
    console.error('error(getToken2ForToken1Price):', e);
  }
};

export const getTokenForTokenPrice = async (input: GetTokenForTokenPriceInput) => {
  try {
    const nativePrice = await getToken2ForToken1Price(input);

    return getToken1ForToken2Price({
      nativeAmount: nativePrice,
      swapAddress: input.outputSwapAddress,
      client: input.client,
    });
  } catch (e) {
    console.error('error(getTokenForTokenPrice)', e);
  }
};

export const getSwapInfo = async (swapAddress: string, client: CosmWasmClient): Promise<InfoResponse | number> => {
  try {
    if (!swapAddress || !client) {
      throw new Error(
        `No swapAddress or rpcEndpoint was provided: ${JSON.stringify({
          swapAddress,
          client,
        })}`,
      );
    }

    return await client.queryContractSmart(swapAddress, {
      info: {},
    });
  } catch (e) {
    console.error('Cannot get swap info:', e);
    return 0;
  }
};
