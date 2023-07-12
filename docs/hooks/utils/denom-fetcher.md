# DenomFetcher
The DenomFetcher class is a utility class that allows you to fetch trace data for a given denom.

## Properties

The DenomFetcher class has the following properties:

- `denomMatcherCache`: a private property that stores a map of ibc denom to minimal denom.
- `activePromises`: a private property that caches axios promises to avoid multiple requests for the same data.

## Methods

The DenomFetcher class has one public method:

`fetchDenomTrace(denom: string): Promise<NativeDenom | undefined>`

This method takes a denom as a string and returns a Promise that resolves to a NativeDenom object or undefined if the denom is not found.

It first checks if the denom is already defined in the denoms object, and if so, returns the NativeDenom object.

If the denom is not found in the denoms object, it checks the denomMatcherCache to see if the denom has been previously queried. If so, it returns the NativeDenom object associated with the cached minimal denom.

If the denom has not been previously queried, it checks if there is an active promise for the denom in the activePromises object. If there is, it waits for the promise to resolve and returns the NativeDenom object if found, or undefined if not.

If there is no active promise for the denom, it sends a GET request to the https://api.osmosis.interbloc.org/ibc/apps/transfer/v1/denom_traces/ URL with the denom (excluding the ibc/ prefix) appended to the end. If the request is successful and the response contains a denom_trace.base_denom property, it returns the corresponding NativeDenom object and adds the denom and minimal denom to the denomMatcherCache. If the request is not successful or the response does not contain a denom_trace.base_denom property, it returns undefined.

## Exports

A constant denomFetcher which is an instance of the DenomFetcher class.

## Example

```ts
import { denomFetcher } from '@leapwallet/cosmos-wallet-hooks';

const denomTrace = await denomFetcher.fetchDenomTrace('ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4'); // uakt
// This will return the NativeDenom object for the stake denom if it's available, or undefined if it's not.
```
