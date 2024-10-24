export function isERC20Token(erc20Tokens: string[], token: string): boolean {
  token = token || '';
  return erc20Tokens.some((erc20Token) => erc20Token.toLowerCase() === token.toLowerCase());
}
