import { Token } from '~/types/bank'
import { tokenAndPriceChanges, tokenAndUsdPrice, tokenImages } from '~/util/tokens'

export type CustomWallet = {
  name: string
  id: string
  // chain id : address
  addresses: Record<string, string>
  colorIndex: number
  addressIndex: number
  // chain id : asset-list
  assets: Record<string, Token[]>
  // map of rewards for staking
  rewards: Record<string, number>
}

const rewards = {
  cosmos: 60,
  osmosis: 35,
  juno: 44,
  akash: 12,
  axelar: 21,
  emoney: 15,
  persistence: 29,
  stargaze: 7,
  sifchain: 12700,
  sommelier: 10,
  umee: 4,
  assetmantle: 6,
  kujira: 2,
  injective: 2,
  sei: 7,
  stride: 12,
}

const assets = {
  cosmos: [
    {
      amount: '145.8765',
      symbol: 'ATOM',
      percentChange: tokenAndPriceChanges.ATOM,
      coinMinimalDenom: 'uatom',
      img: tokenImages.ATOM,
      usdPrice: tokenAndUsdPrice.ATOM,
      coinDecimals: 6,
    },
  ],
  juno: [
    {
      amount: '184.1024',
      symbol: 'JUNO',
      percentChange: tokenAndPriceChanges.JUNO,
      coinMinimalDenom: 'ujuno',
      img: tokenImages.JUNO,
      usdPrice: tokenAndUsdPrice.JUNO,
      coinDecimals: 6,
    },
  ],
  osmosis: [
    {
      amount: '139.3017',
      symbol: 'OSMO',
      percentChange: tokenAndPriceChanges.OSMO,
      coinMinimalDenom: 'uosmo',
      img: tokenImages.OSMO,
      usdPrice: tokenAndUsdPrice.OSMO,
      coinDecimals: 6,
    },
    {
      amount: '7.3456',
      symbol: 'ATOM',
      percentChange: tokenAndPriceChanges.ATOM,
      coinMinimalDenom: 'uatom',
      img: tokenImages.ATOM,
      ibcChainInfo: {
        pretty_name: 'Osmosis',
        icon: tokenImages.OSMO,
        name: 'osmosis',
        channelId: 'channel-0',
      },
      usdPrice: tokenAndUsdPrice.ATOM,
      coinDecimals: 6,
    },
  ],
  stargaze: [
    {
      amount: '125.0019',
      symbol: 'STARS',
      percentChange: tokenAndPriceChanges.STARS,
      coinMinimalDenom: 'ustars',
      img: tokenImages.STARS,
      usdPrice: tokenAndUsdPrice.STARS,
      coinDecimals: 6,
    },
  ],
  assetmantle: [
    {
      amount: '39.04618',
      symbol: 'MNTL',
      percentChange: tokenAndPriceChanges.MNTL,
      coinMinimalDenom: 'umntl',
      img: tokenImages.MNTL,
      usdPrice: tokenAndUsdPrice.MNTL,
      coinDecimals: 6,
    },
  ],
  axelar: [
    {
      amount: '124.95',
      symbol: 'AXL',
      percentChange: tokenAndPriceChanges.AXL,
      coinMinimalDenom: 'uaxl',
      img: tokenImages.AXL,
      usdPrice: tokenAndUsdPrice.AXL,
      coinDecimals: 6,
    },
    {
      amount: '100.1666',
      symbol: 'USDC',
      coinMinimalDenom: 'uusdc',
      img: tokenImages.USDC,
      percentChange: tokenAndPriceChanges.USDC,
      ibcChainInfo: {
        pretty_name: 'Axelar',
        icon: tokenImages.AXL,
        name: 'axelar',
        channelId: 'channel-71',
      },
      usdPrice: tokenAndUsdPrice.USDC,
      coinDecimals: 6,
    },
  ],
  akash: [
    {
      amount: '115.625',
      symbol: 'AKT',
      percentChange: tokenAndPriceChanges.AKT,
      coinMinimalDenom: 'uakt',
      img: tokenImages.AKT,
      coinDecimals: 6,
      usdPrice: tokenAndUsdPrice.AKT,
    },
  ],
  emoney: [
    {
      amount: '80',
      symbol: 'NGM',
      percentChange: tokenAndPriceChanges.NGM,
      coinMinimalDenom: 'ungm',
      img: tokenImages.NGM,
      coinDecimals: 6,
      usdPrice: tokenAndUsdPrice.NGM,
    },
  ],
  persistence: [
    {
      amount: '141.25',
      symbol: 'XPRT',
      percentChange: tokenAndPriceChanges.XPRT,
      coinMinimalDenom: 'uxprt',
      img: tokenImages.XPRT,
      coinDecimals: 6,
      usdPrice: tokenAndUsdPrice.XPRT,
    },
  ],
  sifchain: [
    {
      amount: '52400',
      symbol: 'ROWAN',
      percentChange: tokenAndPriceChanges.ROWAN,
      coinMinimalDenom: 'rowan',
      img: tokenImages.ROWAN,
      coinDecimals: 6,
      usdPrice: tokenAndUsdPrice.ROWAN,
    },
    {
      amount: '54',
      symbol: 'ATOM',
      percentChange: tokenAndPriceChanges.ATOM,
      coinMinimalDenom: 'uatom',
      img: tokenImages.ATOM,
      ibcChainInfo: {
        pretty_name: 'Sifchain',
        icon: tokenImages.ROWAN,
        name: 'sifchain',
        channelId: 'channel-0',
      },
      usdPrice: tokenAndUsdPrice.ATOM,
      coinDecimals: 6,
    },
    {
      amount: '7.3456',
      symbol: 'OSMO',
      percentChange: tokenAndPriceChanges.OSMO,
      coinMinimalDenom: 'uosmo',
      img: tokenImages.OSMO,
      ibcChainInfo: {
        pretty_name: 'Sifchain',
        icon: tokenImages.ROWAN,
        name: 'sifchain',
        channelId: 'channel-1',
      },
      usdPrice: tokenAndUsdPrice.OSMO,
      coinDecimals: 6,
    },
  ],
  sommelier: [
    {
      amount: '3882.5',
      symbol: 'SOMM',
      percentChange: tokenAndPriceChanges.SOMM,
      coinMinimalDenom: 'usomm',
      img: tokenImages.SOMM,
      coinDecimals: 6,
      usdPrice: tokenAndUsdPrice.SOMM,
    },
  ],
  umee: [
    {
      amount: '5500',
      symbol: 'UMEE',
      percentChange: tokenAndPriceChanges.UMEE,
      coinMinimalDenom: 'uumee',
      img: tokenImages.UMEE,
      coinDecimals: 18,
      usdPrice: tokenAndUsdPrice.UMEE,
    },
  ],
  kujira: [
    {
      amount: '120',
      symbol: 'KUJI',
      percentChange: tokenAndPriceChanges.KUJI,
      coinMinimalDenom: 'ukuji',
      img: tokenImages.KUJI,
      coinDecimals: 6,
      usdPrice: tokenAndUsdPrice.KUJI,
    },
  ],
  injective: [
    {
      amount: '1160',
      symbol: 'INJ',
      percentChange: tokenAndPriceChanges.INJ,
      coinMinimalDenom: 'inj',
      img: tokenImages.INJ,
      coinDecimals: 18,
      usdPrice: tokenAndUsdPrice.INJ,
    },
  ],
  sei: [
    {
      amount: '1500.676767',
      symbol: 'SEI',
      percentChange: tokenAndPriceChanges.SEI,
      coinMinimalDenom: 'usei',
      img: tokenImages.SEI,
      coinDecimals: 6,
      usdPrice: tokenAndUsdPrice.SEI,
    },
  ],
  stride: [
    {
      amount: '1210.125',
      symbol: 'STRD',
      percentChange: tokenAndPriceChanges.STRD,
      coinMinimalDenom: 'ustrd',
      img: tokenImages.STRD,
      coinDecimals: 6,
      usdPrice: tokenAndUsdPrice.STRD,
    },
  ],
}

export const wallet1: CustomWallet = {
  name: 'Main Wallet',
  id: 'wallet-id-one',
  rewards,
  assets,
  addresses: {
    cosmos: 'cosmos1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4wgxl59',
    osmosis: 'osmo1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4xn40zh',
    juno: 'juno1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4c69yne',
    akash: 'akash1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4rntcdl',
    axelar: 'axelar1pkzmx7j90m9hxarmtu5j5ywxyetxl2q42xshly',
    emoney: 'emoney1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4ptutrc',
    persistence: 'persistence1jrq2mxawp7jm3z9k0v5qecst9a486tcsd5w0lf',
    stargaze: 'stars1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4653zl5',
    sifchain: 'sif1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4t4ffmw',
    sommelier: 'somm1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4z5fn90',
    umee: 'umee1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4u7mqsh',
    assetmantle: 'mantle1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4sva6t0',
    kujira: 'kujira1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4lqy8e0',
    injective: 'inj12xz8z7lrqvtj34l7j05u72zjawyc5635859px9',
    sei: 'sei1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4ryhfjy',
    stride: 'stride1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4drxrqf',
  },
  colorIndex: 0,
  addressIndex: 0,
}

export const wallet2: CustomWallet = {
  name: 'Side Wallet',
  id: 'wallet-id-two',
  addresses: {
    cosmos: 'cosmos1t9rfc40vz4xtx8mj6lfnk9mlakls5aensa2ull',
    osmosis: 'osmo1t9rfc40vz4xtx8mj6lfnk9mlakls5aencxevfd',
    juno: 'juno1t9rfc40vz4xtx8mj6lfnk9mlakls5aenx0f8cr',
    akash: 'akash1t9rfc40vz4xtx8mj6lfnk9mlakls5aenax8mx9',
    axelar: 'axelar1t9rfc40vz4xtx8mj6lfnk9mlakls5aen5nu557',
    emoney: 'emoney1t9rfc40vz4xtx8mj6lfnk9mlakls5aenl7sggz',
    persistence: 'persistence135m7mzpfglrxmf38pvdeh3rnkre56tjkezwceq',
    stargaze: 'stars1t9rfc40vz4xtx8mj6lfnk9mlakls5aenypap5w',
    sifchain: 'sif1t9rfc40vz4xtx8mj6lfnk9mlakls5aen4q92s5',
    sommelier: 'somm1t9rfc40vz4xtx8mj6lfnk9mlakls5aenup9sw4',
    umee: 'umee1t9rfc40vz4xtx8mj6lfnk9mlakls5aenzthrmd',
    assetmantle: 'mantle1t9rfc40vz4xtx8mj6lfnk9mlakls5aenwe3eq4',
    kujira: 'kujira1t9rfc40vz4xtx8mj6lfnk9mlakls5aenp4gyj4',
    injective: 'inj1nyntfxq3yl0qa486p08k9w0tnq8cy6k89emsf6',
    sei: 'sei1t9rfc40vz4xtx8mj6lfnk9mlakls5aena3m2e7',
    stride: 'stride1t9rfc40vz4xtx8mj6lfnk9mlakls5aennk2qtn',
  },
  rewards,
  assets,
  colorIndex: 1,
  addressIndex: 1,
}
