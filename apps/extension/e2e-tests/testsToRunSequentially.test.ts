import {
  importUsingPrivateKey,
  importWalletUsingSeed12Test,
  importWalletUsingSeed24Test,
} from './onboarding'
import { lockWalletTest, removeWalletTest } from './wallet'

// const mnemonicObj = { mnemonic: '' }

// createNewWalletTest(mnemonicObj)
// showSecretPhraseTest(mnemonicObj)
// removeWalletTest()
importWalletUsingSeed12Test()
lockWalletTest()
removeWalletTest()
importWalletUsingSeed24Test()
removeWalletTest()
importUsingPrivateKey()
// switchChainTest()
// createWalletTest()
// sendTxTest()
