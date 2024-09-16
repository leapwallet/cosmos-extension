import axios from 'axios';
import JSON5 from 'json5';

import { normalizeImageSrc } from '../index';

export async function fetchProposalMetadataFromLink(proposal: any) {
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
