import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';

import { MsgTransferONFT } from './tx-type';

export const customTypes = {
  TransferONFT: {
    typeUrl: '/OmniFlix.onft.v1beta1.MsgTransferONFT',
    type: MsgTransferONFT,
  },
  IBCTransferONFT: {
    typeUrl: '/ibc.applications.nft_transfer.v1.MsgTransfer',
    type: MsgTransfer,
  },
};

export const customRegistry = [
  [customTypes.TransferONFT.typeUrl, customTypes.TransferONFT.type],
  [customTypes.IBCTransferONFT.typeUrl, customTypes.IBCTransferONFT.type],
];
