#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <new-version>"
    exit 1
fi


newVersion="$1"

packagesDir="./packages"


walletSdk="wallet-sdk"
walletHooks="wallet-hooks"
walletProvider="wallet-provider"

walletSdkPackage="@leapwallet/cosmos-wallet-sdk"
walletHooksPackage="@leapwallet/cosmos-wallet-hooks"
walletProviderPackage="@leapwallet/cosmos-wallet-provider"

update_version() {
    local packageDir="$packagesDir/$1"
    local packageJson="$packageDir/package.json"
    jq ".version=\"$newVersion\"" "$packageJson" | sponge "$packageJson"
}


update_dependency() {
    local packageDir="$packagesDir/$1"
    local packageJson="$packageDir/package.json"
    jq ".dependencies[\"$2\"]=\"$newVersion\"" "$packageJson" | sponge "$packageJson"
}


update_version $walletSdk
update_version $walletHooks
update_version $walletProvider


update_dependency $walletHooks $walletSdkPackage
update_dependency $walletProvider $walletSdkPackage


echo "Updated all package versions to $newVersion"
