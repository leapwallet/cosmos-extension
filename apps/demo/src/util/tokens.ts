import { IbcChainInfo } from '~/types/bank'

import { TransactionToken } from './../types/bank'

export type AllIbcInfo = Record<string, IbcChainInfo>

export const tokenImages: Record<string, string> = {
  ATOM: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
  OSMO: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg',
  JUNO: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.svg',
  AKT: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png',
  AXL: 'https://axelarscan.io/logos/assets/axl.png',
  NGM: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.png',
  XPRT: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.png',
  STARS: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png',
  ROWAN: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png',
  SOMM: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png',
  UMEE: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.png',
  MNTL: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.png',
  KUJI: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.png',
  INJ: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png',
  SEI: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/testnets/atlantic/images/sei.png',
  STRD: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png',
  USDC: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axlusdc.svg',
}

const generateIbcChainInfo = (name: string, symbol: string, info: Record<string, string>) => {
  return Object.entries(info).reduce((acc, [chain, channelId]) => {
    return {
      ...acc,
      [chain]: { pretty_name: name, icon: tokenImages[symbol], channelId, name: symbol },
    }
  }, {} as AllIbcInfo)
}

export type TokenByChainValue = TransactionToken & { allIbcInfo: AllIbcInfo }

export const tokensByChain: Record<string, TokenByChainValue> = {
  cosmos: {
    img: tokenImages.ATOM,
    symbol: 'ATOM',
    allIbcInfo: generateIbcChainInfo('Atom', 'ATOM', {
      cosmos: 'channel-0',
      osmosis: 'channel-1',
      juno: 'channel-8',
    }),
  },
  osmosis: {
    img: tokenImages.OSMO,
    symbol: 'OSMO',
    allIbcInfo: generateIbcChainInfo('Osmosis', 'OSMO', {
      cosmos: 'channel-0',
      juno: 'channel-42',
      secret: 'channel-88',
    }),
  },
  juno: {
    img: tokenImages.JUNO,
    symbol: 'JUNO',
    allIbcInfo: generateIbcChainInfo('Juno', 'JUNO', {
      osmosis: 'channel-0',
      cosmos: 'channel-1',
      secret: 'channel-48',
    }),
  },
  akash: {
    img: tokenImages.AKT,
    symbol: 'AKT',
    allIbcInfo: generateIbcChainInfo('Akash', 'AKT', {
      cosmos: 'channel-17',
      osmosis: 'channel-9',
      juno: 'channel-35',
      secret: 'channel-43',
    }),
  },
  axelar: {
    img: tokenImages.AXL,
    symbol: 'AXL',
    allIbcInfo: generateIbcChainInfo('Axelar', 'AXL', {
      cosmos: 'channel-2',
      osmosis: 'channel-3',
      juno: 'channel-4',
      secret: 'channel-12',
    }),
  },
  emoney: {
    img: tokenImages.NGM,
    symbol: 'NGM',
    allIbcInfo: generateIbcChainInfo('E-Money', 'NGM', {
      cosmos: 'channel-1',
      osmosis: 'channel-0',
      akash: 'channel-3',
    }),
  },
  persistence: {
    img: tokenImages.XPRT,
    symbol: 'XPRT',
    allIbcInfo: generateIbcChainInfo('Persistence', 'XPRT', {
      cosmos: 'channel-24',
      osmosis: 'channel-6',
      akash: 'channel-4',
      emoney: 'channel-36',
      irisnet: 'channel-19',
      juno: 'channel-37',
    }),
  },
  stargaze: {
    img: tokenImages.STARS,
    symbol: 'STARS',
    allIbcInfo: generateIbcChainInfo('Stargaze', 'STARS', {
      cosmos: 'channel-19',
      osmosis: 'channel-0',
      juno: 'channel-5',
      secret: 'channel-18',
      axelar: 'channel-50',
    }),
  },
  sifchain: {
    img: tokenImages.ROWAN,
    symbol: 'ROWAN',
    allIbcInfo: generateIbcChainInfo('Sifchain', 'ROWAN', {
      cosmos: 'channel-0',
      akash: 'channel-2',
      persistence: 'channel-7',
      osmosis: 'channel-17',
      juno: 'channel-14',
      stargaze: 'channel-57',
      emoney: 'channel-19',
    }),
  },
  sommelier: {
    img: tokenImages.SOMM,
    symbol: 'SOMM',
    allIbcInfo: generateIbcChainInfo('Sommelier', 'SOMM', {}),
  },
  umee: {
    img: tokenImages.UMEE,
    symbol: 'UMEE',
    allIbcInfo: generateIbcChainInfo('Umee', 'UMEE', {
      cosmos: 'channel-1',
      akash: 'channel-5',
      osmosis: 'channel-0',
      juno: 'channel-2',
      stargaze: 'channel-14',
      sifchain: 'channel-6',
    }),
  },
  assetmantle: {
    img: tokenImages.MNTL,
    symbol: 'MNTL',
    allIbcInfo: generateIbcChainInfo('Assetmantle', 'MNTL', {
      osmosis: 'channel-0',
      juno: 'channel-2',
      stargaze: 'channel-5',
      axelar: 'channel-9',
    }),
  },
  kujira: {
    img: tokenImages.KUJI,
    symbol: 'KUJI',
    allIbcInfo: generateIbcChainInfo('Kujira', 'KUJI', {
      cosmos: 'channel-0',
      juno: 'channel-42',
      secret: 'channel-88',
    }),
  },
  injective: {
    img: tokenImages.INJ,
    symbol: 'INJ',
    allIbcInfo: generateIbcChainInfo('Injective', 'INJ', {
      cosmos: 'channel-1',
      persistence: 'channel-82',
      osmosis: 'channel-8',
      juno: 'channel-78',
      secret: 'channel-74',
      axelar: 'channel-77',
    }),
  },
  sei: {
    img: tokenImages.SEI,
    symbol: 'SEI',
    allIbcInfo: generateIbcChainInfo('Sei Atlantic', 'SEI', {}),
  },
  stride: {
    img: tokenImages.STRD,
    symbol: 'STRD',
    allIbcInfo: generateIbcChainInfo('Stride', 'STRD', {}),
  },
}

export const tokenWithTargetChainSpecificIbcInfo = (
  srcChain: string,
  targetChain: string,
  token?: string | undefined,
): TransactionToken => {
  const tokenInfo = tokensByChain[srcChain]
  const targetChainIbcInfo = tokensByChain[targetChain].allIbcInfo[srcChain]

  if (token) {
    return {
      img: tokenImages[token],
      symbol: token,
      ibcChainInfo: targetChainIbcInfo,
    }
  }
  return {
    img: tokenInfo.img,
    symbol: tokenInfo.symbol,
    ibcChainInfo: targetChainIbcInfo,
  }
}

export const tokenAndMinimalDenom: Record<string, string> = {
  ATOM: 'uatom',
  OSMO: 'uosmo',
  JUNO: 'ujuno',
  AKT: 'uakt',
  AXL: 'uaxl',
  NGM: 'ungm',
  XPRT: 'uxprt',
  STARS: 'ustars',
  ROWAN: 'rowan',
  SOMM: 'usomm',
  UMEE: 'uumee',
  MNTL: 'umntl',
  KUJI: 'ukuji',
  INJ: 'inj',
  SEI: 'usei',
  STRD: 'ustrd',
  USDC: 'usdc',
}

export const tokenAndUsdPrice: Record<string, string> = {
  ATOM: '13.11',
  OSMO: '1.1',
  JUNO: '3.94',
  AKT: '0.2655',
  AXL: '0.8578',
  NGM: '0.1654',
  XPRT: '0.6392',
  STARS: '0.0349',
  ROWAN: '0.0059',
  SOMM: '0.3486',
  UMEE: '0.0140',
  MNTL: '0.0521',
  KUJI: '1.03',
  INJ: '1.77',
  SEI: '0.001',
  STRD: '0.9612',
  USDC: '1',
}

export const tokenAndPriceChanges: Record<string, number> = {
  ATOM: 11.2,
  OSMO: 2.1,
  JUNO: 0.8,
  AKT: -2.1,
  AXL: 8.9,
  NGM: 3,
  XPRT: -12.4,
  STARS: -2.2,
  ROWAN: 1.8,
  SOMM: 0,
  UMEE: 6.6,
  MNTL: -5.9,
  KUJI: -1.5,
  INJ: 3.2,
  SEI: -3.7,
  STRD: 9,
  USDC: -0.01,
}
