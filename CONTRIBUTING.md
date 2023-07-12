# Contributing

## Adding a new chain

We have to do the changes in the following files to support any chain natively

- `/packages/wallet-sdk/src/constants`

  - `/chain-infos.ts`

    - Add the chain info in the `ChainInfos` object in this file.
    - Keep it Alphabetically.

  - `/chainIds.ts`

    - In this file, we maintain a mapping of the chain-ids to the respective `ChainInfos` key.

  - `/address-prefixes.ts`

    - In this file, we maintain a mapping of the chain address prefix to the respective `ChainInfos` key.

  - `/denoms.ts`

    - In this file, add all the denoms that the chain has.
    - In the newer version of SDK, we also need to update the denoms in S3 bucket, without which the dnoms will not be visible on the app.

  - `/fee-denoms.ts`

    - In this file, add the fee denom that the chain accept for its mainnet and testnet.
    - If the chain has no testnet (or no mainnet), then just copy the value at both places.

  - `/default-gasprice-step.ts`

    - Add the default gas estimates for the chain in this file.

  - `/gas-adjustment.ts`

    - Add the gas adjustment value for the chain in this file.

  - `/networks.ts`

    - Add an entry for the new chain in this file.

  - `/cw20-denoms.ts`

    - If the chain has any cw20 token, then add the token in this file.
    - And also update the `denoms.ts` file.

- `/packages/wallet-hooks/src/apis`

  - `/platforms-mapping.ts`

    - Update this file with the new chain data.

  - `/LeapWalletApi.ts`

    - Update the `blockchains` record in the `getCosmosNetwork()` function

  We use this for logging the txs on our leap backend. So, the new chain must exist in the `CosmosBlockchain` and `Platform` enum.

- `/apps/extension/src/images/logos/index.ts`

  - Update the `ChainLogos` record.

While raising a PR for a new chain support, please add a video recording, showing all the pages and all the txs (send, gov, and stake), and showing the activity log explorer functionality. (Please refer to any previous PR of this in case you wanna check anything)

```
💡 Keep in mind
```

1. Always do the testing tx with a small coin amount (<0.01)

2. Do the testing send tx in Wallet 2 of the leap test wallet. (If you are a leap team member)

3. Select the low fee while doing the txs in testing.

## Testing

### Writing e2e tests

Save tests to `e2e-tests` folder in `apps/extension`. Files containing tests for a particular feature must end with `featureTest.ts`. For example, `send-tx/sendTxTest.ts` tests the send tx feature.

Make sure, you import the written test in `testsToRunSequentially.test.ts` file, and put it at correct order (if order matters) but it should come after `importWalletUsingSeedTest()` (as we launch browser each time we run a test, so we have to make wallet each time we want to test any in-wallet feature).

Set a `data-testing-id` on the element you're selecting to reduce the amount of time taken to maintain them.

Here's an example of what the code would look like if you don't use data-testing-id:

```jsx
// Code under test:
<Button width={312} height={48} color={ButtonVariant.PRIMARY}>
  Send
</Button>;

// Test code that requires unreadable selectors that can change even if the implementation doesn't:
const sendButtonSelector = '#root > div.auth-menu_page__NpaVl > div > a:nth-child(1) > button';
```

Here's an example of what the code would look like if you use data-testing-id:

```jsx
// Code under test:
<Button width={312} height={48} color={ButtonVariant.PRIMARY}>
  <span data-testing-id='btn-send'>Send</span>
</Button>;

// Test code:
const sendButtonSelector = '[data-testing-id=btn-send]';
```
