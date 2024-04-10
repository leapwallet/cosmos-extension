export * from './chain-info';
export * from './leap';
export * from './signer';

import { LeapWindow } from './leap';

declare global {
  interface Window extends LeapWindow {}
}
