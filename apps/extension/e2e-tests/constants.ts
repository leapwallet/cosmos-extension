/**
 * Test seed phrases and private keys for running wallet creation flow end-to-end test cases.
 * There is no harm in keeping them here as they don't really have any values.
 */

/**
 * A wallet created for testing
 */
export const TEST_SEED_PHRASE =
  'theory milk modify such core forum portion despair shift jar betray captain'

/**
 * A wallet created for testing using Keplr Social login
 */
export const KEPLR_SOCIAL_LOGIN_PRIVATE_KEY =
  '17a51edba3e2b2bab1f2257b1733049bb42a864f006ac3287f40f7ba49d1615d'

/**
 * Cosmos address of the wallet created using Keplr Social login
 */
export const KEPLR_SOCIAL_LOGIN_WALLET_COSMOS_ADDRESS =
  'cosmos12x6hrzd9gx7t0kxghrnx09wh6h2smjx7zylupr'

/**
 * A wallet created for testing with 24 words as a seed phrase
 */
export const TEST_SEED_PHRASE_24 =
  'emotion digital promote foil regular cloth treat shy vibrant drip element barrel borrow vacant curtain color senior quit uphold margin civil private fault private'

/**
 * Private key of the wallet created for testing 24 words seed phrase
 */
export const LONG_PRIVATE_KEY =
  'eyJuYW1lIjoiV2FsbGV0IDEiLCJhZGRyZXNzIjoidGVycmExcHN3amV2bGVrOW1tenUybDltcWNrM3lyampraHQ4MzlxOGZ6eWoiLCJlbmNyeXB0ZWRfa2V5IjoiNTVlNDQ4MjNhNWI0OTZhZmI0ZmFmNGM2NGZhMzY5NDA1MDYwYTFlOGFkMWYzMGM4YWE4NTEwMDYyOTRhOGU5YlJ2amQ5QnZ5R3plb2pYQlVKS2FuTWh4T3MvUlVVdmk4WXJHSnpMUExYY3c4bERhMmp0VmpVTlZ0c2JJdEtMWENvUUJHbC9LRDZkb0UzUjdFU3EzZm5XK3dxTzBqWFJwTjdEcjRjZDhtdmlNPSJ9'

/**
 * Juno private key
 */
export const JUNO_PRIVATE_KEY = '0x0ddf1659cecf51e03fc51c8a95b8dca5fed3a9c8a145405420cbd04a912d7138'

/**
 * Address of Wallet 1 of Noble testnet chain, this chain has been chosen
 * because we have some tokens that we can use for txs
 */
export const NOBLE_TEST_WALLET_ADDRESS = 'noble1psm3urxlc0ww5c295xzueczqucw34x9qpjad0p'

/**
 * Address of Wallet 1 of Osmosis testnet chain
 */
export const OSMOSIS_TEST_WALLET_ADDRESS = 'osmo1psm3urxlc0ww5c295xzueczqucw34x9qp2m4pa'

/**
 * Address of Wallet 2 of Noble testnet chain, for things such as sending
 * money to
 */
export const OTHER_NOBLE_TEST_WALLET_ADDRESS = {
  full: 'noble1gjqf5d2g7rmlmrng3ujrqff9caduwrllmghe5k',
  sliced: 'noble...ghe5k',
}

/**
 * Password to use for testing
 */
export const PASSWORD = 'blasphemy123@'
