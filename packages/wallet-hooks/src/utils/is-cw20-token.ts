export function isCW20Token(cw20Tokens: string[], token: string): boolean {
  token = token || '';
  return cw20Tokens.some((cw20Token) => cw20Token.toLowerCase() === token.toLowerCase());
}
