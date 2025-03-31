import { TxResponse, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'

import { ActivityHeader } from './activity-header'
import { ActivityList } from './ActivityList'
import { SelectedTx } from './ChainActivity'
import { TxDetails } from './index'

type GeneralActivityProps = {
  txResponse: TxResponse
}

export const GeneralActivity = observer(({ txResponse }: GeneralActivityProps) => {
  const selectedChain = useActiveChain()
  const [selectedTx, setSelectedTx] = useState<SelectedTx | null>(null)

  return (
    <>
      <TxDetails
        open={!!selectedTx}
        tx={selectedTx}
        onBack={() => setSelectedTx(null)}
        forceChain={selectedChain}
      />

      <ActivityHeader />

      <ActivityList txResponse={txResponse} setSelectedTx={setSelectedTx} />
    </>
  )
})

GeneralActivity.displayName = 'GeneralActivity'
