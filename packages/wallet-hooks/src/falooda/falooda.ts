import { Fallback } from '@leapwallet/fallback-falooda';

import { cosmosNodes, junoNodes, leapNode, osmosisNodes } from './urls';
export const enableLeapNode = Math.random() > 0.5;
export const falooda = new Fallback.Falooda({
  intervalInSecs: 60,
  urls: {
    cosmos: {
      cosmosHub: cosmosNodes,
      juno: junoNodes,
      osmosis: osmosisNodes,
    },
  },
});

export function enableFalooda() {
  falooda.start();
}

export function disableFalooda() {
  falooda.stop();
}

export const faloodaChains = ['cosmos', 'juno', 'osmosis'];
