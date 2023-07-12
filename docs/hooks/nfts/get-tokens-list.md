# Get Tokens List Hooks

## NFT Contracts List

We have a public list of NFT contracts (chain-wise) on [GitHub](https://github.com/leapwallet/nft-contracts-list/)

### Add to List

To add an NFT contract in the list -

1. Check if there is an existing `chain_id.txt` file. Say you want to add a juno NFT contracts, check if `juno.txt` exists. If not, create it from GitHub UI itself.
2. Edit the file on GitHub UI and add the contract address on a new line.

## `useLoadNFTContractsList`

Load the list of NFT contracts for a chain from the [public list](#nft-contracts-list)

## Definition

```ts
function useLoadNFTContractsList(
  chain: SupportedChain,
  options: QueryOptions<string[]>,
): UseQueryResult<string[], unknown>;
```

- `chain` - chain ID
- `options` - react-query query options [QueryOptions](./types.md#queryoptions)
- returns `result` - [UseQueryResult](https://tanstack.com/query/v4/docs/reference/useQuery)
  - `result.data` - array of contract addresses - `string[]`

## Usage

```tsx
function ListMyNFTsComponent() {
  const activeChain = useActiveChain();
  const { data, isLoading, error } = useLoadNFTContractsList(activeChain);

  return isLoading ? (
    <>
      {error ? (
        <p>Some error occured</p>
      ) : (
        <div>
          <h2>NFT Contracts List</h2>
          <ul>
            {data.map((address) => (
              <li>{address}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  ) : (
    <div>Loading...</div>
  );
}
```

## `useGetAllNFTsList`

Gets the list of tokens owned on the active chain by the current wallet address grouped by the NFT collection address based on the [public list](#nft-contracts-list)

## Definition

```ts
function useGetAllNFTsList(
  options: QueryOptions<TokensListByCollection[]>,
): UseQueryResult<TokensListByCollection[], unknown>;
```

- `options` - react-query query options [QueryOptions](./types.md#queryoptions)
- returns `result` - [UseQueryResult](https://tanstack.com/query/v4/docs/reference/useQuery)
  - `result.data` - array of NFTs owned with contract addresses - [`TokensListByCollection[]`](./types.md#tokenslistbycollection)

## Usage

```tsx
function CurrentChainComponent() {
  const { data, isLoading, error } = useGetAllNFTsList();

  return isLoading ? (
    <>
      {error ? (
        <p>Some error occured</p>
      ) : (
        <div>
          <h2>NFTs You Own</h2>
          <ul>
            {data.map(({ contract, tokens }) => (
              <li key={contract.address}>
                <div>
                  <h3>Contract</h3>
                  <p>Name: {contract.name}</p>
                  <p>Name: {contract.address}</p>
                </div>
                <div>
                  <h3>Tokens</h3>
                  {tokens.map((tokenName) => (
                    <p key={tokenName}>Name: {tokenName}</p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  ) : (
    <div>Loading...</div>
  );
}
```
