const today = new Date()
const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()

const proposals = [
  {
    proposal_id: '44',
    content: {
      '@type': '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
      title: 'Advancing Ethermint: GTM and Engineering Plan for the Ethermint Chain',
      description:
        'Tharsis is requesting 100,000 ATOMs from the Cosmos Hub community pool to fund, develop and advance the Ethermint project and launch an Ethermint Chain. n\n More details can be found in the long form proposal here: https://gateway.pinata.cloud/ipfs/QmWwJ63V4TuZkDfWoH66vxd6NK82g6rgPVnypESXBFRbws and https://github.com/cosmos/governance/pull/18 and https://forum.cosmos.network/t/advancing-ethermint-governance-proposal-gtm-and-engineering-plan-for-the-ethermint-chain/4554. \n\n The multisig administration includes:\n\t - @fedekunze (Federico Kunze Küllmer, Tharsis)\n\t - @zmanian (Zaki Manian, Iqlusion)\n\t - @marbar3778 (Marko Baricevic, Interchain GmbH)',
      recipient: 'cosmos124ezy53svellxqs075g69n4f5c0yzcy5slw7xz',
      amount: [
        {
          denom: 'uatom',
          amount: '100000000000',
        },
      ],
    },
    status: 'PROPOSAL_STATUS_VOTING_PERIOD',
    submit_time: '2021-04-06T08:20:18.765813712Z',
    deposit_end_time: '2021-04-20T08:20:18.765813712Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: startDate,
    voting_end_time: endDate,
  },
  {
    proposal_id: '42',
    content: {
      '@type': '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
      title: 'ZKValidator Community Spend Proposal',
      description:
        'ZKValidator Community Spend Proposal Q2 2021\n\nCommunity Spend proposal for a series of privacy focussed events. Submitted by ZKValidator (http://zkvalidator.com/)\n\n-=-=-\n\nThe proposal is to spend 5k Atoms from the community pool and to deliver four quarterly privacy focussed events. Three of them online and the fourth will be in-person. We will also deliver blog posts and youtube videos to wrap the events up. The content of the event will be presentations, showcases, panels and Q&A sessions around privacy on Cosmos. See our most recent events recordings here: (https://www.youtube.com/playlist?list=PLj80z0cJm8QGNPbPJ2adQhN5W890O7YMr)\n\nFull proposal on ipfs: (https://gateway.pinata.cloud/ipfs/QmYFYySsUPdtECuUmPCX7Dkt3cKBs423qwmofpYd5NXcJu)\n\nFull proposal on forum.cosmos.network: (https://forum.cosmos.network/t/zkvalidator-community-spend-proposal-privacy-events/4531)\n\n-=-=-\n\nAmount to spend from the community pool: 5000 ATOMs.',
      recipient: 'cosmos1xcvrq5fxalld6vvf4t5l38jlvdlj3wh4jk6c3y',
      amount: [
        {
          denom: 'uatom',
          amount: '5000000000',
        },
      ],
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '72665050546556',
      abstain: '412265069506',
      no: '21219766315820',
      no_with_veto: '48045104154',
    },
    submit_time: '2021-04-05T10:16:52.060303826Z',
    deposit_end_time: '2021-04-19T10:16:52.060303826Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2021-04-08T16:15:03.192076547Z',
    voting_end_time: '2021-04-22T16:15:03.192076547Z',
  },
  {
    proposal_id: '41',
    content: {
      '@type': '/cosmos.params.v1beta1.ParameterChangeProposal',
      title: 'Enable IBC transfers',
      description:
        'The Proposal enables transferring and receiving assets using the ICS20 standard on the Cosmos Hub. If this proposal passes, there will be IBC assets available in the Bank module of the Hub and ATOM will be available on Zones connected over IBC.\n Iqlusion believes that the IBC software is sufficiently stable for small amounts of value transfer. We expect there to be issues with stuck funds and UX confusion but overcoming these issues will only happen once IBC is live.\n Security Model\n Tendermint full nodes produce agreement under the assumption that at most ⅓ of the voting power held by validators is Byzantine.\n IBC\nIBC is a protocol for authenticated message passing between heterogeneous sovereign blockchains. IBC requires trusting that chains on both sides of the connections operate within their security model.\n Incentive Security Extensions\n IBC has a facility to support freezing connections once a violation of the security model has occurred. The set of criteria for detecting such attacks continues to evolve and is a constant focus of research.',
      changes: [
        {
          subspace: 'transfer',
          key: 'SendEnabled',
          value: 'true',
        },
        {
          subspace: 'transfer',
          key: 'ReceiveEnabled',
          value: 'true',
        },
      ],
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '111820292866240',
      abstain: '175820327',
      no: '75097962',
      no_with_veto: '0',
    },
    submit_time: '2021-03-12T22:22:04.759487214Z',
    deposit_end_time: '2021-03-26T22:22:04.759487214Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '554010000',
      },
    ],
    voting_start_time: '2021-03-15T08:45:34.255967187Z',
    voting_end_time: '2021-03-29T08:45:34.255967187Z',
  },
  {
    proposal_id: '38',
    content: {
      '@type': '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal',
      title: 'Signal Proposal to Adopt the Liquidity Module onto the Cosmos Hub',
      description:
        'Summary: Tendermint (https://tendermint.com) and B-Harvest (https://bharvest.io) have joined forces to produce and develop a Liquidity Module (https://github.com/tendermint/liquidity). This signal proposal is a Request For Comment to the ATOM community regarding the addition of this Liquidity Module into the Cosmos Hub source code.\nBy voting YES to this proposal, you will signal that you approve of having a DEX based on this specific Liquidity Module deployed on the Cosmos Hub.\nDetail of the proposal can be found at IPFS link below.\n\nCurrent Development : https://github.com/tendermint/liquidity/tree/develop\nIPFS : https://ipfs.io/ipfs/QmZpgkYLoCBnXM1S7TEdQunMmur9bAw5VTNgFQCyrqgKDd',
      plan: {
        name: 'Signal Proposal to Adopt the Liquidity Module onto the Cosmos Hub',
        time: '9999-12-31T00:00:00Z',
        height: '0',
        info: '',
        upgraded_client_state: null,
      },
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '72354132146827',
      abstain: '20137669036050',
      no: '19671757060',
      no_with_veto: '4900000',
    },
    submit_time: '2021-03-01T07:32:12.270741190Z',
    deposit_end_time: '2021-03-15T07:32:12.270741190Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '768020000',
      },
    ],
    voting_start_time: '2021-03-03T05:19:22.474110101Z',
    voting_end_time: '2021-03-17T05:19:22.474110101Z',
  },
  {
    proposal_id: '37',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Stargate Upgrade- Second time is a charm!',
      description:
        'Proposal to complete the Stargate upgrade, halt `cosmoshub-3` at 06:00 UTC on Feb 18th, export the state and start `cosmoshub-4` based on gaia 4.0.\n\n Gaia Commit hash: \n a279d091c6f66f8a91c87943139ebaecdd84f689  Proposal details can be found on \n github: https://github.com/cosmos/governance/pull/13 \n Rendered: https://ipfs.io/ipfs/QmTkzDwWqPbnAh5YiV5VwcTLnGdwSNsNTn2aDxdXBFca7D/example#/ipfs/QmYn2SxCMYk5SWs5GMcXdbXR8wMCCXRmCyW19SFyzSeZp1 \n ipfs: https://cloudflare-ipfs.com/ipfs/QmYn2SxCMYk5SWs5GMcXdbXR8wMCCXRmCyW19SFyzSeZp1 \n sia: https://siasky.net/EACAsPcUjpTEpQlG9_nRI1OR07gNeRiudfEWAvKnf0tj_Q \n  ',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '88530588570370',
      abstain: '712303271059',
      no: '7142724106',
      no_with_veto: '2230224099',
    },
    submit_time: '2021-01-28T21:07:30.044676129Z',
    deposit_end_time: '2021-02-11T21:07:30.044676129Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '567000000',
      },
    ],
    voting_start_time: '2021-01-29T05:35:54.623785165Z',
    voting_end_time: '2021-02-12T05:35:54.623785165Z',
  },
  {
    proposal_id: '36',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Delay of Hub Stargate Upgrade for approximately 2 weeks',
      description:
        'The Stargate team is recommending that the Cosmos Hub reschedule the next upgrade to a new commit hash. The new commit hash is expected to be available on Tuesday Jan 26th with a new upgrade proposal immediately after.\n\nThis governance proposal will signal that [proposal 35](https://www.mintscan.io/cosmos/proposals/35) will not be executed. The Hub governance will vote on the forthcoming proposal aiming for a final upgrade. The earliest target date would be February 11th. Given that Lunar New Year is on Feb 12th. The next best date is Feb 18th 06:00UTC.\n\nWe are recommending the delay for the following reasons.\n\n* Bugs have been identified in the Proposal 29 implementation.  They are resolved in this pull request[Additional review of prop 29 and migration testing by zmanian · Pull Request #559 · cosmos/gaia · GitHub](https://github.com/cosmos/gaia/pull/559)\n* A balance validation regression was identified during Prop 29 code review. [x/bank: balance and metadata validation by fedekunze · Pull Request #8417 · cosmos/cosmos-sdk · GitHub](https://github.com/cosmos/cosmos-sdk/pull/8417)\n* The IBC Go To Market Working Group has [identified Ledger hardware wallet](https://github.com/cosmos/cosmos-sdk/issues/8266) support as a necessary feature for the initial launch of IBC on the Hub. We have an opportunity to provide this support in this upgrade. The SDK believes this can be quickly remediated in the time available with merged PRs on Monday.\n* The number of Stargate related support requests from integrators has increased significantly since the governance proposal went live but some teams have already announced a period of reduced $ATOM support while they upgrade like <https://twitter.com/Ledger_Support/status/1352247403605356551?s=20>. The additional time should minimize the disruption for $ATOM holders. Thank so much to the $IRIS team whom is fielding a similar request volume among our non-English community.',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '112975355003343',
      abstain: '1266949600661',
      no: '19317817353',
      no_with_veto: '20323204167',
    },
    submit_time: '2021-01-24T15:51:52.051468824Z',
    deposit_end_time: '2021-02-07T15:51:52.051468824Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2021-01-24T17:22:39.722711413Z',
    voting_end_time: '2021-02-07T17:22:39.722711413Z',
  },
  {
    proposal_id: '35',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Cosmos Stargate Hub Upgrade Proposal 2: Time to Upgrade.',
      description:
        'Proposal to complete the Stargate upgrade, halt `cosmoshub-3` at 06:00 UTC on Jan 28th, export the state and start `cosmoshub-4` based on gaia 3.0.\n\n Gaia Commit hash: \n d974b27a8caf8cad3b06fbe4678871e4b0b69a51  Proposal details can be found on \n github: https://github.com/cosmos/governance/pull/5 \n ipfs: https://cloudflare-ipfs.com/ipfs/QmPww2PSmkmuLLu12GGwRdu5ur1Etf9u3Nt3Z6NqB7BQP1 \n sia: https://siasky.net/EAALGMzFCafvbKkQjnAieo2cA1mpxk-JLpKsiC4XxuM6eQ',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '83031841971944',
      abstain: '34061170179',
      no: '22423746556183',
      no_with_veto: '12653004202939',
    },
    submit_time: '2021-01-12T01:37:07.471992293Z',
    deposit_end_time: '2021-01-26T01:37:07.471992293Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '556002000',
      },
    ],
    voting_start_time: '2021-01-12T03:16:59.677362837Z',
    voting_end_time: '2021-01-26T03:16:59.677362837Z',
  },
  {
    proposal_id: '34',
    content: {
      '@type': '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
      title: 'Luna Mission - Funding $ATOM',
      description:
        'The Cosmos Hub (ATOM) community is requesting a community pool spend amount of 129,208 ATOM in order to implement a comprehensive ATOM marketing plan that will be executed in collaboration with AiB (Tendermint). The marketing efforts will be initiated immediately upon passing of proposal #34.\n\n The distribution of funds will be administered by 5 community members, that have been carefully selected by the community via the Cosmos governance working group to administer the marketing plan and release funds to either AiB that will act as a liaison between Cosmos Hub community and third parties or directly to parties that will be in charge of executing the marketing plan based on a majority multisignature approval. At least 3 members will have to approve each milestone-spend for it to be released to AiB based on the expected proposal scope &completion. \n\n More details can be found in the long form proposal here: https://cloudflare-ipfs.com/ipfs/QmWAxtxf7fUprPVWx1jWyxSKjBNqkcbA3FG6hRps7QTu3k and https://github.com/cosmos/governance/pull/10 and https://forum.cosmos.network/t/draft-governance-proposal-for-a-community-pool-spend-proposal-33-luna-mission-funding-atom/4244/15 \n\n The multisig administration includes: \n @johnniecosmos, @JoeDirtay, @jackzampolin (Jack Zampolin, Pylon Validator), @immasssi (SG-1 Validator), @zakimanian (Zaki Manian, Iqlusion Validator).',
      recipient: 'cosmos16plylpsgxechajltx9yeseqexzdzut9g8vla4k',
      amount: [
        {
          denom: 'uatom',
          amount: '129208000000',
        },
      ],
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '84872217254701',
      abstain: '21629199841870',
      no: '8164358907348',
      no_with_veto: '624894869',
    },
    submit_time: '2021-01-05T23:09:26.477112871Z',
    deposit_end_time: '2021-01-19T23:09:26.477112871Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2021-01-06T17:09:48.361764171Z',
    voting_end_time: '2021-01-20T17:09:48.361764171Z',
  },
  {
    proposal_id: '33',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Leap Wallet should be the de-facto wallet for cosmos',
      description:
        'The only non-custodial super wallet for web3. Leap is the simplest & safest way to send, swap, and stake tokens.\nInstall Leap Wallet now from https://bit.ly/3fyNb0h',
      recipient: 'cosmos124ezy53svellxqs075g69n4f5c0yzcy5slw7xz',
      amount: [],
    },
    status: 'PROPOSAL_STATUS_VOTING_PERIOD',
    submit_time: '2021-04-06T08:20:18.765813712Z',
    deposit_end_time: '2021-04-20T08:20:18.765813712Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: startDate,
    voting_end_time: endDate,
  },
  {
    proposal_id: '32',
    content: {
      '@type': '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
      title: 'Funding for Development of Governance Split Votes',
      description:
        'Sikka is requesting 1776 ATOMs from the community pool to architect and implement the Governance Split Votes feature proposed in Cosmos Hub Proposal #31. This community fund proposal is dependent on the passing of Proposal #31 and thus should only be approved if Proposal #31 is approved. We request 1776 ATOMs, valuing each atom at $5.1 \n\nSikka has already begun the design of this feature and submitted it as ADR 037 to the Cosmos Hub: https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-037-gov-split-vote.md \n\n As past contributors to the codebase that runs the Cosmos Hub, we are familiar with the security and code quality requirements to be included in the Cosmos Hub.  Sikka will implement & test this feature and will work with the maintainers of the github.com/cosmos/cosmos-sdk repo to get it merged into the x/gov module.',
      recipient: 'cosmos1ey69r37gfxvxg62sh4r0ktpuc46pzjrmz29g45',
      amount: [
        {
          denom: 'uatom',
          amount: '1776000000',
        },
      ],
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '76951560777331',
      abstain: '14188515730075',
      no: '63568377574',
      no_with_veto: '0',
    },
    submit_time: '2020-11-24T17:22:36.584208993Z',
    deposit_end_time: '2020-12-08T17:22:36.584208993Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '514000000',
      },
    ],
    voting_start_time: '2020-11-24T19:05:51.541527469Z',
    voting_end_time: '2020-12-08T19:05:51.541527469Z',
  },
  {
    proposal_id: '31',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Governance Split Votes',
      description:
        "In the Cosmos Hub governance system, each address can only cast a vote for one option (Yes/No/Abstain/NoWithVeto) which uses their full voting power behind that choice.\n\nThis proposal proposes an upgrade to the Cosmos Hub governance module that would allow a staker to optionally split their votes into several voting options. For example, a single address could use 70% of its voting power to vote Yes and 30% of its voting power to vote No. Clients may opt into supporting this feature, as the existing UX of voting for a single option is preserved.\n\nThis is beneficial because oftentimes the entity owning that address might not be a single individual. For example, a company or organization that owns an address might have different stakeholders who want to vote differently, and so it makes sense to allow them to split their voting power.\n\nAnother example use case is exchanges and custodians. Many custodians and exchanges custody multiple customers’ ATOMs in the same address and use this address to stake on behalf of them. However, because of this, it makes it infeasible to do 'passthrough voting' and give their customers voting rights over their tokens, if different customers have different voting preferences. With this new proposal, custodians can use split votes to accurately reflect the preferences of their customers in on-chain governance.\n\nThe technical architecture for this feature can be seen in ADR 037 to the Cosmos SDK: https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-037-gov-split-vote.md \n\nAcceptance of this governance proposal is signalling approval to adopt this feature in a future upgrade of the Cosmos Hub.",
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '78243188462092',
      abstain: '2665118949431',
      no: '60184365788',
      no_with_veto: '99',
    },
    submit_time: '2020-11-23T00:53:38.508414880Z',
    deposit_end_time: '2020-12-07T00:53:38.508414880Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2020-11-23T01:03:57.407886020Z',
    voting_end_time: '2020-12-07T01:03:57.407886020Z',
  },
  {
    proposal_id: '30',
    content: {
      '@type': '/cosmos.params.v1beta1.ParameterChangeProposal',
      title: 'Adjust Blocks Per Year to 4.36M',
      description:
        'While the current inflation rate is set at 7%, the effective inflation rate is more like ~6.29%. This is because blocks have slowed down somewhat from ~6.5s to ~7.24s per block, and thus the current blocks per year value of 4855015 is too high. Here we propose to adjust the blocks per year value from 4855015 to 4360000 to bring it in line with current block times, which should realign the effective inflation rate. More details were drafted on Github (https://github.com/cosmos/governance/tree/master/proposals/2020-10-blocks-per-year) and are available on IPFS (https://ipfs.io/ipfs/QmTkzDwWqPbnAh5YiV5VwcTLnGdwSNsNTn2aDxdXBFca7D/example#/ipfs/QmTZ3R4W2odBsx6hpt7awfRTfZA67x5eQaoL6ctxBr6NyN)',
      changes: [
        {
          subspace: 'mint',
          key: 'BlocksPerYear',
          value: '"4360000"',
        },
      ],
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '107762154303102',
      abstain: '3288804088',
      no: '32749535328',
      no_with_veto: '5093003292',
    },
    submit_time: '2020-11-03T02:35:05.578046799Z',
    deposit_end_time: '2020-11-17T02:35:05.578046799Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512006000',
      },
    ],
    voting_start_time: '2020-11-04T10:15:16.314802042Z',
    voting_end_time: '2020-11-18T10:15:16.314802042Z',
  },
  {
    proposal_id: '29',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title:
        'Genesis fund recovery proposal on behalf of fundraiser participants unable to access their ATOMs',
      description:
        'The purpose of this proposal is to restore access to geneis ATOMs for a subset of donors who have been active participants in our community through the last year.\n The view of iqlusion is that this is an important moment for the Cosmos Hub. Stargate brings the fundraiser period to the end with delivery of IBC. This proposal resolves the open business of active members of our community who cannot access their ATOM. This is an opportunity is opporunity to bring this business to a close and setup the agenda for IBC powered innovation comming in 2021.We strongly encourage the Cosmos Community to verify the cryptographic evidence and bring these community members to full ATOM holder status.\n\n\nFull Proposal:https://ipfs.io/ipfs/QmV6pBgDppN7X3BdVW197EUe7dpcmcdLMivPa6xxtPj3aW \nThe original authors of the proposal will be available to answer questions on the Cosmos forum.\nhttps://forum.cosmos.network/t/updated-genesis-atoms-recovery-request-proposal/3905',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '60252124759321',
      abstain: '19764603711398',
      no: '6614606743206',
      no_with_veto: '998582410890',
    },
    submit_time: '2020-09-09T06:47:46.521375251Z',
    deposit_end_time: '2020-09-23T06:47:46.521375251Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2020-09-09T06:47:46.521375251Z',
    voting_end_time: '2020-09-23T06:47:46.521375251Z',
  },
  {
    proposal_id: '27',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Stargate Upgrade Proposal 1',
      description:
        'Stargate is our name for the process of ensuring that the widely integrated public network known as the Cosmos Hub is able to execute the cosmoshub-3 -> cosmoshub-4 upgrade with the minimum disruption to its existing ecosystem. This upgrade will also realize the Internet of Blockchains vision from the Cosmos whitepaper.\nIntegrations from ecosystem partners are at risk of breaking changes due to the Stargate changes. These changes drive the need for substantial resource and time requirements to ensure successful migration. Stargate represents a unique set of circumstances and is not intended to set precedent for future upgrades which are expected to be less dramatic.\nThere is a widespread consensus from many Cosmos stakeholders that these changes to core software components will enhance the performance and composability of the software and the value of the Cosmos Hub in a world of many blockchains.\nA Yes result on this proposal provides a clear signal that the Cosmos Hub accepts and understands the Stargate process and is prepared to approve an upgrade with proposed changes if the plan below is executed successfully.\nA No result would force a reconsideration of the tradeoffs in the Alternatives section and the forming a new plan to deliver IBC.\nSee the full proposal here: https://ipfs.io/ipfs/Qmbo3fF54tX3JdoHZNVLcSBrdkXLie56Vh2u29wLfs4PnW',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '101845973043268',
      abstain: '559408864',
      no: '21185026706',
      no_with_veto: '106144492',
    },
    submit_time: '2020-07-12T06:23:02.440964897Z',
    deposit_end_time: '2020-07-26T06:23:02.440964897Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2020-07-13T01:37:47.298505506Z',
    voting_end_time: '2020-07-27T01:37:47.298505506Z',
  },
  {
    proposal_id: '26',
    content: {
      '@type': '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
      title: 'Takeoff Proposal from Cyber to Cosmos',
      description:
        "cyber Congress (https://cybercongress.ai) developed Cyber (https://github.com/cybercongress/go-cyber): a software for replacing existing internet behemoth monopolies, such as Google, which exploited outdated internet protocols using the common patterns of our semantic interaction. These corps lock the information, produced by the users, from search, social and commercial knowledge graphs in private databases, and then sell this knowledge back as advertisement. They stand as an insurmountable wall between content creators and consumers extracting an overwhelming majority of the created value.\n\nWe propose ATOM holders to invest 10,000 ATOM from the community pool into the Takeoff of Cyber. In exchange, at the end of its donation round (https://cyber.page/gol/takeoff), and when an IBC connection will become possible, cyber Congress will transfer CYB tokens back to the community pool. Passing this proposal will transfer 10,000 ATOMs from the community pool to cyber Congress multisig (https://www.mintscan.io/account/cosmos1latzme6xf6s8tsrymuu6laf2ks2humqv2tkd9a).\n\nFull Proposal-Manifest text: https://ipfs.io/ipfs/QmUYDQt9tqLQJwxnUck7dQY3XmZA3tDtpFh3Hchkg7oH46\n\nor at https://cyber.page/gol/takeoff\n\nThe software we offer resembles a decentralized google (https://github.com/cybercongress):\n- A protocol spec and the rationale behind it\n- go-cyber: our implementation using cosmos-sdk\n- cyber.page: PoC reference web interface\n- launch-kit: useful tools for launching cosmos-sdk based chains\n- cyberindex: GraphQL middleware for cyber\n- euler Foundation: mainnet predecessor of cyber Foundation: the DAO, which will handle all the donated ETH\n- documentation and various side tools\n\nCyber solves the problem of opening up the centralised semantics core of the Internet. It does so by opening up access to evergrowing semantics core taught to it by the users.\n\nEconomics of the protocol are built around the idea that feedback loops between the number of links and the value of the knowledge graph exist. The more usage => the bigger the knowledge graph => the more value => the better the quality of the knowledge => the more usage. Transaction fees for basic operations are replaced by lifetime bandwidth, which means usability for both, end-users and developers. You can think of Cyber as a shared ASIC for search.\n\nYou already see that the idea of Cyber evolves around content identifiers and its ranks. From here, welcome to Decentralized Marketing, or DeMa. You've certainly heard of DeFi. DeFi is built around a simple idea that you can use a collateral for something that will be settled based on a provided price feed. Here comes the systematic problem of DeFi: price oracles. DeMa is based on the same idea of using collateral, but the input for settlement can be information regarding the content identifier itself.\n\nWith the help of DeMa and IBC chains will be able to prove relevance using content identifiers and their ranks one to another. This will help to grow the IBC ecosystem, where each chain has multiple possibilities to exchange data, which is provably valued.\n\nCosmos was created to become the internet of blockchains. A protocol that propagates the spirit of decentralization and governed by the community. For such technology to succeed, a lot is required. One thing is a solid foundation it can build on. One virtue of such foundation is monetary flow of income that has to feed this machine for as long as it exists.\n\nA good question that arises is how to turn the community pool into a pool that isn’t (a) a pot of money which goes solely to network security, (b) a pool that isn’t solely a build-up of inflationary rewards and (с) has long term prosperity value (its value rises).\n\nThe solution to the above problem is to establish a fund, that is managed and processed collectively and consists of a diversified number of assets that can bring long term value to its stakeholders.\n\nThis means using the funds to support exceptional projects that are building with Tendermint and Cosmos-SDK. After all, is we want to glorify the ecosystem, we need for it to grow. How will it grow? It will have projects with a clear utility, amazing a product and provable distribution. This will attract users, developers and large stakeholders to the ecosystem. Together we already did one very successful investment decision. We all participated in cosmos fundraizer. So let us move the idea forward.\n\nIf this proposal is successful and stands for more demand from the public, we will open another proposal using the community pool. However, anyone can participate in Game of Links (https://cyber.page/gol/) or Takeoff https://cyber.page/gol/takeoff independently. If you have question you can ask them either on Cyber topic on Cosmos forum (https://forum.cosmos.network/t/cyber-a-decentralized-google-for-provable-and-relevant-answers) or Cyber forum (https://ai.cybercongress.ai).\n\nProposal results: https://www.mintscan.io/proposals/26",
      recipient: 'cosmos1latzme6xf6s8tsrymuu6laf2ks2humqv2tkd9a',
      amount: [
        {
          denom: 'uatom',
          amount: '10000000000',
        },
      ],
    },
    status: 'PROPOSAL_STATUS_REJECTED',
    final_tally_result: {
      yes: '25247651668590',
      abstain: '30887048132382',
      no: '47223322778439',
      no_with_veto: '18719964938',
    },
    submit_time: '2020-05-21T18:00:11.292428073Z',
    deposit_end_time: '2020-06-04T18:00:11.292428073Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2020-05-21T18:00:11.292428073Z',
    voting_end_time: '2020-06-04T18:00:11.292428073Z',
  },
  {
    proposal_id: '25',
    content: {
      '@type': '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
      title: 'CosmWasm Integration 1 - Permissions and Upgrades',
      description:
        "CosmWasm Integration 1 - Permissions and Upgrades\n\nCommunity-spend proposal submitted by Ethan Frey (https://github.com/ethanfrey) of Confio UO (http://confio.tech/) and CosmWasm (https://www.cosmwasm.com)\n\n-=-=-\n\nFull proposal: https://ipfs.io/ipfs/QmbD3bMajQCFmtDmkuRVWhmMWVdN2sK8QP2FoFCz9cjPiC\nForum Post: https://forum.cosmos.network/t/proposal-cosmwasm-on-cosmos-hub/3629\n\n-=-=-\n\nAmount to spend from the community pool: 25000 ATOMs\n\nTimeline: 2-4 months from approval\n\nDeliverables:\n1. Adding governance control to all aspects of the CosmWasm contract lifecycle to make it compatible with the hub. Allowing governance to control code upload, contract instantiation, upgrades, and destruction (if needed).\n2. Adding ability to upgrade contracts along with migrations (also allowing orderly shutdowns). This controlled by a governance vote.\n3. Launch a testnet with working version of this code (Cosmos SDK 0.38 or 0.39) to enable all interested parties to trial the process and provide feedback.\n4. Provide sample contracts to demo on the testnet, along with some migration scenarios\n\nWithin 2 months, the working code and binaries should be delivered and open for public review. Within 4 months, these binaries will be used on a testnet, with sufficient staking tokens given to all active voters on the Cosmos Hub, and we will go through a few governance voting cycles to trial contract deployment and migrations (with a shorter voting cycles, eg. 3 days)\n\nDetailed milestones in the full proposal:\nhttps://ipfs.io/ipfs/QmbD3bMajQCFmtDmkuRVWhmMWVdN2sK8QP2FoFCz9cjPiC\n\nBeyond the milestones, CosmWasm will enhance documentation of the platform and offer technical support on our Telegram channel.\n\n-=-=-\n\n_Problem_\nWith the upcoming launch of IBC, the hub will need to adapt more rapidly to the needs of the ecosystem, while also limiting chain restarts, which may be detrimental to IBC connections. In particular support for relaying Dynamic IBC Protocols and Rented Security, using ATOMs as collateral for smaller zones, would greatly benefit from CosmWasm's flexibility.\n\n_Solution_\nWe’re adding some key features to CosmWasm to convert it from a permissionless, immutable smart contract platform to a permissioned platform with governance control for upgrading or shutting down contracts. This is a key requirement to be able to integrate CosmWasm to the Cosmos Hub with minimal disruption.\n\n_Future_\nWe will continue development of CosmWasm, especially adding IBC integration as well as working towards a stable 1.0 release that can be audited and safely deployed (Q3/Q4 2020).\n\n-=-=-\n\nTwitter: https://twitter.com/CosmWasm\nMedium: https://medium.com/confio\nTelegram: https://t.me/joinchat/AkZriEhk9qcRw5A5U2MapA\nWebsite: https://www.cosmwasm.com\nGithub: https://github.com/CosmWasm",
      recipient: 'cosmos1y3x7q772u8s25c5zve949fhanrhvmtnu484l8z',
      amount: [
        {
          denom: 'uatom',
          amount: '25000000000',
        },
      ],
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '130633411716489',
      abstain: '17650000',
      no: '6754563411',
      no_with_veto: '0',
    },
    submit_time: '2020-05-12T17:10:00.465282299Z',
    deposit_end_time: '2020-05-26T17:10:00.465282299Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '541000000',
      },
    ],
    voting_start_time: '2020-05-12T21:34:51.554328316Z',
    voting_end_time: '2020-05-26T21:34:51.554328316Z',
  },
  {
    proposal_id: '23',
    content: {
      '@type': '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
      title: 'Cosmos Governance Working Group - Q1 2020',
      description:
        'Cosmos Governance Working Group - Q1 2020 funding\n\nCommunity-spend proposal submitted by Gavin Birch (https://twitter.com/Ether_Gavin) of Figment Networks (https://figment.network)\n\n-=-=-\n\nFull proposal: https://ipfs.io/ipfs/QmSMGEoY2dfxADPfgoAsJxjjC6hwpSNx1dXAqePiCEMCbY\n\n-=-=-\n\nAmount to spend from the community pool: 5250 ATOMs\n\nTimeline: Q1 2020\n\nDeliverables:\n1. A governance working group community & charter\n2. A template for community spend proposals\n3. A best-practices document for community spend proposals\n4. An educational wiki for the Cosmos Hub parameters\n5. A best-practices document for parameter changes\n6. Monthly governance working group community calls (three)\n7. Monthly GWG articles (three)\n8. One Q2 2020 GWG recommendations article\n\nMilestones:\nBy end of Month 1, the Cosmos Governance Working Group (GWG) should have been initiated and led by Gavin Birch of Figment Networks.\nBy end of Month 2, Gavin Birch is to have initiated and led GWG’s education, best practices, and Q2 recommendations.\nBy end of Month 3, Gavin Birch is to have led and published initial governance education, best practices, and Q2 recommendations.\n\nDetailed milestones and funding:\nhttps://docs.google.com/spreadsheets/d/1mFEvMSLbiHoVAYqBq8lo3qQw3KtPMEqDFz47ESf6HEg/edit?usp=sharing\n\nBeyond the milestones, Gavin will lead the GWG to engage in and answer governance-related questions on the Cosmos Discourse forum, Twitter, the private Cosmos VIP Telegram channel, and the Cosmos subreddit. The GWG will engage with stake-holders to lower the barriers to governance participation with the aim of empowering the Cosmos Hub’s stakeholders. The GWG will use this engagement to guide recommendations for future GWG planning.\n\nRead more about the our efforts to launch the Cosmos GWG here: https://figment.network/resources/introducing-the-cosmos-governance-working-group/\n\n-=-=-\n\n_Problem_\nPerhaps the most difficult barrier to effective governance is that it demands one of our most valuable and scarce resources: our attention. Stakeholders may be disadvantaged by informational or resource-based asymmetries, while other entities may exploit these same asymmetries to capture value controlled by the Cosmos Hub’s governance mechanisms.\n\nWe’re concerned that without establishing community standards, processes, and driving decentralized delegator-based participation, the Cosmos Hub governance mechanism could be co-opted by a centralized power. As governance functionality develops, potential participants will need to understand how to assess proposals by knowing what to pay attention to.\n\n_Solution_\nWe’re forming a focused, diverse group that’s capable of assessing and synthesizing the key parts of a proposal so that the voting community can get a fair summary of what they need to know before voting.\n\nOur solution is to initiate a Cosmos governance working group that develops decentralized community governance efforts alongside the Hub’s development. We will develop and document governance features and practices, and then communicate these to the broader Cosmos community.\n\n_Future_\nAt the end of Q1, we’ll publish recommendations for the future of the Cosmos GWG, and ideally we’ll be prepared to submit a proposal based upon those recommendations for Q2 2020. We plan to continue our work in blockchain governance, regardless of whether the Hub passes our proposals.\n\n-=-=-\n\nCosmos forum: https://forum.cosmos.network/c/governance\nCosmos GWG Telegram channel: https://t.me/hubgov\nTwitter: https://twitter.com/CosmosGov',
      recipient: 'cosmos1hjct6q7npsspsg3dgvzk3sdf89spmlpfg8wwf7',
      amount: [
        {
          denom: 'uatom',
          amount: '5250000000',
        },
      ],
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '132707314781653',
      abstain: '6792152705214',
      no: '6583520449408',
      no_with_veto: '1204049999',
    },
    submit_time: '2020-01-15T06:51:48.001168602Z',
    deposit_end_time: '2020-01-29T06:51:48.001168602Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2020-01-15T19:16:08.573134301Z',
    voting_end_time: '2020-01-29T19:16:08.573134301Z',
  },
  {
    proposal_id: '19',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Cosmos Hub 3 Upgrade Proposal E',
      description:
        'Figment Networks (https://figment.network)\n\n-=-=-\n\nFull proposal:\nhttps://ipfs.io/ipfs/QmfJyd64srJSX824WoNnF6BbvF4wvPGqVBynZeN98C7ygq\n\n-=-=-\n\n_Decision_\n\nWe are signalling that:\n\n1. The Gaia 2.0.3 implementation is aligned with the list of high-level changes approved in Cosmos Hub 3 Upgrade Proposal A.\n\n2. We are prepared to upgrade the Cosmos Hub to cosmoshub-3 based upon\n\ta. Commit hash: 2f6783e298f25ff4e12cb84549777053ab88749a;\n\tb. The state export from cosmoshub-2 at Block Height 2902000;\n\tc. Genesis time: 60 minutes after the timestamp at Block Height 2902000.\n\n3. We are prepared to relaunch cosmoshub-2\n\ta. In the event of:\n\t\ti. A non-trivial error in the migration procedure and/or\n\t\tii. A need for ad-hoc genesis file changes\n\t\tiii. The failure of cosmoshub-3 to produce two (2) blocks by 180 minutes after the timestamp of Block Height 2902000;\n\tb. Using:\n\t\ti. The starting block height: 2902000\n\t\tii. Software version: Cosmos SDK v0.34.6+ https://github.com/cosmos/cosmos-sdk/releases/tag/v0.34.10\n\t\tiii. The full data snapshot at export Block Height 2902000;\n\tc. And will consider the relaunch complete after cosmoshub-2 has reached consensus on Block 2902001.\n\n4. The upgrade will be considered complete after cosmoshub-3 has reached consensus on Block Height 2 within 120 minutes of genesis time.\n\n5. This proposal is void if the voting period has not concluded by Block Height 2852202.\n\n-=-=-\n\n_Context_\nThis proposal follows Cosmos Hub 3 Upgrade Proposal D (https://hubble.figment.network/cosmos/chains/cosmoshub-2/governance/proposals/16) aka Prop 16, which passed in vote, but failed in execution (https://forum.cosmos.network/t/cosmos-hub-3-upgrade-post-mortem/2772). This proposal is intended to succeed where Prop 16 failed.\n\nThis proposal is intended to signal acceptance/rejection of the precise software release that will contain the changes to be included in the Cosmos Hub 3 upgrade. A high level overview of these changes was successfully approved by the voters signalling via Cosmos Hub 3 Upgrade Proposal A:\nhttps://hubble.figment.network/cosmos/chains/cosmoshub-2/governance/proposals/13\n\nWe are proposing to use this code https://github.com/cosmos/gaia/releases/tag/v2.0.3 to upgrade the Cosmos Hub.\nWe are proposing to export the ledger’s state at Block Height 2,902,000, which we expect to occur on December 11, 2019 at or around 14:27 UTC assuming an average of 6.94 seconds per block. Please note that there will likely be a variance from this target time, due to deviations in block time.\n\nWe are proposing that the Cosmos Hub 3 genesis time be set to 60 minutes after Block Height 2,902,000.\n\n-=-=-\n\nCo-ordination in case of failure will happen in this channel: https://riot.im/app/#/room/#cosmos_validators_technical_updates:matrix.org',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '154154642304501',
      abstain: '0',
      no: '525588663406',
      no_with_veto: '0',
    },
    submit_time: '2019-11-14T17:13:31.985706216Z',
    deposit_end_time: '2019-11-28T17:13:31.985706216Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '513000000',
      },
    ],
    voting_start_time: '2019-11-15T05:57:10.911711562Z',
    voting_end_time: '2019-11-29T05:57:10.911711562Z',
  },
  {
    proposal_id: '16',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Cosmos Hub 3 Upgrade Proposal D',
      description:
        'Figment Networks (https://figment.network)\n\n-=-=-\n\nThis proposal is intended to supersede flawed Cosmos Hub 3 Upgrade Proposal B (https://hubble.figment.network/cosmos/chains/cosmoshub-2/governance/proposals/14) and Cosmos Hub 3 Upgrade Proposal C (https://hubble.figment.network/cosmos/chains/cosmoshub-2/governance/proposals/15), regardless of their outcomes. This proposal will make both Proposal 14 and 15 void.\n\nThis proposal is intended to signal acceptance/rejection of the precise software release that will contain the changes to be included in the Cosmos Hub 3 upgrade. A high overview of these changes was successfully approved by the voters signalling via Cosmos Hub 3 Upgrade Proposal A:\nhttps://hubble.figment.network/cosmos/chains/cosmoshub-2/governance/proposals/13\n\n-=-=-\n\nWe are proposing to use this code https://github.com/cosmos/gaia/releases/tag/v2.0.0 to upgrade the Cosmos Hub. We are proposing to export the ledger’s state at Block Height 1,933,000, which we expect to occur on September 24, 2019 at or around 1:53 pm UTC. Please note that there will likely be a variance from this target time, due to changes in block time (https://forum.cosmos.network/t/cosmos-hub-3-upgrade-proposal-d/2675/18?u=gavin). We are proposing to launch Cosmos Hub 3 at 60 minutes after Block Height 1,933,000.\n\n-=-=-\n\nInstructions for migration: https://github.com/cosmos/gaia/wiki/Cosmos-Hub-2-Upgrade\nPlease note the recovery scenario in the case that the chain fails to start.\n\n-=-=-\n\nFull proposal:\nhttps://ipfs.io/ipfs/QmPbSLvAgY8m7zAgSLHzKHfDtV4wx5XaGt1S1cDzqvXqJg',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '151766431561545',
      abstain: '637685895771',
      no: '575592227281',
      no_with_veto: '0',
    },
    submit_time: '2019-09-05T21:32:32.253341577Z',
    deposit_end_time: '2019-09-19T21:32:32.253341577Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '612000000',
      },
    ],
    voting_start_time: '2019-09-06T02:30:01.287557726Z',
    voting_end_time: '2019-09-20T02:30:01.287557726Z',
  },
  {
    proposal_id: '14',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Cosmos Hub 3 Upgrade Proposal B',
      description:
        "This proposal is intended to signal acceptance/rejection of the precise software release that will contain the changes to be included in the Cosmos Hub 3 upgrade. A high level overview of these changes was successfully approved by the voters signalling via Cosmos Hub 3 Upgrade Proposal A: https://hubble.figment.network/cosmos/chains/cosmoshub-2/governance/proposals/13\n\nWe are proposing to use this code https://github.com/cosmos/gaia/releases/tag/v2.0.0 to upgrade the Cosmos Hub. We are proposing to export the ledger's state at Block Height 1823000, which we expect to occur on Sunday, September 15, 2019 at or around 2:00 pm UTC. We are proposing to launch Cosmos Hub 3 at 3:57 pm UTC on Sunday, September 15, 2019. \n\nInstructions for migration: https://github.com/cosmos/gaia/wiki/Cosmos-Hub-2-Upgrade\n\nFull proposal: https://ipfs.io/ipfs/Qmf54mwb8cSRf316jS4by96dL91fPCabvB9V5i2Sa1hxdz\n\n",
    },
    status: 'PROPOSAL_STATUS_REJECTED',
    final_tally_result: {
      yes: '25041581559222',
      abstain: '41000000000',
      no: '56592155045420',
      no_with_veto: '0',
    },
    submit_time: '2019-08-23T16:16:19.814900321Z',
    deposit_end_time: '2019-09-06T16:16:19.814900321Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2019-08-23T17:43:15.034844973Z',
    voting_end_time: '2019-09-06T17:43:15.034844973Z',
  },
  {
    proposal_id: '13',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Cosmos Hub 3 Upgrade Proposal A',
      description:
        'This is a proposal to approve these high-level changes for a final vote for what will become Cosmos Hub 3. Please read them carefully: \nhttps://github.com/cosmos/cosmos-sdk/blob/rc1/v0.36.0/CHANGELOG.md\n\n-=-=-\n\nIf approved, and assuming that testing is successful, there will be a second proposal called Cosmos Hub 3 Upgrade Proposal B. Cosmos Hub 3 Upgrade Proposal B should specify 1) the software hash; 2) the block height state export from cosmoshub-2; 3) the genesis time; 4) instructions for generating the new genesis file.\n\n-=-=-\n\nFull proposal: \nhttps://ipfs.io/ipfs/QmbXnLfx9iSDH1rVSkW5zYC8ErRZHUK4qUPfaGs4ZdHdc7\n',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '120499728510495',
      abstain: '18092219398336',
      no: '0',
      no_with_veto: '151999',
    },
    submit_time: '2019-07-26T18:04:10.416760069Z',
    deposit_end_time: '2019-08-09T18:04:10.416760069Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '550000000',
      },
    ],
    voting_start_time: '2019-07-29T14:37:18.454146432Z',
    voting_end_time: '2019-08-12T14:37:18.454146432Z',
  },
  {
    proposal_id: '12',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Are Validators Charging 0% Commission Harmful to the Success of the Cosmos Hub?',
      description:
        "This governance proposal is intended to act purely as a signalling proposal.  Throughout this history of the Cosmos Hub, there has been much debate about the impact that validators charging 0% commission has on the Cosmos Hub, particularly with respect to the decentralization of the Cosmos Hub and the sustainability for validator operations. \n\n Discussion around this topic has taken place in many places including numerous threads on the Cosmos Forum, public Telegram channels, and in-person meetups.  Because this has been one of the primary discussion points in off-chain Cosmos governance discussions, we believe it is important to get a signal on the matter from the on-chain governance process of the Cosmos Hub. \n\n There have been past discussions on the Cosmos Forum about placing an in-protocol restriction on validators from charging 0% commission.  https://forum.cosmos.network/t/governance-limit-validators-from-0-commission-fee/2182 \n\n This proposal is NOT proposing a protocol-enforced minimum.  It is merely a signalling proposal to query the viewpoint of the bonded Atom holders as a whole. \n\n We encourage people to discuss the question behind this governance proposal in the associated Cosmos Hub forum post here:  https://forum.cosmos.network/t/proposal-are-validators-charging-0-commission-harmful-to-the-success-of-the-cosmos-hub/2505 \n\n Also, for voters who believe that 0% commission rates are harmful to the network, we encourage optionally sharing your belief on what a healthy minimum commission rate for the network using the memo field of their vote transaction on this governance proposal or linking to a longer written explanation such as a Forum or blog post. \n\n The question on this proposal is “Are validators charging 0% commission harmful to the success of the Cosmos Hub?”.  A Yes vote is stating that they ARE harmful to the network's success, and a No vote is a statement that they are NOT harmful.",
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '62973338233484',
      abstain: '35498146258257',
      no: '8203669919474',
      no_with_veto: '5526140000',
    },
    submit_time: '2019-07-23T00:28:15.881319915Z',
    deposit_end_time: '2019-08-06T00:28:15.881319915Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '514000000',
      },
    ],
    voting_start_time: '2019-07-23T08:59:37.718897404Z',
    voting_end_time: '2019-08-06T08:59:37.718897404Z',
  },
  {
    proposal_id: '10',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Increase Max Validator Set Size to 125',
      description:
        'Read here, or on https://ipfs.ink/e/QmRhQycV19QiTQGLuPzPHfJwCioj1wDeHHtZvxiHegTFDd \n\nThis proposal supercedes proposal number 9, which contains conflicting numbers in the title and body. \n\nIn the Cosmos Hub, the total number of active validators is currently capped at 100, ordered by total delegated Atoms. This number was originally proposed in the Cosmos whitepaper section titled [Limitations on the Number of Validators](https://github.com/cosmos/cosmos/blob/master/WHITEPAPER.md#limitations-on-the-number-of-validators 4). This number was chosen as a relatively conservative estimate, as at the time of writing, it was unclear how many widely distributed nodes Tendermint consensus could scale to over the public internet.  \n\nHowever, since then, we have seen empirically through the running of the Game of Stakes incentivized testnet that Tendermint Core with Gaia state machine can operate with over 180 validators at reasonable average block times of <7 seconds. The Game of Stakes results empirically show that adding validators should not delay consensus at small block sizes. At large block sizes, the time it takes for the block to gossip to all validators may increase depending on the newfound network topology. However we view this as unlikely, and if it did become a problem, it could later be solved by known improvements at the p2p layer. The other tradeoff to increasing the number of validators is that the size of commits becomes ~25% larger due to more precommits being included, increasing the network and storage costs for nodes. This can also be resolved in the future with the integration of aggregate signatures. At the time of submission of this proposal, the minimum delegation to become a top 100 validator is 30,600 Atoms, a fairly high barrier to entry for new validators looking to enter the active validator set.  \n\nIn the Cosmos whitepaper, it states that the number of validators on the Hub will increase at a rate of 13% a year until it hits a cap of 300 validators. We propose scrapping this mechanism and instead increasing the max validators to 125 validators in the next chain upgrade with no further planned increases. Future increases to the validator set size will be originated through governance.',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '115845057759826',
      abstain: '143480099999',
      no: '6244866096334',
      no_with_veto: '0',
    },
    submit_time: '2019-07-01T14:09:25.508939113Z',
    deposit_end_time: '2019-07-15T14:09:25.508939113Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '586500001',
      },
    ],
    voting_start_time: '2019-07-03T11:01:59.653929827Z',
    voting_end_time: '2019-07-17T11:01:59.653929827Z',
  },
  {
    proposal_id: '8',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Notification for Security Critical Hard Fork at Block 482100',
      description:
        "As described by user @Jessysaurusrex on Cosmos Forum in https://forum.cosmos.network/t/critical-cosmossdk-security-advisory/2211, All in Bits has learned of a critical security vulnerability in the codebase for the Cosmos Hub.  We deem the issue to be of high severity, as if exploited it can potentially degrade the security model of the chain's Proof of Stake system.  This vulnerability CANNOT lead to the theft of Atoms or creation of Atoms out of thin air. \n\n All in Bits has released a source code patch, Gaia v0.34.6, that closes the exploitable code path starting at block 482100. \n\n The proposed upgrade code Git hash is:  80234baf91a15dd9a7df8dca38677b66b8d148c1 \n\n As a proof of stake, we are putting some collateral behind this legitimacy of this bug and patch and encourage others familiar with the report to do so as well.  If the disclosed bug turns out to be fabricated or malicious in some way, we urge the Cosmos Hub governance to slash these Atoms by voting NoWithVeto on this proposal. \n\n We encourage validators and all users to upgrade their nodes to Gaia v0.34.6 before block 482100.  In the absence of another public bulletin board, we request validators to please vote Yes on this proposal AFTER they have upgraded their nodes to v0.34.6, as a method of signalling the readiness of the network for the upgrade.",
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '126067366023363',
      abstain: '0',
      no: '1389999',
      no_with_veto: '0',
    },
    submit_time: '2019-05-30T19:43:02.870666885Z',
    deposit_end_time: '2019-06-13T19:43:02.870666885Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '1328000000',
      },
    ],
    voting_start_time: '2019-05-30T19:48:15.472348272Z',
    voting_end_time: '2019-06-13T19:48:15.472348272Z',
  },
  {
    proposal_id: '7',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Activate the Community Pool',
      description:
        'Enable governance to spend funds from the community pool. Full proposal: https://ipfs.io/ipfs/QmNsVCsyRmEiep8rTQLxVNdMHm2uiZkmaSHCR6S72Y1sL1',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '101546237540481',
      abstain: '4000000',
      no: '271654460000',
      no_with_veto: '0',
    },
    submit_time: '2019-05-03T21:08:25.443199036Z',
    deposit_end_time: '2019-05-17T21:08:25.443199036Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000000',
      },
    ],
    voting_start_time: '2019-05-04T16:02:33.246802950Z',
    voting_end_time: '2019-05-18T16:02:33.246802950Z',
  },
  {
    proposal_id: '6',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: "Don't Burn Deposits for Rejected Governance Proposals Unless Vetoed",
      description:
        "Read here, or on https://ipfs.ink/e/QmRtR7qkeaZCpCzHDwHgJeJAZdTrbmHLxFDYXhw7RoF1pp\n\nThe Cosmos Hub's state machine handles spam prevention of governance proposals by means of a deposit system. A governance proposal is only considered eligible for voting by the whole validator set if a certain amount of staking token is deposited on the proposal. The intention is that the deposit will be burned if a proposal is spam or has caused a negative externality to the Cosmos community (such as wasting stakeholders’ time having to review the proposal).\n\nIn the current implementation of the governance module used in the Cosmos Hub, the deposit is burned if a proposal does not pass, regardless of how close the final tally result may have been. For example, if 49% of stake votes in favor of a proposal while 51% votes against it, the deposit will still be burned. This seems to be an undesirable behavior as it disincentivizes anyone from creating or depositing on a proposal that might be slightly contentious but not spam, due to fear of losing the deposit minimum (currently 512 atoms). This will especially be the case as TextProposals will be used for signaling purposes, to gauge the sentiment of staked Atom holders. Disincentivizing proposals for which the outcome is uncertain would undermine that effort.\n\nWe instead propose that the deposit be returned on failed votes, and that the deposit only be burned on vetoed votes. If a proposal seems to be spam or is deemed to have caused a negative externality to Cosmos communninty, voters should vote NoWithVeto on the proposal. If >33% of the stake chooses to Veto a proposal, the deposits will then be burned. However, if a proposal gets rejected without being vetoed, the deposits should be returned to the depositors.  This proposal does not make any change to the current behavior for proposals that fail to meet quorum; if a proposal fails to meet quorum its deposit will be burned.",
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '110522077231139',
      abstain: '11773440000',
      no: '4000000',
      no_with_veto: '0',
    },
    submit_time: '2019-05-03T18:14:33.209053883Z',
    deposit_end_time: '2019-05-17T18:14:33.209053883Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '516000000',
      },
    ],
    voting_start_time: '2019-05-03T19:50:58.076569857Z',
    voting_end_time: '2019-05-17T19:50:58.076569857Z',
  },
  {
    proposal_id: '5',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Expedited Cosmos Upgrade Proposal',
      description:
        'Proposal to upgrade the Cosmos Hub at block 500,000 on April 22nd 5pm GMT. Details:https://ipfs.io/ipfs/QmS13GPNs1cRKSojete5y9RgW7wyf1sZ1BGqX3zjTGs7sX',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '100649363640051',
      abstain: '440382406440',
      no: '3261263357974',
      no_with_veto: '4775200426319',
    },
    submit_time: '2019-04-19T00:49:55.251313656Z',
    deposit_end_time: '2019-05-03T00:49:55.251313656Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '513000000',
      },
    ],
    voting_start_time: '2019-04-19T02:48:01.207552384Z',
    voting_end_time: '2019-05-03T02:48:01.207552384Z',
  },
  {
    proposal_id: '4',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Proposal for issuance of fungible tokens directly on the Cosmos Hub',
      description:
        'This proposal is a first step towards enabling fungible token issuance on the Cosmos Hub, with listing of new tokens requiring governance approval. Read the full proposal at https://github.com/validator-network/cosmoshub-proposals/blob/0d306f1fcc841a0ac6ed1171af96e6869d6754b6/issuance-proposal.md',
    },
    status: 'PROPOSAL_STATUS_REJECTED',
    final_tally_result: {
      yes: '33723552888122',
      abstain: '20706168938',
      no: '26427988266507',
      no_with_veto: '13368982409321',
    },
    submit_time: '2019-04-15T08:45:39.072577509Z',
    deposit_end_time: '2019-04-29T08:45:39.072577509Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512000001',
      },
    ],
    voting_start_time: '2019-04-15T15:25:48.465886746Z',
    voting_end_time: '2019-04-29T15:25:48.465886746Z',
  },
  {
    proposal_id: '3',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'ATOM Transfer Enablement v2',
      description:
        'A plan for enabling ATOM transfers is being proposed, which involves the release and test of Cosmos SDK v0.34.0 and a strategy for the network to accept the release and upgrade the mainnet once testing has been deemed to be successful. Read the full proposal at  https://ipfs.io/ipfs/Qmam1PU39qmLBzKv3eYA3kMmSJdgR6nursGwWVjnmovpSy or formatted at https://ipfs.ink/e/Qmam1PU39qmLBzKv3eYA3kMmSJdgR6nursGwWVjnmovpSy',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '91073006010689',
      abstain: '82100000001',
      no: '8960614220464',
      no_with_veto: '91169999999',
    },
    submit_time: '2019-04-03T10:15:22.291176064Z',
    deposit_end_time: '2019-04-17T10:15:22.291176064Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '521500000',
      },
    ],
    voting_start_time: '2019-04-03T17:35:12.673927642Z',
    voting_end_time: '2019-04-17T17:35:12.673927642Z',
  },
  {
    proposal_id: '2',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'ATOM Transfer Enablement',
      description:
        'A plan is proposed to set up a testnet using the Cosmos SDK v0.34.0 release, along with mainnet conditions, plus transfer enablement and increased block size, as a testing ground. Furthermore, a path for upgrading the cosmoshub-1 chain to use the Cosmos SDK release v0.34.0, along with the necessary updates to the genesis file, at block 425000, is outlined. IPFS: https://ipfs.io/ipfs/QmaUaMjXPE6i4gJR1NakQc15TZpSqjSrXNmrS1vA5veF9W',
    },
    status: 'PROPOSAL_STATUS_REJECTED',
    final_tally_result: {
      yes: '5195610593628',
      abstain: '2619844783500',
      no: '58322135404940',
      no_with_veto: '43483296883256',
    },
    submit_time: '2019-03-25T21:42:19.240550245Z',
    deposit_end_time: '2019-04-08T21:42:19.240550245Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '521400000',
      },
    ],
    voting_start_time: '2019-03-25T23:44:04.098630937Z',
    voting_end_time: '2019-04-08T23:44:04.098630937Z',
  },
  {
    proposal_id: '1',
    content: {
      '@type': '/cosmos.gov.v1beta1.TextProposal',
      title: 'Adjustment of blocks_per_year to come aligned with actual block time',
      description:
        'This governance proposal is for adjustment of blocks_per_year parameter to normalize the inflation rate and reward rate.\\n ipfs link: https://ipfs.io/ipfs/QmXqEBr56xeUzFpgjsmDKMSit3iqnKaDEL4tabxPXoz9xc',
    },
    status: 'PROPOSAL_STATUS_PASSED',
    final_tally_result: {
      yes: '97118903526799',
      abstain: '402380577234',
      no: '320545400000',
      no_with_veto: '0',
    },
    submit_time: '2019-03-20T06:41:27.040075748Z',
    deposit_end_time: '2019-04-03T06:41:27.040075748Z',
    total_deposit: [
      {
        denom: 'uatom',
        amount: '512100000',
      },
    ],
    voting_start_time: '2019-03-20T20:43:59.630492307Z',
    voting_end_time: '2019-04-03T20:43:59.630492307Z',
  },
]

export default proposals
