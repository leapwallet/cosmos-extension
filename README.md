![Leap_banner](https://github.com/leapwallet/cosmos-extension/assets/110881421/7477ee93-2c5e-40bc-af67-3b2084046269)


## Leap🐸
> The Super Wallet for the Interchain

Available as [Chrome/Brave Extension](https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg/?utm_source=website&utm_medium=permanent-website&utm_campaign=permanent)


Available for iOS on the [App Store](https://apps.apple.com/in/app/leap-cosmos/id1642465549/?utm_source=website&utm_medium=permanent-website&utm_campaign=permanent)

Available for Android on the [Google Play Store](https://play.google.com/store/apps/details?id=io.leapwallet.cosmos&utm_source=website&utm_medium=permanent-website&utm_campaign=permanent)

## Repo structure

- apps -> Contains client apps, e.g. extension, webapp, mobile apps.
- packages -> Contains code used across apps. e.g. wallet sdk, utility functions etc.

## Setup

1. Clone the repo
2. Install the dependencies from the root folder.
3. Run `yarn build:packages` to build the wallet library.

## Developing the extension

1. Run `yarn start:extension` or `yarn start:extension:compass` (for compass wallet) from the root folder to generate the development build of the extension.
2. Open Chrome.
3. Enter chrome://extensions/ in the address bar.
4. Enable Developer mode via the top right toggle.
5. Click on top left Load unpacked button.
6. Select /apps/extension/dist/

## Testing

### Running e2e tests

1. Generate a staging build to `/build` folder in `apps/extension`: `yarn build:ext:staging`
2. Run `yarn test:extension`. It'll run tests sequentially, present in `apps/extension/e2e-tests/testsToRunSequentially.test.ts` file, because Chromium must be focused while running the tests.

If you're developing and want to run tests for the new code, then first update the staging build with the new code(`yarn build:ext:staging` will save a new build to `apps/extension/build`). After that re-run the tests, and repeat this process as many ever times as you want.

```
💡 Keep in mind
```

1. If you are running test for send tx

- update the `sendTxTest.ts` and `constants.ts` files in `apps/extension/e2e-tests` with the correct info of the chain you want to test (right now we have code for NOBLE Testnet)

- the wallet must have some balance for the token you want to send (and you may have to update some logic in `sendTxTest.ts` file to select that particular token)

- if there are some tx fee requirement, then make sure that wallet has the required token and the right amount of balance to pay the tx fee

2. If you want to run test for a particular feature like Create Wallet, then make sure you comment out tests for other features in the `testsToRunSequentially.test.ts` file, but keep the test for `importWalletUsingSeedTest()` uncommented as we launch browser each time we run a test, so we have to make wallet each time we want to test any in-wallet feature

```typescript
// Example of how testsToRunSequentially.test.ts file
// will look like while running the test for send tx

import ...

importWalletUsingSeedTest()
// switchChainTest()
// createWalletTest()
// removeWalletTest()
sendTxTest()
```

_want to write an e2e test? check [CONTRIBUTING.md](./CONTRIBUTING.md) file_

## Contributing

Kindly refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) file. All the contributing guidelines are written over there.
