import { useCallback } from 'react';

import { useBetaCW20Tokens, useCW20Tokens } from '../store';
import { Token } from '../types';

export const useIsCW20Token = () => {
  const cw20Tokens = useCW20Tokens();
  const betaCW20Tokens = useBetaCW20Tokens();

  return useCallback((token: Token) => {
    if (token?.ibcDenom) {
      return false;
    }

    const contractAddress = token?.coinMinimalDenom ?? '';
    return contractAddress in cw20Tokens || contractAddress in betaCW20Tokens;
  }, []);
};
