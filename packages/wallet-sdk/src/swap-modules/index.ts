import { SupportedChain } from '../constants';
import { DenomsRecord } from '../types';
import { SwapModule } from '../types/swaps';
import { OsmosisSwapModule } from './osmosis';

export const getSwapModule = (chain: SupportedChain, denoms: DenomsRecord): SwapModule => {
  switch (chain) {
    case 'osmosis':
      return new OsmosisSwapModule(denoms);
    default:
      throw new Error(`Swap Module not supported for ${chain}`);
  }
};
