import { Leap } from '@leapwallet/cosmos-wallet-provider/dist/provider/core'
import { LeapEvm } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-evm'

import manifest from '../../public/base_manifest.json'
import { init } from './init'

const ethereum = new LeapEvm()
const leap = new Leap(manifest.version, 'core')

init(leap, ethereum)
