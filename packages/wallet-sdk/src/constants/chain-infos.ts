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
  | 'celestiatestnet3';

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
  | 'celestia';

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
  | 'TIA';

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
  | '931';

export enum CosmosSDK {
  Version_Point_46 = 'v0.46',
  Version_Point_47 = 'v0.47',
}

export type ChainInfo = {
  readonly chainId: string;
  readonly chainRegistryPath: string;
  readonly testnetChainRegistryPath?: string;
  readonly chainName: string;
  readonly chainSymbolImageUrl?: string;
  readonly key: SupportedChain;
  readonly nativeDenoms: Record<string, NativeDenom>;
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

    readonly grpc?: string;
    readonly grpcTest?: string;
  };
  readonly txExplorer?: {
    mainnet?: {
      readonly name: string;
      readonly txUrl: string;
    };
    testnet?: {
      readonly name: string;
      readonly txUrl: string;
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
  ibcChannelIds: Record<string, [string]>;
  theme: {
    primaryColor: string;
    gradient: string;
  };
  testnetChainId?: string;
  readonly beta?: boolean;
  readonly disableStaking?: boolean;
  readonly cosmosSDK?: string;
};

export const ChainInfos: Record<SupportedChain, ChainInfo> = {
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
      },
      testnet: {
        name: 'Big Dipper',
        txUrl: 'https://explorer.theta-testnet.polypore.xyz/transactions',
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
      },
      testnet: {
        name: 'Mintscan',
        txUrl: 'https://testnet.mintscan.io/juno-testnet/txs',
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
      },
      testnet: {
        name: 'Mintscan Testnet',
        txUrl: 'https://testnet.mintscan.io/osmosis-testnet/txs',
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

    theme: {
      primaryColor: '#726FDC',
      gradient: 'linear-gradient(180deg, rgba(114, 111, 220, 0.32) 0%, rgba(114, 111, 220, 0) 100%)',
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
      },
      testnet: {
        name: 'Mintscan',
        txUrl: 'https://testnet.mintscan.io/archway-testnet',
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
      },
      testnet: {
        name: 'Axelarscan',
        txUrl: 'https://testnet.axelarscan.io/tx/',
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
        name: 'mintscan',
        txUrl: 'https://www.mintscan.io/bitsong/txs',
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
        name: 'mintscan',
        txUrl: 'https://www.mintscan.io/bitcanna/txs',
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
        txUrl: 'https://scan.carbon.network/transaction?net=main',
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
      ncheq: denoms.swth,
    },
    theme: {
      primaryColor: '#196163',
      gradient: 'linear-gradient(180deg, rgba(25, 97, 99, 0.32) 0%, rgba(25, 97, 99, 0) 100%)',
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
    chainName: 'Coreum Mainnet',
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
        // txUrl: 'https://explorer.coreum.com/coreum/transactions',
        txUrl: 'https://explorer.mainnet-0.coreum.dev/coreum/transactions',
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
      ncheq: denoms.acudos,
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
      ucre: denoms.udec,
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
  },
  dydx: {
    chainId: 'dydx-testnet-1',
    key: 'dydx',
    chainName: 'dYdX Public Testnet',
    chainRegistryPath: 'dydx',
    testnetChainId: 'dydx-testnet-1',
    testnetChainRegistryPath: 'dydx',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/dydx.png',
    apis: {
      rpcTest: 'http://3.128.51.185:26657',
      restTest: 'http://3.128.51.185:1317',
    },
    denom: 'DV4TNT',
    txExplorer: {
      testnet: {
        name: 'Mintscan',
        txUrl: 'https://testnet.mintscan.io/dydx-testnet/txs',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'dydx',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      dv4tnt: denoms.dv4tnt,
    },
    theme: {
      primaryColor: '#5c5ade',
      gradient: 'linear-gradient(180deg, rgba(92, 90, 222, 0.32) 0%, rgba(92, 90, 222, 0) 100%)',
    },
    enabled: false,
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
      },
      testnet: {
        name: 'Ping.Pub',
        txUrl: 'https://explorer.stavr.tech/empower/tx',
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
    key: 'injective',
    chainName: 'Injective',
    chainRegistryPath: 'injective',
    testnetChainRegistryPath: 'injectivetestnet',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/inj.png',
    apis: {
      rest: 'https://injective-rest.publicnode.com',
      rpc: 'https://injective-rpc.publicnode.com',
      rpcTest: 'https://testnet.tm.injective.dev',
      restTest: 'https://testnet.lcd.injective.dev',
    },
    denom: 'INJ',
    txExplorer: {
      mainnet: {
        name: 'Mintscan',
        txUrl: 'https://www.mintscan.io/injective/txs',
      },
      testnet: {
        name: 'Nyancat',
        txUrl: 'https://nyancat.iobscan.io/#/',
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
      },
      testnet: {
        name: 'Nyancat',
        txUrl: 'https://nyancat.iobscan.io/#/',
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
      },
      testnet: {
        name: 'Pandora Explorer',
        txUrl: 'https://blockscan-pandora.ixo.earth/transactions',
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
      ucre: denoms.ukuji,
    },
    theme: {
      primaryColor: '#607D8B',
      gradient: 'linear-gradient(180deg, rgba(96, 125, 139, 0.32) 0%, rgba(96, 125, 139, 0) 100%)',
    },
    enabled: true,
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
      },
      testnet: {
        name: 'Mintscan',
        txUrl: 'https://testnet.mintscan.io/kyve-testnet/txs',
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
      },
      testnet: {
        name: 'Mars Explorer',
        txUrl: 'https://testnet-explorer.marsprotocol.io/transactions/',
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
        name: 'Explorer MayaChain',
        txUrl: 'https://www.explorer.mayachain.info/tx',
      },
    },
    bip44: {
      coinType: '931',
    },
    addressPrefix: 'maya',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      cacao: denoms.cacao,
    },
    theme: {
      primaryColor: '#419e7c',
      gradient: 'linear-gradient(180deg, rgba(65, 158, 124, 0.32) 0%, rgba(65, 158, 124, 0) 100%)',
    },
    enabled: false,
  },
  migaloo: {
    chainId: 'migaloo-1',
    testnetChainId: '',
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
      },
      testnet: {
        name: '',
        txUrl: '',
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
  celestiatestnet3: {
    chainId: 'mocha-4',
    testnetChainId: 'mocha-4',
    key: 'celestiatestnet3',
    chainName: 'Mocha Testnet',
    chainRegistryPath: 'celestiatestnet3',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/filled-celestia.svg',
    apis: {
      restTest: 'https://api-mocha-4.consensus.celestia-mocha.com',
      rpcTest: 'https://rpc-mocha-4.consensus.celestia-mocha.com',
      alternateRestTest: ' https://api-2-mocha-4.consensus.celestia-mocha.com',
      alternateRpcTest: 'https://rpc-2-mocha-4.consensus.celestia-mocha.com',
    },
    denom: 'TIA',
    txExplorer: {
      testnet: {
        name: 'Celestia Explorer',
        txUrl: 'https://celestia.explorers.guru/transaction',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'celestia',
    gasPriceStep: defaultGasPriceStep,
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
      },
      testnet: {
        name: 'Mintscan Testnet',
        txUrl: 'https://testnet.mintscan.io/neutron-testnet/txs',
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
      primaryColor: '#20212e',
      gradient: 'linear-gradient(180deg, rgba(32, 33, 46, 0.32) 0%, rgba(32, 33, 46, 0) 100%)',
    },
    enabled: true,
  },
  nibiru: {
    chainId: 'nibiru-itn-1',
    testnetChainId: 'nibiru-itn-1',
    key: 'nibiru',
    chainName: 'Nibiru',
    chainRegistryPath: 'nibiru',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/nibiry.png',
    apis: {
      rpcTest: 'https://rpc.itn-1.nibiru.fi',
      restTest: 'https://lcd.itn-1.nibiru.fi',
    },
    denom: 'NIBI',
    txExplorer: {
      mainnet: {
        name: 'Ping.Pub',
        txUrl: 'https://ping.testnet.noble.strange.love/noble/tx',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'nibi',
    gasPriceStep: { low: 0.05, average: 0.125, high: 0.2 },
    ibcChannelIds: {},
    nativeDenoms: {
      unibi: denoms.unibi,
    },
    theme: {
      primaryColor: '#5036cc',
      gradient: 'linear-gradient(180deg, rgba(80, 54, 204, 0.32) 0%, rgba(80, 54, 204, 0) 100%)',
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
        name: 'Ping.Pub',
        txUrl: 'https://ping.testnet.noble.strange.love/noble/tx',
      },
      testnet: {
        name: 'Mintscan Testnet',
        txUrl: 'https://testnet.mintscan.io/noble-testnet/txs',
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
      ustake: denoms.ustake,
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
      },
      testnet: {
        name: 'Explorer rila',
        txUrl: 'https://explorer-rila.nolus.io/nolus-rila/tx',
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
    chainSymbolImageUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nomic.svg',
    apis: {
      rpc: 'https://rpc.cosmos.directory/nomic',
      rest: 'https://app.nomic.io:8443/',
      rpcTest: 'https://testnet-rpc.nomic.io:2096',
      restTest: 'https://testnet-api.nomic.io:8443',
    },
    denom: 'NOM',
    txExplorer: {
      mainnet: {
        name: 'Bigdipper',
        txUrl: 'https://bigdipper.live/nomic/transactions/',
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'nomic',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      unom: denoms.unom,
    },
    theme: {
      primaryColor: '#97b1f9',
      gradient: 'linear-gradient(180deg, rgba(151, 177, 249, 0.32) 0%, rgba(151, 177, 249, 0) 100%)',
    },
    enabled: false,
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
      },
    },
    bip44: {
      coinType: '118',
    },
    addressPrefix: 'omniflix',
    gasPriceStep: defaultGasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      ukava: denoms.uflix,
    },
    theme: {
      primaryColor: '#f90',
      gradient: 'linear-gradient(180deg, rgba(255, 153, 0, 0.32) 0%, rgba(255, 153, 0, 0) 100%)',
    },
    enabled: true,
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
      },
      testnet: {
        name: 'Mintscan Testnet',
        txUrl: 'https://testnet.mintscan.io/quasar-testnet/txs',
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
    chainId: 'pacific-1',
    testnetChainId: 'atlantic-2',
    key: 'seiTestnet2',
    chainName: 'Sei',
    chainRegistryPath: 'sei',
    chainSymbolImageUrl: 'https://assets.leapwallet.io/sei.png',
    apis: {
      rpc: 'https://rpc.wallet.pacific-1.sei.io',
      rest: 'https://rest.wallet.pacific-1.sei.io',
      rpcTest: 'https://rpc.wallet.atlantic-2.sei.io',
      restTest: 'https://rest.wallet.atlantic-2.sei.io',
      alternateRpcTest: 'https://sei-testnet-rpc.polkachu.com',
      alternateRestTest: 'https://sei-testnet-api.polkachu.com',
    },
    denom: 'SEI',
    txExplorer: {
      mainnet: {
        name: 'SeiScan',
        txUrl: 'https://www.seiscan.app/pacific-1/txs',
      },
      testnet: {
        name: 'SeiScan',
        txUrl: 'https://www.seiscan.app/atlantic-2/txs',
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
        name: 'Apollo',
        txUrl: 'https://apollo.chandrastation.com/stride/tx',
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
};
