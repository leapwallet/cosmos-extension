# Get IBC Channel IDs

## `useGetIbcChannelId`

Get the list of channel-pairs supported for the active wallet address and given wallet address

## Definition

```ts
function useGetIbcChannelId: (toAddress: string) => Promise<string[] | undefined>
```

- `toAddress` the destination address - used to determine destination chain

## Usage

```tsx
function CurrentChainComponent() {
  const [toAddress, setToAddress] = useState<string>('')
  const [ids, setIds] = useState<string[] | undefined>()
  const getIbcChannelIds = useGetIbcChannelId()

  useEffect(() => {
    getIbcChannelIds(toAddress).then(setIds).catch(console.warn)
  }, [toAddress])

  return (
    <h1>Channel IDs</h1>
    <input value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
    {
      ids && (
        <ul>
          {ids.map(id => <li key={id}>{id}</li>)}
        </ul>
      )
    }
  )
}
```
