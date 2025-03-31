import { SelectedAddress, useSendNft, UseSendNftReturnType } from '@leapwallet/cosmos-wallet-hooks'
import assert from 'assert'
import { observer } from 'mobx-react-lite'
import React, { createContext, useContext, useMemo, useState } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'

type NFTSendContextType = {
  receiverAddress: SelectedAddress | null
  setReceiverAddress: React.Dispatch<React.SetStateAction<SelectedAddress | null>>
  txError: string
  setTxError: React.Dispatch<React.SetStateAction<string>>
  associatedSeiAddress: string
  setAssociatedSeiAddress: React.Dispatch<React.SetStateAction<string>>
  collectionAddress: string
  setCollectionAddress: React.Dispatch<React.SetStateAction<string>>
  sendNftReturn: UseSendNftReturnType
}
export const NFTSendContext = createContext<NFTSendContextType | null>(null)

export const NFTSendContextProvider = observer(({ children }) => {
  const [receiverAddress, setReceiverAddress] = useState<SelectedAddress | null>(null)
  const [associatedSeiAddress, setAssociatedSeiAddress] = useState<string>('')
  const [collectionAddress, setCollectionAddress] = useState('')
  const [txError, setTxError] = useState('')

  const denoms = rootDenomsStore.allDenoms

  const sendNftReturn = useSendNft(denoms, collectionAddress)

  const value = useMemo(() => {
    return {
      receiverAddress,
      setReceiverAddress,
      txError,
      setTxError,
      associatedSeiAddress,
      setAssociatedSeiAddress,
      collectionAddress,
      setCollectionAddress,
      sendNftReturn,
    }
  }, [receiverAddress, txError, associatedSeiAddress, collectionAddress, sendNftReturn])

  return <NFTSendContext.Provider value={value}>{children}</NFTSendContext.Provider>
})

export const useNFTSendContext = () => {
  const context = useContext(NFTSendContext)

  assert(context !== null, 'useNFTSendContext must be used within NFTSendContextProvider')

  return context
}
