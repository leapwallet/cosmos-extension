import { ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait'

export function isGenericOrSendAuthzGrant(parsedMessages: ParsedMessage[] | null) {
  if (parsedMessages === null || parsedMessages.length === 0) {
    return false
  }

  let isTrue = false

  for (const message of parsedMessages) {
    if (message.__type === ParsedMessageType.AuthzGrant) {
      if (
        [
          '/cosmos.bank.v1beta1.SendAuthorization',
          '/cosmos.authz.v1beta1.GenericAuthorization',
        ].includes(message.grant.authorization['$type_url'] ?? message.grant.authorization['@type'])
      ) {
        isTrue = true
        break
      }
    }
  }

  return isTrue
}
