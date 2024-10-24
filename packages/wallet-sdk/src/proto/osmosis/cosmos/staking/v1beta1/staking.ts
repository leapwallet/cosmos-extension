// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../../../binary';

/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRates {
  /** rate is the commission rate charged to delegators, as a fraction. */
  rate: string;
  /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
  maxRate: string;
  /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
  maxChangeRate: string;
}
export interface CommissionRatesProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.CommissionRates';
  value: Uint8Array;
}
/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRatesAmino {
  /** rate is the commission rate charged to delegators, as a fraction. */
  rate: string;
  /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
  max_rate: string;
  /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
  max_change_rate: string;
}
export interface CommissionRatesAminoMsg {
  type: 'cosmos-sdk/CommissionRates';
  value: CommissionRatesAmino;
}
/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRatesSDKType {
  rate: string;
  max_rate: string;
  max_change_rate: string;
}
/** Commission defines commission parameters for a given validator. */
export interface Commission {
  /** commission_rates defines the initial commission rates to be used for creating a validator. */
  commissionRates: CommissionRates;
  /** update_time is the last time the commission rate was changed. */
  updateTime: Date;
}
export interface CommissionProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.Commission';
  value: Uint8Array;
}
/** Commission defines commission parameters for a given validator. */
export interface CommissionAmino {
  /** commission_rates defines the initial commission rates to be used for creating a validator. */
  commission_rates?: CommissionRatesAmino;
  /** update_time is the last time the commission rate was changed. */
  update_time?: Date;
}
export interface CommissionAminoMsg {
  type: 'cosmos-sdk/Commission';
  value: CommissionAmino;
}
/** Commission defines commission parameters for a given validator. */
export interface CommissionSDKType {
  commission_rates: CommissionRatesSDKType;
  update_time: Date;
}
/** Description defines a validator description. */
export interface Description {
  /** moniker defines a human-readable name for the validator. */
  moniker: string;
  /** identity defines an optional identity signature (ex. UPort or Keybase). */
  identity: string;
  /** website defines an optional website link. */
  website: string;
  /** security_contact defines an optional email for security contact. */
  securityContact: string;
  /** details define other optional details. */
  details: string;
}
export interface DescriptionProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.Description';
  value: Uint8Array;
}
/** Description defines a validator description. */
export interface DescriptionAmino {
  /** moniker defines a human-readable name for the validator. */
  moniker: string;
  /** identity defines an optional identity signature (ex. UPort or Keybase). */
  identity: string;
  /** website defines an optional website link. */
  website: string;
  /** security_contact defines an optional email for security contact. */
  security_contact: string;
  /** details define other optional details. */
  details: string;
}
export interface DescriptionAminoMsg {
  type: 'cosmos-sdk/Description';
  value: DescriptionAmino;
}
/** Description defines a validator description. */
export interface DescriptionSDKType {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}

function createBaseCommissionRates(): CommissionRates {
  return {
    rate: '',
    maxRate: '',
    maxChangeRate: '',
  };
}
export const CommissionRates = {
  typeUrl: '/cosmos.staking.v1beta1.CommissionRates',
  encode(message: CommissionRates, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.rate !== '') {
      writer.uint32(10).string(Decimal.fromUserInput(message.rate, 18).atomics);
    }
    if (message.maxRate !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.maxRate, 18).atomics);
    }
    if (message.maxChangeRate !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.maxChangeRate, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CommissionRates {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCommissionRates();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 2:
          message.maxRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.maxChangeRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CommissionRates>): CommissionRates {
    const message = createBaseCommissionRates();
    message.rate = object.rate ?? '';
    message.maxRate = object.maxRate ?? '';
    message.maxChangeRate = object.maxChangeRate ?? '';
    return message;
  },
  fromAmino(object: CommissionRatesAmino): CommissionRates {
    return {
      rate: object.rate,
      maxRate: object.max_rate,
      maxChangeRate: object.max_change_rate,
    };
  },
  toAmino(message: CommissionRates): CommissionRatesAmino {
    const obj: any = {};
    obj.rate = message.rate;
    obj.max_rate = message.maxRate;
    obj.max_change_rate = message.maxChangeRate;
    return obj;
  },
  fromAminoMsg(object: CommissionRatesAminoMsg): CommissionRates {
    return CommissionRates.fromAmino(object.value);
  },
  toAminoMsg(message: CommissionRates): CommissionRatesAminoMsg {
    return {
      type: 'cosmos-sdk/CommissionRates',
      value: CommissionRates.toAmino(message),
    };
  },
  fromProtoMsg(message: CommissionRatesProtoMsg): CommissionRates {
    return CommissionRates.decode(message.value);
  },
  toProto(message: CommissionRates): Uint8Array {
    return CommissionRates.encode(message).finish();
  },
  toProtoMsg(message: CommissionRates): CommissionRatesProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.CommissionRates',
      value: CommissionRates.encode(message).finish(),
    };
  },
};
function createBaseDescription(): Description {
  return {
    moniker: '',
    identity: '',
    website: '',
    securityContact: '',
    details: '',
  };
}
export const Description = {
  typeUrl: '/cosmos.staking.v1beta1.Description',
  encode(message: Description, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.moniker !== '') {
      writer.uint32(10).string(message.moniker);
    }
    if (message.identity !== '') {
      writer.uint32(18).string(message.identity);
    }
    if (message.website !== '') {
      writer.uint32(26).string(message.website);
    }
    if (message.securityContact !== '') {
      writer.uint32(34).string(message.securityContact);
    }
    if (message.details !== '') {
      writer.uint32(42).string(message.details);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Description {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDescription();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.moniker = reader.string();
          break;
        case 2:
          message.identity = reader.string();
          break;
        case 3:
          message.website = reader.string();
          break;
        case 4:
          message.securityContact = reader.string();
          break;
        case 5:
          message.details = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Description>): Description {
    const message = createBaseDescription();
    message.moniker = object.moniker ?? '';
    message.identity = object.identity ?? '';
    message.website = object.website ?? '';
    message.securityContact = object.securityContact ?? '';
    message.details = object.details ?? '';
    return message;
  },
  fromAmino(object: DescriptionAmino): Description {
    return {
      moniker: object.moniker,
      identity: object.identity,
      website: object.website,
      securityContact: object.security_contact,
      details: object.details,
    };
  },
  toAmino(message: Description): DescriptionAmino {
    const obj: any = {};
    obj.moniker = message.moniker;
    obj.identity = message.identity;
    obj.website = message.website;
    obj.security_contact = message.securityContact;
    obj.details = message.details;
    return obj;
  },
  fromAminoMsg(object: DescriptionAminoMsg): Description {
    return Description.fromAmino(object.value);
  },
  toAminoMsg(message: Description): DescriptionAminoMsg {
    return {
      type: 'cosmos-sdk/Description',
      value: Description.toAmino(message),
    };
  },
  fromProtoMsg(message: DescriptionProtoMsg): Description {
    return Description.decode(message.value);
  },
  toProto(message: Description): Uint8Array {
    return Description.encode(message).finish();
  },
  toProtoMsg(message: Description): DescriptionProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.Description',
      value: Description.encode(message).finish(),
    };
  },
};
