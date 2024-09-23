import { GoogleProtobufAny } from '../../../../core-proto-ts';
import { getEthereumAddress, getInjectiveAddress } from '../../../../utils/address';

export const createAnyMessage = (msg: { type: string; value: Uint8Array }) => {
  const message = GoogleProtobufAny.Any.fromPartial({});
  message.typeUrl = `${msg.type.startsWith('/') ? '' : '/'}${msg.type}`;
  message.value = msg.value;

  return message;
};

export const createAny = (value: any, type: string) => {
  const message = GoogleProtobufAny.Any.fromPartial({});
  message.typeUrl = type;
  message.value = value;

  return message;
};

export const getInjectiveSignerAddress = (address: string | undefined) => {
  if (!address) {
    return '';
  }

  if (address.startsWith('inj')) {
    return address;
  }

  if (address.startsWith('0x')) {
    return getInjectiveAddress(address);
  }

  return '';
};

export const getEthereumSignerAddress = (address: string | undefined) => {
  if (!address) {
    return '';
  }

  if (address.startsWith('0x')) {
    return address;
  }

  if (address.startsWith('inj')) {
    return getEthereumAddress(address);
  }

  return '';
};
