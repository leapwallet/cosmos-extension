import { ChainInfos, DefaultGasEstimates, GasPrice, SigningSscrt } from '@leapwallet/cosmos-wallet-sdk';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Wallet } from 'secretjs';

import { useAddress, useChainApis, useDefaultGasEstimates } from '../store';
import { GasOptions } from '../utils';

export type useSecretSnip20Returns = {
  contractAddress: string | undefined;
  gasError: string | null;
  gasOption: GasOptions;
  userPreferredGasPrice: GasPrice | undefined;
  userPreferredGasLimit: number | undefined;
  recommendedGasLimit: number;
  setContractAddress: Dispatch<SetStateAction<string | undefined>>;
  setGasError: Dispatch<SetStateAction<string | null>>;
  setGasOption: Dispatch<SetStateAction<GasOptions>>;
  setUserPreferredGasPrice: Dispatch<SetStateAction<GasPrice | undefined>>;
  setUserPreferredGasLimit: Dispatch<SetStateAction<number | undefined>>;
};

type useSecretSnip20Params = {
  getWallet: () => Promise<Wallet>;
};

export function useSecretSnip20({ getWallet }: useSecretSnip20Params): useSecretSnip20Returns {
  const defaultGasEstimates = useDefaultGasEstimates();
  const { lcdUrl } = useChainApis();
  const address = useAddress();

  const [contractAddress, setContractAddress] = useState<string | undefined>(undefined);
  const [gasError, setGasError] = useState<string | null>(null);
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW);
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(undefined);
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined);
  const [recommendedGasLimit, setRecommendedGasLimit] = useState(
    defaultGasEstimates?.secret?.DEFAULT_GAS_TRANSFER ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
  );

  useEffect(() => {
    (async function simulate() {
      if (getWallet && lcdUrl && address && contractAddress) {
        try {
          const wallet = await getWallet();
          const sscrt = await SigningSscrt.create(lcdUrl as string, ChainInfos.secret.chainId, wallet);
          const { gasUsed } = await sscrt.simulateCreateViewingKey(address, contractAddress);

          setRecommendedGasLimit(parseInt(gasUsed));
        } catch (_) {
          //
        }
      }
    })();
  }, [address, contractAddress, getWallet, lcdUrl]);

  return {
    gasOption,
    setGasOption,
    userPreferredGasPrice,
    setUserPreferredGasPrice,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    recommendedGasLimit,
    gasError,
    setGasError,
    contractAddress,
    setContractAddress,
  };
}
