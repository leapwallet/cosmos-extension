import { UR, UREncoder } from '@keystonehq/keystone-sdk';

export class LeapKeystoneTransactionEncoder {
  private encoder: UREncoder;

  constructor(private data: Uint8Array, private type: string, maxFragmentLength?: number) {
    this.encoder = new UREncoder(new UR(Buffer.from(this.data), this.type), maxFragmentLength ?? 200);
  }

  next() {
    return this.encoder.nextPart();
  }

  get size() {
    return this.encoder.fragmentsLength;
  }
}
