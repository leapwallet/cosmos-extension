import { ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait'

export function isGenericOrSendAuthzGrant(parsedMessages: ParsedMessage[] | null) {
  if (parsedMessages === null || parsedMessages.length === 0) {
    return ''
  }

  let message = ''

  for (const parsedMessage of parsedMessages) {
    if (parsedMessage.__type === ParsedMessageType.AuthzGrant) {
      const messageType =
        parsedMessage.grant.authorization['$type_url'] ??
        parsedMessage.grant.authorization['@type'] ??
        parsedMessage.grant.authorization['type']

      let isTrue = false
      const isSendAuthorization = '/cosmos.bank.v1beta1.SendAuthorization' === messageType

      if (
        isSendAuthorization ||
        ['/cosmos.authz.v1beta1.GenericAuthorization', 'cosmos-sdk/GenericAuthorization'].includes(
          messageType,
        )
      ) {
        isTrue = true
      }

      if (isTrue) {
        if (
          isSendAuthorization ||
          parsedMessage.grant.authorization?.value?.msg === '/cosmos.bank.v1beta1.MsgSend'
        ) {
          message =
            'You are allowing another account to transfer assets from your wallet for the specific time period. Be aware of scammers and approve with caution.'
        } else {
          message = "I've verified the wallet I'm giving permissions to"
        }
      }
    }
  }

  return message
}
