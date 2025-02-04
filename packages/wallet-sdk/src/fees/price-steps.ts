import { ChainInfo, defaultGasPriceStep, SupportedChain } from '../constants';
import { BtcTx, NetworkType } from '../tx';
import { GasPriceStepsRecord } from '../types';
import { getCoreumGasPrice, getOsmosisGasPriceSteps, getSeiGasPrice } from './chain-fees';

export const getGasPricesSteps = async (config: {
  allChainsGasPriceSteps: GasPriceStepsRecord;
  chains: Record<SupportedChain, ChainInfo>;
  activeChain: SupportedChain;
  selectedNetwork: NetworkType;
  lcdUrl?: string;
}) => {
  const { activeChain, allChainsGasPriceSteps, chains, lcdUrl, selectedNetwork } = config;
  const defaultValue = {
    low: allChainsGasPriceSteps[activeChain]?.low ?? defaultGasPriceStep.low,
    medium: allChainsGasPriceSteps[activeChain]?.average ?? defaultGasPriceStep.average,
    high: allChainsGasPriceSteps[activeChain]?.high ?? defaultGasPriceStep.high,
  };

  try {
    if ((activeChain === 'coreum' || activeChain === 'mainCoreum') && lcdUrl) {
      const gas = await getCoreumGasPrice(lcdUrl, allChainsGasPriceSteps);
      return { low: gas, medium: gas * 1.2, high: gas * 1.5 };
    }

    if (activeChain === 'bitcoin' || activeChain === 'bitcoinSignet') {
      const gasPrices = await BtcTx.GetFeeRates(activeChain === 'bitcoin' ? 'mainnet' : 'testnet');
      return gasPrices;
    }

    if (activeChain === 'seiTestnet2') {
      const chainId =
        selectedNetwork === 'mainnet' ? chains['seiTestnet2'].chainId : chains['seiTestnet2'].testnetChainId ?? '';
      const gas = await getSeiGasPrice(allChainsGasPriceSteps, chainId, 'seiTestnet2');
      return { low: gas, medium: gas * 1.2, high: gas * 1.5 };
    }

    if (activeChain === 'seiDevnet') {
      const gas = await getSeiGasPrice(allChainsGasPriceSteps, chains['seiDevnet'].chainId, 'seiDevnet');
      return { low: gas, medium: gas * 1.2, high: gas * 1.5 };
    }

    if (activeChain === 'osmosis') {
      const { low, medium, high } = await getOsmosisGasPriceSteps(lcdUrl ?? '', allChainsGasPriceSteps);
      return { low, medium, high };
    }

    return defaultValue;
  } catch {
    return defaultValue;
  }
};
