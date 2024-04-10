import { Leap, LeapEvm } from '@leapwallet/cosmos-wallet-provider'

import manifest from '../../public/base_manifest.json'
import { init } from './init'

const ethereum = new LeapEvm()
const leap = new Leap(manifest.version, 'core')

init(leap, ethereum)
