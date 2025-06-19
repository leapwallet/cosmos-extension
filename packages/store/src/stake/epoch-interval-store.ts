import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk';
import { differenceInHours, differenceInMinutes, isFuture } from 'date-fns';
import { makeObservable } from 'mobx';

import { ChainInfosStore } from '../assets';
import { BaseQueryStore } from '../base/base-data-store';
import { RootStakeStore } from '../root/root-store';
import { SelectedNetworkStore } from '../wallet';

export type EpochInterval = {
  currentEpochEndTime?: Date;
};

export class EpochIntervalStore extends BaseQueryStore<EpochInterval> {
  data: EpochInterval = {};
  private intervalId: NodeJS.Timeout | null = null;
  private rootStackStore: RootStakeStore;
  private chainInfoStore: ChainInfosStore;
  private selectNetworkStore: SelectedNetworkStore;

  constructor(
    rootStackStore: RootStakeStore,
    chainInfoStore: ChainInfosStore,
    selectNetworkStore: SelectedNetworkStore,
  ) {
    super();
    makeObservable(this);

    this.rootStackStore = rootStackStore;
    this.chainInfoStore = chainInfoStore;
    this.selectNetworkStore = selectNetworkStore;

    this.getData();
  }

  async fetchData() {
    const baseUrl =
      this.selectNetworkStore.selectedNetwork === 'testnet'
        ? this.chainInfoStore.chainInfos.babylon.apis.restTest
        : this.chainInfoStore.chainInfos.mainBabylon.apis.rest;

    const currentEpochRes = await axiosWrapper({
      baseURL: baseUrl,
      url: 'babylon/epoching/v1/current_epoch',
    }).catch(console.error);

    if (!currentEpochRes?.data) {
      return {};
    }

    const currentEpoch = +currentEpochRes.data.current_epoch;
    if (isNaN(currentEpoch)) {
      return {};
    }

    const [currentEpochDetailsRes, prevEpochDetailsRes1, prevEpochDetailsRes2, latestBlockDetailsRes] =
      (await Promise.all([
        axiosWrapper({
          baseURL: baseUrl,
          url: `babylon/epoching/v1/epochs/${currentEpoch}`,
        }),
        axiosWrapper({
          baseURL: baseUrl,
          url: `babylon/epoching/v1/epochs/${currentEpoch - 1}`, // get previous epoch cycle
        }),
        axiosWrapper({
          baseURL: baseUrl,
          url: `babylon/epoching/v1/epochs/${currentEpoch - 2}`, // get previous epoch cycle
        }),
        axiosWrapper({
          baseURL: baseUrl,
          url: `cosmos/base/tendermint/v1beta1/blocks/latest`,
        }),
      ]).catch(console.error)) || [];

    if (
      !prevEpochDetailsRes1?.data?.epoch ||
      !prevEpochDetailsRes2?.data?.epoch ||
      !currentEpochDetailsRes?.data?.epoch ||
      !latestBlockDetailsRes?.data?.block
    ) {
      return {};
    }

    const epochInterval = +currentEpochDetailsRes.data.epoch.current_epoch_interval;
    const lastBlockHeight = +latestBlockDetailsRes.data.block.header?.height;

    const remainingBlocks = epochInterval - (lastBlockHeight % epochInterval);
    if (isNaN(remainingBlocks)) {
      return {};
    }

    // get interval between last block of current - 1 and the last block of current - 2 block
    const lastEpochInterval =
      new Date(prevEpochDetailsRes1.data.epoch.last_block_time as string).getTime() -
      new Date(prevEpochDetailsRes2.data.epoch.last_block_time as string).getTime();

    const avgIntervalPerEpoch = lastEpochInterval / prevEpochDetailsRes1.data.epoch.current_epoch_interval;
    const currentEpochReamingTime = remainingBlocks * avgIntervalPerEpoch;

    const headRoom = 1000 * 60 * 1; // 1 mins
    const currentEpochEndTime = new Date(new Date().getTime() + currentEpochReamingTime + headRoom);

    this.setEpochInterval(currentEpochEndTime);

    return { currentEpochEndTime };
  }

  get timeLeft() {
    if (!this.data.currentEpochEndTime) {
      return '~1 hr';
    }

    const now = new Date();
    const target = new Date(this.data.currentEpochEndTime);

    if (!isFuture(target)) {
      return '~1 hr';
    }

    const minutesLeft = differenceInMinutes(target, now);
    if (minutesLeft >= 60) {
      const hoursLeft = differenceInHours(target, now);
      return `~${hoursLeft} hr`;
    }

    if (minutesLeft <= 1) {
      return '~1 min';
    }

    return `~${minutesLeft} min`;
  }

  refetchAllData() {
    return Promise.all([this.refetchData(), this.rootStackStore.updateStake()]);
  }

  // set interval based on the current epoch end time, refetch the stack epoch data
  setEpochInterval(currentEpochEndTime: Date) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    const interval = currentEpochEndTime.getTime() - Date.now();

    this.intervalId = setInterval(() => {
      this.refetchAllData();
    }, interval);
  }
}
