import { Leap } from '@leapwallet/cosmos-wallet-provider'

import manifest from '../../public/base_manifest.json'
import { init } from './init'

const leap = new Leap(manifest.version, 'core')

init(leap)
