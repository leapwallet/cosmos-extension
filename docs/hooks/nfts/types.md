# Types - NFTs

## QueryOptions

Options to pass in to react-query's `useQuery` hook - [reference](https://tanstack.com/query/v4/docs/reference/useQuery)

> `queryFn` and `queryKey` cannot be passed

```ts
type QueryOptions<T> = Omit<
  UseQueryOptions<T, unknown>, 'queryFn' | 'queryKey'
>;
```

## TokensListByCollection

```ts
type TokensListByCollection = {
  collection: { address: string; name: string };
  tokens: string[];
};
```

## OwnedCollectionInfo

```ts
type OwnedCollectionInfo = {
  collection: {
    image: string;
    name: string;
  };
  tokens: {
    image: string;
    name: string;
    tokenUri: string;
    tokenId: string;
    collection: {
      name: string;
      contractAddress: string;
    };
  }[];
};
```

## TokenUriModifierFn

```ts
type TokenUriModifierFn = (uri: string) => string;
```
