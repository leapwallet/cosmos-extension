import { Activity } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'

export type ActionType =
  | 'send'
  | 'receive'
  | 'delegate'
  | 'undelegate'
  | 'ibc/transfer'
  | 'vote'
  | 'swap'
  | 'fallback'

export const activity1: Activity[] = [
  {
    parsedTx: {
      action: 'delegate',
      fromAddress: 'sif1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4t4ffmw',
      toAddress: 'sif1gujfrjwr853n9n96qe98vasgdjecc8j0g77lv2',
      sentAmount: {
        denomID: 'rowan',
        amount: new BigNumber('12000000'),
      },
      isSuccess: true,
      txhash: 'D1B36CEFB3BA3EC6F7A574E943EBFE2056680C244119B91A9255DCFF5C4494CF',
      timestamp: '2022-09-28T13:12:03Z',
      fee: {
        denomID: 'rowan',
        amount: new BigNumber('250000'),
      },
    },
    content: {
      txType: 'delegate',
      title1: 'Delegation',
      subtitle1: 'sif...77lv2',
      sentTokenInfo: {
        coinDenom: 'ROWAN',
        coinMinimalDenom: 'rowan',
        coinDecimals: 6,
        coinGeckoId: 'rowan',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png',
        chain: 'sifchain',
      },
      sentAmount: '12',
      feeAmount: '0.00025 ROWAN',
    },
  },
  {
    parsedTx: {
      action: 'ibc/transfer',
      fromAddress: 'cosmos19vf5mfr40awvkefw69nl6p3mmlsnacmm28xyqh',
      toAddress: 'akash19vf5mfr40awvkefw69nl6p3mmlsnacmm8utred',
      sentAmount: {
        denomID: 'uatom',
        amount: new BigNumber('1000000'),
      },
      isSuccess: true,
      txhash: 'F7ED4287485E445B92A2A3B78B5BE4728C37E0AB068D55A1E40A4F763C70985E',
      timestamp: '2022-09-27T13:45:37Z',
      fee: {
        denomID: 'uatom',
        amount: new BigNumber('2340'),
      },
    },
    content: {
      txType: 'ibc/transfer',
      title1: 'IBC Transfer',
      subtitle1: 'To akash...utred',
      sentTokenInfo: {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'atom',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        chain: 'cosmos',
      },
      sentAmount: '1',
      feeAmount: '0.00234 ATOM',
    },
  },
  {
    parsedTx: {
      action: 'receive',
      fromAddress: 'sif1gujfrjwr853n9n96qe98vasgdjecc8j0g77lv2',
      toAddress: 'sif1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4t4ffmw',
      sentAmount: {
        denomID: 'uatom',
        amount: new BigNumber('50000000'),
      },
      isSuccess: true,
      txhash: '75325C615B508B99FB028994CB6090AA284BA36738D2C6C412569EBA26FBAFE1',
      timestamp: '2022-09-23T05:14:21.000Z',
      fee: {
        denomID: 'uatom',
        amount: new BigNumber('250000'),
      },
    },
    content: {
      txType: 'receive',
      title1: 'Received ROWAN',
      subtitle1: 'From sif...77lv2',
      sentTokenInfo: {
        coinDenom: 'ROWAN',
        coinMinimalDenom: 'rowan',
        coinDecimals: 6,
        coinGeckoId: 'rowan',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png',
        chain: 'sifchain',
      },
      sentAmount: '50',
      feeAmount: '0.00025 ROWAN',
    },
  },
  {
    parsedTx: {
      action: 'receive',
      fromAddress: 'cosmos19vf5mfr40awvkefw69nl6p3mmlsnacmm28xyqh',
      toAddress: 'cosmosvaloper16s96n9k9zztdgjy8q4qcxp4hn7ww98qkrka4zk',
      sentAmount: {
        denomID: 'uatom',
        amount: new BigNumber('25000000'),
      },
      isSuccess: true,
      txhash: '6063FACF527D66C10A5E38167E2F8CAC31437E88F32BD742C6FBC2C76849B4E4',
      timestamp: '2022-09-25T13:12:03Z',
      fee: {
        denomID: 'uatom',
        amount: new BigNumber('2463'),
      },
    },
    content: {
      txType: 'delegate',
      title1: 'Delegation',
      subtitle1: 'cosmo...ka4zk',
      sentTokenInfo: {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'atom',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        chain: 'cosmos',
      },
      sentAmount: '25',
      feeAmount: '0.002463 ATOM',
    },
  },
  {
    parsedTx: {
      action: 'send',
      fromAddress: 'cosmos19vf5mfr40awvkefw69nl6p3mmlsnacmm28xyqh',
      toAddress: 'cosmos1nhzcr7mrqedyy5gcnkwz38yc0jk9z7y74h33yw',
      sentAmount: {
        denomID: 'uatom',
        amount: new BigNumber('5000000'),
      },
      isSuccess: true,
      txhash: '04611AC0DA8E589B8426729892DA08BD3F7DBCD54F1934C1201B110BEB6A4CE5',
      timestamp: '2022-09-25T07:25:54Z',
      fee: {
        denomID: 'uatom',
        amount: new BigNumber('1040'),
      },
    },
    content: {
      txType: 'send',
      title1: 'Sent ATOM',
      subtitle1: 'To cosmo...h33yw',
      sentTokenInfo: {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'atom',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        chain: 'cosmos',
      },
      sentAmount: '5',
      feeAmount: '0.00104 ATOM',
    },
  },
  {
    parsedTx: {
      action: 'receive',
      fromAddress: 'cosmos1nhzcr7mrqedyy5gcnkwz38yc0jk9z7y74h33yw',
      toAddress: 'cosmos1pkzmx7j90m9hxarmtu5j5ywxyetxl2q4wgxl59',
      sentAmount: {
        denomID: 'uatom',
        amount: new BigNumber('9800000'),
      },
      isSuccess: true,
      txhash: '75325C615B508B99FB028994CB6234AA284BA36738D2C6C412569EBA26FBAFE1',
      timestamp: '2022-09-23T05:14:21.000Z',
      fee: {
        denomID: 'uatom',
        amount: new BigNumber('1040'),
      },
    },
    content: {
      txType: 'receive',
      title1: 'Received ATOM',
      subtitle1: 'From cosmo...h33yw',
      sentTokenInfo: {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'atom',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
        chain: 'cosmos',
      },
      sentAmount: '9.8',
      feeAmount: '0.00104 ATOM',
    },
  },
]
