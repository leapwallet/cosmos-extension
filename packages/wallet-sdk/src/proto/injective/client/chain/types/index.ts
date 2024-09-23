import { ChainErrorModule } from '../../../exceptions/src';

export interface RestApiResponse<T> {
  data: T;
}

export const ChainModule = { ...ChainErrorModule };
