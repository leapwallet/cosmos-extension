import { defaultGasPriceStep } from './default-gasprice-step';
import { denoms, NativeDenom } from './denoms';

/**
 *
 * Chain configuration for wallet.
 * Added here temporarily for development purposes. We can serve this data from the backend or a json file from a cdn
 */

export type SupportedChain =
  | 'cosmos'
  | 'osmosis'
  | 'secret'
  | 'juno'
  | 'akash'
  | 'axelar'
  | 'emoney'
  | 'irisnet'
  | 'persistenceNew'
  | 'persistence'
  | 'stargaze'
  | 'sifchain'
  | 'sommelier'
  | 'umee'
  | 'starname'
  | 'cryptoorg'
  | 'comdex'
  | 'assetmantle'
  | 'crescent'
  | 'kujira'
  | 'injective'
  | 'mars'
  | 'sei'
  | 'stride'
  | 'agoric'
  | 'cheqd'
  | 'likecoin'
  | 'chihuahua'
  | 'gravitybridge'
  | 'fetchhub'
  | 'desmos'
  | 'teritori'
  | 'jackal'
  | 'evmos'
  | 'bitsong'
  | 'bitcanna'
  | 'canto'
  | 'decentr'
  | 'carbon'
  | 'cudos'
  | 'kava'
  | 'omniflix'
  | 'passage'
  | 'archway'
  | 'terra'
  | 'migaloo'
  | 'quasar'
  | 'neutron'
  | 'coreum'
  | 'mainCoreum'
  | 'quicksilver'
  | 'kyve'
  | 'seiTestnet2'
  | 'onomy'
  | 'noble'
  | 'impacthub'
  | 'planq'
  | 'nomic'
  | 'nolus'
  | 'chain4energy'
  | 'gitopia'
  | 'nibiru'
  | 'mayachain'
  | 'empowerchain'
  | 'dydx'
  | 'celestia'
  | 'sge'
  | 'xpla'
  | 'provenance'
  | 'aura'
  | 'kichain'
  | 'sentinel'
  | 'bandchain'
  | 'composable'
  | 'seiDevnet'
  | 'dymension'
  | 'pryzmtestnet'
  | 'thorchain'
  | 'odin'
  | 'saga'
  | 'initia'
  | 'humans'
  | 'lava'
  | 'mantra'
  | 'ethereum'
  | 'forma'
  | 'blackwing'
  | 'civitia'
  | 'init_ai'
  | 'milkyway'
  | 'minimove'
  | 'miniwasm'
  | 'noon'
  | 'tucana'
  | 'arbitrum'
  | 'polygon'
  | 'base'
  | 'optimism'
  | 'blast'
  | 'manta'
  | 'lightlink'
  | 'unichain';

export type AddressPrefix =
  | 'cosmos'
  | 'osmo'
  | 'secret'
  | 'juno'
  | 'akash'
  | 'axelar'
  | 'emoney'
  | 'iaa'
  | 'persistence'
  | 'stars'
  | 'sif'
  | 'somm'
  | 'umee'
  | 'star'
  | 'crc'
  | 'cro'
  | 'comdex'
  | 'mantle'
  | 'cre'
  | 'inj'
  | 'mars'
  | 'sei'
  | 'kujira'
  | 'stride'
  | 'agoric'
  | 'cheqd'
  | 'like'
  | 'chihuahua'
  | 'gravity'
  | 'fetch'
  | 'desmos'
  | 'tori'
  | 'jkl'
  | 'evmos'
  | 'bitsong'
  | 'bcna'
  | 'canto'
  | 'decentr'
  | 'swth'
  | 'cudos'
  | 'kava'
  | 'omniflix'
  | 'pasg'
  | 'archway'
  | 'terra'
  | 'migaloo'
  | 'quasar'
  | 'neutron'
  | 'core'
  | 'testcore'
  | 'quick'
  | 'kyve'
  | 'onomy'
  | 'noble'
  | 'ixo'
  | 'plq'
  | 'nomic'
  | 'nolus'
  | 'c4e'
  | 'gitopia'
  | 'nibi'
  | 'maya'
  | 'empower'
  | 'dydx'
  | 'celestia'
  | 'sge'
  | 'xpla'
  | 'pb'
  | 'aura'
  | 'ki'
  | 'sent'
  | 'band'
  | 'pica'
  | 'dym'
  | 'pryzm'
  | 'thor'
  | 'odin'
  | 'saga'
  | 'init'
  | 'human'
  | 'lava@'
  | 'mantra'
  | 'ethereum'
  | 'forma'
  | 'arbitrum'
  | 'polygon'
  | 'base'
  | 'optimism'
  | 'blast'
  | 'manta'
  | 'lightlink'
  | 'unichain';

export type Denom =
  | 'JUNO'
  | 'OSMO'
  | 'SCRT'
  | 'ATOM'
  | 'AKT'
  | 'AXL'
  | 'NGM'
  | 'IRIS'
  | 'XPRT'
  | 'STARS'
  | 'ROWAN'
  | 'SOMM'
  | 'UMEE'
  | 'IOV'
  | 'CRO'
  | 'CMDX'
  | 'MNTL'
  | 'CRE'
  | 'KUJI'
  | 'INJ'
  | 'MARS'
  | 'SEI'
  | 'STRD'
  | 'CHEQ'
  | 'LIKE'
  | 'BLD'
  | 'HUAHUA'
  | 'GRAV'
  | 'FET'
  | 'DSM'
  | 'TORI'
  | 'JKL'
  | 'EVMOS'
  | 'BTSG'
  | 'BCNA'
  | 'CANTO'
  | 'DEC'
  | 'SWTH'
  | 'CUDOS'
  | 'KAVA'
  | 'FLIX'
  | 'PASG'
  | 'CONST'
  | 'ARCH'
  | 'LUNA'
  | 'WHALE'
  | 'QSR'
  | 'NTRN'
  | 'CORE'
  | 'TESTCORE'
  | 'QCK'
  | 'KYVE'
  | 'NOM'
  | 'USD'
  | 'IXO'
  | 'PLQ'
  | 'NOM'
  | 'NLS'
  | 'C4E'
  | 'LORE'
  | 'NIBI'
  | 'CACAO'
  | 'MPWR'
  | 'DV4TNT'
  | 'TIA'
  | 'SGE'
  | 'XPLA'
  | 'HASH'
  | 'AURA'
  | 'XKI'
  | 'DVPN'
  | 'BAND'
  | 'DYDX'
  | 'PICA'
  | 'DYM'
  | 'PRYZM'
  | 'RUNE'
  | 'ODIN'
  | 'SAGA'
  | 'INIT'
  | 'HEART'
  | 'LAVA'
  | 'OM'
  | 'ETH'
  | 'MILK'
  | 'MATIC';

export type CoinType =
  | '118'
  | '529'
  | '750'
  | '60'
  | '394'
  | '234'
  | '564'
  | '852'
  | '639'
  | '459'
  | '330'
  | '990'
  | '4444'
  | '931'
  | '505'
  | '494';

export enum CosmosSDK {
  Version_Point_46 = 'v0.46',
  Version_Point_47 = 'v0.47',
}

export type DenomWithGasPriceStep = NativeDenom & {
  readonly gasPriceStep: {
    readonly low: number;
    readonly average: number;
    readonly high: number;
  };
};

export type ChainInfo = {
  readonly chainId: string;
  readonly chainRegistryPath: string;
  readonly testnetChainRegistryPath?: string;
  readonly chainName: string;
  readonly chainSymbolImageUrl?: string;
  readonly key: SupportedChain;
  readonly nativeDenoms: Record<string, NativeDenom>;
  readonly feeCurrencies?: DenomWithGasPriceStep[];
  readonly apis: {
    readonly rest?: string;
    readonly rpc?: string;
    readonly restTest?: string;
    readonly rpcTest?: string;
    readonly alternateRpc?: string;
    readonly alternateRest?: string;
    readonly alternateRpcTest?: string;
    readonly alternateRestTest?: string;

    readonly evmJsonRpc?: string;
    readonly evmJsonRpcTest?: string;

    readonly grpc?: string;
    readonly grpcTest?: string;
  };
  readonly txExplorer?: {
    mainnet?: {
      readonly name: string;
      readonly txUrl: string;
      readonly accountUrl: string;
    };
    testnet?: {
      readonly name: string;
      readonly txUrl: string;
      readonly accountUrl: string;
    };
  };
  readonly bip44: {
    readonly coinType: CoinType;
  };
  readonly denom: Denom;
  addressPrefix: AddressPrefix;
  gasPriceStep: {
    low: number;
    high: number;
    average: number;
  };
  enabled: boolean;
  ibcChannelIds?: Record<string, [string]>;
  theme: {
    primaryColor: string;
    gradient: string;
  };
  testnetChainId?: string;
  readonly beta?: boolean;
  readonly disableStaking?: boolean;
  readonly cosmosSDK?: string;
  readonly evmChainId?: string;
  readonly evmChainIdTestnet?: string;
  apiStatus?: boolean;
  readonly evmOnlyChain?: boolean;
};

export const ChainInfos: Record<SupportedChain, ChainInfo> = {
  agoric: {
    chainId: 'agoric-3',
    key: 'agoric',
    chainName: 'Agoric',
    chainRegistryPath: 'agoric',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/bld.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/agoric',
      rest: 'https://rest.cosmos.directory/agoric',
      alternateRpc: 'https://agoric-api.polkachu.com',
    },
    denom: 'BLD',
    txExplorer: {
      mainnet: {
        name: 'BigDipper',
        txUrl: 'https://bigdipper.live/agoric/transactions',
        accountUrl: 'https://bigdipper.live/agoric/accounts',
      },
    },
    bip44: {
      coinType: '564',
    },
    addressPrefix: 'agoric',
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ubld: denoms.ubld,
    },
    theme: {
      primaryColor: '#D15062',
      gradient: 'linear-gradient(180deg, rgba(209, 80, 98, 0.32) 0%, rgba(209, 80, 98, 0) 100%)',
    },
    enabled: true,
  },
  akash: {
    chainId: 'akashnet-2',
    key: 'akash',
    chainName: 'Akash',
    chainRegistryPath: 'akash',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/akt.png',
    apis: {
      rest: 'https://rest.cosmos.directory/akash',
      rpc: 'https://rpc.cosmos.directory/akash',
    },
    denom: 'AKT',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/akash/txs',
        accountUrl: 'https://www.mintscan.io/akash/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'akash',
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    ibcChannelIds: {
      cosmos: ['channel-17'],
      osmo: ['channel-9'],
      juno: ['channel-35'],
      secret: ['channel-43'],
    },
    nativeDenoms: {
      uakt: denoms.uakt,
    },
    theme: {
      primaryColor: '#E4595E',
      gradient: 'linear-gradient(180deg, rgba(249, 51, 40, 0.32) 0%, rgba(249, 51, 40, 0) 100%)',
    },
    enabled: true,
  },
  archway: {
    chainId: 'archway-1',
    key: 'archway',
    chainName: 'Archway',
    chainRegistryPath: 'archway',
    testnetChainId: 'constantine-3',
    testnetChainRegistryPath: 'archwaytestnet',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/archway.svg',
    apis: {
      rest: 'https://api.mainnet.archway.io',
      rpc: 'https://rpc.mainnet.archway.io',
      rpcTest: 'https://rpc.constantine.archway.tech',
      restTest: 'https://api.constantine.archway.tech',
    },
    denom: 'ARCH',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/archway/txs',
        accountUrl: 'https://www.mintscan.io/archway/accounts',
      },
      testnet: {
        name: 'Testnet Mintscan',
        txUrl: 'https://testnet.mintscan.io/archway-testnet/txs',
        accountUrl: 'https://testnet.mintscan.io/archway-testnet/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'archway',
    gasPriceStep: {
      low: 1000000000000,
      average: 1500000000000,
      high: 2000000000000,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      aarch: denoms.aarch,
      aconst: denoms.aconst,
    },
    theme: {
      primaryColor: '#FE4D00',
      gradient: 'linear-gradient(180deg, rgba(255, 77, 0,0.32) 0%, rgba(204, 99, 145, 0) 100%)',
    },
    enabled: true,
  },
  assetmantle: {
    chainId: 'mantle-1',
    key: 'assetmantle',
    chainName: 'Assetmantle',
    chainRegistryPath: 'assetmantle',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/mntl.png',
    apis: {
      rest: 'https://rest.assetmantle.one',
      rpc: 'https://rpc.assetmantle.one',
      // rpcTest: 'http://35.234.10.84:26657/',
      // restTest: 'http://35.234.10.84:1317/',
    },
    denom: 'MNTL',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/asset-mantle/txs',
        accountUrl: 'https://www.mintscan.io/asset-mantle/accounts',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'mantle',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {
      osmo: ['channel-0'],
      juno: ['channel-2'],
      stars: ['channel-5'],
      axelar: ['channel-9'],
    },
    nativeDenoms: {
      umntl: denoms.umntl,
    },
    theme: {
      primaryColor: '#FFC745',
      gradient: 'linear-gradient(180deg, rgba(255, 199, 69, 0.32) 0%, rgba(255, 199, 69, 0) 100%)',
    },
    enabled: true,
  },
  axelar: {
    chainId: 'axelar-dojo-1',
    testnetChainId: 'axelar-testnet-lisbon-3',
    key: 'axelar',
    chainName: 'Axelar',
    chainRegistryPath: 'axelar',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/axl.png',
    testnetChainRegistryPath: 'axelartestnet',
    apis: {
      rest: 'https://rest.cosmos.directory/axelar',
      rpc: 'https://rpc.cosmos.directory/axelar',
      rpcTest: 'https://axelartest-rpc.quickapi.com',
      restTest: 'https://axelartest-lcd.quickapi.com',
      alternateRpcTest: 'https://rpc-axelar-testnet.imperator.co:443',
      alternateRestTest: 'https://lcd-axelar-testnet.imperator.co:443',
    },
    denom: 'AXL',
    txExplorer: {
      mainnet: {
        name: 'Axelarscan',
        txUrl: 'https://axelarscan.io/tx/',
        accountUrl: 'https://axelarscan.io/account',
      },
      testnet: {
        name: 'Axelarscan',
        txUrl: 'https://testnet.axelarscan.io/tx/',
        accountUrl: 'https://testnet.axelarscan.io/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'axelar',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {
      cosmos: ['channel-2'],
      osmo: ['channel-3'],
      juno: ['channel-4'],
      secret: ['channel-12'],
    },
    nativeDenoms: {
      uaxl: denoms.uaxl,
    },
    theme: {
      primaryColor: '#716363',
      gradient: 'linear-gradient(180deg, rgba(113, 99, 99, 0.32) 0%, rgba(113, 99, 99, 0) 100%)',
    },
    enabled: true,
  },
  aura: {
    chainId: 'aura_6322-2',
    key: 'aura',
    chainName: 'Aura',
    chainRegistryPath: 'aura',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/aura.svg',
    apis: {
      rest: 'https://rest.cosmos.directory/aura',
      rpc: 'https://rpc.cosmos.directory/aura',
    },
    denom: 'AURA',
    txExplorer: {
      mainnet: {
        name: 'AuraScan',
        txUrl: 'https://aurascan.io/tx',
        accountUrl: 'https://aurascan.io/address',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'aura',
    gasPriceStep: {
      low: 0.001,
      average: 0.0025,
      high: 0.004,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      uaura: denoms.uaura,
    },
    theme: {
      primaryColor: '#9ac9cf',
      gradient: 'linear-gradient(180deg, rgba(154, 201, 207, 0.32) 0%, rgba(154, 201, 207, 0) 100%)',
    },
    enabled: true,
  },
  bandchain: {
    chainId: 'laozi-mainnet',
    key: 'bandchain',
    chainName: 'Band Protocol',
    chainRegistryPath: 'bandchain',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/band.svg',
    apis: {
      rpc: 'https://rpc.cosmos.directory/bandchain',
      rest: 'https://rest.cosmos.directory/bandchain',
    },
    denom: 'BAND',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/band/tx',
        accountUrl: 'https://www.mintscan.io/band/accounts',
      },
    },
    bip44: {
      coinType: '494',
    },
    addressPrefix: 'band',
    gasPriceStep: {
      low: 0.0025,
      average: 0.003,
      high: 0.005,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      uband: denoms.uband,
    },
    theme: {
      primaryColor: '#4520e6',
      gradient: 'linear-gradient(180deg, rgba(69, 32, 230, 0.32) 0%, rgba(69, 32, 230, 0) 100%)',
    },
    enabled: true,
  },
  bitsong: {
    chainId: 'bitsong-2b',
    key: 'bitsong',
    chainName: 'BitSong',
    chainRegistryPath: 'bitsong',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/bitsong.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/bitsong',
      rest: 'https://rest.cosmos.directory/bitsong',
      alternateRpc: 'https://rpc.bitsong.freak12techno.io',
    },
    denom: 'BTSG',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/bitsong/txs',
        accountUrl: 'https://www.mintscan.io/bitsong/accounts',
      },
    },
    bip44: {
      coinType: '639',
    },
    addressPrefix: 'bitsong',
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ubtsg: denoms.ubtsg,
    },
    theme: {
      primaryColor: '#e2447b',
      gradient: 'linear-gradient(180deg, rgba(204, 99, 145) 0%, rgba(204, 99, 145, 0) 100%)',
    },
    enabled: true,
  },
  bitcanna: {
    chainId: 'bitcanna-1',
    key: 'bitcanna',
    chainName: 'BitCanna',
    chainRegistryPath: 'bitcanna',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/bcna.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/bitcanna',
      rest: 'https://rest.cosmos.directory/bitcanna',
      alternateRpc: 'https://bitcanna-rpc.panthea.eu',
    },
    denom: 'BCNA',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/bitcanna/txs',
        accountUrl: 'https://www.mintscan.io/bitcanna/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'bcna',
    gasPriceStep: {
      low: 0.001,
      average: 0.002,
      high: 0.003,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ubcna: denoms.ubcna,
    },
    theme: {
      primaryColor: '#00b786',
      gradient: 'linear-gradient(180deg, rgba(0, 183, 134, 0.35) 0%, rgba(0, 183, 134, 0) 100%)',
    },
    enabled: true,
  },
  canto: {
    chainId: 'canto_7700-1',
    key: 'canto',
    chainName: 'Canto',
    chainRegistryPath: 'canto',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/canto.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/canto',
      rest: 'https://rest.cosmos.directory/canto',
      alternateRpc: 'https://rpc.canto.silentvalidator.com',
    },
    denom: 'CANTO',
    txExplorer: {
      mainnet: {
        name: 'ping.pub',
        txUrl: 'https://cosmos-explorers.neobase.one/canto/tx',
        accountUrl: 'https://cosmos-explorers.neobase.one/canto/account',
      },
    },
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'canto',
    gasPriceStep: {
      low: 2700000000000,
      average: 3000000000000,
      high: 4000000000000,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      acanto: denoms.acanto,
    },
    theme: {
      primaryColor: '#00b786cc',
      gradient: 'linear-gradient(180deg, rgba(0, 183, 134, 0.6) 0%, rgb(6, 252, 153, 0) 100%)',
    },
    enabled: true,
  },
  carbon: {
    chainId: 'carbon-1',
    key: 'carbon',
    chainName: 'Carbon',
    chainRegistryPath: 'carbon',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/carbon.svg',
    apis: {
      rpc: 'https://rpc.cosmos.directory/carbon',
      rest: 'https://rest.cosmos.directory/carbon',
      alternateRpc: 'https://tm-api.carbon.network',
      alternateRest: 'https://api.carbon.network',
    },
    denom: 'SWTH',
    txExplorer: {
      mainnet: {
        name: 'Carbon scan',
        txUrl: 'https://scan.carbon.network/transaction',
        accountUrl: 'https://scan.carbon.network/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'swth',
    gasPriceStep: {
      low: 769.23077,
      average: 769.23077,
      high: 769.23077,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      swth: denoms.swth,
    },
    theme: {
      primaryColor: '#196163',
      gradient: 'linear-gradient(180deg, rgba(25, 97, 99, 0.32) 0%, rgba(25, 97, 99, 0) 100%)',
    },
    enabled: true,
  },
  celestia: {
    chainId: 'celestia',
    testnetChainId: 'mocha-4',
    key: 'celestia',
    chainName: 'Celestia',
    chainRegistryPath: 'celestia',
    testnetChainRegistryPath: 'celestiatestnet3',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/filled-celestia.svg',
    apis: {
      rest: 'https://api.lunaroasis.net',
      rpc: 'https://rpc.lunaroasis.net',
      restTest: 'https://api-mocha-4.consensus.celestia-mocha.com',
      rpcTest: 'https://rpc-mocha-4.consensus.celestia-mocha.com',
      alternateRestTest: ' https://api-2-mocha-4.consensus.celestia-mocha.com',
      alternateRpcTest: 'https://rpc-2-mocha-4.consensus.celestia-mocha.com',
    },
    denom: 'TIA',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://mintscan.io/celestia/txs',
        accountUrl: 'https://mintscan.io/celestia/account',
      },
      testnet: {
        name: 'Mintscan Testnet',
        txUrl: 'https://testnet.mintscan.io/celestia-testnet/txs',
        accountUrl: 'https://testnet.mintscan.io/celestia-testnet/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'celestia',
    gasPriceStep: {
      low: 0.1,
      average: 0.2,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      utia: denoms.utia,
    },
    theme: {
      primaryColor: '#7B2BF9',
      gradient: 'linear-gradient(180deg, rgba(123, 43, 249, 0.32) 0%, rgba(123, 43, 249, 0) 100%)',
    },
    enabled: true,
  },
  chain4energy: {
    chainId: 'perun-1',
    key: 'chain4energy',
    chainName: 'Chain4Energy',
    chainRegistryPath: 'chain4energy',
    testnetChainId: 'babajaga-1',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/chain4energy.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/chain4energy',
      rest: 'https://rest.cosmos.directory/chain4energy',
      rpcTest: 'https://rpc-testnet.c4e.io',
      restTest: 'https://lcd-testnet.c4e.io',
    },
    denom: 'C4E',
    txExplorer: {
      mainnet: {
        name: 'Explorer C4E',
        txUrl: 'https://explorer.c4e.io/transactions/',
        accountUrl: 'https://explorer.c4e.io/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'c4e',
    gasPriceStep: {
      low: 25,
      average: 50,
      high: 100,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      uc4e: denoms.uc4e,
    },
    theme: {
      primaryColor: '#77B729',
      gradient: 'linear-gradient(180deg, rgba(119, 183, 41, 0.32) 0%, rgba(243, 134, 42, 0) 100%)',
    },
    enabled: true,
  },
  cheqd: {
    chainId: 'cheqd-mainnet-1',
    key: 'cheqd',
    chainName: 'cheqd',
    chainRegistryPath: 'cheqd',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/cheq.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/cheqd',
      rest: 'https://rest.cosmos.directory/cheqd',
    },
    denom: 'CHEQ',
    txExplorer: {
      mainnet: {
        name: 'Big Dipper',
        txUrl: 'https://explorer.cheqd.io/transactions',
        accountUrl: 'https://bigdipper.live/cheqd/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'cheqd',
    gasPriceStep: {
      low: 25,
      average: 50,
      high: 100,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ncheq: denoms.ncheq,
    },
    theme: {
      primaryColor: '#F3862A',
      gradient: 'linear-gradient(180deg, rgba(243, 134, 42, 0.32) 0%, rgba(243, 134, 42, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  chihuahua: {
    chainId: 'chihuahua-1',
    key: 'chihuahua',
    chainName: 'Chihuahua',
    chainRegistryPath: 'chihuahua',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/huahua.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/chihuahua',
      rest: 'https://rest.cosmos.directory/chihuahua',
    },
    denom: 'HUAHUA',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/chihuahua/txs',
        accountUrl: 'https://www.mintscan.io/chihuahua/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'chihuahua',
    gasPriceStep: {
      low: 10,
      average: 50,
      high: 100,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      uhuahua: denoms.uhuahua,
    },
    theme: {
      primaryColor: '#F0A93D',
      gradient: 'linear-gradient(180deg, rgba(240, 169, 61, 0.32) 0%, rgba(240, 169, 61, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  comdex: {
    chainId: 'comdex-1',
    key: 'comdex',
    chainName: 'Comdex',
    chainRegistryPath: 'comdex',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/cmdx.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/comdex',
      rest: 'https://rest.cosmos.directory/comdex',
      alternateRpc: 'https://rpc-comdex.zenchainlabs.io',
    },
    denom: 'CMDX',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/comdex/txs',
        accountUrl: 'https://www.mintscan.io/comdex/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'comdex',
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.04,
    },
    ibcChannelIds: {
      cosmos: ['channel-29'],
      iaa: ['channel-9'],
      persistence: ['channel-10'],
      sif: ['channel-8'],
      osmo: ['channel-1'],
      emoney: ['channel-4'],
      juno: ['channel-18'],
      stars: ['channel-22'],
      axelar: ['channel-28'],
    },
    nativeDenoms: {
      ucmdx: denoms.ucmdx,
    },
    theme: {
      primaryColor: '#FE748A',
      gradient: 'linear-gradient(180deg, rgba(254, 116, 138, 0.32) 0%, rgba(254, 116, 138, 0) 100%)',
    },
    enabled: true,
  },
  mainCoreum: {
    chainId: 'coreum-mainnet-1',
    key: 'mainCoreum',
    chainName: 'Coreum',
    chainRegistryPath: 'coreum',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/coreum-logo.png',
    apis: {
      rest: 'https://rest.cosmos.directory/coreum',
      rpc: 'https://rpc.cosmos.directory/coreum',
    },
    denom: 'CORE',
    txExplorer: {
      mainnet: {
        name: 'Explorer Coreum',
        txUrl: 'https://explorer.mainnet-0.coreum.dev/coreum/transactions',
        accountUrl: 'https://explorer.mainnet-0.coreum.dev/coreum/accounts',
      },
    },
    bip44: {
      coinType: '990',
    },
    addressPrefix: 'core',
    gasPriceStep: {
      low: 0.0625,
      average: 0.07,
      high: 0.08,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ucore: denoms.ucore,
    },
    theme: {
      primaryColor: '#26d695',
      gradient: 'linear-gradient(180deg, rgba(38, 214, 149, 0.32) 0%, rgba(38, 214, 149, 0) 100%)',
    },
    enabled: true,
  },
  coreum: {
    chainId: 'coreum-testnet-1',
    testnetChainId: 'coreum-testnet-1',
    key: 'coreum',
    chainName: 'Coreum Testnet',
    chainRegistryPath: 'coreumtestnet',
    testnetChainRegistryPath: 'coreumtestnet',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/coreum-logo.png',
    apis: {
      restTest: 'https://full-node-pluto.testnet-1.coreum.dev:1317',
      rpcTest: 'https://full-node-pluto.testnet-1.coreum.dev:26657',
      alternateRestTest: 'https://full-node-eris.testnet-1.coreum.dev:1317',
      alternateRpcTest: 'https://full-node-eris.testnet-1.coreum.dev:26657',
    },
    denom: 'TESTCORE',
    txExplorer: {
      testnet: {
        name: 'Explorer Coreum',
        txUrl: 'https://explorer.testnet-1.coreum.dev/coreum/transactions',
        accountUrl: 'https://explorer.testnet-1.coreum.dev/coreum/accounts',
      },
    },
    bip44: {
      coinType: '990',
    },
    addressPrefix: 'testcore',
    gasPriceStep: {
      low: 0.0625,
      average: 0.5,
      high: 62.5,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      utestcore: denoms.utestcore,
    },
    theme: {
      primaryColor: '#26d695',
      gradient: 'linear-gradient(180deg, rgba(38, 214, 149, 0.32) 0%, rgba(38, 214, 149, 0) 100%)',
    },
    enabled: false,
  },
  cosmos: {
    chainId: 'cosmoshub-4',
    testnetChainId: 'theta-testnet-001',
    key: 'cosmos',
    chainRegistryPath: 'cosmoshub',
    chainName: 'Cosmos Hub',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/atom.png',
    apis: {
      rest: 'https://rest.cosmos.directory/cosmoshub',
      rpc: 'https://rpc.cosmos.directory/cosmoshub',
      rpcTest: 'https://rpc.sentry-02.theta-testnet.polypore.xyz',
      restTest: 'https://rest.sentry-02.theta-testnet.polypore.xyz',
    },
    denom: 'ATOM',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/cosmos/txs',
        accountUrl: 'https://www.mintscan.io/cosmos/accounts',
      },
      testnet: {
        name: 'Big Dipper',
        txUrl: 'https://explorer.theta-testnet.polypore.xyz/transactions',
        accountUrl: 'https://explorer.theta-testnet.polypore.xyz/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'cosmos',
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    ibcChannelIds: {
      osmo: ['channel-141'],
      juno: ['channel-207'],
      secret: ['channel-235'],
    },
    nativeDenoms: {
      uatom: denoms.uatom,
    },

    theme: {
      primaryColor: '#726FDC',
      gradient: 'linear-gradient(180deg, rgba(114, 111, 220, 0.32) 0%, rgba(114, 111, 220, 0) 100%)',
    },
    enabled: true,
  },
  crescent: {
    chainId: 'crescent-1',
    key: 'crescent',
    chainName: 'Crescent',
    chainRegistryPath: 'crescent',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/cre.svg',
    apis: {
      rest: 'https://rest.cosmos.directory/crescent',
      rpc: 'https://rpc.cosmos.directory/crescent',
    },
    denom: 'CRE',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/crescent/txs',
        accountUrl: 'https://www.mintscan.io/crescent/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'cre',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      ucre: denoms.ucre,
    },
    theme: {
      primaryColor: '#FFBF6F',
      gradient: 'linear-gradient(180deg, rgba(255, 191, 111, 0.32) 0%, rgba(255, 191, 111, 0) 100%)',
    },
    enabled: true,
  },
  cryptoorg: {
    chainId: 'crypto-org-chain-mainnet-1',
    key: 'cryptoorg',
    chainName: 'Crypto.org',
    chainRegistryPath: 'cryptoorgchain',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/cronos.png',
    apis: {
      rest: 'https://api-cryptoorgchain-ia.notional.ventures',
      rpc: 'https://mainnet.crypto.org',
      // rpcTest: 'http://35.234.10.84:26657/',
      // restTest: 'http://35.234.10.84:1317/',
    },
    denom: 'CRO',
    txExplorer: {
      mainnet: {
        name: 'Crypto.org',
        txUrl: 'https://crypto.org/explorer/tx',
        accountUrl: 'https://crypto.org/explorer/account',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '394',
    },
    addressPrefix: 'cro',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {
      cosmos: ['channel-27'],
      iaa: ['channel-23'],
      star: ['channel-22'],
      akash: ['channel-21'],
      persistence: ['channel-29'],
      sif: ['channel-23'],
      osmo: ['channel-10'],
      emoney: ['channel-42'],
      crc: ['channel-44'],
    },
    nativeDenoms: {
      basecro: denoms.basecro,
    },
    theme: {
      primaryColor: '#2F5AB6',
      gradient: 'linear-gradient(180deg, rgba(47, 90, 182, 0.32) 0%, rgba(47, 90, 182, 0) 100%)',
    },
    enabled: false,
  },
  cudos: {
    chainId: 'cudos-1',
    key: 'cudos',
    chainName: 'Cudos',
    chainRegistryPath: 'cudos',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/cudos.svg',
    apis: {
      rpc: 'https://rpc.cosmos.directory/cudos',
      rest: 'https://rest.cosmos.directory/cudos',
      alternateRpc: 'http://mainnet-full-node-01.hosts.cudos.org:26657/',
      alternateRest: 'http://mainnet-full-node-01.hosts.cudos.org:1317/',
    },
    denom: 'CUDOS',
    txExplorer: {
      mainnet: {
        name: 'Big Dipper',
        txUrl: 'https://explorer.cudos.org/transactions',
        accountUrl: 'https://explorer.cudos.org/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'cudos',
    gasPriceStep: {
      low: 5000000000000,
      average: 10000000000000,
      high: 20000000000000,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      acudos: denoms.acudos,
    },
    theme: {
      primaryColor: '#29c1e2',
      gradient: 'linear-gradient(180deg, rgba(41, 193, 226,0.32) 0%, rgba(41, 193, 226, 0) 100%)',
    },
    enabled: true,
  },
  decentr: {
    chainId: 'mainnet-3',
    key: 'decentr',
    chainName: 'Decentr',
    chainRegistryPath: 'decentr',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/dec.png',
    apis: {
      rest: 'https://rest.cosmos.directory/decentr',
      rpc: 'https://rpc.cosmos.directory/decentr',
      // rpcTest: 'http://35.234.10.84:26657/',
      // restTest: 'http://35.234.10.84:1317/',
    },
    denom: 'DEC',
    txExplorer: {
      mainnet: {
        name: 'Atomscan',
        txUrl: 'https://atomscan.com/decentr/transactions',
        accountUrl: 'https://atomscan.com/decentr/accounts',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'decentr',
    gasPriceStep: {
      low: 0.025,
      average: 0.025,
      high: 0.035,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      udec: denoms.udec,
    },
    theme: {
      primaryColor: '#2596be',
      gradient: 'linear-gradient(180deg, rgba(37, 150, 190, 0.6) 0%, rgba(37, 150, 190, 0) 100%)',
    },
    enabled: true,
  },
  desmos: {
    chainId: 'desmos-mainnet',
    key: 'desmos',
    chainName: 'Desmos',
    chainRegistryPath: 'desmos',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/dsm.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/desmos',
      rest: 'https://rest.cosmos.directory/desmos',
    },
    denom: 'DSM',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/desmos/txs',
        accountUrl: 'https://www.mintscan.io/desmos/accounts',
      },
    },
    bip44: {
      coinType: '852',
    },
    addressPrefix: 'desmos',
    gasPriceStep: {
      low: 0.0025,
      average: 0.0035,
      high: 0.045,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      udsm: denoms.udsm,
    },
    theme: {
      primaryColor: '#fc9557',
      gradient: 'linear-gradient(180deg, rgba(252, 149, 87, 0.32) 0%, rgba(252, 149, 87, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  dydx: {
    chainId: 'dydx-mainnet-1',
    key: 'dydx',
    chainName: 'dYdX',
    chainRegistryPath: 'dydx',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/dydx.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/dydx',
      rest: 'https://rest.cosmos.directory/dydx',
    },
    denom: 'DYDX',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/dydx/txs',
        accountUrl: 'https://www.mintscan.io/dydx/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'dydx',
    gasPriceStep: {
      low: 12500000000,
      average: 12500000000,
      high: 20000000000,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      adydx: denoms.adydx,
    },
    theme: {
      primaryColor: '#5c5ade',
      gradient: 'linear-gradient(180deg, rgba(92, 90, 222, 0.32) 0%, rgba(92, 90, 222, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  dymension: {
    evmChainId: '1100',
    evmChainIdTestnet: '100',
    chainId: 'dymension_1100-1',
    key: 'dymension',
    chainName: 'Dymension',
    chainRegistryPath: 'dymension',
    testnetChainId: 'blumbus_111-1',
    testnetChainRegistryPath: 'dymension',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/dymension-logo.svg',
    apis: {
      rpc: 'https://leap-node-proxy.numia.xyz/dymension-rpc',
      rest: 'https://leap-node-proxy.numia.xyz/dymension-lcd',
      rpcTest: 'https://froopyland.blockpi.network/rpc/v1/0837569d56317f9a6af3c82170a7242ce8319ae4',
      restTest: 'https://froopyland.blockpi.network/lcd/v1/0837569d56317f9a6af3c82170a7242ce8319ae4',
    },
    denom: 'DYM',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://dym.fyi/tx',
        accountUrl: 'https://dym.fyi/address',
      },
      testnet: {
        name: 'Mintscan',
        txUrl: 'https://dym.fyi/tx',
        accountUrl: 'https://dym.fyi/address',
      },
    },
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'dym',
    gasPriceStep: {
      low: 20000000000,
      average: 20000000000,
      high: 20000000000,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      adym: denoms.adym,
      udym: denoms.udym,
    },
    theme: {
      primaryColor: '#c07c3f',
      gradient: 'linear-gradient(180deg, rgba(192, 124, 63, 0.32) 0%, rgba(192, 124, 63, 0) 100%)',
    },
    enabled: true,
  },
  emoney: {
    chainId: 'emoney-3',
    key: 'emoney',
    chainName: 'e-money',
    chainRegistryPath: 'emoney',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/ngm.png',
    apis: {
      rest: 'https://rest.cosmos.directory/emoney',
      rpc: 'https://rpc.cosmos.directory/emoney',
    },
    denom: 'NGM',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/emoney/txs/',
        accountUrl: 'https://www.mintscan.io/emoney/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'emoney',
    gasPriceStep: {
      low: 0.25,
      average: 0.25,
      high: 0.25,
    },
    ibcChannelIds: {
      cosmos: ['channel-1'],
      osmo: ['channel-0'],
      akash: ['channel-3'],
    },
    nativeDenoms: {
      ungm: denoms.ungm,
    },
    theme: {
      primaryColor: '#25949F',
      gradient: 'linear-gradient(180deg, rgba(37, 148, 159, 0.32) 0%, rgba(37, 148, 159, 0) 100%)',
    },
    enabled: true,
  },
  empowerchain: {
    chainId: 'empowerchain-1',
    key: 'empowerchain',
    chainName: 'EmpowerChain',
    chainRegistryPath: 'empowerchain',
    testnetChainId: 'circulus-1',
    testnetChainRegistryPath: 'empowertestnet',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/empower-testnet.png',
    apis: {
      rpc: 'https://rpc-empowerchain.ecostake.com:443',
      rest: 'https://rest-empowerchain.ecostake.com:443',
      rpcTest: 'https://empower-testnet-rpc.polkachu.com',
      restTest: 'https://empower-testnet-api.polkachu.com',
    },
    denom: 'MPWR',
    txExplorer: {
      mainnet: {
        name: 'ExploreMe',
        txUrl: 'https://empowerchain.exploreme.pro/transaction',
        accountUrl: 'https://empowerchain.exploreme.pro/account',
      },
      testnet: {
        name: 'Ping.Pub',
        txUrl: 'https://explorer.stavr.tech/empower/tx',
        accountUrl: 'https://explorer.stavr.tech/empower/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'empower',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      umpwr: denoms.umpwr,
    },
    theme: {
      primaryColor: '#066d1b',
      gradient: 'linear-gradient(180deg, rgba(6, 109, 27, 0.32) 0%, rgba(6, 109, 27, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  evmos: {
    evmChainId: '9001',
    chainId: 'evmos_9001-2',
    key: 'evmos',
    chainName: 'Evmos',
    chainRegistryPath: 'evmos',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/evmos.svg',
    apis: {
      rpc: 'https://rpc.cosmos.directory/evmos',
      rest: 'https://rest.cosmos.directory/evmos',
      evmJsonRpc: 'https://evmos-evm.publicnode.com',
    },
    denom: 'EVMOS',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/evmos/txs',
        accountUrl: 'https://www.mintscan.io/evmos/accounts',
      },
    },
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'evmos',
    gasPriceStep: {
      low: 80000000000,
      average: 80000000000,
      high: 100000000000,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      aevmos: denoms.aevmos,
    },
    theme: {
      primaryColor: '#ed4e33',
      gradient: 'linear-gradient(180deg, rgba(129, 91, 91, 0.32) 0%, rgba(129, 91, 91, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  fetchhub: {
    chainId: 'fetchhub-4',
    key: 'fetchhub',
    chainName: 'Fetch.ai',
    chainRegistryPath: 'fetchhub',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/fet.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/fetchhub',
      rest: 'https://rest.cosmos.directory/fetchhub',
    },
    denom: 'FET',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/fetchai/txs',
        accountUrl: 'https://www.mintscan.io/fetchai/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'fetch',
    gasPriceStep: {
      low: 2.5,
      average: 2.5,
      high: 3.5,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      afet: denoms.afet,
    },
    theme: {
      primaryColor: '#485E9C',
      gradient: 'linear-gradient(180deg, rgba(72, 94, 156, 0.32) 0%, rgba(72, 94, 156, 0) 100%)',
    },
    enabled: true,
  },
  gravitybridge: {
    chainId: 'gravity-bridge-3',
    key: 'gravitybridge',
    chainName: 'Gravity Bridge',
    chainRegistryPath: 'gravitybridge',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/grav.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/gravitybridge',
      rest: 'https://rest.cosmos.directory/gravitybridge',
    },
    denom: 'GRAV',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/gravity-bridge/txs',
        accountUrl: 'https://www.mintscan.io/gravity-bridge/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'gravity',
    gasPriceStep: {
      low: 0.001,
      average: 0.002,
      high: 0.035,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ugraviton: denoms.ugraviton,
    },
    theme: {
      primaryColor: '#2F5AB6',
      gradient: 'linear-gradient(180deg, rgba(47, 90, 182, 0.32) 0%, rgba(47, 90, 182, 0) 100%)',
    },
    enabled: true,
  },
  gitopia: {
    chainId: 'gitopia',
    key: 'gitopia',
    chainName: 'Gitopia',
    chainRegistryPath: 'gitopia',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/gitopia.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/gitopia',
      rest: 'https://rest.cosmos.directory/gitopia',
    },

    denom: 'LORE',
    txExplorer: {
      mainnet: {
        name: 'Ping.Pub',
        txUrl: 'https://ping.pub/gitopia/txs',
        accountUrl: 'https://ping.pub/gitopia/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'gitopia',
    gasPriceStep: {
      low: 0.001,
      average: 0.002,
      high: 0.035,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ulore: denoms.ulore,
    },
    theme: {
      primaryColor: '#6F4AB7',
      gradient: 'linear-gradient(180deg, rgba(111, 74, 183, 0.32) 0%, rgba(47, 90, 182, 0) 100%)',
    },
    enabled: true,
  },
  injective: {
    chainId: 'injective-1',
    testnetChainId: 'injective-888',
    evmChainId: '1',
    evmChainIdTestnet: '888',
    key: 'injective',
    chainName: 'Injective',
    chainRegistryPath: 'injective',
    testnetChainRegistryPath: 'injectivetestnet',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/inj.png',
    apis: {
      rest: 'https://injective-rest.publicnode.com',
      rpc: 'https://injective-rpc.publicnode.com',
      rpcTest: 'https://injective-testnet-rpc.polkachu.com',
      restTest: 'https://injective-testnet-api.polkachu.com',
    },
    denom: 'INJ',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/injective/txs',
        accountUrl: 'https://www.mintscan.io/injective/accounts',
      },
      testnet: {
        name: 'Nyancat',
        txUrl: 'https://nyancat.iobscan.io/#/',
        accountUrl: 'https://nyancat.iobscan.io/#/address',
      },
    },
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'inj',
    gasPriceStep: {
      low: 500000000,
      average: 700000000,
      high: 9000000000,
    },
    ibcChannelIds: {
      cosmos: ['channel-1'],
      persistence: ['channel-82'],
      osmo: ['channel-8'],
      juno: ['channel-78'],
      secret: ['channel-74'],
      axelar: ['channel-77'],
    },
    nativeDenoms: {
      inj: denoms.inj,
    },
    theme: {
      primaryColor: '#1EC7DA',
      gradient: 'linear-gradient(180deg, rgba(30, 199, 218, 0.32) 0%, rgba(30, 199, 218, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  irisnet: {
    chainId: 'irishub-1',
    key: 'irisnet',
    chainName: 'IRISnet',
    chainRegistryPath: 'irisnet',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/iris.png',
    apis: {
      rest: 'https://rest.cosmos.directory/irisnet',
      rpc: 'https://rpc.cosmos.directory/irisnet',
      // rpcTest: 'http://35.234.10.84:26657',
      // restTest: 'http://35.234.10.84:1317',
    },
    denom: 'IRIS',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/iris/txs/',
        accountUrl: 'https://www.mintscan.io/iris/accounts',
      },
      testnet: {
        name: 'Nyancat',
        txUrl: 'https://nyancat.iobscan.io/#/',
        accountUrl: 'https://nyancat.iobscan.io/#/address',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'iaa',
    gasPriceStep: {
      low: 0.2,
      average: 0.3,
      high: 0.4,
    },
    ibcChannelIds: {
      cosmos: ['channel-12'],
      osmo: ['channel-3'],
      akash: ['channel-11'],
      emoney: ['channel-23'],
    },
    nativeDenoms: {
      uiris: denoms.uiris,
    },
    theme: {
      primaryColor: '#804987',
      gradient: 'linear-gradient(180deg, rgba(128, 73, 135, 0.32) 0%, rgba(128, 73, 135, 0) 100%)',
    },
    enabled: true,
  },
  impacthub: {
    chainId: 'ixo-5',
    testnetChainId: 'pandora-8',
    key: 'impacthub',
    chainName: 'Ixo',
    chainRegistryPath: 'impacthub',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/ixo.png',
    apis: {
      rest: 'https://rest.cosmos.directory/impacthub',
      rpc: 'https://rpc.cosmos.directory/impacthub',
      rpcTest: 'https://testnet.ixo.earth/rpc',
      restTest: 'https://testnet.ixo.earth/rest',
    },
    denom: 'IXO',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/ixo/txs',
        accountUrl: 'https://www.mintscan.io/ixo/accounts',
      },
      testnet: {
        name: 'Pandora Explorer',
        txUrl: 'https://blockscan-pandora.ixo.earth/transactions',
        accountUrl: 'https://blockscan-pandora.ixo.earth/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'ixo',
    gasPriceStep: {
      low: 0.025,
      average: 0.04,
      high: 0.06,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      uixo: denoms.uixo,
    },
    theme: {
      primaryColor: '#00d2ff',
      gradient: 'linear-gradient(180deg, rgba(0, 210, 255, 0.32) 0%, rgba(0, 210, 255, 0) 100%)',
    },
    enabled: true,
  },
  initia: {
    chainId: 'initiation-1',
    testnetChainId: 'initiation-1',
    key: 'initia',
    chainName: 'Initia Testnet',
    chainRegistryPath: 'initia',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/initia.svg',
    apis: {
      restTest: 'https://lcd.initiation-1.initia.xyz',
      rpcTest: 'https://rpc-initia-testnet.whispernode.com',
    },
    denom: 'INIT',
    txExplorer: {
      testnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/initiation-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/initiation-1/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'init',
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      uinit: denoms.uinit,
    },
    theme: {
      primaryColor: '#0d9488',
      gradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  jackal: {
    chainId: 'jackal-1',
    key: 'jackal',
    chainName: 'Jackal',
    chainRegistryPath: 'jackal',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/jkl.png',
    apis: {
      rpc: 'https://rpc.jackalprotocol.com',
      rest: 'https://api.jackalprotocol.com',
    },
    denom: 'JKL',
    txExplorer: {
      mainnet: {
        name: 'Ping.Pub',
        txUrl: 'https://ping.pub/jackal/tx',
        accountUrl: 'https://ping.pub/jackal/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'jkl',
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.5,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ujkl: denoms.ujkl,
    },
    theme: {
      primaryColor: '#0a6496',
      gradient: 'linear-gradient(180deg, rgba(10, 100, 150, 0.32) 0%, rgba(10, 100, 150, 0) 100%)',
    },
    enabled: true,
  },
  juno: {
    chainId: 'juno-1',
    testnetChainId: 'uni-6',
    chainName: 'Juno',
    key: 'juno',
    chainRegistryPath: 'juno',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/juno.svg',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/juno/txs',
        accountUrl: 'https://www.mintscan.io/juno/accounts',
      },
      testnet: {
        name: 'NG Explorer',
        txUrl: 'https://testnet.juno.explorers.guru/transaction',
        accountUrl: 'https://testnet.juno.explorers.guru/account',
      },
    },
    apis: {
      rest: 'https://rest.cosmos.directory/juno',
      restTest: 'https://api.uni.junonetwork.io',
      rpc: 'https://rpc.cosmos.directory/juno',
      rpcTest: 'https://rpc.uni.junonetwork.io',
      alternateRpc: 'https://juno-rpc.stakely.io',
    },
    denom: 'JUNO',
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'juno',
    gasPriceStep: {
      low: 0.0025,
      average: 0.003,
      high: 0.004,
    },
    ibcChannelIds: {
      osmo: ['channel-0'],
      cosmos: ['channel-1'],
      secret: ['channel-48'],
    },
    nativeDenoms: {
      ujuno: denoms.ujuno,
      ujunox: denoms.ujunox,
    },
    theme: {
      primaryColor: '#FF7B7C',
      gradient: 'linear-gradient(180deg, rgb(255, 123, 124, 0.32) 0%, rgba(255, 123, 124, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  kava: {
    chainId: 'kava_2222-10',
    key: 'kava',
    chainName: 'Kava',
    chainRegistryPath: 'kava',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/kava.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/kava',
      rest: 'https://rest.cosmos.directory/kava',
    },
    denom: 'KAVA',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/kava/txs',
        accountUrl: 'https://www.mintscan.io/kava/accounts',
      },
    },
    bip44: {
      coinType: '459',
    },
    addressPrefix: 'kava',
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ukava: denoms.ukava,
    },
    theme: {
      primaryColor: '#ff433e',
      gradient: 'linear-gradient(180deg, rgba(255, 67, 62, 0.32) 0%, rgba(255, 67, 62, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_46,
  },
  kichain: {
    chainId: 'kichain-2',
    key: 'kichain',
    chainName: 'Ki',
    chainRegistryPath: 'kichain',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/xki.svg',
    apis: {
      rpc: 'https://rpc.cosmos.directory/kichain',
      rest: 'https://rest.cosmos.directory/kichain',
    },
    denom: 'XKI',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/ki-chain/txs',
        accountUrl: 'https://www.mintscan.io/ki-chain/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'ki',
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.05,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      uxki: denoms.uxki,
    },
    theme: {
      primaryColor: '#0000ff',
      gradient: 'linear-gradient(180deg, rgba(0, 0, 225, 0.32) 0%, rgba(0, 0, 225, 0) 100%)',
    },
    enabled: true,
  },
  kujira: {
    chainId: 'kaiyo-1',
    key: 'kujira',
    chainName: 'Kujira',
    chainRegistryPath: 'kujira',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/kujira-chain-logo.png',
    apis: {
      rest: 'https://rest.cosmos.directory/kujira',
      rpc: 'https://rpc.cosmos.directory/kujira',
      // rpcTest: 'http://35.234.10.84:26657/',
      // restTest: 'http://35.234.10.84:1317/',
    },
    denom: 'KUJI',
    txExplorer: {
      mainnet: {
        name: 'Kujira',
        txUrl: 'https://finder.kujira.app/kaiyo-1/tx',
        accountUrl: 'https://finder.kujira.network/kaiyo-1/address',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'kujira',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      ukuji: denoms.ukuji,
    },
    theme: {
      primaryColor: '#607D8B',
      gradient: 'linear-gradient(180deg, rgba(96, 125, 139, 0.32) 0%, rgba(96, 125, 139, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  kyve: {
    chainId: 'kyve-1',
    testnetChainId: 'kaon-1',
    key: 'kyve',
    chainName: 'KYVE',
    chainRegistryPath: 'kyve',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/kyve.svg',
    apis: {
      rest: 'https://api-eu-1.kyve.network',
      rpc: 'https://rpc-eu-1.kyve.network',
      restTest: 'https://api-eu-1.kaon.kyve.network',
      rpcTest: 'https://rpc-eu-1.kaon.kyve.network',
    },
    denom: 'KYVE',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/kyve/txs',
        accountUrl: 'https://www.mintscan.io/kyve/accounts',
      },
      testnet: {
        name: 'Mintscan',
        txUrl: 'https://testnet.mintscan.io/kyve-testnet/txs',
        accountUrl: 'https://testnet.mintscan.io/kyve-testnet/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'kyve',
    nativeDenoms: {
      ukyve: denoms.ukyve,
      tkyve: denoms.tkyve,
    },
    gasPriceStep: {
      low: 0.02,
      average: 0.03,
      high: 0.05,
    },
    enabled: true,
    ibcChannelIds: {},
    theme: {
      primaryColor: '#58C6B2',
      gradient: 'linear-gradient(180deg, rgba(24, 76, 97, 0.32) 0%, rgba(23, 41, 43, 0) 100%)',
    },
    cosmosSDK: CosmosSDK.Version_Point_46,
  },
  likecoin: {
    chainId: 'likecoin-mainnet-2',
    key: 'likecoin',
    chainName: 'LikeCoin',
    chainRegistryPath: 'likecoin',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/like.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/likecoin',
      rest: 'https://rest.cosmos.directory/likecoin',
    },
    denom: 'LIKE',
    txExplorer: {
      mainnet: {
        name: 'Big Dipper',
        txUrl: 'https://likecoin.bigdipper.live/transactions',
        accountUrl: 'https://likecoin.bigdipper.live/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'like',
    gasPriceStep: {
      low: 1,
      average: 10,
      high: 1000,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      nanolike: denoms.nanolike,
    },
    theme: {
      primaryColor: '#2E8191',
      gradient: 'linear-gradient(180deg, rgba(46, 129, 144, 0.32) 0%, rgba(46, 129, 144, 0) 100%)',
    },
    enabled: true,
  },
  mars: {
    chainId: 'mars-1',
    testnetChainId: 'ares-1',
    key: 'mars',
    chainName: 'Mars',
    chainRegistryPath: 'mars',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/mars_logo_colored.svg',
    apis: {
      rest: 'https://rest.marsprotocol.io',
      rpc: 'https://rpc.marsprotocol.io',
      rpcTest: 'https://testnet-rpc.marsprotocol.io',
      restTest: 'https://testnet-rest.marsprotocol.io',
    },
    denom: 'MARS',
    txExplorer: {
      mainnet: {
        name: 'Mars Explorer',
        txUrl: 'https://explorer.marsprotocol.io/transactions/',
        accountUrl: 'https://explorer.marsprotocol.io/accounts',
      },
      testnet: {
        name: 'Mars Explorer',
        txUrl: 'https://testnet-explorer.marsprotocol.io/transactions/',
        accountUrl: 'https://testnet-explorer.marsprotocol.io/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'mars',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      umars: denoms.umars,
    },
    theme: {
      primaryColor: '#1EC7DA',
      gradient: 'linear-gradient(180deg, rgba(30, 199, 218, 0.32) 0%, rgba(30, 199, 218, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_46,
  },
  mayachain: {
    chainId: 'mayachain-mainnet-v1',
    testnetChainId: '',
    key: 'mayachain',
    chainName: 'Maya Protocol',
    chainRegistryPath: 'mayachain',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/mayachain.png',
    apis: {
      rest: 'https://mayanode.mayachain.info',
      rpc: 'https://tendermint.mayachain.info',
    },
    denom: 'CACAO',
    txExplorer: {
      mainnet: {
        name: 'MayaScan',
        txUrl: 'https://www.mayascan.org/tx',
        accountUrl: 'https://www.mayascan.org/address',
      },
    },
    bip44: {
      coinType: '931',
    },
    addressPrefix: 'maya',
    gasPriceStep: { low: 1, average: 1, high: 1 },
    ibcChannelIds: {},
    nativeDenoms: {
      cacao: denoms.cacao,
    },
    theme: {
      primaryColor: '#419e7c',
      gradient: 'linear-gradient(180deg, rgba(65, 158, 124, 0.32) 0%, rgba(65, 158, 124, 0) 100%)',
    },
    enabled: true,
  },
  migaloo: {
    chainId: 'migaloo-1',
    key: 'migaloo',
    chainName: 'Migaloo',
    chainRegistryPath: 'migaloo',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/whitewhale.png',
    apis: {
      rest: 'https://rest.cosmos.directory/migaloo',
      rpc: 'https://rpc.cosmos.directory/migaloo',
      rpcTest: '',
      restTest: '',
      alternateRest: 'https://migaloo-api.kleomedes.network:443',
    },
    denom: 'WHALE',
    txExplorer: {
      mainnet: {
        name: 'Explorer Guru',
        txUrl: 'https://migaloo.explorers.guru/transaction',
        accountUrl: 'https://migaloo.explorers.guru/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'migaloo',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      uwhale: denoms.uwhale,
    },
    theme: {
      primaryColor: '#3dcd64',
      gradient: 'linear-gradient(180deg, rgba(61, 205, 100, 0.32) 0%, rgba(61, 205, 100, 0) 100%)',
    },
    enabled: true,
  },
  neutron: {
    chainId: 'neutron-1',
    testnetChainId: 'pion-1',
    key: 'neutron',
    chainName: 'Neutron',
    chainRegistryPath: 'neutron',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/neutron-logo.jpeg',
    apis: {
      rest: 'https://rest-kralum.neutron-1.neutron.org',
      restTest: 'https://rest-palvus.pion-1.ntrn.tech',
      rpc: 'https://rpc-kralum.neutron-1.neutron.org',
      rpcTest: 'https://rpc-palvus.pion-1.ntrn.tech',
    },
    denom: 'NTRN',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/neutron/txs',
        accountUrl: 'https://www.mintscan.io/neutron/accounts',
      },
      testnet: {
        name: 'Mintscan Testnet',
        txUrl: 'https://testnet.mintscan.io/neutron-testnet/txs',
        accountUrl: 'https://testnet.mintscan.io/neutron-testnet/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'neutron',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      untrn: denoms.untrn,
    },
    theme: {
      primaryColor: '#414B7D',
      gradient: 'linear-gradient(180deg, rgba(65, 75, 125, 0.32) 0%, rgba(65, 75, 125, 0) 100%)',
    },
    enabled: true,
  },
  nibiru: {
    chainId: 'cataclysm-1',
    testnetChainId: 'nibiru-testnet-1',
    key: 'nibiru',
    chainName: 'Nibiru Chain',
    chainRegistryPath: 'nibiru',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/nibiru.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/nibiru',
      rest: 'https://rest.cosmos.directory/nibiru',
      rpcTest: 'https://rpc.testnet-1.nibiru.fi',
      restTest: 'https://lcd.testnet-1.nibiru.fi',
    },
    denom: 'NIBI',
    txExplorer: {
      mainnet: {
        name: 'Nibiru Guru',
        txUrl: 'https://nibiru.explorers.guru/transaction',
        accountUrl: 'https://nibiru.explorers.guru/account',
      },
      testnet: {
        name: 'Ping.Pub',
        txUrl: 'https://ping.testnet.noble.strange.love/noble/tx',
        accountUrl: 'https://ping.testnet.noble.strange.love/noble/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'nibi',
    gasPriceStep: { low: 0.025, average: 0.05, high: 0.1 },
    ibcChannelIds: {},
    nativeDenoms: {
      unibi: denoms.unibi,
    },
    theme: {
      primaryColor: '#b589d4',
      gradient: 'linear-gradient(180deg, rgba(181, 137, 212, 0.32) 0%, rgba(181, 137, 212, 0) 100%)',
    },
    enabled: true,
  },
  noble: {
    chainId: 'noble-1',
    testnetChainId: 'grand-1',
    key: 'noble',
    chainName: 'Noble',
    chainRegistryPath: 'noble',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/noble-v2.png',
    apis: {
      rpc: 'https://rpc.mainnet.noble.strange.love',
      rest: 'https://rest.cosmos.directory/noble',
      rpcTest: 'https://rpc.testnet.noble.strange.love',
      restTest: 'https://api.testnet.noble.strange.love',
    },
    denom: 'USD',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/noble/tx',
        accountUrl: 'https://www.mintscan.io/noble/address',
      },
      testnet: {
        name: 'Mintscan Testnet',
        txUrl: 'https://testnet.mintscan.io/noble-testnet/txs',
        accountUrl: 'https://testnet.mintscan.io/noble-testnet/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'noble',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      usdc: denoms.usdc,
    },
    theme: {
      primaryColor: '#97b1f9',
      gradient: 'linear-gradient(180deg, rgba(151, 177, 249, 0.32) 0%, rgba(151, 177, 249, 0) 100%)',
    },
    enabled: true,
  },
  nolus: {
    chainId: 'pirin-1',
    key: 'nolus',
    chainName: 'Nolus',
    testnetChainId: 'nolus-rila',
    chainRegistryPath: 'nolus',
    testnetChainRegistryPath: 'nolustestnet',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/nolus.svg',
    apis: {
      rpc: 'https://rpc.cosmos.directory/nolus',
      rest: 'https://rest.cosmos.directory/nolus',
      rpcTest: 'https://net-rila.nolus.io:26657',
      restTest: 'https://net-rila.nolus.io:1317',
    },
    denom: 'NLS',
    txExplorer: {
      mainnet: {
        name: 'Explorer',
        txUrl: 'https://explorer.nolus.io/pirin-1/tx',
        accountUrl: 'https://explorer.nolus.io/pirin-1/account',
      },
      testnet: {
        name: 'Explorer rila',
        txUrl: 'https://explorer-rila.nolus.io/nolus-rila/tx',
        accountUrl: 'https://explorer-rila.nolus.io/rila-1/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'nolus',
    gasPriceStep: {
      low: 0.3,
      average: 0.4,
      high: 0.5,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      unls: denoms.unls,
    },
    theme: {
      primaryColor: '#305998',
      gradient: 'linear-gradient(180deg, rgba(48, 89, 152, 0.32) 0%, rgba(151, 177, 249, 0) 100%)',
    },
    enabled: true,
  },
  nomic: {
    chainId: 'nomic-stakenet-3',
    key: 'nomic',
    chainName: 'Nomic',
    chainRegistryPath: 'nomic',
    testnetChainId: 'nomic-testnet-4d',
    testnetChainRegistryPath: 'nomic',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/nomic-logo.svg',
    apis: {
      rpc: 'https://stakenet-rpc.nomic.io:2096',
      rest: 'https://app.nomic.io:8443',
      rpcTest: 'https://testnet-rpc.nomic.io:2096',
      restTest: 'https://testnet-api.nomic.io:8443',
    },
    denom: 'NOM',
    txExplorer: {},
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'nomic',
    gasPriceStep: { low: 0, average: 0, high: 0 },
    ibcChannelIds: {},
    nativeDenoms: {
      unom: denoms.unom,
    },
    theme: {
      primaryColor: '#6300ff',
      gradient: 'linear-gradient(180deg, rgba(99, 0, 255, 0.32) 0%, rgba(99, 0, 255, 0) 100%)',
    },
    enabled: true,
  },
  odin: {
    chainId: 'odin-mainnet-freya',
    key: 'odin',
    chainName: 'Odin Protocol',
    chainRegistryPath: 'odin',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/odin.png',
    apis: {
      rest: 'https://rest.cosmos.directory/odin',
      rpc: 'https://rpc.cosmos.directory/odin',
    },
    denom: 'ODIN',
    txExplorer: {
      mainnet: {
        name: 'ODIN Explorer',
        txUrl: 'https://mainnet.odinprotocol.io/transactions',
        accountUrl: 'https://mainnet.odinprotocol.io/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'odin',
    gasPriceStep: {
      low: 0.0125,
      average: 0.025,
      high: 0.03,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      loki: denoms.loki,
    },
    theme: {
      gradient: 'linear-gradient(180deg, rgba(113, 65, 191, 0.32) 0%, rgba(113, 65, 191, 0) 100%)',
      primaryColor: '#7141bf',
    },
    enabled: true,
  },
  omniflix: {
    chainId: 'omniflixhub-1',
    key: 'omniflix',
    chainName: 'OmniFlix',
    chainRegistryPath: 'omniflixhub',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/flix.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/omniflixhub',
      rest: 'https://rest.cosmos.directory/omniflixhub',
    },
    denom: 'FLIX',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/omniflix/txs',
        accountUrl: 'https://www.mintscan.io/omniflix/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'omniflix',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      uflix: denoms.uflix,
    },
    theme: {
      primaryColor: '#f90',
      gradient: 'linear-gradient(180deg, rgba(255, 153, 0, 0.32) 0%, rgba(255, 153, 0, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  onomy: {
    chainId: 'onomy-mainnet-1',
    // testnetChainId: '',
    key: 'onomy',
    chainName: 'Onomy',
    chainRegistryPath: 'onomy',
    chainSymbolImageUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/onomy',
      rest: 'https://rest.cosmos.directory/onomy',
      // rpcTest: '',
      // restTest: '',
    },
    denom: 'NOM',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/onomy-protocol/txs',
        accountUrl: 'https://www.mintscan.io/onomy-protocol/accounts',
      },
      // testnet: {
      //   name: '',
      //   txUrl: '',
      // },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'onomy',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      anom: denoms.anom,
    },
    theme: {
      primaryColor: '#353340',
      gradient: 'linear-gradient(180deg, rgba(53, 51, 64, 0.32) 0%, rgba(53, 51, 64, 0) 100%)',
    },
    enabled: true,
  },
  osmosis: {
    chainId: 'osmosis-1',
    testnetChainId: 'osmo-test-5',
    chainName: 'Osmosis',
    chainRegistryPath: 'osmosis',
    key: 'osmosis',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/osmo.svg',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/osmosis/txs',
        accountUrl: 'https://www.mintscan.io/osmosis/accounts',
      },
      testnet: {
        name: 'Mintscan Testnet',
        txUrl: 'https://testnet.mintscan.io/osmosis-testnet/txs',
        accountUrl: 'https://testnet.mintscan.io/osmosis-testnet/account',
      },
    },
    apis: {
      rest: 'https://rest.cosmos.directory/osmosis',
      restTest: 'https://lcd.osmotest5.osmosis.zone',
      rpc: 'https://rpc.cosmos.directory/osmosis',
      rpcTest: 'https://rpc.osmotest5.osmosis.zone',
    },
    denom: 'OSMO',
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'osmo',
    gasPriceStep: {
      low: 0.0025,
      average: 0.003,
      high: 0.004,
    },
    ibcChannelIds: {
      cosmos: ['channel-0'],
      juno: ['channel-42'],
      secret: ['channel-88'],
    },
    nativeDenoms: {
      uosmo: denoms.uosmo,
    },
    cosmosSDK: CosmosSDK.Version_Point_47,
    theme: {
      primaryColor: '#726FDC',
      gradient: 'linear-gradient(180deg, rgba(114, 111, 220, 0.32) 0%, rgba(114, 111, 220, 0) 100%)',
    },
    enabled: true,
  },
  passage: {
    chainId: 'passage-2',
    key: 'passage',
    chainName: 'Passage',
    chainRegistryPath: 'passage',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/pasg.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/passage',
      rest: 'https://rest.cosmos.directory/passage',
    },
    denom: 'PASG',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/passage/transactions',
        accountUrl: 'https://www.mintscan.io/passage/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'pasg',
    gasPriceStep: {
      low: 0.001,
      average: 0.0025,
      high: 0.01,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      upasg: denoms.upasg,
    },
    theme: {
      primaryColor: '#e2447b',
      gradient: 'linear-gradient(180deg, rgba(204, 99, 145) 0%, rgba(204, 99, 145, 0) 100%)',
    },
    enabled: true,
  },
  persistenceNew: {
    chainId: 'core-1',
    testnetChainId: 'test-core-1',
    key: 'persistenceNew',
    chainName: 'Persistence (New)',
    chainRegistryPath: 'persistence',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/xprt.png',
    apis: {
      rest: 'https://rest.cosmos.directory/persistence',
      rpc: 'https://rpc.cosmos.directory/persistence',
      rpcTest: 'https://persistence-testnet-rpc.allthatnode.com:26657',
      restTest: 'https://persistence-testnet-rpc.allthatnode.com:1317',
    },
    denom: 'XPRT',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/persistence/txs',
        accountUrl: 'https://www.mintscan.io/persistence/accounts',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'persistence',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {
      cosmos: ['channel-24'],
      osmo: ['channel-6'],
      akash: ['channel-4'],
      emoney: ['channel-36'],
      irisnet: ['channel-19'],
      juno: ['channel-37'],
    },
    nativeDenoms: {
      uxprt: denoms.uxprt,
    },
    theme: {
      primaryColor: '#C98688',
      gradient: 'linear-gradient(180deg, rgba(201, 134, 136, 0.32) 0%, rgba(201, 134, 136, 0) 100%)',
    },
    enabled: true,
  },
  persistence: {
    chainId: 'core-1',
    testnetChainId: 'test-core-1',
    key: 'persistence',
    chainName: 'Persistence (Old)',
    chainRegistryPath: 'persistence',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/xprt.png',
    apis: {
      rest: 'https://rest.cosmos.directory/persistence',
      rpc: 'https://rpc.cosmos.directory/persistence',
      rpcTest: 'https://persistence-testnet-rpc.allthatnode.com:26657',
      restTest: 'https://persistence-testnet-rpc.allthatnode.com:1317',
    },
    denom: 'XPRT',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/persistence/txs',
        accountUrl: 'https://www.mintscan.io/persistence/accounts',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '750',
    },
    addressPrefix: 'persistence',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {
      cosmos: ['channel-24'],
      osmo: ['channel-6'],
      akash: ['channel-4'],
      emoney: ['channel-36'],
      irisnet: ['channel-19'],
      juno: ['channel-37'],
    },
    nativeDenoms: {
      uxprt: denoms.uxprt,
    },
    theme: {
      primaryColor: '#C98688',
      gradient: 'linear-gradient(180deg, rgba(201, 134, 136, 0.32) 0%, rgba(201, 134, 136, 0) 100%)',
    },
    enabled: true,
  },
  composable: {
    chainId: 'centauri-1',
    key: 'composable',
    chainName: 'Picasso',
    chainRegistryPath: 'composable',
    // testnetChainId: 'banksy-testnet-3',
    // testnetChainRegistryPath: 'composabletestnet',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/pica.svg',
    apis: {
      rpc: 'https://rpc.cosmos.directory/composable',
      rest: 'https://rest.cosmos.directory/composable',
      // rpcTest: 'https://rpc.cosmos.directory/composabletestnet',
      // restTest: 'https://rest.cosmos.directory/composabletestnet',
    },
    denom: 'PICA',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://explorer.nodestake.top/composable/tx',
        accountUrl: 'https://explorer.nodestake.top/composable/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'pica',
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.04,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ppica: denoms.ppica,
    },
    theme: {
      primaryColor: '#6156ff',
      gradient: 'linear-gradient(180deg, rgba(97, 86, 255, 0.32) 0%, rgba(254, 116, 138, 0) 100%)',
    },
    enabled: true,
  },
  planq: {
    chainId: 'planq_7070-2',
    testnetChainId: 'planq_7000-4',
    key: 'planq',
    chainName: 'Planq',
    chainRegistryPath: 'planq',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/planq.svg',
    apis: {
      rest: 'https://rest.cosmos.directory/planq',
      rpc: 'https://rpc.cosmos.directory/planq',
      evmJsonRpc: 'https://evm-rpc.planq.network',
    },
    denom: 'PLQ',
    gasPriceStep: {
      low: 20000000000,
      average: 25000000000,
      high: 30000000000,
    },
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://explorer.planq.network/transactions/',
        accountUrl: 'https://explorer.planq.network/accounts',
      },
    },
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'plq',
    ibcChannelIds: {
      osmo: ['channel-492'],
    },
    nativeDenoms: {
      aplanq: denoms.aplanq,
    },
    theme: {
      primaryColor: '#8c6af6',
      gradient: 'linear-gradient(180deg, rgba(140, 106, 246, 0.32) 0%, rgba(140, 106, 246, 0) 100%)',
    },
    enabled: true,
  },
  provenance: {
    chainId: 'pio-mainnet-1',
    key: 'provenance',
    chainName: 'Provenance',
    chainRegistryPath: 'provenance',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/provenance.svg',
    apis: {
      rest: 'https://rest.cosmos.directory/provenance',
      rpc: 'https://rpc.cosmos.directory/provenance',
    },
    denom: 'HASH',
    gasPriceStep: {
      low: 1905,
      average: 1905,
      high: 2500,
    },
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/provenance/txs',
        accountUrl: 'https://www.mintscan.io/provenance/accounts',
      },
    },
    bip44: {
      coinType: '505',
    },
    addressPrefix: 'pb',
    ibcChannelIds: {},
    nativeDenoms: {
      nhash: denoms.nhash,
    },
    theme: {
      primaryColor: '#4e7fdc',
      gradient: 'linear-gradient(180deg, rgba(78, 127, 220, 0.32) 0%, rgba(78, 127, 220, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_46,
  },
  pryzmtestnet: {
    chainId: 'pryzm-1',
    testnetChainId: 'indigo-1',
    key: 'pryzmtestnet',
    chainName: 'Pryzm',
    chainRegistryPath: 'pryzm',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/pryzm.svg',
    apis: {
      rest: 'https://api.pryzm.nodestake.org',
      rpc: 'https://rpc.pryzm.nodestake.org',
      restTest: 'https://testnet-api.pryzm.zone',
      rpcTest: 'https://testnet-rpc.pryzm.zone',
    },
    denom: 'PRYZM',
    txExplorer: {
      mainnet: {
        name: 'CosmosRun',
        txUrl: 'https://cosmosrun.info/pryzm/tx',
        accountUrl: 'https://cosmosrun.info/pryzm/account',
      },
      testnet: {
        name: 'CosmosRun',
        txUrl: 'https://testnets.cosmosrun.info/pryzm-indigo-1/tx',
        accountUrl: 'https://testnets.cosmosrun.info/pryzm-indigo-1/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'pryzm',
    gasPriceStep: {
      low: 0.015,
      average: 0.025,
      high: 0.04,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      upryzm: denoms.upryzm,
    },
    theme: {
      primaryColor: '#8293de',
      gradient: 'linear-gradient(180deg, rgba(130, 147, 222, 0.32) 0%, rgba(130, 147, 222, 0) 100%)',
    },
    enabled: true,
    cosmosSDK: CosmosSDK.Version_Point_47,
  },
  quasar: {
    chainId: 'quasar-1',
    testnetChainId: 'qsr-questnet-04',
    key: 'quasar',
    chainName: 'Quasar',
    chainRegistryPath: 'quasar',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/quasar.png',
    apis: {
      rest: 'https://quasar-api.polkachu.com',
      rpc: 'https://quasar-rpc.polkachu.com',
      restTest: 'https://quasar-testnet-api.polkachu.com',
      rpcTest: 'https://quasar-testnet-rpc.polkachu.com',
    },
    denom: 'QSR',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/quasar/txs',
        accountUrl: 'https://www.mintscan.io/quasar/accounts',
      },
      testnet: {
        name: 'Mintscan Testnet',
        txUrl: 'https://testnet.mintscan.io/quasar-testnet/txs',
        accountUrl: 'https://testnet.mintscan.io/quasar-testnet/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'quasar',
    gasPriceStep: { low: 0.01, average: 0.01, high: 0.02 },
    ibcChannelIds: {},
    nativeDenoms: {
      uqsr: denoms.uqsr,
    },
    theme: {
      primaryColor: '#8c6af6',
      gradient: 'linear-gradient(180deg, rgba(140, 106, 246, 0.32) 0%, rgba(140, 106, 246, 0) 100%)',
    },
    enabled: true,
  },
  quicksilver: {
    chainId: 'quicksilver-2',
    key: 'quicksilver',
    chainRegistryPath: 'quicksilver',
    chainName: 'Quicksilver',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/qck.png',
    apis: {
      rest: 'https://rest.cosmos.directory/quicksilver',
      rpc: 'https://rpc.cosmos.directory/quicksilver',
    },
    denom: 'QCK',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/quicksilver/txs',
        accountUrl: 'https://www.mintscan.io/quicksilver/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'quick',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      uqck: denoms.uqck,
    },
    theme: {
      primaryColor: '#727272',
      gradient: 'linear-gradient(180deg, rgba(114, 114, 114, 0.32) 0%, rgba(114, 114, 114, 0) 100%)',
    },
    enabled: true,
  },
  saga: {
    chainId: 'ssc-1',
    chainName: 'Saga',
    chainRegistryPath: 'saga',
    key: 'saga',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/saga.svg',
    bip44: {
      coinType: '118',
    },
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/saga/txs',
        accountUrl: 'https://www.mintscan.io/saga/accounts',
      },
    },
    apis: {
      rest: 'https://ssc-lcd.sagarpc.io',
      rpc: 'https://ssc-rpc.sagarpc.io',
    },
    denom: 'SAGA',
    addressPrefix: 'saga',
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      usaga: denoms.usaga,
    },
    theme: {
      gradient: 'linear-gradient(180deg, rgba(50, 129, 250, 0.32) 0%, rgba(50, 129, 250, 0) 100%)',
      primaryColor: '#3281fa',
    },
    enabled: true,
  },
  secret: {
    chainId: 'secret-4',
    testnetChainId: 'pulsar-3',
    chainName: 'Secret Network',
    chainRegistryPath: 'secretnetwork',
    key: 'secret',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/scrt.svg',
    bip44: {
      coinType: '529',
    },
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/secret/txs',
        accountUrl: 'https://www.mintscan.io/secret/accounts',
      },
    },
    apis: {
      rest: 'https://lcd.secret.express',
      restTest: 'https://api.pulsar3.scrttestnet.com',
      rpc: 'https://rpc.secret.express',
      rpcTest: 'https://rpc.pulsar3.scrttestnet.com',
      grpc: 'https://secret-4.api.trivium.network:9091',
      grpcTest: 'https://grpc.pulsar3.scrttestnet.com',
    },
    denom: 'SCRT',
    addressPrefix: 'secret',
    gasPriceStep: {
      low: 0.15,
      average: 0.25,
      high: 0.3,
    },
    ibcChannelIds: {
      cosmos: ['channel-0'],
      osmo: ['channel-1'],
      juno: ['channel-8'],
    },
    nativeDenoms: {
      uscrt: denoms.uscrt,
    },
    theme: {
      primaryColor: '#6896c7',
      gradient: 'linear-gradient(180deg, rgba(104, 150, 199, 0.32) 0%, rgba(104, 150, 199, 0) 100%)',
    },
    enabled: true,
  },
  sei: {
    chainId: 'atlantic-1',
    testnetChainId: 'atlantic-1',
    key: 'sei',
    chainName: 'Sei (Atlantic 1)',
    chainRegistryPath: 'atlantic',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/sei.png',
    apis: {
      // rest: 'https://lcd.injective.network',
      // rpc: 'https://tm.injective.network',
      restTest: 'https://rest-sei-test.ecostake.com',
      rpcTest: 'https://rpc-sei-test.ecostake.com',
    },
    denom: 'SEI',
    txExplorer: {
      testnet: {
        name: 'Explorers Guru',
        txUrl: 'https://sei.explorers.guru/transaction',
        accountUrl: 'https://sei.explorers.guru/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'sei',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      usei: denoms.usei,
    },
    theme: {
      primaryColor: '#AF3450',
      gradient: 'linear-gradient(180deg, rgba(175, 52, 80, 0.32) 0%, rgba(175, 52, 80, 0) 100%)',
    },
    enabled: false,
  },
  seiTestnet2: {
    evmChainId: '1329',
    evmChainIdTestnet: '1328',
    chainId: 'pacific-1',
    testnetChainId: 'atlantic-2',
    key: 'seiTestnet2',
    chainName: 'Sei',
    chainRegistryPath: 'sei',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/sei.png',
    apis: {
      rpc: 'https://rpc.wallet.pacific-1.sei.io',
      rest: 'https://rest.wallet.pacific-1.sei.io',
      rpcTest: 'https://rpc.wallet.atlantic-2.sei.io', // ['https://rpc-testnet.sei-apis.com', 'https://rpc.atlantic-2.seinetwork.io'];
      restTest: 'https://rest.wallet.atlantic-2.sei.io',
      alternateRpcTest: 'https://sei-testnet-rpc.polkachu.com',
      alternateRestTest: 'https://sei-testnet-api.polkachu.com',
      evmJsonRpc: 'https://evm-rpc.sei-apis.com',
      evmJsonRpcTest: 'https://evm-rpc-testnet.sei-apis.com',
    },
    denom: 'SEI',
    txExplorer: {
      mainnet: {
        name: 'Seitrace',
        txUrl: 'https://seitrace.com/tx/PLACEHOLDER_FOR_TX_HASH?chain=pacific-1',
        accountUrl: 'https://seitrace.com/address/PLACEHOLDER_FOR_WALLET_ADDRESS?chain=pacific-1',
      },
      testnet: {
        name: 'Seitrace',
        txUrl: 'https://seitrace.com/tx/PLACEHOLDER_FOR_TX_HASH?chain=atlantic-2',
        accountUrl: 'https://seitrace.com/address/PLACEHOLDER_FOR_WALLET_ADDRESS?chain=atlantic-2',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'sei',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      usei: denoms.usei,
    },
    theme: {
      primaryColor: '#AF3450',
      gradient: 'linear-gradient(180deg, rgba(175, 52, 80, 0.32) 0%, rgba(175, 52, 80, 0) 100%)',
    },
    enabled: true,
  },
  seiDevnet: {
    evmChainId: '713715',
    chainId: 'arctic-1',
    testnetChainId: '',
    key: 'seiDevnet',
    chainName: 'Sei Devnet (Arctic-1)',
    chainRegistryPath: 'seiDevnet',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/sei.png',
    apis: {
      rpc: 'https://rpc-arctic-1.sei-apis.com',
      alternateRpc: 'https://rpc.wallet.arctic-1.sei.io',
      rest: 'https://rest-arctic-1.sei-apis.com',
      alternateRest: 'https://rest.wallet.arctic-1.sei.io',
      evmJsonRpc: 'https://evm-rpc-arctic-1.sei-apis.com',
    },
    denom: 'SEI',
    txExplorer: {
      mainnet: {
        name: 'Seitrace',
        txUrl: 'https://seitrace.com/tx/PLACEHOLDER_FOR_TX_HASH?chain=arctic-1',
        accountUrl: 'https://seitrace.com/address/PLACEHOLDER_FOR_WALLET_ADDRESS?chain=arctic-1',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'sei',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      usei: denoms.usei,
    },
    theme: {
      primaryColor: '#AF3450',
      gradient: 'linear-gradient(180deg, rgba(175, 52, 80, 0.32) 0%, rgba(175, 52, 80, 0) 100%)',
    },
    enabled: true,
  },
  sentinel: {
    chainId: 'sentinelhub-2',
    key: 'sentinel',
    chainName: 'Sentinel',
    chainRegistryPath: 'sentinel',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/sentinel.svg',
    apis: {
      rest: 'https://rest.cosmos.directory/sentinel',
      rpc: 'https://rpc.cosmos.directory/sentinel',
    },
    denom: 'DVPN',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/sentinel/tx',
        accountUrl: 'https://www.mintscan.io/sentinel/accounts',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'sent',
    gasPriceStep: {
      low: 0.1,
      average: 0.25,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      udvpn: denoms.udvpn,
    },
    theme: {
      primaryColor: '#0fa0ec',
      gradient: 'linear-gradient(180deg, rgba(15, 160, 236, 0.32) 0%, rgba(15, 160, 236, 0) 100%)',
    },
    enabled: true,
  },
  sge: {
    chainId: 'sgenet-1',
    key: 'sge',
    chainName: 'SGE',
    chainRegistryPath: 'sge',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/sge.svg',
    apis: {
      rest: 'https://rest.cosmos.directory/sge',
      rpc: 'https://rpc.cosmos.directory/sge',
    },
    denom: 'SGE',
    txExplorer: {
      mainnet: {
        name: 'NodeStake',
        txUrl: 'https://explorer.nodestake.top/sge/tx',
        accountUrl: 'https://explorer.nodestake.top/sge/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'sge',
    gasPriceStep: {
      low: 0.001,
      average: 0.02,
      high: 0.04,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      usge: denoms.usge,
    },
    theme: {
      primaryColor: '#c9ab67',
      gradient: 'linear-gradient(180deg, rgba(201, 171, 103, 0.32) 0%, rgba(201, 171, 103, 0) 100%)',
    },
    enabled: true,
  },
  sifchain: {
    chainId: 'sifchain-1',
    key: 'sifchain',
    chainName: 'Sifchain',
    chainRegistryPath: 'sifchain',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/rowan.png',
    apis: {
      rest: 'https://rest.cosmos.directory/sifchain',
      rpc: 'https://rpc.cosmos.directory/sifchain',
      // rpcTest: 'https://rpc-testnet.sifchain.finance',
      // restTest: 'https://api-testnet.sifchain.finance',
    },
    denom: 'ROWAN',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/sifchain/txs',
        accountUrl: 'https://www.mintscan.io/sifchain/accounts',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'sif',
    gasPriceStep: {
      low: 1200000000000,
      average: 1800000000000,
      high: 2400000000000,
    },
    ibcChannelIds: {
      cosmos: ['channel-0'],
      iaa: ['channel-8'],
      akash: ['channel-2'],
      persistence: ['channel-7'],
      osmo: ['channel-17'],
      juno: ['channel-14'],
      stars: ['channel-57'],
      emoney: ['channel-19'],
    },
    nativeDenoms: {
      rowan: denoms.rowan,
    },
    theme: {
      primaryColor: '#DABE5D',
      gradient: 'linear-gradient(180deg, rgba(218, 190, 93, 0.32) 0%, rgba(218, 190, 93, 0) 100%)',
    },
    enabled: true,
  },
  sommelier: {
    chainId: 'sommelier-3',
    key: 'sommelier',
    chainName: 'Sommelier',
    chainRegistryPath: 'sommelier',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/somm.png',
    apis: {
      rest: 'https://rest.cosmos.directory/sommelier',
      rpc: 'https://rpc.cosmos.directory/sommelier',
      // rpcTest: 'http://35.234.10.84:26657/',
      // restTest: 'http://35.234.10.84:1317/',
    },
    denom: 'SOMM',
    txExplorer: {
      mainnet: {
        name: 'Atomscan',
        txUrl: 'https://www.atomscan.com/sommelier/transactions',
        accountUrl: 'https://atomscan.com/sommelier/accounts',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'somm',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      usomm: denoms.usomm,
    },
    theme: {
      primaryColor: '#8B20E9',
      gradient: 'linear-gradient(180deg, rgba(139, 32, 233, 0.32) 0%, rgba(139, 32, 233, 0) 100%)',
    },
    enabled: true,
  },
  stargaze: {
    chainId: 'stargaze-1',
    testnetChainId: 'elgafar-1',
    key: 'stargaze',
    chainName: 'Stargaze',
    chainRegistryPath: 'stargaze',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/stars.png',
    apis: {
      rest: 'https://rest.cosmos.directory/stargaze',
      rpc: 'https://rpc.cosmos.directory/stargaze',
      rpcTest: 'https://rpc.elgafar-1.stargaze-apis.com',
      restTest: 'https://rest.elgafar-1.stargaze-apis.com',
    },
    denom: 'STARS',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/stargaze/txs/',
        accountUrl: 'https://www.mintscan.io/stargaze/accounts',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'stars',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {
      cosmos: ['channel-19'],
      osmo: ['channel-0'],
      juno: ['channel-5'],
      secret: ['channel-18'],
      axelar: ['channel-50'],
    },
    nativeDenoms: {
      ustars: denoms.ustars,
    },
    theme: {
      primaryColor: '#2991D7',
      gradient: 'linear-gradient(180deg, rgba(41, 145, 215, 0.32) 0%, rgba(41, 145, 215, 0) 100%)',
    },
    enabled: true,
  },
  starname: {
    chainId: 'iov-mainnet-ibc',
    key: 'starname',
    chainName: 'Starname',
    chainRegistryPath: 'starname',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/iov.svg',
    apis: {
      rest: 'https://rest.cosmos.directory/starname',
      rpc: 'https://rpc.cosmos.directory/starname',
      // rpcTest: 'http://35.234.10.84:26657/',
      // restTest: 'http://35.234.10.84:1317/',
    },
    denom: 'IOV',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/starname/txs',
        accountUrl: 'https://www.mintscan.io/starname/accounts',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '234',
    },
    addressPrefix: 'star',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {
      cosmos: ['channel-0'],
      iaa: ['channel-19'],
      akash: ['channel-6'],
      osmo: ['channel-2'],
      persistence: ['channel-13'],
      sif: ['channel-18'],
    },
    nativeDenoms: {
      uiov: denoms.uiov,
    },
    theme: {
      primaryColor: '#5C67B0',
      gradient:
        'linear-gradient(180deg, rgba(92, 103, 176, 0.32) 0%, rgba(92, 103, 176, 0) 99.99%, rgba(249, 51, 40, 0) 100%)',
    },
    enabled: true,
  },
  stride: {
    chainId: 'stride-1',
    key: 'stride',
    chainName: 'Stride',
    chainRegistryPath: 'stride',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/strd.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/stride',
      rest: 'https://rest.cosmos.directory/stride',
    },
    denom: 'STRD',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/stride/tx',
        accountUrl: 'https://www.mintscan.io/stride/address',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'stride',
    gasPriceStep: {
      low: 0.0,
      average: 0.025,
      high: 0.04,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ustrd: denoms.ustrd,
    },
    theme: {
      primaryColor: '#E91179',
      gradient: 'linear-gradient(180deg, rgba(233, 17, 121, 0.32) 0%, rgba(233, 17, 121, 0) 100%)',
    },
    enabled: true,
  },
  teritori: {
    chainId: 'teritori-1',
    key: 'teritori',
    chainName: 'Teritori',
    chainRegistryPath: 'teritori',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/teritori.png',
    apis: {
      rpc: 'https://rpc.cosmos.directory/teritori',
      rest: 'https://rest.cosmos.directory/teritori',
    },
    denom: 'TORI',
    txExplorer: {
      mainnet: {
        name: 'Teritori Explorer',
        txUrl: 'https://explorer.teritori.com/teritori/tx',
        accountUrl: 'https://explorer.teritori.com/teritori/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'tori',
    gasPriceStep: {
      low: 0.001,
      average: 0.025,
      high: 0.5,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      utori: denoms.utori,
    },
    theme: {
      primaryColor: '#26c0fc',
      gradient: 'linear-gradient(180deg, rgba(38, 192, 252, 0.32) 0%, rgba(38, 192, 252, 0) 100%)',
    },
    enabled: true,
  },
  terra: {
    chainId: 'phoenix-1',
    // testnetChainId: 'pisco-1',
    key: 'terra',
    chainRegistryPath: 'terra2',
    chainName: 'Terra 2.0',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/luna.png',
    apis: {
      rest: 'https://phoenix-lcd.terra.dev',
      rpc: 'https://rpc.cosmos.directory/terra2',
      // rpcTest: 'https://rpc.cosmos.directory/terra',
      // restTest: 'https://pisco-lcd.terra.dev',
    },
    denom: 'LUNA',
    txExplorer: {
      mainnet: {
        name: 'Terra Finder',
        txUrl: 'https://finder.station.money/mainnet/tx',
        accountUrl: 'https://finder.station.money/mainnet/address',
      },
      // testnet: {
      //   name: 'Terra Finder',
      //   txUrl: 'https://finder.terra.money/testnet/tx',
      // },
    },
    bip44: {
      coinType: '330',
    },
    addressPrefix: 'terra',
    gasPriceStep: {
      low: 0.15,
      average: 0.25,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      uluna: denoms.uluna,
    },

    theme: {
      primaryColor: '#29A874',
      gradient: 'linear-gradient(180deg, rgba(41, 168, 116, 0.32) 0%, rgba(41, 168, 116, 0) 100%)',
    },
    enabled: true,
  },
  thorchain: {
    chainId: 'thorchain-1',
    key: 'thorchain',
    chainName: 'THORChain',
    chainRegistryPath: 'thorchain',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/thorchain.svg',
    apis: {
      rest: 'https://thornode.thorchain.liquify.com',
      rpc: 'https://rpc.ninerealms.com',
    },
    denom: 'RUNE',
    txExplorer: {
      mainnet: {
        name: 'ViewBlock',
        txUrl: 'https://viewblock.io/thorchain/tx',
        accountUrl: 'https://viewblock.io/thorchain/address',
      },
    },
    bip44: {
      coinType: '931',
    },
    addressPrefix: 'thor',
    gasPriceStep: { low: 2, average: 2, high: 2 },
    ibcChannelIds: {},
    nativeDenoms: {
      cacao: denoms.cacao,
    },
    theme: {
      primaryColor: '#1fc2a7',
      gradient: 'linear-gradient(180deg, rgba(31, 194, 167, 0.32) 0%, rgba(31, 194, 167, 0) 100%)',
    },
    enabled: true,
  },
  umee: {
    chainId: 'umee-1',
    key: 'umee',
    chainName: 'umee',
    chainRegistryPath: 'umee',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/umee.png',
    apis: {
      rest: 'https://rest.cosmos.directory/umee',
      rpc: 'https://rpc.cosmos.directory/umee',
      // rpcTest: 'http://35.234.10.84:26657/',
      // restTest: 'http://35.234.10.84:1317/',
    },
    denom: 'UMEE',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/umee/txs',
        accountUrl: 'https://www.mintscan.io/umee/accounts',
      },
      // testnet: {
      //   name: 'Nyancat',
      //   txUrl: 'https://nyancat.iobscan.io/#/',
      // },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'umee',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {
      cosmos: ['channel-1'],
      akash: ['channel-5'],
      osmo: ['channel-0'],
      juno: ['channel-2'],
      stars: ['channel-14'],
      sif: ['channel-6'],
    },
    nativeDenoms: {
      uumee: denoms.uumee,
    },
    theme: {
      primaryColor: '#6DECEA',
      gradient: 'linear-gradient(180deg, rgba(109, 236, 234, 0.32) 0%, rgba(109, 236, 234, 0) 100%)',
    },
    enabled: true,
  },
  xpla: {
    chainId: 'dimension_37-1',
    key: 'xpla',
    chainName: 'XPLA',
    chainRegistryPath: 'xpla',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/xpla.svg',
    apis: {
      rest: 'https://rest.cosmos.directory/xpla',
      rpc: 'https://rpc.cosmos.directory/xpla',
    },
    denom: 'XPLA',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/xpla/txs',
        accountUrl: 'https://www.mintscan.io/xpla/accounts',
      },
    },
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'xpla',
    gasPriceStep: {
      low: 850000000000,
      average: 1147500000000,
      high: 1487500000000,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      axpla: denoms.axpla,
    },
    theme: {
      primaryColor: '#00b1ff',
      gradient: 'linear-gradient(180deg, rgba(0, 177, 255, 0.32) 0%, rgba(0, 177, 255, 0) 100%)',
    },
    enabled: true,
  },
  humans: {
    chainId: 'humans_1089-1',
    chainName: 'Humans.ai',
    key: 'humans',
    chainRegistryPath: 'humans',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/humans.png',
    apis: {
      rest: 'https://rest.cosmos.directory/humans',
      rpc: 'https://rpc.cosmos.directory/humans',
    },
    denom: 'HEART',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/humans/tx',
        accountUrl: 'https://www.mintscan.io/humans/accounts',
      },
    },
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'human',
    gasPriceStep: {
      low: 80000000000,
      average: 100000000000,
      high: 160000000000,
    },
    ibcChannelIds: {
      osmo: ['channel-4'],
    },
    nativeDenoms: {
      aheart: denoms.aheart,
    },
    theme: {
      gradient: 'linear-gradient(180deg, rgba(50, 129, 250, 0.32) 0%, rgba(50, 129, 250, 0) 100%)',
      primaryColor: '#3281fa',
    },
    enabled: true,
  },
  lava: {
    chainId: 'lava-mainnet-1',
    testnetChainId: 'lava-testnet-2',
    key: 'lava',
    chainName: 'Lava',
    chainRegistryPath: 'lava',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/lava.png',
    apis: {
      rest: 'https://lava.rest.lava.build',
      rpc: 'https://lava.tendermintrpc.lava.build',
      restTest: 'https://public-rpc-testnet2.lavanet.xyz:443/rest',
      rpcTest: 'https://public-rpc-testnet2.lavanet.xyz:443/rpc',
    },
    denom: 'LAVA',
    txExplorer: {
      mainnet: {
        name: 'w3coins',
        txUrl: 'https://lava-explorer.w3coins.io/Lava/tx',
        accountUrl: 'https://lava-explorer.w3coins.io/Lava/account',
      },
      testnet: {
        name: 'Explorers Guru',
        txUrl: 'https://testnet.lava.explorers.guru/transaction',
        accountUrl: 'https://testnet.lava.explorers.guru/account',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'lava@',
    gasPriceStep: {
      low: 0.00002,
      average: 0.025,
      high: 0.05,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      ulava: denoms.ulava,
    },
    theme: {
      primaryColor: '#EF8107',
      gradient: 'linear-gradient(180deg, rgba(239, 129, 7, 0.32) 0%, rgba(0, 177, 255, 0) 100%)',
    },
    enabled: true,
  },
  mantra: {
    chainId: 'mantra-1',
    testnetChainId: 'mantra-dukong-1',
    chainName: 'MANTRA',
    apis: {
      rest: 'https://rest.cosmos.directory/mantrachain',
      rpc: 'https://rpc.cosmos.directory/mantrachain',
      restTest: 'https://rest.testcosmos.directory/mantrachaintestnet2',
      rpcTest: 'https://rpc.testcosmos.directory/mantrachaintestnet2',
    },
    chainSymbolImageUrl: 'https://assets.leapwallet.io/mantra.png',
    testnetChainRegistryPath: 'mantrachaintestnet2',
    chainRegistryPath: 'mantrachain',
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'mantra',
    txExplorer: {
      mainnet: {
        name: 'MANTRACHAIN',
        txUrl: 'https://explorer.mantrachain.io/mantra/tx',
        accountUrl: 'https://explorer.mantrachain.io/mantra/account',
      },
      testnet: {
        name: 'MANTRACHAIN',
        txUrl: 'https://explorer.mantrachain.io/MANTRA-Dukong/tx',
        accountUrl: 'https://explorer.mantrachain.io/MANTRA-Dukong/account',
      },
    },
    theme: {
      gradient: 'linear-gradient(180deg, rgba(50, 129, 250, 0.32) 0%, rgba(50, 129, 250, 0) 100%)',
      primaryColor: '#3281fa',
    },
    key: 'mantra',
    nativeDenoms: {
      uom: denoms.uom,
    },
    ibcChannelIds: {},
    denom: 'OM',
    gasPriceStep: {
      low: 0.01,
      average: 0.02,
      high: 0.03,
    },
    enabled: true,
  },
  ethereum: {
    chainId: '1',
    evmChainId: '1',
    key: 'ethereum',
    chainName: 'Ethereum',
    chainRegistryPath: 'ethereum',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/eth.png',
    apis: {
      rpc: 'https://mainnet.infura.io/v3/37b42f2d421b43f481788b4e18807191',
      evmJsonRpc: 'https://mainnet.infura.io/v3/37b42f2d421b43f481788b4e18807191',
    },
    denom: 'ETH',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'ethereum',
    txExplorer: {
      mainnet: {
        name: 'Etherscan',
        txUrl: 'https://etherscan.io/tx',
        accountUrl: 'https://etherscan.io/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      wei: denoms.wei,
    },
    theme: {
      primaryColor: '#343434',
      gradient: 'linear-gradient(180deg, rgba(52, 52, 52, 0.32) 0%, rgba(52, 52, 52, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
  forma: {
    chainId: '984122',
    evmChainId: '984122',
    key: 'forma',
    chainName: 'Forma',
    chainRegistryPath: 'forma',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/forma-1.png',
    apis: {
      rpc: 'https://rpc.forma.art',
      evmJsonRpc: 'https://rpc.forma.art',
    },
    denom: 'TIA',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'forma',
    txExplorer: {
      mainnet: {
        name: 'Forma Art',
        txUrl: 'https://explorer.forma.art/tx',
        accountUrl: 'https://explorer.forma.art/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      utia: denoms.utia,
    },
    theme: {
      primaryColor: '#ff6b6b',
      gradient: 'linear-gradient(180deg, rgba(255, 107, 107, 0.32) 0%, rgba(255, 107, 107, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
  blackwing: {
    chainId: 'tomcat-1',
    testnetChainId: 'tomcat-1',
    key: 'blackwing',
    chainName: 'Blackwing',
    chainRegistryPath: 'blackwing',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/blackwing.svg',
    apis: {
      restTest: 'https://maze-rest-18bdff44-3aa4-425e-9bc0-06a2afa40af8.ase1-prod.newmetric.xyz',
      rpcTest: 'https://maze-rpc-18bdff44-3aa4-425e-9bc0-06a2afa40af8.ase1-prod.newmetric.xyz',
    },
    denom: 'INIT',
    bip44: {
      coinType: '118',
    },
    txExplorer: {
      mainnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/tomcat-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/tomcat-1/account',
      },
      testnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/tomcat-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/tomcat-1/account',
      },
    },
    addressPrefix: 'init',
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      'l2/aee375e9d0b181f0d9d3a49f9a3d1d6b05d62b0ac81f8c92b9282afa4213d884':
        denoms['l2/aee375e9d0b181f0d9d3a49f9a3d1d6b05d62b0ac81f8c92b9282afa4213d884'],
    },
    theme: {
      primaryColor: '#0d9488',
      gradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0) 100%)',
    },
    disableStaking: true,
    enabled: true,
  },
  civitia: {
    chainId: 'landlord-1',
    testnetChainId: 'landlord-1',
    key: 'civitia',
    chainName: 'Civitia',
    chainRegistryPath: 'civitia',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/civitia.png',
    apis: {
      restTest: 'https://maze-rest-sequencer-beab9b6f-d96d-435e-9caf-5679296d8172.ue1-prod.newmetric.xyz',
      rpcTest: 'https://maze-rpc-sequencer-beab9b6f-d96d-435e-9caf-5679296d8172.ue1-prod.newmetric.xyz',
    },
    denom: 'INIT',
    bip44: {
      coinType: '118',
    },
    txExplorer: {
      mainnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/landlord-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/landlord-1/account',
      },
      testnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/landlord-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/landlord-1/account',
      },
    },
    addressPrefix: 'init',
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      'l2/afaa3f4e1717c75712f8e8073e41f051a4e516cd25daa82d948c4729388edefd':
        denoms['l2/afaa3f4e1717c75712f8e8073e41f051a4e516cd25daa82d948c4729388edefd'],
    },
    theme: {
      primaryColor: '#0d9488',
      gradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0) 100%)',
    },
    disableStaking: true,
    enabled: true,
  },
  init_ai: {
    chainId: 'init-ai-1',
    testnetChainId: 'init-ai-1',
    key: 'init_ai',
    chainName: 'INIT AI',
    chainRegistryPath: 'init_ai',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/init-ai.svg',
    apis: {
      restTest: 'https://maze-rest-617bacff-7d34-4eb8-87f4-ee16fb4e0ac7.ue1-prod.newmetric.xyz',
      rpcTest: 'https://maze-rpc-617bacff-7d34-4eb8-87f4-ee16fb4e0ac7.ue1-prod.newmetric.xyz',
    },
    denom: 'INIT',
    bip44: {
      coinType: '118',
    },
    txExplorer: {
      mainnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/init-ai-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/init-ai-1/account',
      },
      testnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/init-ai-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/init-ai-1/account',
      },
    },
    addressPrefix: 'init',
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      'l2/aadf1a9da6a38b7e7e11839364ee42002260eff1657f403b9ce608337bcb986b':
        denoms['l2/aadf1a9da6a38b7e7e11839364ee42002260eff1657f403b9ce608337bcb986b'],
    },
    theme: {
      primaryColor: '#0d9488',
      gradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0) 100%)',
    },
    enabled: true,
    disableStaking: true,
  },
  milkyway: {
    chainId: 'glados-1',
    testnetChainId: 'glados-1',
    key: 'milkyway',
    chainName: 'Milkyway',
    chainRegistryPath: 'milkyway',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/milkyway.svg',
    apis: {
      restTest: 'https://lcd.testnet.milkyway.zone',
      rpcTest: 'https://rpc.testnet.milkyway.zone',
    },
    denom: 'MILK',
    bip44: {
      coinType: '118',
    },
    txExplorer: {
      mainnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/glados-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/glados-1/account',
      },
      testnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/glados-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/glados-1/account',
      },
    },
    addressPrefix: 'init',
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      umilk: denoms.umilk,
    },
    theme: {
      primaryColor: '#0d9488',
      gradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0) 100%)',
    },
    disableStaking: true,
    enabled: true,
  },
  minimove: {
    chainId: 'minimove-1',
    testnetChainId: 'minimove-1',
    key: 'minimove',
    chainName: 'Minimove',
    chainRegistryPath: 'minimove',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/minimove.svg',
    apis: {
      restTest: 'https://lcd.minimove-1.initia.xyz',
      rpcTest: 'https://rpc.minimove-1.initia.xyz',
    },
    denom: 'INIT',
    bip44: {
      coinType: '118',
    },
    txExplorer: {
      mainnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/minimove-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/minimove-1/account',
      },
      testnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/minimove-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/minimove-1/account',
      },
    },
    addressPrefix: 'init',
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      'l2/771d639f30fbe45e3fbca954ffbe2fcc26f915f5513c67a4a2d0bc1d635bdefd':
        denoms['l2/771d639f30fbe45e3fbca954ffbe2fcc26f915f5513c67a4a2d0bc1d635bdefd'],
    },
    theme: {
      primaryColor: '#0d9488',
      gradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0) 100%)',
    },
    disableStaking: true,
    enabled: true,
  },
  miniwasm: {
    chainId: 'miniwasm-1',
    testnetChainId: 'miniwasm-1',
    key: 'miniwasm',
    chainName: 'Miniwasm',
    chainRegistryPath: 'miniwasm',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/miniwasm.svg',
    apis: {
      restTest: 'https://lcd.miniwasm-1.initia.xyz',
      rpcTest: 'https://rpc.miniwasm-1.initia.xyz',
    },
    denom: 'INIT',
    bip44: {
      coinType: '118',
    },
    txExplorer: {
      mainnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/miniwasm-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/miniwasm-1/account',
      },
      testnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/minimove-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/minimove-1/account',
      },
    },
    addressPrefix: 'init',
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      'l2/2588fd87a8e081f6a557f43ff14f05dddf5e34cb27afcefd6eaf81f1daea30d0':
        denoms['l2/2588fd87a8e081f6a557f43ff14f05dddf5e34cb27afcefd6eaf81f1daea30d0'],
    },
    theme: {
      primaryColor: '#0d9488',
      gradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0) 100%)',
    },
    disableStaking: true,
    enabled: true,
  },
  noon: {
    chainId: 'burrito-1',
    testnetChainId: 'burrito-1',
    key: 'noon',
    chainName: 'Noon',
    chainRegistryPath: 'noon',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/noon.svg',
    apis: {
      restTest: 'https://burrito-1-lcd.lunchlunch.xyz',
      rpcTest: 'https://burrito-1-rpc.lunchlunch.xyz',
    },
    denom: 'INIT',
    bip44: {
      coinType: '118',
    },
    txExplorer: {
      mainnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/burrito-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/burrito-1/account',
      },
      testnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/burrito-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/burrito-1/account',
      },
    },
    addressPrefix: 'init',
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      'l2/ffea49d63cbadcfd749b4f635eca198b2f3b44cb1f6b580f5d201d58f3bf7aea':
        denoms['l2/ffea49d63cbadcfd749b4f635eca198b2f3b44cb1f6b580f5d201d58f3bf7aea'],
    },
    theme: {
      primaryColor: '#0d9488',
      gradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0) 100%)',
    },
    disableStaking: true,
    enabled: true,
  },
  tucana: {
    chainId: 'birdee-1',
    testnetChainId: 'birdee-1',
    key: 'tucana',
    chainName: 'Tucana',
    chainRegistryPath: 'tucana',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/tucana.svg',
    apis: {
      restTest: 'https://maze-rest-c9796789-107d-49ab-b6de-059724d2a91d.ue1-prod.newmetric.xyz',
      rpcTest: 'https://maze-rest-c9796789-107d-49ab-b6de-059724d2a91d.ue1-prod.newmetric.xyz',
    },
    denom: 'INIT',
    bip44: {
      coinType: '118',
    },
    txExplorer: {
      mainnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/birdee-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/birdee-1/account',
      },
      testnet: {
        name: 'Initia Scan',
        txUrl: 'https://scan.testnet.initia.xyz/birdee-1/txs',
        accountUrl: 'https://scan.testnet.initia.xyz/birdee-1/account',
      },
    },
    addressPrefix: 'init',
    gasPriceStep: {
      low: 0.15,
      average: 0.15,
      high: 0.4,
    },
    ibcChannelIds: {},
    nativeDenoms: {
      utuc: denoms.utuc,
    },
    theme: {
      primaryColor: '#0d9488',
      gradient: 'linear-gradient(180deg, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0) 100%)',
    },
    disableStaking: true,
    enabled: true,
  },
  arbitrum: {
    chainId: '42161',
    evmChainId: '42161',
    key: 'arbitrum',
    chainName: 'Arbitrum',
    chainRegistryPath: 'arbitrum',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/arbitrum.png',
    apis: {
      rpc: 'https://arb1.arbitrum.io/rpc',
      evmJsonRpc: 'https://arb1.arbitrum.io/rpc',
    },
    denom: 'ETH',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'arbitrum',
    txExplorer: {
      mainnet: {
        name: 'Arbiscan',
        txUrl: 'https://arbiscan.io/tx',
        accountUrl: 'https://arbiscan.io/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      'arbitrum-native': denoms['arbitrum-native'],
    },
    theme: {
      primaryColor: '#13aaff',
      gradient: 'linear-gradient(180deg, rgba(19, 170, 255, 0.32) 0%, rgba(19, 170, 255, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
  polygon: {
    chainId: '137',
    evmChainId: '137',
    key: 'polygon',
    chainName: 'Polygon',
    chainRegistryPath: 'polygon',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/polygon.png',
    apis: {
      rpc: 'https://polygon-rpc.com',
      evmJsonRpc: 'https://polygon-rpc.com',
    },
    denom: 'MATIC',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'polygon',
    txExplorer: {
      mainnet: {
        name: 'PolygonScan',
        txUrl: 'https://polygonscan.com/tx',
        accountUrl: 'https://polygonscan.com/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      'polygon-native': denoms['polygon-native'],
    },
    theme: {
      primaryColor: '#620fec',
      gradient: 'linear-gradient(180deg, rgba(98, 15, 236, 0.32) 0%, rgba(98, 15, 236, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
  base: {
    chainId: '8453',
    evmChainId: '8453',
    key: 'base',
    chainName: 'Base',
    chainRegistryPath: 'base',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/base.png',
    apis: {
      rpc: 'https://mainnet.base.org',
      evmJsonRpc: 'https://mainnet.base.org',
    },
    denom: 'ETH',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'base',
    txExplorer: {
      mainnet: {
        name: 'BaseScan',
        txUrl: 'https://basescan.org/tx',
        accountUrl: 'https://basescan.org/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      'base-native': denoms['base-native'],
    },
    theme: {
      primaryColor: '#2851e3',
      gradient: 'linear-gradient(180deg, rgba(40, 81, 227, 0.32) 0%, rgba(40, 81, 227, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
  optimism: {
    chainId: '10',
    evmChainId: '10',
    key: 'optimism',
    chainName: 'Optimism',
    chainRegistryPath: 'optimism',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/optimism.png',
    apis: {
      rpc: 'https://mainnet.optimism.io',
      evmJsonRpc: 'https://mainnet.optimism.io',
    },
    denom: 'ETH',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'optimism',
    txExplorer: {
      mainnet: {
        name: 'Optimistic',
        txUrl: 'https://optimistic.etherscan.io/tx',
        accountUrl: 'https://optimistic.etherscan.io/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      'optimism-native': denoms['optimism-native'],
    },
    theme: {
      primaryColor: '#933635',
      gradient: 'linear-gradient(180deg, rgba(147, 54, 53, 0.32) 0%, rgba(147, 54, 53, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
  blast: {
    chainId: '81457',
    evmChainId: '81457',
    key: 'blast',
    chainName: 'Blast',
    chainRegistryPath: 'blast',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/blast.png',
    apis: {
      rpc: 'https://rpc.blast.io',
      evmJsonRpc: 'https://rpc.blast.io',
    },
    denom: 'ETH',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'blast',
    txExplorer: {
      mainnet: {
        name: 'Blastscan',
        txUrl: 'https://blastscan.io/tx',
        accountUrl: 'https://blastscan.io/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      'blast-native': denoms['blast-native'],
    },
    theme: {
      primaryColor: '#e3e400',
      gradient: 'linear-gradient(180deg, rgba(227, 228, 0, 0.32) 0%, rgba(227, 228, 0, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
  manta: {
    chainId: '169',
    evmChainId: '169',
    testnetChainId: '3441006',
    evmChainIdTestnet: '3441006',
    key: 'manta',
    chainName: 'Manta',
    chainRegistryPath: 'manta',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/manta.png',
    apis: {
      rpc: 'https://pacific-rpc.manta.network/http',
      evmJsonRpc: 'https://pacific-rpc.manta.network/http',
      rpcTest: 'https://pacific-rpc.sepolia-testnet.manta.network/http',
      evmJsonRpcTest: 'https://pacific-rpc.sepolia-testnet.manta.network/http',
    },
    denom: 'ETH',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'manta',
    txExplorer: {
      mainnet: {
        name: 'Manta Pacific Explorer',
        txUrl: 'https://pacific-explorer.manta.network/tx',
        accountUrl: 'https://pacific-explorer.manta.network/address',
      },
      testnet: {
        name: 'Manta Sepolia Explorer',
        txUrl: 'https://pacific-explorer.sepolia-testnet.manta.network/tx',
        accountUrl: 'https://pacific-explorer.sepolia-testnet.manta.network/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      'manta-native': denoms['manta-native'],
    },
    theme: {
      primaryColor: '#1D57F9',
      gradient: 'linear-gradient(180deg, rgba(29, 87, 249, 0.32) 0%, rgba(29, 87, 249, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
  lightlink: {
    chainId: '1890',
    testnetChainId: '1891',
    evmChainId: '1890',
    evmChainIdTestnet: '1891',
    key: 'lightlink',
    chainName: 'LightLink',
    chainRegistryPath: 'lightlink',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/lightlink.png',
    apis: {
      rpc: 'https://replicator.phoenix.lightlink.io/rpc/v1',
      evmJsonRpc: 'https://replicator.phoenix.lightlink.io/rpc/v1',
      rpcTest: 'https://replicator.pegasus.lightlink.io/rpc/v1',
      evmJsonRpcTest: 'https://replicator.pegasus.lightlink.io/rpc/v1',
    },
    denom: 'ETH',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'lightlink',
    txExplorer: {
      mainnet: {
        name: 'LightLink Phoenix',
        txUrl: 'https://phoenix.lightlink.io/tx',
        accountUrl: 'https://phoenix.lightlink.io/address',
      },
      testnet: {
        name: 'LightLink Pegasus',
        txUrl: 'https://pegasus.lightlink.io/tx',
        accountUrl: 'https://pegasus.lightlink.io/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      'lightlink-native': denoms['lightlink-native'],
    },
    theme: {
      primaryColor: '#3AC5FF',
      gradient: 'linear-gradient(180deg, rgba(58, 197, 255, 0.32) 0%, rgba(58, 197, 255, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
  unichain: {
    chainId: '1301',
    testnetChainId: '1301',
    evmChainIdTestnet: '1301',
    key: 'unichain',
    chainName: 'Unichain Sepolia',
    chainRegistryPath: 'unichain',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/unichain.png',
    apis: {
      rpcTest: 'https://sepolia.unichain.org',
      evmJsonRpcTest: 'https://sepolia.unichain.org',
    },
    denom: 'ETH',
    bip44: {
      coinType: '60',
    },
    addressPrefix: 'unichain',
    txExplorer: {
      testnet: {
        name: 'Uniscan',
        txUrl: 'https://sepolia.uniscan.xyz/tx',
        accountUrl: 'https://sepolia.uniscan.xyz/address',
      },
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
    nativeDenoms: {
      'unichain-native': denoms['unichain-native'],
    },
    theme: {
      primaryColor: '#f50db5',
      gradient: 'linear-gradient(180deg, rgba(245, 13, 181, 0.32) 0%, rgba(245, 13, 181, 0) 100%)',
    },
    enabled: true,
    evmOnlyChain: true,
  },
};
