import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'Cosmos Docs',
  description: 'Documentation for cosmos wallet packages @leapwallet',
  base: '/leap-cosmos/',

  lastUpdated: true,
  cleanUrls: 'without-subfolders',

  head: [
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    ['link', { rel: 'shortcut icon', href: '/leap-cosmos/favicon.ico', type: 'image/x-icon' }],
    ['link', { rel: 'stylesheet', href: '/leap-cosmos/styles.css' }],
    ['script', { src: '/leap-cosmos/script.js' }],
  ],

  markdown: {
    headers: {
      level: [0, 0],
    },
  },

  themeConfig: {
    logo: {
      src: '/icon-128.png',
      alt: 'Leap Cosmos Logo',
    },
    nav: nav(),
    sidebar: {
      '/sdk/': sidebarSDK(),
      '/hooks/': sidebarHooks(),
    },
    editLink: {
      pattern: 'https://github.com/leapwallet/leap-cosmos/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/leapwallet/leap-cosmos' }],
    footer: {
      message: 'Made with ♥️ in India at LeapWallet.io',
    },
    algolia: {
      // appId: '8J64VVRP8K',
      // apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
      // indexName: 'vitepress',
    },
  },
});

function nav() {
  return [
    { text: 'SDK', link: '/sdk/', activeMatch: '/sdk/' },
    {
      text: 'Hooks',
      link: '/hooks/',
      activeMatch: '/hooks/',
    },
    {
      text: 'Doc Template',
      link: '/template',
      activeMatch: '/template',
    },
  ];
}

/**
 *
 * @returns {import('vitepress').DefaultTheme.Sidebar}
 */
function sidebarSDK() {
  return [
    {
      text: 'Chains',
      collapsible: true,
      items: [
        { text: 'Get Channel IDs', link: '/sdk/chains/get-channel-ids' },
        { text: 'Get Validators List', link: '/sdk/chains/get-validators-list' },
        { text: 'Get Chain Info', link: '/sdk/chains/get-chain-info' },
      ],
    },
    {
      text: 'Types',
      collapsible: true,
      items: [
        { text: 'Chains', link: '/sdk/types/chains-metadata' },
        { text: 'Swaps', link: '/sdk/types/swaps' },
        { text: 'Validators', link: '/sdk/types/validators' },
        { text: 'Activity', link: '/sdk/types/activity' },
      ],
    },
    {
      text: 'Key',
      collapsible: true,
      items: [{ text: 'Wallet Generation', link: '/sdk/key/wallet-generation' }],
    },
    {
      text: 'Constants',
      collapsible: true,
      items: [{ text: 'Chain Info', link: '/sdk/constants/chain-info' }],
    },
    {
      text: 'Swap Modules',
      collapsible: true,
      items: [{ text: 'Get Swap Module', link: '/sdk/swap-modules/index' }],
    },
    {
      text: 'Activity',
      collapsible: true,
      items: [{ text: 'Parse Tx', link: '/sdk/activity/parse-tx' }],
    },
  ];
}

/**
 *
 * @returns {import('vitepress').DefaultTheme.Sidebar}
 */
function sidebarHooks() {
  return [
    {
      text: 'Store',
      collapsible: true,
      items: [{ text: 'Active Chain', link: '/hooks/store/active-chain' }],
    },
    {
      text: 'NFTs',
      collapsible: true,
      items: [
        { text: 'Get Tokens List', link: '/hooks/nfts/get-tokens-list' },
        { text: 'Get Owned Collection', link: '/hooks/nfts/get-owned-collection' },
        { text: 'Types', link: '/hooks/nfts/types' },
      ],
    },
    {
      text: 'Swaps',
      collapsible: true,
      items: [{ text: 'Use Swap Module', link: '/hooks/swaps/use-swap-module' }],
    },
    {
      text: 'Utils',
      collapsible: true,
      items: [
        { text: 'Format BigNumber', link: '/hooks/utils/format-big-number' },
        { text: 'Get IBC Channel IDs', link: '/hooks/utils/use-get-ibc-channel-ids' },
        { text: 'Denom Fetcher', link: '/hooks/utils/denom-fetcher' },
      ],
    },
    {
      text: 'Send',
      collapsible: true,
      items: [
        { text: 'Get Metadata', link: '/hooks/send/get-metadata' },
        { text: 'useSend', link: '/hooks/send/use-send' },
        { text: 'useSimpleSend', link: '/hooks/send/use-simple-send' },
      ],
    },
  ];
}
