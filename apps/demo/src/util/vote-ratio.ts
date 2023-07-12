import { VoteOptions } from '~/types/vote'

type TallyResult = {
  yes: string
  abstain: string
  no: string
  no_with_veto: string
}

type VoteSectionValues = {
  label: VoteOptions
  percentage: number
  selectedBorderCSS: string
  selectedBackgroundCSS: string
  isMajor: boolean
}

const borderCSS = {
  [VoteOptions.YES]: 'dark:border-green-800 border-green-300',
  [VoteOptions.ABSTAIN]: 'dark:border-gray-800 border-gray-200',
  [VoteOptions.NO]: 'dark:border-red-800 border-red-300',
  [VoteOptions.NO_WITH_VETO]: 'dark:border-red-800 border-red-300',
  GENERAL: 'dark:border-gray-800 border-gray-200',
}

const backgroundCSS = {
  [VoteOptions.YES]: 'bg-green-600/20',
  [VoteOptions.ABSTAIN]: 'bg-gray-600/20',
  [VoteOptions.NO]: 'bg-red-600/20',
  [VoteOptions.NO_WITH_VETO]: 'bg-red-600/20',
  GENERAL: 'bg-gray-600/20',
}

export function voteRatio(tally: TallyResult): VoteSectionValues[] {
  const yes = Number(tally.yes)
  const no = Number(tally.no)
  const noWithVeto = Number(tally.no_with_veto)
  const abstain = Number(tally.abstain)

  const total = yes + no + abstain + noWithVeto

  const yesPercentage = (yes / total) * 100
  const noPercentage = (no / total) * 100
  const noWithVetoPercentage = (noWithVeto / total) * 100
  const abstainPercentage = (abstain / total) * 100
  const maxPercentage = Math.max(
    yesPercentage,
    noPercentage,
    noWithVetoPercentage,
    abstainPercentage,
  )

  return [
    {
      label: VoteOptions.YES,
      percentage: yesPercentage,
      selectedBorderCSS:
        yesPercentage === maxPercentage ? borderCSS[VoteOptions.YES] : borderCSS.GENERAL,
      selectedBackgroundCSS:
        yesPercentage === maxPercentage ? backgroundCSS[VoteOptions.YES] : backgroundCSS.GENERAL,
      isMajor: yesPercentage === maxPercentage,
    },
    {
      label: VoteOptions.NO,
      percentage: noPercentage,
      selectedBorderCSS:
        noPercentage === maxPercentage ? borderCSS[VoteOptions.NO] : borderCSS.GENERAL,
      selectedBackgroundCSS:
        noPercentage === maxPercentage ? backgroundCSS[VoteOptions.NO] : backgroundCSS.GENERAL,
      isMajor: noPercentage === maxPercentage,
    },
    {
      label: VoteOptions.NO_WITH_VETO,
      percentage: noWithVetoPercentage,
      selectedBorderCSS:
        noWithVetoPercentage === maxPercentage
          ? borderCSS[VoteOptions.NO_WITH_VETO]
          : borderCSS.GENERAL,
      selectedBackgroundCSS:
        noWithVetoPercentage === maxPercentage
          ? backgroundCSS[VoteOptions.NO_WITH_VETO]
          : backgroundCSS.GENERAL,
      isMajor: noWithVetoPercentage === maxPercentage,
    },
    {
      label: VoteOptions.ABSTAIN,
      percentage: abstainPercentage,
      selectedBorderCSS:
        abstainPercentage === maxPercentage ? borderCSS[VoteOptions.ABSTAIN] : borderCSS.GENERAL,
      selectedBackgroundCSS:
        abstainPercentage === maxPercentage
          ? backgroundCSS[VoteOptions.ABSTAIN]
          : backgroundCSS.GENERAL,
      isMajor: abstainPercentage === maxPercentage,
    },
  ]
}
