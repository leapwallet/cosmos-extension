import { Button } from 'components/ui/button'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Link } from 'react-router-dom'

const InsufficientBalanceCard = observer(() => {
  return (
    <div className='flex w-full items-center justify-between p-5 rounded-xl bg-secondary-100'>
      <div className='flex flex-col gap-1'>
        <span className='font-medium'>Insufficient balance to stake</span>
        <span className='text-muted-foreground text-xs'>Get SEI to stake and earn rewards</span>
      </div>
      <Button size={'slim'} variant='mono' asChild>
        <Link to={`/buy?pageSource=stake`}>Get SEI</Link>
      </Button>
    </div>
  )
})

export default InsufficientBalanceCard
