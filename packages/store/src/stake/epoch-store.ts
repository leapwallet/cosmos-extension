import { axiosWrapper, Delegation, NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { makeObservable } from 'mobx';

import { ChainInfosStore } from '../assets';
import { BaseQueryStore } from '../base/base-data-store';
import { formatTokenAmount } from '../utils';
import { decodeEpochMessage, EpochMessage } from '../utils/babylon/decode-epoch-message';
import { SelectedNetworkStore } from '../wallet';

type EpochMessageWithTxId = EpochMessage & {
  tx: string;
  type?: string;
};

type LatestEpochMsgsResponse = {
  latest_epoch_msgs: {
    epoch_number: bigint;
    msgs: {
      tx_id: string;
      msg_id: string;
      block_height: bigint;
      block_time?: Date;
      msg: string;
    }[];
  }[];
  pagination?: {
    next_key: Uint8Array;
    total: bigint;
  };
};

const txTypeToMsgType = {
  DELEGATE: '/babylon.epoching.v1.MsgWrappedDelegate',
  UNDELEGATE: '/babylon.epoching.v1.MsgWrappedUndelegate',
  UNBONDING_DELEGATION: '/babylon.epoching.v1.MsgWrappedCancelUnbondingDelegation',
  RE_DELEGATION: '/babylon.epoching.v1.MsgWrappedBeginRedelegate',
};

export class StakeEpochStore extends BaseQueryStore<EpochMessage[]> {
  data: EpochMessageWithTxId[] = [];
  private walletAddress?: string;
  private selectedNetworkStore: SelectedNetworkStore;
  private chainInfosStore: ChainInfosStore;

  constructor(selectedNetworkStore: SelectedNetworkStore, chainInfosStore: ChainInfosStore) {
    super();

    this.selectedNetworkStore = selectedNetworkStore;
    this.chainInfosStore = chainInfosStore;

    makeObservable(this);
  }

  get baseUrl() {
    return this.selectedNetworkStore.selectedNetwork === 'testnet'
      ? this.chainInfosStore.chainInfos.babylon.apis.restTest
      : this.chainInfosStore.chainInfos.babylon.apis.rest;
  }

  get totalDelegatedAmount() {
    return this.data.reduce((acc, epochMsg) => {
      if (epochMsg.type !== txTypeToMsgType.DELEGATE) {
        return acc;
      }

      return acc.plus(new BigNumber(epochMsg.amount.amount));
    }, new BigNumber(0));
  }

  setWalletAddress(walletAddress: string) {
    if (this.walletAddress === walletAddress) {
      return;
    }

    this.walletAddress = walletAddress;
    this.refetchData();
  }

  async fetchData() {
    if (!this.walletAddress) return [];

    const res = await axiosWrapper<LatestEpochMsgsResponse>({
      baseURL: this.baseUrl,
      url: `/babylon/epoching/v1/epochs:latest/messages?epoch_count=1&end_epoch=0`,
    }).catch(console.error);

    if (!res?.data) return [];
    const latestMsg = res.data.latest_epoch_msgs?.[0];

    if (!latestMsg) return [];
    const data = latestMsg.msgs
      .map((epochMsg) => {
        const decodedMsg = decodeEpochMessage(epochMsg.msg);
        if (!decodedMsg) return null;

        if (decodedMsg.delegatorAddress !== this.walletAddress) {
          return null;
        }

        return {
          tx: epochMsg.tx_id,
          ...decodedMsg,
        };
      })
      .filter(Boolean) as EpochMessageWithTxId[];

    const msgTypePromises = data.map(async (msg) => {
      const isValidType = await this.getTxType(msg.tx);
      return [msg, isValidType] as const;
    });

    const mesTypes = await Promise.all(msgTypePromises);
    const dataWithType = mesTypes.map(([msg, type]) => ({
      ...msg,
      type,
    }));

    return dataWithType;
  }

  async getTxType(txId: string) {
    const res = await axiosWrapper({
      baseURL: this.baseUrl,
      url: `/cosmos/tx/v1beta1/txs/${txId}`,
    }).catch(console.error);

    if (!res || !res.data) return;

    return res.data?.tx?.body?.messages?.[0]?.['@type'] as string;
  }

  getDelegationEpochMessages(activeStakingDenom: NativeDenom): Delegation[] {
    const delegations = this.data.reduce((acc, epochMsg) => {
      if (epochMsg.type !== txTypeToMsgType.DELEGATE) {
        return acc;
      }

      const { validatorAddress, amount } = epochMsg;
      if (!validatorAddress) {
        return acc;
      }

      if (!acc[validatorAddress]) {
        acc[validatorAddress] = new BigNumber(0);
      }

      acc[validatorAddress] = acc[validatorAddress].plus(
        new BigNumber(amount.amount).dividedBy(new BigNumber(10).pow(activeStakingDenom.coinDecimals || 6)),
      );
      return acc;
    }, {} as Record<string, BigNumber>);

    const delegation = Object.entries(delegations).map(
      ([validatorAddress, amount]) =>
        ({
          delegation: {
            delegator_address: this.data[0]?.delegatorAddress,
            validator_address: validatorAddress,
            shares: '',
          },
          balance: {
            amount: amount.toString(),
            denom: this.data[0]?.amount.denom,
            formatted_amount: formatTokenAmount(amount.toString(), activeStakingDenom.coinDenom),
            currencyAmount: '',
            denomFiatValue: '',
          },
          status: 'delegation_pending_epoch_cycle',
        } as Delegation),
    );

    delegation.sort((a, b) => {
      return new BigNumber(b.balance.amount).comparedTo(new BigNumber(a.balance.amount));
    });

    return delegation;
  }

  getReDelegationEpochMessages(activeStakingDenom: NativeDenom): Delegation[] {
    const data = this.data.reduce((acc, epochMsg) => {
      if (epochMsg.type !== txTypeToMsgType.RE_DELEGATION) {
        return acc;
      }

      const { validatorDstAddress, amount } = epochMsg;
      if (!validatorDstAddress) {
        return acc;
      }

      if (!acc[validatorDstAddress]) {
        acc[validatorDstAddress] = new BigNumber(0);
      }

      acc[validatorDstAddress] = acc[validatorDstAddress].plus(
        new BigNumber(amount.amount).dividedBy(new BigNumber(10).pow(activeStakingDenom.coinDecimals || 6)),
      );
      return acc;
    }, {} as Record<string, BigNumber>);

    const reDelegations = Object.entries(data).map(
      ([validatorDstAddress, amount]) =>
        ({
          delegation: {
            delegator_address: this.data[0]?.delegatorAddress,
            validator_address: validatorDstAddress,
            shares: '',
          },
          balance: {
            amount: amount.toString(),
            denom: this.data[0]?.amount.denom,
            formatted_amount: formatTokenAmount(amount.toString(), activeStakingDenom.coinDenom),
            currencyAmount: '',
            denomFiatValue: '',
          },
          status: 're_delegation_pending_epoch_cycle',
        } as Delegation),
    );

    reDelegations.sort((a, b) => {
      return new BigNumber(b.balance.amount).comparedTo(new BigNumber(a.balance.amount));
    });

    return reDelegations;
  }

  getUnDelegationEpochMessages(activeStakingDenom: NativeDenom) {
    const data = this.data.reduce((acc, epochMsg) => {
      if (epochMsg.type !== txTypeToMsgType.UNDELEGATE) {
        return acc;
      }

      const { validatorAddress, amount } = epochMsg;
      if (!validatorAddress) {
        return acc;
      }

      if (!acc[validatorAddress]) {
        acc[validatorAddress] = new BigNumber(0);
      }

      acc[validatorAddress] = acc[validatorAddress].plus(
        new BigNumber(amount.amount).dividedBy(new BigNumber(10).pow(activeStakingDenom.coinDecimals || 6)),
      );
      return acc;
    }, {} as Record<string, BigNumber>);

    return Object.entries(data).map(([validatorAddress, amount]) => ({
      delegatorAddress: this.data[0]?.delegatorAddress,
      validatorAddress,
      currencyBalance: '',
      balance: amount.toString(),
      formattedBalance: formatTokenAmount(amount.toString(), activeStakingDenom.coinDenom),
    }));
  }

  /**
   * Get a map of validator addresses and their corresponding unBonding delegation creation heights
   */
  get canceledUnBondingDelegationsMap() {
    return this.data.reduce((acc, epochMsg) => {
      if (epochMsg.type !== txTypeToMsgType.UNBONDING_DELEGATION || !epochMsg.creationHeight) {
        return acc;
      }
      const { creationHeight, validatorAddress } = epochMsg;
      if (!validatorAddress) {
        return acc;
      }

      if (!acc[validatorAddress]) {
        acc[validatorAddress] = [];
      }

      acc[validatorAddress].push(creationHeight);
      return acc;
    }, {} as Record<string, string[]>);
  }
}
