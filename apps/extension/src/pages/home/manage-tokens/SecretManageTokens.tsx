import { SecretToken, useSecretTokenStore } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, GenericCard, HeaderActionType } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { EmptyCard } from 'components/empty-card'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { sliceSearchWord } from 'utils/strings'

import { AddTokenSheet } from './AddTokenSheet'
import { CreateKeySheet } from './CreateKeySheet'
import { ImportKeySheet } from './ImportKeySheet'

type SecretManageTokensProps = {
  isVisible: boolean
  onClose: VoidFunction
  token?: SecretToken & { contractAddr: string }
}

export function SecretManageTokens({ isVisible, onClose, token }: SecretManageTokensProps) {
  const defaultLogo = useDefaultTokenLogo()
  const [searchText, setSearchText] = useState('')
  const [showAddToken, setShowAddToken] = useState(false)
  const [selectedToken, setSelectedToken] = useState<
    (SecretToken & { contractAddr: string }) | null
  >(null)
  const [reviewTx, setReviewTx] = useState(false)
  const [showUpdateViewingKey, setShowUpdateViewingKey] = useState(false)
  const [importKey, setImportKey] = useState(false)

  const { secretTokens } = useSecretTokenStore()

  const selectToken = (token: SecretToken & { contractAddr: string }) => {
    setSelectedToken(token)
    setShowAddToken(true)
  }

  useEffect(() => {
    if (token) {
      selectToken(token)
      setShowAddToken(true)
    }
  }, [token])

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const tokensList = useMemo(() => {
    return Object.entries(secretTokens)
      .filter(([contractAddr, tokenData]) => {
        const filterText = searchText.toUpperCase()
        return (
          contractAddr.toUpperCase().includes(filterText) ||
          tokenData.name.toUpperCase().includes(filterText) ||
          tokenData.symbol.toUpperCase().includes(filterText)
        )
      })
      .map(([contractAddr, tokenData]) => {
        return { ...tokenData, contractAddr }
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  const clearState = () => {
    setReviewTx(false)
    setShowUpdateViewingKey(false)
    setImportKey(false)
    setShowAddToken(false)
    setSelectedToken(null)
    onClose()
  }

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={() => {
          onClose()
          setSearchText('')
          setSelectedToken(null)
        }}
        headerTitle='Manage Tokens'
        headerActionType={HeaderActionType.CANCEL}
        closeOnClickBackDrop={true}
      >
        <div className='w-full h-[580px] flex flex-col pt-6 pb-2 px-7 sticky top-[72px] bg-gray-50 dark:bg-black-100'>
          <div className='w-[344px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px]  mb-4 py-2 pl-5 pr-[10px]'>
            <input
              placeholder='search tokens'
              className='flex flex-grow text-base text-gray-600 dark:text-gray-200  outline-none bg-white-0'
              onChange={handleFilterChange}
            />
            <img src={Images.Misc.SearchIcon} />
          </div>

          <div className='overflow-y-auto pb-20'>
            {tokensList.length === 0 ? (
              <EmptyCard
                isRounded
                subHeading={searchText ? 'Please try again with something else' : ''}
                heading={
                  searchText ? 'No results for “' + sliceSearchWord(searchText) + '”' : 'No Tokens'
                }
                src={Images.Misc.Explore}
              />
            ) : null}

            <div className='rounded-2xl flex flex-col items-center mx-7 m-auto justify-center dark:bg-gray-900 bg-white-100'>
              {tokensList.map((tokenData, index, array) => {
                const isLast = index === array.length - 1
                const isFirst = index === 0

                return (
                  <React.Fragment key={tokenData.contractAddr}>
                    <GenericCard
                      onClick={() => selectToken(tokenData)}
                      className={classNames({ 'rounded-t-2xl': isFirst, 'rounded-b-2xl': isLast })}
                      title={tokenData.symbol}
                      subtitle={tokenData.name}
                      icon={<span className='material-icons-round text-gray-400'>add</span>}
                      img={
                        <img
                          src={tokenData.icon === '' ? defaultLogo : tokenData.icon}
                          className='w-[28px] h-[28px] mr-2'
                        />
                      }
                    />
                    {!isLast ? <CardDivider /> : null}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </BottomSheet>

      <AddTokenSheet
        isVisible={showAddToken}
        onClose={() => {
          setShowAddToken(false)
          clearState()
        }}
        onCreateViewingKey={() => setReviewTx(true)}
        onUpdateViewingKey={() => setShowUpdateViewingKey(true)}
        onImportViewingKey={() => {
          setShowUpdateViewingKey(true)
          setImportKey(true)
        }}
        token={selectedToken ?? undefined}
      />

      <CreateKeySheet
        isVisible={reviewTx}
        onClose={() => {
          setReviewTx(false)
        }}
        token={selectedToken ?? undefined}
        onSuccess={() => clearState()}
      />

      <ImportKeySheet
        isVisible={importKey || showUpdateViewingKey}
        onClose={() => {
          setImportKey(false)
          setShowUpdateViewingKey(false)
        }}
        type={importKey ? 'import' : 'update'}
        token={selectedToken ?? undefined}
        onSuccess={() => clearState()}
      />
    </>
  )
}
