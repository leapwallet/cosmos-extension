import { encodeSecp256k1Pubkey } from '@cosmjs/amino'
import { encodePubkey } from '@cosmjs/proto-signing'

type GetPublicKeyParams = {
  chainId: string
  coinType: string
  key: Uint8Array
}

export function getPublicKey({ chainId, coinType, key }: GetPublicKeyParams) {
  const jsonKey = encodePubkey(encodeSecp256k1Pubkey(key))
  let path = ''
  if (chainId.startsWith('injective')) {
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
