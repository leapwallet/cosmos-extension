import axios from 'axios';
import JSON5 from 'json5';

import { normalizeImageSrc } from '../utils';

function proposalHasContentMessages(proposal: any): boolean {
  return !!proposal?.messages?.find((message: any) => message['@type'] === '/cosmos.gov.v1.MsgExecLegacyContent');
}

function getContentFromMessages(proposal: any, currContent: any) {
  const messageWithContent = proposal.messages.find(
    (message: any) => message['@type'] === '/cosmos.gov.v1.MsgExecLegacyContent',
  );
  let content = currContent;
  if (messageWithContent) {
    content = {
      title: messageWithContent?.content?.title,
      description: messageWithContent?.content?.description,
    };
  }
  return content;
}

function proposalHasMetadataLink(proposal: any) {
  return proposal.metadata.startsWith('ipfs://') || proposal.metadata.startsWith('https://');
}

async function fetchProposalMetadataFromLink(proposal: any) {
  const res = await axios.get(normalizeImageSrc(proposal.metadata));
  let data = await res.data;
  if (typeof data === 'string') {
    data = JSON5.parse(data);
  }
  const content = {
    title: data?.title,
    description: data?.summary ?? data?.details,
  };
  return content;
}

export { fetchProposalMetadataFromLink, getContentFromMessages, proposalHasContentMessages, proposalHasMetadataLink };
