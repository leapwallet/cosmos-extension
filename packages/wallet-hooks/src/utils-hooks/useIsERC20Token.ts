import { useCallback } from 'react';

import { useBetaERC20Tokens, useERC20Tokens } from '../store';
import { Token } from '../types';

export const useIsERC20Token = () => {
  const erc20Tokens = useERC20Tokens();
  const betaERC20Tokens = useBetaERC20Tokens();

  return useCallback((token: Token) => {
    if (token?.ibcDenom) {
      return false;
    }

    const contractAddress = token?.coinMinimalDenom ?? '';
    return contractAddress in erc20Tokens || contractAddress in betaERC20Tokens;
  }, []);
};
