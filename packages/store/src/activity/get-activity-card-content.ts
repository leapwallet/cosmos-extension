import { fromSmall } from '@leapwallet/cosmos-wallet-sdk/dist/browser/utils/token-converter';
import { ParsedMessageType } from '@leapwallet/parser-parfait';

import type { ActivityCardContent, getActivityContentProps } from './types';
import { convertVoteOptionToString } from './vote-option';

const sliceAddress = (address?: string, visibleLetters = 5) => {
  return address?.slice(0, visibleLetters) + '...' + address?.slice(address.length - visibleLetters, address.length);
};

async function getActivityCardContent({
  parsedTx,
  address,
  restUrl,
  chainId,
  coinDecimals,
  ibcTraceFetcher,
}: getActivityContentProps): Promise<ActivityCardContent> {
  if (!parsedTx) {
    return {
      txType: 'fallback',
      title1: 'Unknown',
      subtitle1: '',
    };
  }

  const content: ActivityCardContent = {
    txType: 'fallback',
    title1: parsedTx.code === 0 ? 'Success' : 'Failed',
    subtitle1: sliceAddress(parsedTx?.txHash ?? ''),
  };

  const msg = parsedTx.messages[0];

  switch (msg.__type) {
    case ParsedMessageType.BankSend: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.tokens[0].denomination, restUrl, chainId ?? '');
      const isReceive = msg.toAddress.toUpperCase() === address?.toUpperCase();
      content.txType = isReceive ? 'receive' : 'send';

      content.title1 = isReceive
        ? `Received ${sentTokenInfo?.coinDenom ?? ''}`
        : `Sent ${sentTokenInfo?.coinDenom ?? ''}`;

      content.subtitle1 = isReceive
        ? `From ${sliceAddress(msg.fromAddress ?? '')}`
        : `To ${sliceAddress(msg.toAddress ?? '')}`;

      if (!sentTokenInfo?.coinDenom) {
        content.sentAmount = msg.tokens[0].quantity;
      } else {
        if (sentTokenInfo?.chain === 'solana' && sentTokenInfo?.coinDenom !== 'SOL') {
          content.sentAmount = msg.tokens[0].quantity.toString();
        } else {
          content.sentAmount = fromSmall(
            msg.tokens[0].quantity.toString(),
            sentTokenInfo?.coinDecimals ?? coinDecimals ?? 0,
          );
        }
      }

      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.StakingDelegate: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.denomination, restUrl, chainId ?? '');
      content.txType = 'delegate';
      content.title1 = 'Delegation';
      content.subtitle1 = `${sliceAddress(msg.delegatorAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.StakingUndelegate: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.denomination, restUrl, chainId ?? '');
      content.txType = 'undelegate';
      content.title1 = 'Undelegation';
      content.subtitle1 = `${sliceAddress(msg.delegatorAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.IbcSend: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.token.denomination, restUrl, chainId ?? '');
      content.txType = 'ibc/transfer';
      content.title1 = 'IBC Send';
      content.subtitle1 = `To ${sliceAddress(msg.toAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.token.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.IbcReceive: {
      const sentTokenInfo = await ibcTraceFetcher.fetchIbcTrace(msg.token.denomination, restUrl, chainId ?? '');
      content.txType = 'ibc/transfer';
      content.title1 = 'IBC Receive';
      content.subtitle1 = `From ${sliceAddress(msg.fromAddress ?? '')}`;
      content.sentAmount = fromSmall(msg.token.quantity.toString(), sentTokenInfo?.coinDecimals ?? 0);
      content.sentTokenInfo = sentTokenInfo;
      break;
    }
    case ParsedMessageType.GovVote: {
      content.txType = 'vote';
      content.title1 = `Voted ${convertVoteOptionToString(msg.option)}`;
      content.subtitle1 = `Proposal ${msg.proposalId}`;
      break;
    }
    case ParsedMessageType.GammJoinPool: {
      content.txType = 'liquidity/add';
      content.title1 = `Add Liquidity - Pool #${msg.poolId}`;
      content.subtitle1 = `Bought ${msg.shares} shares`;
      break;
    }
    case ParsedMessageType.GammExitPool: {
      content.txType = 'liquidity/remove';
      content.title1 = `Remove Liquidity - Pool #${msg.poolId}`;
      content.subtitle1 = `Sold ${msg.shares} shares`;
      break;
    }
    case ParsedMessageType.GammSwapExact:
    case ParsedMessageType.PMSwapExactIn:
    case ParsedMessageType.PMSplitSwapExactIn: {
      content.txType = 'swap';
      const lastRoute: any = msg.routes[msg.routes.length - 1];

      const tokenGiven = {
        denomination: msg.tokenIn.denomination,
        quantity: msg.tokenIn.quantity,
      };
      const tokenGained = {
        denomination: lastRoute.tokenOutDenomination,
        quantity: msg.tokenOutAmount,
      };
      const fromToken =
        tokenGiven && chainId
          ? await ibcTraceFetcher.fetchIbcTrace(tokenGiven.denomination, restUrl, chainId)
          : undefined;
      const toToken =
        tokenGained && chainId
          ? await ibcTraceFetcher.fetchIbcTrace(tokenGained.denomination, restUrl, chainId)
          : undefined;

      if (fromToken && toToken) {
        content.title1 = `${fromToken.coinDenom} 👉🏻 ${toToken.coinDenom}`;
        content.receivedAmount = fromSmall(tokenGained?.quantity.toString() ?? '0', toToken.coinDecimals);
        content.sentAmount = fromSmall(tokenGiven?.quantity.toString() ?? '0', fromToken.coinDecimals);
        content.sentTokenInfo = fromToken;
        content.receivedTokenInfo = toToken;
        content.img = fromToken.icon;
        content.secondaryImg = toToken.icon;
      } else if (fromToken && !toToken) {
        content.title1 = `Swapped to ${fromToken.coinDenom}`;
        content.img = fromToken.icon;
        content.sentTokenInfo = fromToken;
      } else if (!fromToken && toToken) {
        content.title1 = `Swapped from ${toToken.coinDenom}`;
        content.img = toToken.coinMinimalDenom;
        content.receivedTokenInfo = toToken;
      } else {
        content.title1 = 'Swap';
      }
      break;
    }
  }
  return content;
}

export { getActivityCardContent };
