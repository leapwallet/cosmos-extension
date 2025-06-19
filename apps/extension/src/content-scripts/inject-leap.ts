import { Leap } from '@leapwallet/cosmos-wallet-provider/dist/provider/core'
import { LeapAptos } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-aptos'
import { LeapBitcoin } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-bitcoin'
import { LeapEvm } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-evm'
import { LeapSolana } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-solana'
import { LeapSui } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-sui'

import manifest from '../../public/base_manifest.json'
import { init } from './init'

const bitcoin = new LeapBitcoin()
const ethereum = new LeapEvm()
export const aptos = new LeapAptos()
export const solana = new LeapSolana()
const sui = new LeapSui()
const leap = new Leap(manifest.version, 'core', aptos, solana, sui)

init(leap, ethereum, aptos, bitcoin, solana, sui)
