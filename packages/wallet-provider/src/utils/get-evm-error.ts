import { ETHEREUM_RPC_ERROR_MESSAGE } from '../provider/types';

// Sei EVM
export function getEvmError(code: number, message?: string, data?: unknown) {
  return {
    code,
    message: message ?? ETHEREUM_RPC_ERROR_MESSAGE[code],
    data,
  };
}
