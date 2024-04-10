import { ETHEREUM_RPC_ERROR_MESSAGE } from './types';

export class LeapEvmRpcError extends Error {
  public code: number;
  public data?: unknown;

  constructor(code: number, message?: string, data?: unknown) {
    super(message ?? ETHEREUM_RPC_ERROR_MESSAGE[code]);
    this.code = code;
    this.data = data;
    this.name = 'LeapEvmRpcError';
  }
}
