# `getChannelIds`

Get the channel IDs for IBC transactions between two chains

## Definition

```ts
function getChannelIds(sourceChain: string, recipientChain: string): Promise<string[]>
```

- `sourceChain` - the chain from which the tx is sent
- `recipientChain` - the chain to which the tx is sent

## Usage

```ts
async function checkIBCSupport() {
  const channels = await getChannelIds('cosmoshub', 'osmosis');
  // returns a list of channel ids
  // e.g. ['channel-141']
  if (channels.length > 0) {
    return true
  } else {
    return false
  }
}
```
