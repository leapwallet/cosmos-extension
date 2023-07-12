import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Activity from '~/pages/activity'
import AssetDetails from '~/pages/asset-details'
import ChooseStakingValidator from '~/pages/choose-staking-validator'
import Governance from '~/pages/governance'
import Home from '~/pages/home'
import ManageChains from '~/pages/manage-chains'
import NotFound from '~/pages/not-found'
import Send from '~/pages/send'
import Stake from '~/pages/stake'
import ValidatorDetails from '~/pages/validator-details'

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/manage-chains' element={<ManageChains />} />
        <Route path='/send' element={<Send />} />
        <Route path='/activity' element={<Activity />} />
        <Route path='/asset-details' element={<AssetDetails />} />
        <Route path='/gov' element={<Governance />} />
        <Route path='/stake' element={<Stake />} />
        <Route path='/validator-details' element={<ValidatorDetails />} />
        <Route path='/choose-staking-validator' element={<ChooseStakingValidator />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router
