import { Avatar, Card, CardDivider, HeaderActionType, InputWithButton } from '@leapwallet/leap-ui'
import React, { ReactElement, useMemo, useState } from 'react'

import Badge from '~/components/badge'
import BottomSheet from '~/components/bottom-sheet'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { Images } from '~/images'
import { Token } from '~/types/bank'
import { capitalize } from '~/util/strings'

export type ChooseTokenSheetProps = {
  isVisible: boolean
  balances: Token[]
  selectedToken: Pick<Token, 'symbol'>
  onSelectToken: (denom: Token) => void
  onCloseHandler?: () => void
}

export default function ChooseTokenSheet({
  isVisible,
  onCloseHandler,
  onSelectToken,
  balances,
  selectedToken,
}: ChooseTokenSheetProps): ReactElement {
  const [inputText, setInputText] = useState<string>('')

  const activeChain = useActiveChain()

  const displayTokens = useMemo(
    () =>
      Object.values(balances).filter((item) => {
        return item.symbol?.toLowerCase().includes(inputText)
      }),
    [inputText, balances],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onCloseHandler}
      headerTitle='Choose token to send'
      closeOnClickBackDrop={true}
      headerActionType={HeaderActionType.CANCEL}
    >
      <div>
        <div className='flex flex-col items-center gap-y-[16px] mt-[28px] mb-[40px]'>
          <InputWithButton
            icon={Images.Misc.Search}
            className='-ml-4'
            value={inputText}
            placeholder='search tokens...'
            onChange={handleInputChange}
          />
          <div className=' dark:bg-gray-900 bg-white-100 rounded-2xl  items-center'>
            {displayTokens.map((value, index) => {
              const title = (
                <div className='flex  hover:overflow-visible items-center'>
                  <div className='mr-2'>{value.symbol}</div>
                </div>
              )

              const currentlyActive = selectedToken.symbol === value.symbol

              return (
                <div
                  key={index}
                  className='relative'
                  onClick={() => {
                    onSelectToken(value)
                    onCloseHandler()
                  }}
                >
                  {index !== 0 && <CardDivider />}
                  {value.ibcChainInfo && (
                    <div className='absolute flex top-[16px] left-[68px] items-center'>
                      <div className='mr-2 text-md invisible font-bold'>{value.symbol}</div>
                      <Badge
                        image={value.ibcChainInfo.icon}
                        text={`${value.ibcChainInfo.pretty_name} / ${value.ibcChainInfo.channelId}`}
                      />
                    </div>
                  )}
                  <Card
                    key={index}
                    avatar={<Avatar avatarImage={value.img} size='sm' />}
                    isRounded
                    iconSrc={currentlyActive ? Images.Misc.ChainChecks[activeChain] : undefined}
                    size='md'
                    subtitle={<>Balance: {value.amount + ' ' + capitalize(value.symbol)} </>}
                    title={title}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
