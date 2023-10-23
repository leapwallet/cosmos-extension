import { NetworkData } from './../types/validators';

export const networkData: NetworkData[] = [
  {
    enabled: true,
    name: 'osmosis',
    gasPrice: '0.0025uosmo',
    ownerAddress: 'osmovaloper1u5v0m74mql5nzfx2yh43s2tke4mvzghr6m2n5t',
    default: true,
    maxPerDay: 1,
  },
  {
    enabled: true,
    name: 'juno',
    gasPrice: '0.0025ujuno',
  },
  {
    enabled: true,
    name: 'cosmoshub',
    gasPrice: '0.0025uatom',
  },
  {
    enabled: true,
    name: 'akash',
    ownerAddress: 'akashvaloper1xgnd8aach3vawsl38snpydkng2nv8a4kqgs8hf',
  },
  {
    enabled: true,
    name: 'chihuahua',
    gasPrice: '0.025uhuahua',
    ownerAddress: 'chihuahuavaloper19vwcee000fhazmpt4ultvnnkhfh23ppwxll8zz',
  },
  {
    enabled: true,
    name: 'gravitybridge',
    gasPrice: '0.025ugraviton',
  },
  {
    enabled: false,
    name: 'regen',
    gasPrice: '0.03uregen',
    ownerAddress: 'regenvaloper1c4y3j05qx652rnxm5mg4yesqdkmhz2f6dl7hhk',
    autostake: {
      batchTxs: 5,
    },
  },
  {
    enabled: true,
    name: 'theta',
    testnet: true,
  },
  {
    enabled: true,
    name: 'terra',
    gasPrice: '0.015uluna',
  },
  // {
  //   enabled: false,
  //   name: 'terra2',
  //   gasPrice: '0.015uluna',
  // },
  {
    enabled: false,
    name: 'sentinel',
    gasPrice: '0.02udvpn',
  },
  {
    enabled: false,
    name: 'dig',
    gasPrice: '0.01udig',
    ownerAddress: 'digvaloper136avwnuvvy94dqmtnaue2nfvjes8xr37h9rzay',
  },
  {
    enabled: true,
    name: 'bitcanna',
    gasPrice: '0.001ubcna',
  },
  {
    enabled: true,
    name: 'emoney',
    gasPrice: '0.08ungm',
  },
  {
    enabled: false,
    name: 'kava',
    gasPrice: '0.00008ukava',
  },
  {
    enabled: true,
    name: 'desmos',
    gasPrice: '0.001udsm',
  },
  {
    enabled: true,
    name: 'teritori',
    gasPrice: '0.001utori',
  },
  {
    enabled: false,
    name: 'cryptoorgchain',
    gasPrice: '0.025basecro',
    ownerAddress: 'crocncl10mfs428fyntu296dgh5fmhvdzrr2stlaekcrp9',
  },
  {
    enabled: true,
    name: 'evmos',
    txTimeout: 120000,
    ownerAddress: 'evmosvaloper1umk407eed7af6anvut6llg2zevnf0dn0feqqny',
    maxPerDay: 1,
  },
  {
    enabled: true,
    name: 'sifchain',
    gasPrice: '1500000000000rowan',
    ownerAddress: 'sifvaloper19t5nk5ceq5ga75epwdqhnupwg0v9339p096ydz',
  },
  {
    enabled: false,
    name: 'lumnetwork',
  },
  {
    enabled: true,
    name: 'stargaze',
  },
  {
    enabled: true,
    name: 'comdex',
  },
  {
    enabled: true,
    name: 'cheqd',
    gasPrice: '25ncheq',
  },
  {
    enabled: true,
    name: 'umee',
  },
  {
    enabled: true,
    name: 'bitsong',
  },
  {
    enabled: true,
    name: 'persistenceNew',
  },
  {
    enabled: true,
    name: 'persistence',
  },
  {
    enabled: true,
    name: 'agoric',
  },
  {
    enabled: true,
    name: 'impacthub',
  },
  {
    enabled: false,
    name: 'kichain',
    gasPrice: '0.025uxki',
  },
  {
    enabled: true,
    name: 'sommelier',
  },
  {
    enabled: false,
    name: 'konstellation',
    image: 'https://assets.leapwallet.io/darctoken.svg',
  },
  {
    enabled: true,
    name: 'fetchhub',
    gasPrice: '5000afet',
  },
  {
    enabled: false,
    name: 'cerberus',
    gasPrice: '0.025ucrbrus',
    autostake: {
      batchTxs: 100,
    },
    ownerAddress: 'cerberusvaloper1tat2cy3f9djtq9z7ly262sqngcarvaktr0w78f',
  },
  {
    enabled: true,
    name: 'secretnetwork',
    gasPrice: '0.025uscrt',
    gasPricePrefer: '0.05uscrt',
  },
  {
    enabled: false,
    name: 'bostrom',
    gasPrice: '0boot',
  },
  {
    enabled: true,
    name: 'starname',
    gasPrice: '10uvoi',
  },
  {
    enabled: false,
    name: 'rizon',
    gasPrice: '0.0001uatolo',
  },
  {
    enabled: true,
    name: 'decentr',
    gasPrice: '0.025udec',
  },
  {
    enabled: true,
    name: 'assetmantle',
    gasPrice: '0.025umntl',
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04,
    },
    ownerAddress: 'mantlevaloper1fqs7gakxdmujtk0qufdzth5pfyspus3yx394zd',
  },
  {
    enabled: true,
    name: 'crescent',
    gasPrice: '0.025ucre',
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04,
    },
  },
  {
    enabled: false,
    name: 'meme',
    gasPrice: '0.025umeme',
  },
  {
    enabled: false,
    name: 'cronos',
  },
  {
    enabled: false,
    name: 'harpoon',
    ownerAddress: 'kujiravaloper1vue5lawr3s0au9zj0aqeft5aknx6cjq6w5ghca',
    testnet: true,
  },
  {
    enabled: true,
    name: 'kujira',
    ownerAddress: 'kujiravaloper1vue5lawr3s0au9zj0aqeft5aknx6cjq6w5ghca',
  },
  {
    enabled: true,
    name: 'injective',
  },
  {
    enabled: false,
    name: 'genesisl1',
    txTimeout: 120000,
  },
  {
    enabled: false,
    name: 'mars',
  },
  {
    enabled: true,
    name: 'atlantic',
  },
  {
    enabled: true,
    name: 'stride',
  },
  {
    enabled: true,
    name: 'irisnet',
  },
  {
    enabled: true,
    name: 'likecoin',
  },
  {
    enabled: true,
    name: 'jackal',
  },
  {
    enabled: true,
    name: 'canto',
  },
  {
    enabled: true,
    name: 'carbon',
  },
  {
    enabled: true,
    name: 'cudos',
  },
  {
    enabled: true,
    name: 'kava',
  },
  {
    enabled: true,
    name: 'omniflix',
  },
  {
    enabled: true,
    name: 'passage',
  },
  {
    enabled: true,
    name: 'archway',
  },
  {
    enabled: true,
    name: 'quasar',
  },
  { enabled: true, name: 'neutron' },
  { enabled: true, name: 'coreum' },
  { enabled: true, name: 'mainCoreum' },
  {
    enabled: true,
    name: 'quicksilver',
    gasPrice: '0.0001uqck',
  },
  { enabled: true, name: 'migaloo' },
  { enabled: true, name: 'seiTestnet2' },
  { enabled: true, name: 'onomy' },
  { enabled: true, name: 'kyve' },
  { enabled: true, name: 'kyvenetwork', testnet: true },
  { enabled: true, name: 'noble' },
  { enabled: true, name: 'planq' },
  { enabled: true, name: 'nibiru' },
  { enabled: true, name: 'mayachain' },
  { enabled: true, name: 'empowerchain' },
  { enabled: true, name: 'celestiatestnet3' },
  { enabled: true, name: 'sge' },
  { enabled: true, name: 'xpla' },
  { enabled: true, name: 'provenance' },
  { enabled: true, name: 'aura' },
  { enabled: true, name: 'kichain' },
  { enabled: true, name: 'sentinel' },
  { enabled: true, name: 'bandchain' },
];

export default networkData;
