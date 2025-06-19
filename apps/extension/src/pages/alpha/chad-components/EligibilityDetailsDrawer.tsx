import { useAddress } from '@leapwallet/cosmos-wallet-hooks'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { Drawer, DrawerContent } from 'components/ui/drawer'
import { useAlphaUser } from 'hooks/useAlphaUser'
import { useQueryParams } from 'hooks/useQuery'
import { CrownFrog, HappyFrog } from 'icons/frog'
import { Images } from 'images'
import React from 'react'
import { useNavigate } from 'react-router'
import { queryParams } from 'utils/query-params'

type EligibilityDrawerProps = {
  isShown: boolean
  onClose: () => void
}

const eligibilitySteps = [
  'Make transactions with Leap Wallet',
  'Use core features like Swap and Stake',
  'Stay active in the Leap ecosystem',
]

function NonChadDetailsDrawer({ isShown, onClose }: EligibilityDrawerProps) {
  const navigate = useNavigate()
  return (
    <BottomModal
      fullScreen
      isOpen={isShown}
      onClose={onClose}
      className='flex flex-col items-center gap-4 h-full'
    >
      <div className='flex flex-col items-center'>
        {/* all raffles tab */}
        <div className='size-20'>
          <HappyFrog />
        </div>

        <span className='flex flex-col gap-3 text-center mb-7 mt-2'>
          <span className='font-bold text-lg'>How to Become a Leap Chad?</span>
          <span className='text-sm font-medium'>
            NFT WL Giveaways, Early access & Invite Codes, Dapp Quests, Points, Airdrops and more
            are waiting. You can qualify for Leap Chad by:
          </span>
        </span>

        <ul className='flex flex-col gap-4 bg-secondary-100 rounded-xl p-5 w-full'>
          {eligibilitySteps.map((step) => (
            <li key={step} className='flex items-center gap-2.5 text-sm m-0'>
              <CheckCircle size={24} className='text-primary' />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button className='w-full mt-auto' onClick={() => navigate('/')}>
        Explore Leap Features
      </Button>
      <span className='text-xs font-medium text-muted-foreground'>
        We&apos;ll notify you when you become a Leap Chad!
      </span>
    </BottomModal>
  )
}

function ChadDetailsDrawer({ isShown, onClose }: EligibilityDrawerProps) {
  const navigate = useNavigate()

  return (
    <Drawer open={isShown} onClose={onClose}>
      <DrawerContent showHandle={false} className='max-panel-height h-screen rounded-none'>
        <div className='flex flex-col items-center gap-7 m-auto'>
          <div className='isolate flex flex-col items-center gap-4 relative h-[454px] w-[342px] px-6 py-8'>
            <img
              src={Images.Alpha.chadDetailsBanner}
              className='select-none -z-10 absolute inset-0 w-full h-full rounded-2xl overflow-hidden mx-auto'
            />

            <CrownFrog className='my-8' />

            <span className='flex flex-col gap-3 text-center'>
              <span className='font-bold text-xl'>
                Congratulations! <br />
                You are now a Leap Chad
              </span>
              <span className='text-muted-foreground text-sm'>
                You now have access to exclusive whitelisted giveaways, airdrops and more!
              </span>
            </span>

            <Button
              variant='mono'
              className='mt-auto w-full'
              onClick={() => {
                onClose()
                navigate(`/alpha?${queryParams.alphaTab}=exclusive`)
              }}
            >
              View exclusive rewards
            </Button>
          </div>

          <button
            onClick={onClose}
            className='font-bold text-muted-foreground hover:text-foreground transition-colors'
          >
            Dismiss
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export const EligibleDetailsDrawer = () => {
  const cosmosAddress = useAddress('cosmos')
  const { alphaUser } = useAlphaUser(cosmosAddress)
  const params = useQueryParams()

  const show = params.get(queryParams.chadEligibility) === 'true'

  const hide = () => params.remove(queryParams.chadEligibility)

  return alphaUser?.isChad ? (
    <ChadDetailsDrawer isShown={show} onClose={hide} />
  ) : (
    <NonChadDetailsDrawer isShown={show} onClose={hide} />
  )
}
