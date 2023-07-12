import { convertMicroDenomToDenom } from './conversion';

export const calcPoolTokenValue = ({ tokenAmountInMicroDenom, tokenSupply, tokenReserves }: any) => {
  return convertMicroDenomToDenom((tokenAmountInMicroDenom / tokenSupply) * tokenReserves, 6);
};

export const calcPoolTokenDollarValue = ({
  tokenAmountInMicroDenom,
  tokenSupply,
  tokenReserves,
  tokenDollarPrice,
}: any) => {
  return (
    calcPoolTokenValue({
      tokenAmountInMicroDenom,
      tokenSupply,
      tokenReserves,
    }) *
    tokenDollarPrice *
    2
  );
};
