import { encodeSecp256k1Pubkey } from '@cosmjs/amino'
import { encodePubkey } from '@cosmjs/proto-signing'

type GetPublicKeyParams = {
  chainKey: string
  chainId: string
  coinType: string
  key: Uint8Array
}

export function getPublicKey({ chainKey, chainId, coinType, key }: GetPublicKeyParams) {
  const jsonKey = encodePubkey(encodeSecp256k1Pubkey(key))
  let path = ''
  if (chainKey === 'initiaEvm') {
    path = '/initia.crypto.v1beta1.ethsecp256k1.PubKey'
  } else if (chainId.startsWith('injective')) {
    path = '/injective.crypto.v1beta1.ethsecp256k1.PubKey'
  } else if (chainId.startsWith('evmos') || coinType === '60') {
    path = '/ethermint.crypto.v1.ethsecp256k1.PubKey'
  } else {
    path = '/cosmos.crypto.secp256k1.PubKey'
  }
  return {
    typeUrl: path,
    value: jsonKey.value,
  }
}
