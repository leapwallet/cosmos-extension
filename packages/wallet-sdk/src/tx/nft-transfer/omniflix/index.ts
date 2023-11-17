import { customTypes } from './utils/registry';
import { MsgTransferONFT } from './utils/tx-type';

export const createTransferOnftMessage = ({
  msgType = 'TransferONFT', // Todo support for 'Ibc'
  value,
}: {
  msgType?: 'TransferONFT';
  value: MsgTransferONFT; // valuse in camelCase
}) => {
  msgType = 'TransferONFT';
  const type = customTypes[msgType].type;
  const typeUrl = customTypes[msgType].typeUrl;
  const msgValue = type.encode(type.fromPartial(value)).finish();
  return {
    typeUrl: typeUrl,
    value: msgValue,
  };
};
