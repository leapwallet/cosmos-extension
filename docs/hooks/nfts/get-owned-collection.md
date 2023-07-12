# `useGetOwnedCollection`

Get detailed information about all the NFTs in a specific collection. This hook is supposed to consume data returned by [useGetAllNFTsList](./get-tokens-list.md#usegetallnftslist)

## Definition

```ts
function useGetOwnedCollection(
  tokensListByCollection: TokensListByCollection,
  tokenUriModifier?: TokenUriModifierFn,
  options: QueryOptions<OwnedCollectionInfo>,
): UseQueryResult<OwnedCollectionInfo, unknown>;
```

- `tokensListByCollection` - [TokensListByCollection](./types.md#tokenslistbycollection)
- `tokenUriModifier` - [TokenUriModifierFn](./types.md#tokenurimodifierfn) a function to modify the token_uri field before making a fetching the data
- returns `result` - [UseQueryResult](https://tanstack.com/query/v4/docs/reference/useQuery)
  - `result.data` - array of contract addresses - [`OwnedCollectionInfo`](./types.md#ownedcollectioninfo)

## Usage

```tsx
function ShowMyNFTCollection({
  tokensListByCollection
}) {
  const { data, isLoading, error } = useGetOwnedCollection(tokensListByCollection);

  return isLoading ? (
    <>
      {error ? (
        <p>Some error occured</p>
      ) : (
        <div>
          <h3>{data.collection.name}</h3>
          <img src={data.collection.image} />
          <ul>
            {data.tokens.map((token) => (
              <li key={token.tokenId}>
                <img src={token.image} />
                <p>{token.name}</p>
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
