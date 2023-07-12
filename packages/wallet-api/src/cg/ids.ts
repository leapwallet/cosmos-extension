import {
  AssetPlatform,
  CgIdTokenIdMapping,
  CgTerraNativeTokens,
  ContractApiResponse,
  Id,
  IdAddressMapping,
  TokenAddress,
  TokenId,
} from '../types';

/** @returns `null` if either CG doesn't have the requested info or the HTTP request failed. */
const fetchId = async (platform: AssetPlatform, address: TokenAddress): Promise<Id | null> => {
  const response = await fetch(`${process.env.COIN_GECKO_BASE_URL}/coins/${platform}/contract/${address}`);
  if (response?.status !== 200) return null;
  const { id }: ContractApiResponse = await response.json();
  return id;
};

/**
 * Gets data for non-native tokens (native token IDs must be hardcoded since they don't have addresses).
 *
 * {@link CgApi.Id}s which couldn't be found either because of an HTTP request error or because CoinGecko doesn't
 * have the info won't get returned.
 *
 * Duplicate `addresses` will be ignored.
 *
 * @see {@link getIds}
 */
const getNonNativeTokenIds = async (platform: AssetPlatform, addresses: TokenAddress[]): Promise<IdAddressMapping> => {
  addresses = [...new Set(addresses)];
  const idAddressMapping: IdAddressMapping = {};
  const data: Record<TokenAddress, Id> = {};
  for (const address of addresses) {
    const cgId = await fetchId(platform, address);
    if (cgId === null) continue;
    idAddressMapping[cgId] = address;
    data[address] = cgId;
  }
  return idAddressMapping;
};

/** Utility function for {@link getIds} if you only have one {@link TokenId}. */
export const getId = async (platform: AssetPlatform, token: TokenId): Promise<TokenId | null> => {
  const cgTokenMapping = await getIds(platform, [token]);
  return Object.keys(cgTokenMapping)[0] ?? null;
};

/**
 * @inheritDoc getNonNativeTokenIds
 * @see {@link getId}
 */
export const getIds = async (
  platform: AssetPlatform,
  tokens: TokenId[],
): Promise<CgIdTokenIdMapping | { [key: string]: string }> => {
  const nativeIdTokenMapping: CgIdTokenIdMapping = {};
  const addresses = Array<TokenAddress>();
  /*
      We hardcode certain non-native tokens' CoinGecko IDs such as Juno CW20 tokens because CoinGecko doesn't support
      querying their CoinGecko IDs via the API.

      To find the CW20 token address of a Juno token, use
      https://github.com/CosmosContracts/junoswap-asset-list/blob/main/pools_list.json.
      Cosmos Directory lists CW20 token addresses such as on https://cosmos.directory/juno/chain.
      CoinGecko sometimes has the token's contract address on the token's webpage.
       */
  if (platform === AssetPlatform.Default) {
    const res: { [key: string]: string } = {};
    for (const token_ of tokens) {
      res[token_] = token_;
    }
    return res;
  }
  for (const token of tokens)
    switch (platform) {
      case AssetPlatform.Terra:
        if (CgTerraNativeTokens.isKey(token)) {
          const id = CgTerraNativeTokens.Ids[token];
          nativeIdTokenMapping[id] = token;
        } else if (token.startsWith('terra')) addresses.push(token);
        break;
      case AssetPlatform.Canto:
        if (token === 'canto') nativeIdTokenMapping.canto = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Avalanche:
        if (token === 'avax') nativeIdTokenMapping['avalanche-2'] = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Aurora:
        if (token === 'aurora') nativeIdTokenMapping['aurora-near'] = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Near:
        if (token === 'near') nativeIdTokenMapping.near = token;
        else addresses.push(token);
        break;
      case AssetPlatform.BinanceSmartChain:
        if (token === 'bnb') nativeIdTokenMapping.binancecoin = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Fantom:
        if (token === 'ftm') nativeIdTokenMapping.fantom = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Ethereum:
        if (token === 'eth') nativeIdTokenMapping.ethereum = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Polygon:
        if (token === 'matic') nativeIdTokenMapping['matic-network'] = token;
        else addresses.push(token);
        break;
      case AssetPlatform.CosmosHub:
        if (token === 'atom') nativeIdTokenMapping.cosmos = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Regen:
        if (token === 'regen') nativeIdTokenMapping.regen = token;
        break;
      case AssetPlatform.MediBloc:
        if (token === 'med') nativeIdTokenMapping.medibloc = token;
        break;
      case AssetPlatform.Crescent:
        if (token === 'cre') nativeIdTokenMapping['crescent-network'] = token;
        break;
      case AssetPlatform.Secret:
        if (token === 'scrt') nativeIdTokenMapping.secret = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Osmosis:
        if (token === 'osmo') nativeIdTokenMapping.osmosis = token;
        else if (token === 'ion') nativeIdTokenMapping.ion = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Kava:
        if (token === 'kava') nativeIdTokenMapping.kava = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Cronos:
        if (token === 'cro') nativeIdTokenMapping['crypto-com-chain'] = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Evmos:
        if (token === 'evmos') nativeIdTokenMapping.evmos = token;
        else addresses.push(token);
        break;
      case AssetPlatform.C2X:
        if (token === 'ctx') nativeIdTokenMapping['c2x-2'] = token;
        break;
      case AssetPlatform.ThorChain:
        if (token === 'rune') nativeIdTokenMapping.thorchain = token;
        else addresses.push(token);
        break;
      case AssetPlatform.Agoric:
        if (token === 'bld') nativeIdTokenMapping.agoric = token;
        break;
      case AssetPlatform.Akash:
        if (token === 'akt') nativeIdTokenMapping['akash-network'] = token;
        break;
      case AssetPlatform.Teritori:
        if (token === 'tori') nativeIdTokenMapping.teritori = token;
        break;
      case AssetPlatform.Cudos:
        if (token === 'cudos') nativeIdTokenMapping.cudos = token;
        break;
      case AssetPlatform.Carbon:
        if (token === 'swth') nativeIdTokenMapping.switcheo = token;
        break;
      case AssetPlatform.Axelar:
        if (token === 'axelar') {
          nativeIdTokenMapping.axelar = token;
        } else if (token === 'axlusdc') {
          nativeIdTokenMapping.axlusdc = token;
        } else if (token === 'tether') {
          nativeIdTokenMapping.tether = token;
        } else if (token === 'dot') {
          nativeIdTokenMapping.polkadot = token;
        } else if (token === 'frax') {
          nativeIdTokenMapping.frax = token;
        } else if (token === 'dai') {
          nativeIdTokenMapping.dai = token;
        }
        break;
      case AssetPlatform.Onomy:
        if (token === 'onomy-protocol') nativeIdTokenMapping['onomy-protocol'] = token;
        break;
      case AssetPlatform.Noble:
        if (token === 'usd-coin') nativeIdTokenMapping['usd-coin'] = token;
        break;
      case AssetPlatform.Quicksilver:
        if (token === 'quicksilver') nativeIdTokenMapping['quicksilver'] = token;
        break;
      case AssetPlatform.Quasar:
        if (token === 'quasar') nativeIdTokenMapping['quasar'] = token;
        break;
      case AssetPlatform.Mars:
        if (token === 'mars-protocol-a7fcbcfb-fd61-4017-92f0-7ee9f9cc6da3')
          nativeIdTokenMapping['mars-protocol-a7fcbcfb-fd61-4017-92f0-7ee9f9cc6da3'] = token;
        break;
      case AssetPlatform.Migaloo:
        if (token === 'white-whale') nativeIdTokenMapping['white-whale'] = token;
        break;
      case AssetPlatform.ImpactHub:
        if (token === 'ixo') nativeIdTokenMapping['ixo'] = token;
        break;
      case AssetPlatform.Omniflix:
        if (token === 'flix') nativeIdTokenMapping['flix'] = token;
        break;
      case AssetPlatform.Coreum:
        if (token === 'core') nativeIdTokenMapping.coreum = token;
        break;
      case AssetPlatform.Stride:
        if (token === 'strd') nativeIdTokenMapping.stride = token;
        break;
      case AssetPlatform.Band:
        if (token === 'band') nativeIdTokenMapping['band-protocol'] = token;
        break;
      case AssetPlatform.BitCanna:
        if (token === 'bcna') nativeIdTokenMapping.bitcanna = token;
        break;
      case AssetPlatform.BitSong:
        if (token === 'btsg') nativeIdTokenMapping.bitsong = token;
        break;
      case AssetPlatform.Bostrom:
        if (token === 'boot') nativeIdTokenMapping.bostrom = token;
        break;
      case AssetPlatform.EMoney:
        if (token === 'ngm') nativeIdTokenMapping['e-money'] = token;
        else if (token === 'eeur') nativeIdTokenMapping['e-money-eur'] = token;
        break;
      case AssetPlatform.Kujira:
        if (token === 'kuji') nativeIdTokenMapping.kujira = token;
        break;
      case AssetPlatform.Tgrade:
        if (token === 'tgd') nativeIdTokenMapping.tgrade = token;
        break;
      case AssetPlatform.AssetMantle:
        if (token === 'mntl') nativeIdTokenMapping.assetmantle = token;
        break;
      case AssetPlatform.Cerberus:
        if (token === 'crbrus') nativeIdTokenMapping['cerberus-2'] = token;
        break;
      case AssetPlatform.Cheqd:
        if (token === 'cheq') nativeIdTokenMapping['cheqd-network'] = token;
        break;
      case AssetPlatform.Chihuahua:
        if (token === 'huahua') nativeIdTokenMapping['chihuahua-token'] = token;
        break;
      case AssetPlatform.Comdex:
        if (token === 'cmdx') nativeIdTokenMapping.comdex = token;
        break;
      case AssetPlatform.Decentr:
        if (token === 'dec') nativeIdTokenMapping.decentr = token;
        break;
      case AssetPlatform.Desmos:
        if (token === 'dsm') nativeIdTokenMapping.desmos = token;
        break;
      case AssetPlatform.Dig:
        if (token === 'dig') nativeIdTokenMapping['dig-chain'] = token;
        break;
      case AssetPlatform.FetchHub:
        if (token === 'fet') nativeIdTokenMapping['fetch-ai'] = token;
        break;
      case AssetPlatform.FirmaChain:
        if (token === 'fct') nativeIdTokenMapping.firmachain = token;
        break;
      case AssetPlatform.GravityBridge:
        if (token === 'grav') nativeIdTokenMapping.graviton = token;
        break;
      case AssetPlatform.Injective:
        if (token === 'inj') nativeIdTokenMapping['injective-protocol'] = token;
        break;
      case AssetPlatform.IrisNet:
        if (token === 'iris') nativeIdTokenMapping['iris-network'] = token;
        break;
      case AssetPlatform.Juno:
        switch (token) {
          case 'juno':
            nativeIdTokenMapping['juno-network'] = token;
            break;
          case 'juno1ur4jx0sxchdevahep7fwq28yk4tqsrhshdtylz46yka3uf6kky5qllqp4k':
            nativeIdTokenMapping.handshake = token;
            break;
          case 'juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz':
            nativeIdTokenMapping.fanfury = token;
            break;
          case 'juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n':
            nativeIdTokenMapping['hopers-io'] = token;
            break;
          case 'juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr':
            nativeIdTokenMapping.neta = token;
            break;
          case 'juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl':
            nativeIdTokenMapping['marble-dao'] = token;
            break;
          case 'juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z':
            nativeIdTokenMapping['hope-galaxy'] = token;
            break;
          case 'juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa':
            nativeIdTokenMapping.racoon = token;
            break;
          case 'juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g':
            nativeIdTokenMapping['junoswap-raw-dao'] = token;
            break;
          case 'juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv':
            nativeIdTokenMapping['stakeeasy-juno-derivative'] = token;
            break;
          case 'juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3':
            nativeIdTokenMapping['stakeeasy-bjuno'] = token;
            break;
          case 'juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf':
            nativeIdTokenMapping.seasy = token;
            break;
          case 'juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup':
            nativeIdTokenMapping.loop = token;
            break;
          case 'juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l':
            nativeIdTokenMapping.posthuman = token;
            break;
          case 'juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9':
            nativeIdTokenMapping.wynd = token;
            break;
        }
        break;
      case AssetPlatform.Ki:
        if (token === 'xki') nativeIdTokenMapping.ki = token;
        break;
      case AssetPlatform.LikeCoin:
        if (token === 'like') nativeIdTokenMapping.likecoin = token;
        break;
      case AssetPlatform.Lum:
        if (token === 'lum') nativeIdTokenMapping['lum-network'] = token;
        break;
      case AssetPlatform.Microtick:
        if (token === 'tick') nativeIdTokenMapping.microtick = token;
        break;
      case AssetPlatform.Oraichain:
        if (token === 'orai') nativeIdTokenMapping['oraichain-token'] = token;
        break;
      case AssetPlatform.Persistence:
        if (token === 'xprt') nativeIdTokenMapping.persistence = token;
        break;
      case AssetPlatform.Planq:
        if (token === 'planq') nativeIdTokenMapping.planq = token;
        break;
      case AssetPlatform.Provenance:
        if (token === 'hash') nativeIdTokenMapping['provenance-blockchain'] = token;
        break;
      case AssetPlatform.Rizon:
        if (token === 'atolo') nativeIdTokenMapping.rizon = token;
        break;
      case AssetPlatform.Sentinel:
        if (token === 'dvpn') nativeIdTokenMapping.sentinel = token;
        break;
      case AssetPlatform.Shentu:
        if (token === 'ctk') nativeIdTokenMapping.certik = token;
        break;
      case AssetPlatform.Sifchain:
        if (token === 'erowan') nativeIdTokenMapping.sifchain = token;
        break;
      case AssetPlatform.Sommelier:
        if (token === 'somm') nativeIdTokenMapping.sommelier = token;
        break;
      case AssetPlatform.Stargaze:
        if (token === 'stars') nativeIdTokenMapping.stargaze = token;
        break;
      case AssetPlatform.Starname:
        if (token === 'iov') nativeIdTokenMapping.starname = token;
        break;
      case AssetPlatform.Umee:
        if (token === 'umee') nativeIdTokenMapping.umee = token;
        break;
      case AssetPlatform.Vidulum:
        if (token === 'vdl') nativeIdTokenMapping.vidulum = token;
    }
  const nonNativeIdTokenMapping = await getNonNativeTokenIds(platform, addresses);
  const result = Object.assign(nativeIdTokenMapping, nonNativeIdTokenMapping);
  return result;
};
