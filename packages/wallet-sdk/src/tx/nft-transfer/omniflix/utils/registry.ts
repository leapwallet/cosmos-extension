import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';

import { MsgTransferONFT } from './tx-type';

export type TransferONFT = { typeUrl: '/OmniFlix.onft.v1beta1.MsgTransferONFT'; type: typeof MsgTransferONFT };
export type IBCTransferONFT = { typeUrl: '/ibc.applications.nft_transfer.v1.MsgTransfer'; type: typeof MsgTransfer };

export const customTypes: {
  TransferONFT: TransferONFT;
  IBCTransferONFT: IBCTransferONFT;
} = {
  TransferONFT: {
    typeUrl: '/OmniFlix.onft.v1beta1.MsgTransferONFT',
    type: MsgTransferONFT,
  },
  IBCTransferONFT: {
    typeUrl: '/ibc.applications.nft_transfer.v1.MsgTransfer',
    type: MsgTransfer,
  },
};

export const customRegistry: Array<
  [string, typeof customTypes.TransferONFT.type] | [string, typeof customTypes.IBCTransferONFT.type]
> = [
  [customTypes.TransferONFT.typeUrl, customTypes.TransferONFT.type],
  [customTypes.IBCTransferONFT.typeUrl, customTypes.IBCTransferONFT.type],
];
