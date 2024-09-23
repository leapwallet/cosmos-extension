import { ConcreteException } from '../exception';
import { Exception } from '../types';
import { GeneralException } from './GeneralException';
import { HttpRequestException } from './HttpRequestException';
import { TransactionException } from './TransactionException';

export type ThrownException = HttpRequestException | GeneralException | TransactionException;

export const isThrownException = (exception: Error | Exception): boolean => {
  if (exception instanceof ConcreteException) {
    return true;
  }

  if (
    [
      'GrpcUnaryRequestException',
      'HttpRequestException',
      'Web3Exception',
      'GeneralException',
      'LedgerException',
      'LedgerCosmosException',
      'MetamaskException',
      'TrezorException',
      'CosmosWalletException',
      'TransactionException',
      'WalletException',
      'TrustWalletException',
      'OkxWalletException',
    ].includes(exception.constructor.name)
  ) {
    return true;
  }

  return false;
};

export { GeneralException, HttpRequestException, TransactionException };
