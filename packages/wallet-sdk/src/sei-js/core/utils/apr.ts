import Long from 'long';

import { axiosWrapper } from '../../../healthy-nodes';

export async function estimateStakingAPR(restUrl: string) {
  try {
    const apis = {
      pool: '/cosmos/staking/v1beta1/pool',
      mintParams: '/seichain/mint/v1beta1/params',
    };

    const [pool, mintParams] = await Promise.all(
      Object.values(apis).map(async (api) => {
        try {
          const res = await axiosWrapper({
            baseURL: restUrl,
            url: api,
            method: 'get',
          });

          return res.data;
        } catch (_) {
          return {};
        }
      }),
    );

    const bondedTokens = Number(pool?.pool?.bonded_tokens);
    const mintSchedule = mintParams?.params?.token_release_schedule;

    if (!mintSchedule || !pool) {
      throw new Error('Failed to query mintSchedule or pool');
    }

    // Calculate number of tokens to be minted in the next year.
    const upcomingMintTokens = getUpcomingMintTokens(new Date(), 365, mintSchedule);

    // APR estimate is the number of tokens to be minted / current number of bonded tokens.
    return upcomingMintTokens / bondedTokens;
  } catch (_) {
    return 0;
  }
}

// Gets the number of tokens that will be minted in the given window based on the given releaseSchedule.
// Assumes that releaseSchedule has no overlapping schedules.
export function getUpcomingMintTokens(
  startData: Date,
  days: number,
  releaseSchedule: ScheduledTokenReleaseSDKType[],
): number {
  // End date is the exclusive end date of the window to query.
  // Ie. if start date is 2023-1-1 and days is 365, end date here will be 2024-1-1 so rewards will be calculated from 2023-1-1 to 2023-12-31
  const endDate = new Date(startData.getTime());
  endDate.setDate(endDate.getDate() + days);

  // Sort release schedule in increasing order of start time.
  const sortedReleaseSchedule = getSortedReleaseSchedule(releaseSchedule);

  let tokens = 0;
  for (const release of sortedReleaseSchedule) {
    // Skip all schedules that ended before today.
    if (release.endDate.getTime() < startData.getTime()) {
      continue;
    }

    // If the start date is after end date, we have come to the end of all releases we should consider.
    if (release.startDate.getTime() > endDate.getTime()) {
      break;
    }

    // All releases from here are part of the window.
    // The case where this release started before today.
    if (release.startDate.getTime() < startData.getTime()) {
      // Need to deduct 1 day from endDate to make it an inclusive end date.
      const earlierInclusiveEndDate = new Date(endDate.getTime());
      earlierInclusiveEndDate.setDate(earlierInclusiveEndDate.getDate() - 1);

      // Number of days left in this release.
      const daysLeft: number = calculateDaysInclusive(startData, earlierInclusiveEndDate);
      const totalPeriod: number = calculateDaysInclusive(release.startDate, release.endDate);
      tokens += (daysLeft / totalPeriod) * release.tokenReleaseAmount;
    }

    // The case where this release ends after our search window.
    else if (release.endDate.getTime() > endDate.getTime()) {
      const daysLeft: number = calculateDaysInclusive(release.startDate, endDate);
      const totalPeriod: number = calculateDaysInclusive(release.startDate, release.endDate);
      tokens += (daysLeft / totalPeriod) * release.tokenReleaseAmount;
    }

    // In the final case, the entire period falls within our window.
    else {
      tokens += release.tokenReleaseAmount;
    }
  }

  return tokens;
}

// Converts the releaseSchedule into ReleaseSchedule[] and sorts it by start date.
function getSortedReleaseSchedule(releaseSchedule: ScheduledTokenReleaseSDKType[]) {
  const releaseScheduleTimes = releaseSchedule.map((schedule) => {
    return createReleaseSchedule(schedule.start_date, schedule.end_date, schedule.token_release_amount);
  });

  // Sort release schedule in increasing order of start time.
  const sortedReleaseSchedule = releaseScheduleTimes.sort((x, y) => {
    return x.startDate.getTime() - y.startDate.getTime();
  });

  return sortedReleaseSchedule;
}

// Returns the number of days in the window inclusive of the start and end date.
function calculateDaysInclusive(startDate: Date, endDate: Date) {
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function createReleaseSchedule(start_date: string, end_date: string, token_release_amount: Long) {
  return {
    startDate: new Date(start_date),
    endDate: new Date(end_date),
    tokenReleaseAmount: Number(token_release_amount),
  };
}

export interface ScheduledTokenReleaseSDKType {
  start_date: string;
  end_date: string;
  token_release_amount: Long;
}
