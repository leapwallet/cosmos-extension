import { Leap } from '@leapwallet/cosmos-wallet-provider/dist/provider/core'
import { LeapAptos } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-aptos'
import { LeapBitcoin } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-bitcoin'
import { LeapEvm } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-evm'

import manifest from '../../public/base_manifest.json'
import { isCompassWallet } from '../utils/isCompassWallet'
import { init } from './init'

const bitcoin = new LeapBitcoin()
const ethereum = new LeapEvm()
export const aptos = new LeapAptos()
const leap = new Leap(manifest.version, 'core', isCompassWallet() ? undefined : aptos)

init(leap, ethereum, aptos, bitcoin)
