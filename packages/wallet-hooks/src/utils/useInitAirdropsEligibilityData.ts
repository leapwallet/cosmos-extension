import { fromSmall, initResourceFromS3 } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAirdropsDataStore, useAirdropsEligibilityDataStore, useDenoms } from '../store';
import { queryAddresses } from './airdropsUtils';
import { useGetStorageLayer } from './global-vars';

const AIRDROPS_DATA = 'airdrops-data';
const AIRDROPS_DATA_LAST_UPDATED_AT = 'airdrops-data-last-updated-at';

const AIRDROPS_DATA_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/airdrops/airdrops-dashboard.json';
const AIRDROPS_DATA_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/airdrops/airdrops-dashboard-last-updated-at.json';

const AIRDROPS_DATA_ELIGIBILITY = 'airdrops-eligibility-data';
const AIRDROPS_DATA_ELIGIBILITY_LAST_UPDATED_AT = 'airdrops-eligibility-data-last-updated-at';

const AIRDROPS_DATA_ELIGIBILITY_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/airdrops/airdrops-eligibility.json';
const AIRDROPS_DATA_ELIGIBILITY_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/airdrops/airdrops-eligibility-last-updated-at.json';

export type AirdropEligibilityInfo = {
  name: string;
  airdropIcon: string;
  isEligible?: boolean;
  tokenInfo: {
    amount?: number;
    denom: string;
    subTitle?: string;
    address?: string;
  }[];
  CTAInfo?: {
    type: 'external' | 'internal';
    href: string;
    text: string;
  };
  totalAmount?: number;
  href?: string;
  isLinkedAddress?: boolean;
  isZeroState?: boolean;
  zeroStateGradient?: string;
  froge?: string;
  isHidden: boolean;
  status?: 'failed';
  id?: string;
  claimStartDate?: string;
  claimEndDate?: string;
};

export function useInitAirdropsEligibilityData() {
  const storage = useGetStorageLayer();
  const { airdropsData, setAirdropsData } = useAirdropsDataStore();
  const { setAirdropsEligibilityData } = useAirdropsEligibilityDataStore();
  const denoms = useDenoms();

  const [data, setData] = useState<Record<string, AirdropEligibilityInfo>>();
  const addresses = useRef<string[]>([]);

  const fetchAirdropsEligibilityData = useCallback((receivedAddresses: string[]) => {
    addresses.current = receivedAddresses;
    setAirdropsEligibilityData(null);

    initResourceFromS3({
      storage,
      setResource: (val) => setAirdropsData(val?.airdrops),
      resourceKey: AIRDROPS_DATA,
      resourceURL: AIRDROPS_DATA_URL,
      lastUpdatedAtKey: AIRDROPS_DATA_LAST_UPDATED_AT,
      lastUpdatedAtURL: AIRDROPS_DATA_LAST_UPDATED_AT_URL,
    });

    initResourceFromS3({
      storage,
      setResource: setData,
      resourceKey: AIRDROPS_DATA_ELIGIBILITY,
      resourceURL: AIRDROPS_DATA_ELIGIBILITY_URL,
      lastUpdatedAtKey: AIRDROPS_DATA_ELIGIBILITY_LAST_UPDATED_AT,
      lastUpdatedAtURL: AIRDROPS_DATA_ELIGIBILITY_LAST_UPDATED_AT_URL,
    });
  }, []);

  const formatData = async () => {
    const airdropsMetadata: Record<string, AirdropEligibilityInfo> = {};
    if (data) {
      Object.keys(data)
        .filter((airdrop) => !data[airdrop].isHidden)
        .forEach(
          (airdrop) =>
            (airdropsMetadata[airdrop] = {
              ...data[airdrop],
              isZeroState: true,
              href: `?airdrop=${airdrop}`,
              id: airdrop,
            }),
        );
    }

    const queryRes = await queryAddresses(
      addresses.current,
      Object.keys(airdropsMetadata)?.map((airdropId) => Number(airdropId)) ?? [],
    );

    if (Object.keys(queryRes)?.length > 0) {
      const rows: { [key: string]: AirdropEligibilityInfo } = {};
      const uniqueAirdropsIds = new Set(Object.keys(airdropsMetadata));
      Object.keys(queryRes).forEach((airdropId: string) => {
        const airdropEligibilityInfo = queryRes[airdropId];
        if (uniqueAirdropsIds.has(String(airdropId))) {
          uniqueAirdropsIds.delete(String(airdropId));
        }
        if (!airdropsMetadata?.[airdropId]) {
          return;
        }

        const airdropsDashboardData = {
          claimStartDate: airdropsData?.[airdropId]?.claimStartDate,
          claimEndDate: airdropsData?.[airdropId]?.claimEndDate,
        };

        if (airdropEligibilityInfo.success === true) {
          if (airdropEligibilityInfo?.data?.length > 0) {
            let totalAmount = 0;
            const tokenInfoData = airdropEligibilityInfo?.data?.map((eligibililtyData: any) => {
              const tokenInfo: any = { ...airdropsMetadata[airdropId].tokenInfo };
              if (!isNaN(eligibililtyData?.amount)) {
                let amount = eligibililtyData?.amount;
                let denom = eligibililtyData?.denom;
                if (denom && Object.keys(denoms ?? {})?.includes(denom)) {
                  amount = fromSmall(amount, denoms[denom]?.coinDecimals);
                  denom = denoms[denom]?.coinDenom ?? tokenInfo.denom;
                } else {
                  denom = tokenInfo.denom;
                }
                totalAmount = totalAmount + Number(amount);
                return {
                  ...tokenInfo,
                  address: eligibililtyData?.address,
                  amount: amount,
                  denom: denom,
                };
              }
            });

            const row: AirdropEligibilityInfo = {
              ...airdropsDashboardData,
              ...airdropsMetadata[airdropId],
              isZeroState: false,
              tokenInfo: tokenInfoData,
              totalAmount,
              isLinkedAddress: true,
              isEligible: true,
            };
            rows[airdropId] = row;
          } else {
            const row: AirdropEligibilityInfo = {
              ...airdropsDashboardData,
              ...airdropsMetadata[airdropId],
              tokenInfo: [],
              isZeroState: false,
              isEligible: false,
            };
            rows[airdropId] = row;
          }
        } else {
          const row: AirdropEligibilityInfo = {
            ...airdropsDashboardData,
            ...airdropsMetadata[airdropId],
            tokenInfo: [],
            isZeroState: false,
            isEligible: false,
            status: 'failed',
          };
          rows[airdropId] = row;
        }
      });
      setAirdropsEligibilityData(rows);
    }
  };

  const isDataNotNull = airdropsData && data;

  useEffect(() => {
    if (isDataNotNull) {
      (async () => await formatData())();
    }
  }, [isDataNotNull]);

  return { fetchAirdropsEligibilityData };
}
