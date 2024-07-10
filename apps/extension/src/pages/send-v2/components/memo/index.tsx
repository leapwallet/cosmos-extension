import classNames from 'classnames'
import { useSendContext } from 'pages/send-v2/context'
import React from 'react'

export const Memo: React.FC = () => {
  const { memo, setMemo, addressWarning } = useSendContext()

  return (
    <div
      className={classNames('p-4 rounded-2xl bg-white-100 dark:bg-gray-950', {
        'opacity-50 pointer-events-none': addressWarning.type === 'link',
      })}
    >
      <p className='font-bold text-sm text-gray-600 dark:text-gray-400 mb-3'>Memo</p>
      <input
        type='text'
        value={memo}
        placeholder='Required for CEX transfers...'
        className='w-full h-10 rounded-xl px-4 py-2 font-medium text-xs placeholder:text-gray-600 dark:placeholder:text-gray-400 text-black-100 dark:text-white-100 outline-none border border-[transparent] focus-within:border-green-600 bg-gray-50 dark:bg-gray-900'
        onChange={(e) => setMemo(e.target?.value)}
      />
    </div>
  )
}
