import { SupportedChain } from './chain-infos';

export type ChainNetwork = 'mainnet' | 'testnet';
type FeeDenom = Record<SupportedChain, string>;

export type FeeDenoms = Record<ChainNetwork, FeeDenom>;

export const nativeFeeDenoms: FeeDenoms = {
  mainnet: {
    akash: 'uakt',
    axelar: 'uaxl',
    juno: 'ujuno',
    cosmos: 'uatom',
    osmosis: 'uosmo',
    secret: 'uscrt',
    persistenceNew: 'uxprt',
    persistence: 'uxprt',
    stargaze: 'ustars',
    emoney: 'ungm',
    sifchain: 'rowan',
    irisnet: 'uiris',
    sommelier: 'usomm',
    umee: 'uumee',
    starname: 'uiov',
    cryptoorg: 'basecro',
    comdex: 'ucmdx',
    assetmantle: 'umntl',
    crescent: 'ucre',
    kujira: 'ukuji',
    injective: 'inj',
    mars: 'umars',
    sei: 'usei',
    stride: 'ustrd',
    agoric: 'ubld',
    cheqd: 'ncheq',
    likecoin: 'nanolike',
    chihuahua: 'uhuahua',
    gravitybridge: 'ugraviton',
    fetchhub: 'afet',
    desmos: 'udsm',
    teritori: 'utori',
    jackal: 'ujkl',
    evmos: 'aevmos',
    bitsong: 'ubtsg',
    bitcanna: 'ubcna',
    canto: 'acanto',
    decentr: 'udec',
    carbon: 'swth',
    kava: 'ukava',
    omniflix: 'uflix',
    passage: 'upasg',
    terra: 'uluna',
    quasar: 'uqsr',
    neutron: 'untrn',
    coreum: 'utestcore',
    mainCoreum: 'ucore',
    quicksilver: 'uqck',
    migaloo: 'uwhale',
    kyve: 'ukyve',
    seiTestnet2: 'usei',
    seiDevnet: 'usei',
    onomy: 'anom',
    noble: 'usdc',
    impacthub: 'uixo',
    planq: 'aplanq',
    nomic: 'unom',
    nolus: 'unls',
    archway: 'aarch',
    chain4energy: 'uc4e',
    gitopia: 'ulore',
    nibiru: 'unibi',
    mayachain: 'cacao',
    empowerchain: 'umpwr',
    dydx: 'adydx',
    celestia: 'utia',
    sge: 'usge',
    bandchain: 'uband',
    sentinel: 'udvpn',
    kichain: 'uxki',
    aura: 'uaura',
    provenance: 'nhash',
    xpla: 'axpla',
    composable: 'ppica',
    pryzmtestnet: 'upryzm',
    thorchain: 'rune',
    odin: 'loki',
    dymension: 'udym',
    saga: 'usaga',
    initia: 'uinit',
    humans: 'aheart',
    lava: 'ulava',
    mantra: 'uom',
    ethereum: 'wei',
    forma: 'forma-native',
    civitia: 'l2/1666ede2bf1985307a86de36a6b78411cbf1edeffc2ac569e6a7b2f8753db4bb',
    milkyway: 'umilk',
    minimove: 'l2/4b66eb60bf9f503ea97fe4dc96d5c604c1dca14ee988e21510ac4b087bf72671',
    miniwasm: 'l2/2588fd87a8e081f6a557f43ff14f05dddf5e34cb27afcefd6eaf81f1daea30d0',
    arbitrum: 'arbitrum-native',
    polygon: 'polygon-native',
    base: 'base-native',
    optimism: 'optimism-native',
    blast: 'blast-native',
    manta: 'manta-native',
    lightlink: 'lightlink-native',
    unichain: 'unichain-native',
    bitcoin: 'bitcoin-native',
    bitcoinSignet: 'bitcoin-signet-native',
    flame: 'flame-native',
    avalanche: 'avalanche-native',
    bsc: 'binance-native',
    elys: 'uelys',
    babylon: 'ubbn',
    movement: 'movement-native',
    aptos: 'aptos-native',
    movementBardock: 'movement-native',
  },
  testnet: {
    akash: 'uakt',
    axelar: 'uaxl',
    juno: 'ujunox',
    cosmos: 'uatom',
    osmosis: 'uosmo',
    secret: 'uscrt',
    persistenceNew: 'uxprt',
    persistence: 'uxprt',
    stargaze: 'ustars',
    emoney: 'ungm',
    sifchain: 'rowan',
    irisnet: 'uiris',
    sommelier: 'usomm',
    umee: 'uumee',
    starname: 'uiov',
    cryptoorg: 'basecro',
    comdex: 'ucmdx',
    assetmantle: 'umntl',
    crescent: 'ucre',
    injective: 'inj',
    kujira: 'ukuji',
    mars: 'umars',
    sei: 'usei',
    stride: 'ustrd',
    agoric: 'ubld',
    cheqd: 'ncheq',
    likecoin: 'nanolike',
    chihuahua: 'uhuahua',
    gravitybridge: 'ugraviton',
    fetchhub: 'afet',
    desmos: 'udsm',
    teritori: 'utori',
    jackal: 'ujkl',
    evmos: 'aevmos',
    bitsong: 'ubtsg',
    bitcanna: 'ubcna',
    canto: 'acanto',
    decentr: 'udec',
    carbon: 'swth',
    kava: 'ukava',
    omniflix: 'uflix',
    passage: 'upasg',
    terra: 'uluna',
    quasar: 'uqsr',
    neutron: 'untrn',
    coreum: 'utestcore',
    mainCoreum: 'ucore',
    quicksilver: 'uqck',
    migaloo: 'uwhale',
    kyve: 'tkyve',
    seiTestnet2: 'usei',
    seiDevnet: 'usei',
    onomy: 'anom',
    noble: 'usdc',
    impacthub: 'uixo',
    planq: 'aplanq',
    nomic: 'unom',
    nolus: 'unls',
    archway: 'aconst',
    chain4energy: 'uc4e',
    gitopia: 'ulore',
    nibiru: 'unibi',
    mayachain: 'cacao',
    empowerchain: 'umpwr',
    dydx: 'adydx',
    celestia: 'utia',
    sge: 'usge',
    bandchain: 'uband',
    sentinel: 'udvpn',
    kichain: 'uxki',
    aura: 'uaura',
    provenance: 'nhash',
    xpla: 'axpla',
    composable: 'ppica',
    pryzmtestnet: 'upryzm',
    thorchain: 'rune',
    odin: 'loki',
    dymension: 'udym',
    saga: 'usaga',
    initia: 'uinit',
    humans: 'aheart',
    lava: 'ulava',
    mantra: 'uom',
    ethereum: 'wei',
    forma: 'forma-native',
    civitia: 'l2/1666ede2bf1985307a86de36a6b78411cbf1edeffc2ac569e6a7b2f8753db4bb',
    milkyway: 'umilk',
    minimove: 'l2/4b66eb60bf9f503ea97fe4dc96d5c604c1dca14ee988e21510ac4b087bf72671',
    miniwasm: 'l2/2588fd87a8e081f6a557f43ff14f05dddf5e34cb27afcefd6eaf81f1daea30d0',
    arbitrum: 'arbitrum-native',
    polygon: 'polygon-native',
    base: 'base-native',
    optimism: 'optimism-native',
    blast: 'blast-native',
    manta: 'manta-native',
    lightlink: 'lightlink-native',
    unichain: 'unichain-native',
    bitcoin: 'bitcoin-native',
    bitcoinSignet: 'bitcoin-signet-native',
    flame: 'flame-native',
    avalanche: 'avalanche-native',
    bsc: 'binance-native',
    elys: 'uelys',
    babylon: 'ubbn',
    movement: 'movement-native',
    aptos: 'aptos-native',
    movementBardock: 'movement-native',
  },
};
