import { JsonRpcProvider } from '@ethersproject/providers';

export async function fetchEvmChainId(rpcUrl: string) {
  try {
    const provider = new JsonRpcProvider(rpcUrl);
    const res = await provider.getNetwork();
    return res.chainId;
  } catch (error) {
    //
  }
}
