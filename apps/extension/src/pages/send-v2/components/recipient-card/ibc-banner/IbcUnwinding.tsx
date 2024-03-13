import { useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import Text from 'components/text'
import { useSendContext } from 'pages/send-v2/context'
import React from 'react'

export default function IbcUnwinding({ path }: { path: string[] }) {
  const { chains } = useChainsStore()
  const {
    isIbcUnwindingDisabled,
    setIsIbcUnwindingDisabled,
    pfmEnabled,
    addressError,
    setAddressError,
  } = useSendContext()

  let receivedPath = path

  // showing only source and destination path if ibc unwinding is disabled
  if (isIbcUnwindingDisabled) {
    receivedPath = path.length > 1 ? [path[0], path[path.length - 1]] : []
  }

  const setIsIbcUnwinding = () => {
    setAddressError(undefined)
    setIsIbcUnwindingDisabled(!isIbcUnwindingDisabled)
  }

  return (
    <div className='px-4 py-3 rounded-2xl bg-white-100 dark:bg-gray-900 justify-center items-center mb-4'>
      {pfmEnabled ? (
        <div className='flex items-center justify-between mb-3'>
          <Text className='font-bold'>Use IBC unwinding</Text>
          <input
            type='checkbox'
            id='toggle-switch2'
            checked={!isIbcUnwindingDisabled}
            onChange={setIsIbcUnwinding}
            className='h-5 w-9 appearance-none rounded-full cursor-pointer bg-gray-600/30 transition duration-200 checked:bg-green-600 relative'
          />
        </div>
      ) : (
        <div className='flex items-center justify-between mb-3'>
          <Text className='font-bold'>Use direct IBC path</Text>
          <input
            type='checkbox'
            id='toggle-switch2'
            checked={isIbcUnwindingDisabled}
            onChange={setIsIbcUnwinding}
            className='h-5 w-9 appearance-none rounded-full cursor-pointer bg-gray-600/30 transition duration-200 checked:bg-green-600 relative'
          />
        </div>
      )}
      <Text size='xs' color='text-gray-400' className='font-bold'>
        {isIbcUnwindingDisabled
          ? 'Using a direct channel, might make the token unusable'
          : 'IBC unwinding enables to make the token useful'}
      </Text>
      {addressError ? (
        <Text size='xs' color='text-red-300' className='font-bold my-2'>
          {addressError}
        </Text>
      ) : receivedPath?.length < 1 ? null : (
        <div className='my-3 flex p-[10px] flex-wrap gap-1 rounded-[10px] border border-gray-200 dark:border-gray-800 items-center'>
          {receivedPath?.map((d: string, index) => {
            const chainInfo = Object.values(chains).find((chain) => chain.chainId === d)
            return (
              <React.Fragment key={index}>
                <div className='bg-gray-50 dark:bg-gray-950 rounded-[15px] px-[6px] py-[2px] flex items-center gap-1'>
                  <img
                    src={chainInfo?.chainSymbolImageUrl}
                    alt='chain-icon'
                    className='w-[10px] h-[10px]'
                  />
                  <Text color='text-gray-500' className='font-bold text-[10px]'>
                    {chainInfo?.chainName}
                  </Text>
                </div>
                {receivedPath.length > index + 1 && (
                  <span
                    className='material-icons-round text-black-100 dark:text-white-100'
                    style={{ fontSize: 14 }}
                  >
                    east
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
