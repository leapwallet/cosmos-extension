/** For example, a CW20 token address. */
export type TokenAddress = string;

/** Either a lowercase native token symbol (e.g., `'luna'`, `'lunc'`, `'krtc'`) or a {@link TokenAddress}. */
export type TokenId = string;
export type ProposalId = string;
export type LcdUrl = string;

export type Wallet = string;
export type ContractApiResponse = {
  readonly id: Id;
};

export type IdAddressMapping = Record<Id, TokenAddress>;

export function validateCgPlatform(platform: string): boolean {
  return [
    'CRONOS',
    'CARBON',
    'NEAR',
    'AURORA',
    'POLYGON',
    'CANTO',
    'FANTOM',
    'ETHEREUM',
    'BINANCE_SMART_CHAIN',
    'EVMOS',
    'STRIDE',
    'AXELAR',
    'COREUM',
    'TERITORI',
    'KAVA',
    'THOR_CHAIN',
    'TERRA',
    'KUJIRA',
    'TGRADE',
    'ASSET_MANTLE',
    'AVALANCHE',
    'COSMOS_HUB',
    'OSMOSIS',
    'E_MONEY',
    'SECRET',
    'AGORIC',
    'AKASH',
    'BAND',
    'BITCANNA',
    'BIT_SONG',
    'BOSTROM',
    'CERBERUS',
    'CHEQD',
    'CHIHUAHUA',
    'COMDEX',
    'DECENTR',
    'DESMOS',
    'DIG',
    'FETCH_HUB',
    'FIRMA_CHAIN',
    'GRAVITY_BRIDGE',
    'INJECTIVE',
    'IRISNET',
    'JUNO',
    'KI',
    'LIKE_COIN',
    'LUM',
    'MICROTICK',
    'ORAICHAIN',
    'PERSISTENCE',
    'PROVENANCE',
    'RIZON',
    'SENTINEL',
    'SHENTU',
    'SIFCHAIN',
    'SOMMELIER',
    'STARGAZE',
    'STARNAME',
    'UMEE',
    'VIDULUM',
    'CRESCENT',
    'NOBLE',
    'QUICK_SILVER',
    'QUASAR',
    'MARS',
    'MEDI_BLOC',
    'MIGALOO',
    'IMPACT_HUB',
    'OMNI_FLIX',
    'DEFAULT',
  ].includes(platform);
}

/**
 * We use the term "asset platform" instead of "blockchain" because networks such Avalanche are comprised of several
 * blockchains, but that's irrelevant in this context.
 *
 * If CG supports the asset platform ([HTTP GET /asset_platforms](https://www.coingecko.com/en/api/documentation)), then
 * the key's value will be the asset platform's CG ID. Otherwise, it'll be the key in lowercase.
 */

export enum AssetPlatform {
  // The following values are CG asset platform IDs:
  Terra = 'terra',
  Canto = 'canto',
  Avalanche = 'avalanche',
  Aurora = 'aurora',
  Near = 'near-protocol',
  BinanceSmartChain = 'binance-smart-chain',
  Fantom = 'fantom',
  Ethereum = 'ethereum',
  Polygon = 'polygon-pos',
  CosmosHub = 'cosmos',
  Secret = 'secret',
  Osmosis = 'osmosis',
  Kava = 'kava',
  Cronos = 'cronos',
  Evmos = 'evmos',
  ThorChain = 'thorchain',

  // The following values aren't CG asset platform IDs:
  Stride = 'stride',
  Coreum = 'coreum',
  Axelar = 'axelar',
  Teritori = 'teritori',
  Carbon = 'carbon',
  Agoric = 'agoric',
  Regen = 'regen',
  MediBloc = 'medi-bloc',
  Crescent = 'crescent',
  C2X = 'c2x',
  EMoney = 'emoney',
  Akash = 'akash',
  Band = 'band',
  BitCanna = 'bitcanna',
  BitSong = 'bitsong',
  Bostrom = 'bostrom',
  Cerberus = 'cerberus',
  Cheqd = 'cheqd',
  Chihuahua = 'chihuahua',
  Comdex = 'comdex',
  Decentr = 'decentr',
  Desmos = 'desmos',
  Dig = 'dig',
  FetchHub = 'fetchhub',
  FirmaChain = 'firmachain',
  GravityBridge = 'gravitybridge',
  Injective = 'injective',
  IrisNet = 'irisnet',
  Juno = 'juno',
  Ki = 'ki',
  LikeCoin = 'likecoin',
  Lum = 'lum',
  Microtick = 'microtick',
  Oraichain = 'oraichain',
  Persistence = 'persistence',
  Planq = 'planq',
  Provenance = 'provenance',
  Rizon = 'rizon',
  Sentinel = 'sentinel',
  Shentu = 'shentu',
  Sifchain = 'sifchain',
  Sommelier = 'sommelier',
  Stargaze = 'stargaze',
  Starname = 'starname',
  Umee = 'umee',
  Vidulum = 'vidulum',
  AssetMantle = 'assetmantle',
  Kujira = 'kujira',
  Tgrade = 'tgrade',
  Mars = 'mars',
  Omniflix = 'omniflix',
  Jackal = 'jackal',
  Quicksilver = 'quicksilver',
  Neutron = 'neutron',
  Quasar = 'quasar',
  Onomy = 'Onomy',
  Noble = 'Noble',
  Migaloo = 'Migaloo',
  ImpactHub = 'ImpactHub',
  Default = 'default',
}

/**
 * @example `parseAssetPlatform('GRAVITY_BRIDGE'); // AssetPlatform.GravityBridge`
 */
export function parseAssetPlatform(platform: string): AssetPlatform | undefined {
  switch (platform) {
    case 'CARBON':
      return AssetPlatform.Carbon;
    case 'TERITORI':
      return AssetPlatform.Teritori;
    case 'CANTO':
      return AssetPlatform.Canto;
    case 'STRIDE':
      return AssetPlatform.Stride;
    case 'AXELAR':
      return AssetPlatform.Axelar;
    case 'COREUM':
      return AssetPlatform.Coreum;
    case 'C2X':
      return AssetPlatform.C2X;
    case 'REGEN':
      return AssetPlatform.Regen;
    case 'MEDI_BLOC':
      return AssetPlatform.MediBloc;
    case 'CRESCENT':
      return AssetPlatform.Crescent;
    case 'NEAR':
      return AssetPlatform.Near;
    case 'AURORA':
      return AssetPlatform.Aurora;
    case 'AVALANCHE':
      return AssetPlatform.Avalanche;
    case 'FANTOM':
      return AssetPlatform.Fantom;
    case 'ETHEREUM':
      return AssetPlatform.Ethereum;
    case 'BINANCE_SMART_CHAIN':
      return AssetPlatform.BinanceSmartChain;
    case 'POLYGON':
      return AssetPlatform.Polygon;
    case 'E_MONEY':
      return AssetPlatform.EMoney;
    case 'COSMOS_HUB':
      return AssetPlatform.CosmosHub;
    case 'TERRA':
      return AssetPlatform.Terra;
    case 'KUJIRA':
      return AssetPlatform.Kujira;
    case 'TGRADE':
      return AssetPlatform.Tgrade;
    case 'ASSET_MANTLE':
      return AssetPlatform.AssetMantle;
    case 'OSMOSIS':
      return AssetPlatform.Osmosis;
    case 'SECRET':
      return AssetPlatform.Secret;
    case 'KAVA':
      return AssetPlatform.Kava;
    case 'CRONOS':
      return AssetPlatform.Cronos;
    case 'EVMOS':
      return AssetPlatform.Evmos;
    case 'THOR_CHAIN':
      return AssetPlatform.ThorChain;
    case 'AGORIC':
      return AssetPlatform.Agoric;
    case 'AKASH':
      return AssetPlatform.Akash;
    case 'BAND':
      return AssetPlatform.Band;
    case 'BITCANNA':
      return AssetPlatform.BitCanna;
    case 'BIT_SONG':
      return AssetPlatform.BitSong;
    case 'BOSTROM':
      return AssetPlatform.Bostrom;
    case 'CERBERUS':
      return AssetPlatform.Cerberus;
    case 'CHEQD':
      return AssetPlatform.Cheqd;
    case 'CHIHUAHUA':
      return AssetPlatform.Chihuahua;
    case 'COMDEX':
      return AssetPlatform.Comdex;
    case 'DECENTR':
      return AssetPlatform.Decentr;
    case 'DESMOS':
      return AssetPlatform.Desmos;
    case 'DIG':
      return AssetPlatform.Dig;
    case 'FETCH_HUB':
      return AssetPlatform.FetchHub;
    case 'FIRMA_CHAIN':
      return AssetPlatform.FirmaChain;
    case 'GRAVITY_BRIDGE':
      return AssetPlatform.GravityBridge;
    case 'INJECTIVE':
      return AssetPlatform.Injective;
    case 'IRISNET':
      return AssetPlatform.IrisNet;
    case 'JUNO':
      return AssetPlatform.Juno;
    case 'KI':
      return AssetPlatform.Ki;
    case 'LIKE_COIN':
      return AssetPlatform.LikeCoin;
    case 'LUM':
      return AssetPlatform.Lum;
    case 'MICROTICK':
      return AssetPlatform.Microtick;
    case 'ORAICHAIN':
      return AssetPlatform.Oraichain;
    case 'PERSISTENCE':
      return AssetPlatform.Persistence;
    case 'PLANQ':
      return AssetPlatform.Planq;
    case 'PROVENANCE':
      return AssetPlatform.Provenance;
    case 'RIZON':
      return AssetPlatform.Rizon;
    case 'SENTINEL':
      return AssetPlatform.Sentinel;
    case 'SHENTU':
      return AssetPlatform.Shentu;
    case 'SIFCHAIN':
      return AssetPlatform.Sifchain;
    case 'SOMMELIER':
      return AssetPlatform.Sommelier;
    case 'STARGAZE':
      return AssetPlatform.Stargaze;
    case 'STARNAME':
      return AssetPlatform.Starname;
    case 'UMEE':
      return AssetPlatform.Umee;
    case 'VIDULUM':
      return AssetPlatform.Vidulum;
    case 'ONOMY':
      return AssetPlatform.Onomy;
    case 'NOBLE':
      return AssetPlatform.Noble;
    case 'QUICK_SILVER':
      return AssetPlatform.Quicksilver;
    case 'QUASAR':
      return AssetPlatform.Quasar;
    case 'MARS':
      return AssetPlatform.Mars;
    case 'MIGALOO':
      return AssetPlatform.Migaloo;
    case 'IMPACT_HUB':
      return AssetPlatform.ImpactHub;
    case 'OMNI_FLIX':
      return AssetPlatform.Omniflix;
    case 'DEFAULT':
      return AssetPlatform.Default;
    default:
      return undefined;
  }
}

/** CG ID APIs for Terra native tokens. */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CgTerraNativeTokens {
  /** Type guard to check that the `token` can be indexed by {@link Ids}. */
  export function isKey(token: string): token is keyof typeof Ids {
    return token in Ids;
  }

  /** Maps lowercase token symbols to {@link CgApi.Id}s. */
  export const Ids = {
    luna: 'terra-luna-2',
    lunc: 'terra-luna',
    ustc: 'terrausd',
    autc: 'terra-aut',
    catc: 'terra-cat',
    chtc: 'terra-cht',
    cntc: 'terra-cnt',
    dktc: 'terra-dkt',
    eutc: 'terra-eut',
    gbtc: 'terra-gbt',
    hktc: 'terra-hkt',
    idtc: 'terra-idt',
    intc: 'terra-int',
    jptc: 'terra-jpt',
    krtc: 'terra-krw',
    mntc: 'terramnt',
    phtc: 'terra-pht',
    sdtc: 'terra-sdt',
    setc: 'terra-set',
    sgtc: 'terra-sgt',
    thtc: 'terra-tht',
  };
}

export type CgIdTokenIdMapping = Record<Id, TokenId>;
export enum Platform {
  Teritori = 'TERITORI',
  Carbon = 'CARBON',
  Stride = 'STRIDE',
  C2X = 'C2X',
  Canto = 'CANTO',
  Regen = 'REGEN',
  MediBloc = 'MEDI_BLOC',
  Crescent = 'CRESCENT',
  Tgrade = 'TGRADE',
  EMoney = 'E_MONEY',
  AssetMantle = 'ASSET_MANTLE',
  Kujira = 'KUJIRA',
  Polygon = 'POLYGON',
  Near = 'NEAR',
  Aurora = 'AURORA',
  Avalanche = 'AVALANCHE',
  BinanceSmartChain = 'BINANCE_SMART_CHAIN',
  Fantom = 'FANTOM',
  Ethereum = 'ETHEREUM',
  CosmosHub = 'COSMOS_HUB',
  Terra = 'TERRA',
  Osmosis = 'OSMOSIS',
  Secret = 'SECRET',
  Kava = 'KAVA',
  Cronos = 'CRONOS',
  Evmos = 'EVMOS',
  ThorChain = 'THORCHAIN',
  Agoric = 'AGORIC',
  Akash = 'AKASH',
  Band = 'BAND',
  BitCanna = 'BITCANNA',
  BitSong = 'BIT_SONG',
  Bostrom = 'BOSTROM',
  Cerberus = 'CERBERUS',
  Cheqd = 'CHEQD',
  Chihuahua = 'CHIHUAHUA',
  Comdex = 'COMDEX',
  Decentr = 'DECENTR',
  Desmos = 'DESMOS',
  Dig = 'DIG',
  FetchHub = 'FETCH_HUB',
  FirmaChain = 'FIRMACHAIN',
  GravityBridge = 'GRAVITY_BRIDGE',
  Injective = 'INJECTIVE',
  IrisNet = 'IRISNET',
  Juno = 'JUNO',
  Ki = 'KI',
  LikeCoin = 'LIKE_COIN',
  Lum = 'LUM',
  Microtick = 'MICROTICK',
  Oraichain = 'ORAICHAIN',
  Persistence = 'PERSISTENCE',
  Provenance = 'PROVENANCE',
  Rizon = 'RIZON',
  Sentinel = 'SENTINEL',
  Shentu = 'SHENTU',
  Sifchain = 'SIFCHAIN',
  Sommelier = 'SOMMELIER',
  Stargaze = 'STARGAZE',
  Starname = 'STARNAME',
  Umee = 'UMEE',
  Vidulum = 'VIDULUM',
  Axelar = 'AXELAR',
  Coreum = 'COREUM',
  Passage = 'PASSAGE',
  OmniFlix = 'OMNI_FLIX',
  Archway = 'ARCHWAY',
  Quasar = 'QUASAR',
  Neutron = 'NEUTRON',
  QuickSilver = 'QUICK_SILVER',
  Onomy = 'ONOMY',
  Sei = 'SEI',
  Kyve = 'KYVE',
  Migaloo = 'MIGALOO',
  Noble = 'NOBLE',
}

export enum CosmosBlockchain {
  Jackal = 'JACKAL',
  Migaloo = 'MIGALOO',
  Carbon = 'CARBON',
  Passage = 'PASSAGE',
  DeFund = 'DEFUND',
  QuickSilver = 'QUICK_SILVER',
  Mars = 'MARS',
  Canto = 'CANTO',
  OmniFlix = 'OMNI_FLIX',
  C2X = 'C2X',
  Regen = 'REGEN',
  MediBloc = 'MEDI_BLOC',
  Gnoland = 'GNOLAND',
  Crescent = 'CRESCENT',
  Neutron = 'NEUTRON',
  Teritori = 'TERITORI',
  Chronic = 'CHRONIC',
  Ethos = 'ETHOS',
  Galaxy = 'GALAXY',
  CosmosHub = 'COSMOS_HUB',
  Stride = 'STRIDE',
  Bostrom = 'BOSTROM',
  Cerberus = 'CERBERUS',
  Cheqd = 'CHEQD',
  ThorChain = 'THOR_CHAIN',
  Osmosis = 'OSMOSIS',
  Secret = 'SECRET',
  Juno = 'JUNO',
  Akash = 'AKASH',
  Agoric = 'AGORIC',
  Axelar = 'AXELAR',
  Quasar = 'QUASAR',
  Coreum = 'COREUM',
  EMoney = 'E_MONEY',
  Sifchain = 'SIFCHAIN',
  IrisNet = 'IRISNET',
  Persistence = 'PERSISTENCE',
  Stargaze = 'STARGAZE',
  Sommelier = 'SOMMELIER',
  Umee = 'UMEE',
  Starname = 'STARNAME',
  Cronos = 'CRONOS',
  CryptoOrgChain = 'CRYPTO_ORG_CHAIN',
  Comdex = 'COMDEX',
  AssetMantle = 'ASSET_MANTLE',
  Cresent = 'CRESENT',
  Evmos = 'EVMOS',
  Kava = 'KAVA',
  Injective = 'INJECTIVE',
  Kujira = 'KUJIRA',
  Tgrade = 'TGRADE',
  Sei = 'SEI',
  Nomic = 'NOMIC',
  Desmos = 'DESMOS',
  Dig = 'DIG',
  FetchHub = 'FETCH_HUB',
  FirmaChain = 'FIRMA_CHAIN',
  GravityBridge = 'GRAVITY_BRIDGE',
  Ki = 'KI',
  LikeCoin = 'LIKE_COIN',
  Lum = 'LUM',
  Microtick = 'MICROTICK',
  Oraichain = 'ORAICHAIN',
  Provenance = 'PROVENANCE',
  Rizon = 'RIZON',
  Sentinel = 'SENTINEL',
  Shentu = 'SHENTU',
  Vidulum = 'VIDULUM',
  Chihuahua = 'CHIHUAHUA',
  Decentr = 'DECENTR',
  Terra = 'TERRA',
  Band = 'BAND',
  Bitcanna = 'BITCANNA',
  BitSong = 'BIT_SONG',
  Onomy = 'ONOMY',
  Kyve = 'KYVE',
  Archway = 'ARCHWAY',
  Noble = 'NOBLE',
  Ixo = 'IXO',
  Nibiru = 'NIBIRU',
  Nolus = 'NOLUS',
  Planq = 'PLANQ',
  Gitopia = 'GITOPIA',
  EmpowerChain = 'EMPOWER_CHAIN',
  mayaChain = 'MAYA_CHAIN',
  chain4Energy = 'CHAIN4_ENERGY',
}

export class NetworkError extends Error {
  constructor(readonly error: any = undefined) {
    super();
  }
}

export type HealthResponse = {
  /** Whether the database is up. */
  readonly postgres: boolean;
  /** Whether Redis is up. */
  readonly redis: boolean;
  /** Whether CoinGecko's API is up. */
  readonly coinGecko: boolean;
};

export type BannerResponse = {
  /** @example `'Terra has disabled staking. The staking features won't work until Terra enables staking again.'` */
  readonly banner: string;
};

export type MarketDescriptionResponse = {
  /** @example `'Terra is a decentralized financial payment network.'` */
  readonly description: string;
};

export type MarketChartResponse = {
  /** Chronologically ordered (i.e., the oldest data is the first element). */
  readonly prices: MarketChartPriceInt[];
};

export type MarketChartPriceInt = {
  /** UTC timestamp */
  readonly date: string;
  /** @example `80.37088402941855` */
  readonly price: number;
};

/** Chronologically ordered (i.e., the oldest data is the first element) prices. */
export type MarketChartPrice = MarketChartPriceInt & {
  /**
   * When plotting prices on something like a line chart, it can look bad
   * ([example](https://i.imgur.com/8yC7ehv.png)). Therefore, the smoothed price (close to but not the actual price)
   * can be used for instead ([example](https://i.imgur.com/7OAqVeb.png)).
   */
  readonly smoothedPrice: number;
};

/**
 * The key is the token, and the value is the market cap in USD. Only tokens whose market caps could be fetched are
 * returned.
 */
export type MarketCapsResponse = Record<string, number>;

/**
 * Each key is a token. The value is the percentage change of the price in USD for the last 24h. Only tokens whose
 * percentages could be fetched are returned.
 *
 * @example
 * ```
 * {
 *   'luna': 9.21725,
 *   'terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun': -0.1197,
 * }
 * ```
 */
export type MarketPercentageChangesResponse = Record<string, number>;

export enum SwapValidity {
  /** The swap is safe to execute. */
  Valid = 'VALID',
  /** The swap may cause the user a noticeable loss. */
  Warning = 'WARNING',
  /** The swap must not be executed because the user may lose a significant amount of money. */
  Invalid = 'INVALID',
  /** The swap was unable to be validated (e.g., the price of a token could not be found for comparison). */
  Unknown = 'UNKNOWN',
}

export type MarketSwapValidityResponse = {
  readonly validity: SwapValidity;
};

/**
 * The key is the token address, and the value is the price. Only tokens whose prices could be fetched are returned.
 *
 * @example
 * ```
 * {
 *   'terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun': 3297.22,
 *   'luna': 103.47,
 * }
 * ```
 */
export type MarketPricesResponse = Record<string, number>;

export type V2MarketPricesResponse = {
  /**
   * Every platform specified in {@link V2MarketPricesRequest.platformTokenAddresses.platforms} will be a key (a
   * {@link Platform}) here.
   */
  readonly [platform: string]: {
    /**
     * The key is the token address, and the value is the price. Only tokens whose prices could be fetched are
     * returned.
     *
     * @example
     * ```
     * {
     *   'luna': 9.21725,
     *   'terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun': -0.1197,
     * }
     * ```
     */
    readonly [tokenAddress: string]: number;
  };
};

export type V2MarketPercentageChangesResponse = {
  /**
   * Every platform specified in {@link V2MarketPercentageChangesResponse.platformTokenAddresses.platforms} will be a
   * key (a {@link Platform}) here.
   */
  readonly [platform: string]: {
    /**
     * The key is the token address, and the value is the price. Only tokens whose prices could be fetched are
     * returned.
     *
     * @example
     * ```
     * {
     *   'luna': 9.21725,
     *   'terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun': -0.1197,
     * }
     * ```
     */
    readonly [tokenAddress: string]: number;
  };
};

export type TerraFeatureFlagsResponse = {
  readonly send: {
    /** Sending tokens to Terra addresses. */
    readonly terra: boolean;
    /**
     * Sending tokens via Rango. Technically, Rango swaps tokens (across chains) but our frontends consider this a
     * transfer to another chain since it's the same asset (in a wrapped form).
     */
    readonly rango: boolean;
  };
  readonly fiatRamp: {
    /** Transak integration. */
    readonly transak: boolean;
    /** Kado Ramp integration.	 */
    readonly kadoRamp: boolean;
  };
  readonly staderLabs: {
    /** If `false`, then ignore {@link liquidStakingFeatures}. */
    readonly liquidStaking: boolean;
    readonly liquidStakingFeatures: {
      readonly stake: boolean;
      readonly unstake: boolean;
      readonly claimRewards: boolean;
    };
    /** If `false`, then ignore {@link stakePlusFeatures}. */
    readonly stakePools: boolean;
    readonly stakePoolsFeatures: {
      readonly delegate: boolean;
      readonly undelegate: boolean;
      readonly claimRewards: boolean;
    };
    /** If `false`, then ignore {@link stakePlusFeatures}. */
    readonly stakePlus: boolean;
    readonly stakePlusFeatures: {
      readonly stake: boolean;
      readonly unstake: boolean;
      readonly claimRewards: boolean;
    };
  };
  /** If `false`, then ignore {@link vanillaStakingFeatures}. */
  readonly vanillaStaking: boolean;
  readonly vanillaStakingFeatures: {
    readonly stake: boolean;
    readonly unstake: boolean;
    readonly redelegate: boolean;
  };
  /** If `false`, then ignore {@link anchorProtocolFeatures}. */
  readonly anchorProtocol: boolean;
  readonly anchorProtocolFeatures: {
    readonly deposit: boolean;
    readonly withdraw: boolean;
  };
  readonly manageCw20Tokens: boolean;
  readonly addLedger: boolean;
  /** NFT page. */
  readonly nfts: boolean;
  /** If `false`, then ignore {@link swapFeatures}. */
  readonly swap: boolean;
  readonly swapFeatures: {
    readonly astroport: boolean;
    readonly terraformer: boolean;
    readonly loop: boolean;
    readonly terraswap: boolean;
    readonly market: boolean;
  };
  /** Tx history. */
  readonly activity: boolean;
};

export type TerraRewardsResponse = {
  /**
   * A floating point value as a `string` that's at least `'0'`. This is the sum of the rewards from the LEAP Ahead
   * Rewards, Leap with Friends, and early user programs.
   *
   * @example `'150.2'`
   */
  readonly total: string;
  /**
   * A floating point value as a `string` that's at least `'0'`.
   *
   * @example `'105.63'`
   */
  readonly earlyUserTotal: string;
  /**
   * A floating point value as a `string` that's at least `'0'`.
   *
   * @example `'105.63'`
   */
  readonly leapWithFriendsTotal: string;
  /**
   * A floating point value as a string that's at least `'0'`.
   *
   * @example `'105.63'`
   */
  readonly leapAheadRewardsTotal: string;
  /** Ordered reverse-chronologically. */
  readonly history: TerraRewardsHistoryEntry[];
};

export type TerraRewardsHistoryEntry = {
  /**
   * This field will only be sent if the {@link type} is {@link TerraRewardsProgram.LeapAheadRewards}. The boost the
   * user got on their rewards today (e.g., for holding an affiliate's NFT). For example, if the user was rewarded 100
   * tokens today, and this is `1.2`, then the {@link quantity} will be `'120'`.
   */
  readonly multiplier?: number;
  /**
   * This field will only be sent if the {@link type} is {@link TerraRewardsProgram.LeapAheadRewards}. This is a list of
   * affiliates that influenced the {@link multiplier}. This field will be empty if the {@link multiplier} is `1`, and
   * will always be nonempty otherwise.
   *
   * @example `['Luna Wormz']`
   */
  readonly affiliates?: string[];
  /** The user gets rewarded tokens each day. This field shows which day's rewards are being shown. */
  readonly date: string;
  /**
   * The number of Leap tokens the user was rewarded on the specified day. The number of Leap tokens the user was
   * rewarded on the specified day. Don't multiply this with the {@link multiplier} because it's already been done for
   * you.
   *
   * @example `'10.75'`
   */
  readonly quantity: string;
  /** The program this reward came from. */
  readonly type: TerraRewardsProgram;
};

export enum TerraRewardsProgram {
  LeapAheadRewards = 'LEAP_AHEAD_REWARDS',
  LeapWithFriends = 'LEAP_WITH_FRIENDS',
}

export type TerraReferralCodeValidityResponse = {
  readonly isValid: boolean;
};

export type TerraReferralCodeResponse = {
  /** 1-8 characters in length. Only consists of letters and numbers 0-9. */
  readonly referralCode: string;
};

export type TerraReferralStatusResponse = {
  readonly status: TerraReferralStatus;
};

export enum TerraReferralStatus {
  /** The wallet will never be a friend wallet. */
  Invalid = 'INVALID',
  /** The wallet is a friend wallet. */
  Eligible = 'ELIGIBLE',
  /**
   * The wallet isn't {@link Invalid} but isn't {@link Eligible} (i.e., if the user were to add a wallet later on, the
   * status may be changed to {@link Invalid} or {@link Eligible}).
   */
  Pending = 'PENDING',
}

export type TerraReferralNewResponse = {
  readonly status: TerraReferralStatus;
};

export type FailedTerraReferralNewResponse = {
  readonly reason: FailedTerraReferralNewResponseReason;
  /**
   * A human-readable explanation for the {@link reason} field. This is always sent if the {@link reason} is
   * {@link FailedTerraReferralNewResponseReason.InvalidPayload}, and never sent otherwise.
   */
  readonly explanation?: any;
};

export enum FailedTerraReferralNewResponseReason {
  /** The request didn't conform to the expectations. */
  InvalidPayload = 'INVALID_PAYLOAD',
  /** The referral code doesn't exist. */
  NonexistingReferralCode = 'NONEXISTING_REFERRAL_CODE',
}

export type MarketPercentageChangeResponse = {
  /** The percentage change of the price in USD for the specified time period. */
  readonly change: number;
};

/** Which Figment DataHub API proxies are enabled. */
export type FigmentStatusResponse = {
  readonly osmosis: {
    /** Whether HTTP GET /figment/osmosis/lcd and HTTP POST /figment/osmosis/lcd are enabled. */
    readonly lcd: boolean;
    /** Whether HTTP GET /figment/osmosis/rpc and HTTP POST /figment/osmosis/rpc are enabled. */
    readonly rpc: boolean;
  };
  readonly cosmosHub: {
    /** Whether HTTP GET /figment/cosmos-hub/lcd and HTTP POST /figment/cosmos-hub/lcd are enabled. */
    readonly lcd: boolean;
    /** Whether HTTP GET /figment/cosmos-hub/rpc and HTTP POST /figment/cosmos-hub/rpc are enabled. */
    readonly rpc: boolean;
  };
};

/** Currencies CG supports. */
export enum CGCurrency {
  /** Bitcoin */
  Btc = 'btc',
  /** Ethereum */
  Eth = 'eth',
  /** Litecoin */
  Ltc = 'ltc',
  /** Bitcoin Cash */
  Bch = 'bch',
  /** BNB */
  Bnb = 'bnb',
  /** EOS */
  Eos = 'eos',
  /** XRP */
  Xrp = 'xrp',
  /** Stellar */
  Xlm = 'xlm',
  /** Chainlink */
  Link = 'link',
  /** Polkadot */
  Dot = 'dot',
  /** yearn.finance */
  Yfi = 'yfi',
  /** US Dollar */
  Usd = 'usd',
  /** UAE Dirham */
  Aed = 'aed',
  /** Argentine Peso */
  Ars = 'ars',
  /** Australian Dollar */
  Aud = 'aud',
  /** Basic Attention */
  Bat = 'bat',
  /** Bermudian Dollar */
  Bmd = 'bmd',
  /** Brazilian Real */
  Brl = 'brl',
  /** Canadian Dollar */
  Cad = 'cad',
  /** Swiss Franc */
  Chf = 'chf',
  /** Chilean Peso */
  Clp = 'clp',
  /** Chinese Yuan */
  Cny = 'cny',
  /** Czech Koruna */
  Czk = 'czk',
  /** Danish Krone */
  Dkk = 'dkk',
  /** Euro */
  Eur = 'eur',
  /** Great British Pound */
  Gbp = 'gbp',
  /** Hong Kong Dollar */
  Hkd = 'hkd',
  /** Hungarian Forint */
  Huf = 'huf',
  /** Indonesian Rupiah */
  Idr = 'idr',
  /** Israeli Shekel */
  Ils = 'ils',
  /** Indian Rupee */
  Inr = 'inr',
  /** Japanese Yen */
  Jpy = 'jpy',
  /** South Korean Won */
  Krw = 'krw',
  /** Kuwaiti Dinar */
  Kwd = 'kwd',
  /** Sri Lankan Rupee */
  Lkr = 'lkr',
  /** Burmese Kyat */
  Mmk = 'mmk',
  /** Mexican Peso */
  Mxn = 'mxn',
  /** Malaysian Ringgit */
  Myr = 'myr',
  /** Nigerian Naira */
  Nnr = 'nnr',
  /** Norwegian Krone */
  Nok = 'nok',
  /** New Zealand Dollar */
  Nzd = 'nzd',
  /** Philippine Peso */
  Php = 'php',
  /** Pakistani Rupee */
  Pkr = 'pkr',
  /** Polish Zloty */
  Pln = 'pln',
  /** Russian Ruble */
  Rub = 'rub',
  /** Saudi Arabia Real */
  Sar = 'sar',
  /** Swedish Krona */
  Sek = 'sek',
  /** Singapore Dollar */
  Sgd = 'sgd',
  /** Thai Baht */
  Thb = 'thb',
  /** Ukrainian Hryvnia */
  Uah = 'uah',
  /** Venezuelan Bolivar */
  Vef = 'vef',
  /** Vietnamese Dong */
  Vnd = 'vnd',
  /** South African Rand */
  Zar = 'zar',
  /** IMF Special Drawing Rights */
  Xdr = 'xdr',
  /** Silver Ounce */
  Xag = 'xag',
  /** Gold Ounce */
  Xau = 'xau',
}

export enum Currency {
  /** Bitcoin */
  Btc = 'BTC',
  /** Ethereum */
  Eth = 'ETH',
  /** Litecoin */
  Ltc = 'LTC',
  /** Bitcoin Cash */
  Bch = 'BCH',
  /** BNB */
  Bnb = 'BNB',
  /** EOS */
  Eos = 'EOS',
  /** XRP */
  Xrp = 'XRP',
  /** Stellar */
  Xlm = 'XLM',
  /** Chainlink */
  Link = 'LINK',
  /** Polkadot */
  Dot = 'DOT',
  /** yearn.finance */
  Yfi = 'YFI',
  /** US Dollar */
  Usd = 'USD',
  /** UAE Dirham */
  Aed = 'AED',
  /** Argentine Peso */
  Ars = 'ARS',
  /** Australian Dollar */
  Aud = 'AUD',
  /** Basic Attention */
  Bat = 'BAT',
  /** Bermudian Dollar */
  Bmd = 'BMD',
  /** Brazilian Real */
  Brl = 'BRL',
  /** Canadian Dollar */
  Cad = 'CAD',
  /** Swiss Franc */
  Chf = 'CHF',
  /** Chilean Peso */
  Clp = 'CLP',
  /** Chinese Yuan */
  Cny = 'CNY',
  /** Czech Koruna */
  Czk = 'CZK',
  /** Danish Krone */
  Dkk = 'DKK',
  /** Euro */
  Eur = 'EUR',
  /** Great British Pound */
  Gbp = 'GBP',
  /** Hong Kong Dollar */
  Hkd = 'HKD',
  /** Hungarian Forint */
  Huf = 'HUF',
  /** Indonesian Rupiah */
  Idr = 'IDR',
  /** Israeli Shekel */
  Ils = 'ILS',
  /** Indian Rupee */
  Inr = 'INR',
  /** Japanese Yen */
  Jpy = 'JPY',
  /** South Korean Won */
  Krw = 'KRW',
  /** Kuwaiti Dinar */
  Kwd = 'KWD',
  /** Sri Lankan Rupee */
  Lkr = 'LKR',
  /** Burmese Kyat */
  Mmk = 'MMK',
  /** Mexican Peso */
  Mxn = 'MXN',
  /** Malaysian Ringgit */
  Myr = 'MYR',
  /** Nigerian Naira */
  Nnr = 'NNR',
  /** Norwegian Krone */
  Nok = 'NOK',
  /** New Zealand Dollar */
  Nzd = 'NZD',
  /** Philippine Peso */
  Php = 'PHP',
  /** Pakistani Rupee */
  Pkr = 'PKR',
  /** Polish Zloty */
  Pln = 'PLN',
  /** Russian Ruble */
  Rub = 'RUB',
  /** Saudi Arabia Real */
  Sar = 'SAR',
  /** Swedish Krona */
  Sek = 'SEK',
  /** Singapore Dollar */
  Sgd = 'SGD',
  /** Thai Baht */
  Thb = 'THB',
  /** Ukrainian Hryvnia */
  Uah = 'UAH',
  /** Venezuelan Bolivar */
  Vef = 'VEF',
  /** Vietnamese Dong */
  Vnd = 'VND',
  /** South African Rand */
  Zar = 'ZAR',
  /** IMF Special Drawing Rights */
  Xdr = 'XDR',
  /** Silver Ounce */
  Xag = 'XAG',
  /** Gold Ounce */
  Xau = 'XAU',
}

export enum CosmosTxType {
  Send = 'SEND',
  IbcSend = 'IBC_SEND',
  Swap = 'SWAP',
  GovVote = 'GOV_VOTE',
  StakeDelegate = 'STAKE_DELEGATE',
  StakeUndelegate = 'STAKE_UNDELEGATE',
  StakeRedelgate = 'STAKE_REDELEGATE',
  StakeClaim = 'STAKE_CLAIM',
  StakeCancelUndelegate = 'STAKE_CANCEL_UNDELEGATE',
  NFTSend = 'NFT_SEND',
  Dapp = 'DAPP',
  SecretTokenTransaction = 'SECRET_TOKEN_TRANSACTION',
  AuthZRevoke = 'AUTHZ_REVOKE',
  AuthZGrant = 'AUTHZ_GRANT',
  LSStake = 'LS_STAKE',
  LSUnstake = 'LS_UNSTAKE',
}

export enum App {
  Ios = 'IOS',
  Android = 'ANDROID',
  Dashboard = 'DASHBOARD',
  ChromeExtension = 'CHROME_EXTENSION',
}

export type CosmosTxRequest = {
  readonly app?: App;
  readonly feeDenomination?: string;
  readonly feeQuantity?: string;
  readonly txHash: string;
  readonly blockchain: CosmosBlockchain;
  /** Whether the tx occurred on the mainnet or the testnet. */
  readonly isMainnet: boolean;
  readonly wallet: string;
  /** Address of the wallet performing the tx. */
  readonly walletAddress: string;
  readonly type: CosmosTxType;
  /**
   * A free-form object of any additional data that might be useful for analytics.
   *
   * @example
   * ```
   * {
   *   fromToken: 'ujuno',
   *   toToken: 'juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr',
   *   fromQuantity: '10',
   *   toQuantity: '500',
   * }
   * ```
   */
  readonly metadata?: object;
};

export type MarketDescriptionRequest = {
  readonly platform: Platform;
  readonly token: string;
};

export type MarketPercentageChangesRequest = {
  readonly platform: Platform;
  readonly tokens: string[];
  /** {@link Currency.Usd} if `undefined`. */
  readonly currency?: Currency;
};

export type V2MarketPercentageChangesRequest = {
  readonly platformTokenAddresses: PlatformTokenAddresses[];
  /** {@Link Currency.Usd} if `undefined`. */
  readonly currency?: Currency;
};

export type PlatformTokenAddresses = {
  readonly platform: Platform;
  readonly tokenAddresses: string[];
};

export type MarketPricesRequest = {
  readonly platform: Platform;
  readonly tokens: string[];
  /** {@Link Currency.Usd} if `undefined`. */
  readonly currency?: Currency;
};

export type MarketChartRequest = {
  readonly platform: Platform;
  readonly token: string;
  /**
   * In the range of 0.0001 - 900000. Minutely data will be used for durations of less than 1 day. Hourly data will be
   * used for durations between 1 and 90 days. Daily data will be used for durations greater 90 days. A floating point
   * can be used to specify fractions of a day. For example, 0.005 will retrieve 0.005th of a day (i.e., the last 7.2
   * minutes).
   * @example `7.89`
   */
  readonly days: number;
  /** {@link Currency.Usd} if `undefined. */
  readonly currency?: Currency;
};

export type MarketChartApiResponse = {
  /**
   * Each element's first and second elements are the number of milliseconds since 1970-01-01 UTC, and the price
   * respectively.
   *
   * @example
   * ```
   * [
   *   [1650211406768, 82.35912717051168],
   * ]
   * ```
   */
  readonly prices: [number, number][];
};

export type MarketCapsRequest = {
  readonly platform: Platform;
  readonly tokens: string[];
  /** {@link Currency.Usd} if `undefined`. */
  readonly currency?: Currency;
};

export type V2MarketPricesRequest = {
  readonly platformTokenAddresses: PlatformTokenAddresses[];
  /** {@Link Currency.Usd} if `undefined`. */
  readonly currency?: Currency;
};

/**
 * The ID representing a token on CG.
 * @example `'anchor-beth-token'`
 */
export type Id = string;

/** A token's market cap. */
export type MarketCap = number;

export type MarketCaps = Record<Id, MarketCap>;

/** Each value is the price of one token. */
export type Prices = Record<Id, number>;

export type APIPrices = {
  [platform: string]: Prices;
};

export type PricesApiResponse = {
  /** Maps {@link Currency}s to their prices. Certain {@link Currency}s may not be present. */
  readonly [id: Id]: Record<string, number>;
};

export type MarketCapsApiResponse = {
  readonly id: Id;
  readonly market_cap: number | null;
}[];

/** The percentage change (e.g., `3.4`, `-8.777`) of the token's price over the last 24h. */
export type PercentageChange = number;

export type PercentageChanges = Record<Id, PercentageChange>;

export type PercentageChangesApiResponse = {
  readonly id: Id;
  readonly price_change_percentage_24h: number | null;
}[];

export type APIPercentageChanges = {
  [platform: string]: PercentageChanges;
};

export enum V2TxOperation {
  Cosmos = 'cosmos.tx',
  Evm = 'evm.tx',
  Solana = 'svm.tx',
  Sui = 'sui.tx',
}

export type LightNodeStatsRequest = {
  readonly userUUID: string;
  readonly walletAddress: string;
  readonly totalRunningTimeMilliseconds: number;
  readonly lastStartedAt?: string;
  readonly lastStoppedAt?: string;
};

export type V2TxRequest = Omit<CosmosTxRequest, 'blockchain' | 'type'> & {
  chainId: string;
  type: CosmosTxType;
};
