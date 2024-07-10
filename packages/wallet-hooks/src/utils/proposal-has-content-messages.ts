export function proposalHasContentMessages(proposal: any): boolean {
  return !!proposal?.messages?.find((message: any) => message['@type'] === '/cosmos.gov.v1.MsgExecLegacyContent');
}
