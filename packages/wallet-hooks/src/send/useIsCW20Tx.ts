import { useCallback } from 'react';

import { useBetaCW20Tokens, useCW20Tokens } from '../store';
import { Token } from '../types/bank';

export const useIsCW20Tx = () => {
  const cw20Tokens = useCW20Tokens();
  const betaCW20Tokens = useBetaCW20Tokens();

  return useCallback(
    (selectedToken: Token) =>
      (selectedToken.coinMinimalDenom ?? '') in (cw20Tokens ?? {}) ||
      (selectedToken.coinMinimalDenom ?? '') in (betaCW20Tokens ?? {}),
    [],
  );
};
