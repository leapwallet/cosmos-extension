
![Leap_banner](https://github.com/leapwallet/cosmos-extension/assets/110881421/94f43d03-5c9d-4f3b-ba4d-0830e629317e)


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
