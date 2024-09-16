export function getProposalContentFromMessages(proposal: any, currContent: any) {
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
