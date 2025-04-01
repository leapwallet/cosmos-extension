import { SecretToken, useSecretTokenStore } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, GenericCard, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { Plus } from '@phosphor-icons/react'
import classNames from 'classnames'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import useQuery from 'hooks/useQuery'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { sliceSearchWord } from 'utils/strings'

import { AddTokenSheet, CreateKeySheet, ImportKeySheet } from './components'
import { Snip20ManageTokensProvider } from './context'

export default function SecretManageTokens() {
  const defaultLogo = useDefaultTokenLogo()
  const navigate = useNavigate()

  const [searchText, setSearchText] = useState('')
  const [showAddToken, setShowAddToken] = useState(false)
  const [selectedToken, setSelectedToken] = useState<
    (SecretToken & { contractAddr: string }) | null
  >(null)
  const [reviewTx, setReviewTx] = useState(false)
  const [showUpdateViewingKey, setShowUpdateViewingKey] = useState(false)
  const [importKey, setImportKey] = useState(false)

  const contractAddress = useQuery().get('contractAddress') ?? undefined
  const { secretTokens } = useSecretTokenStore()

  const selectToken = (token: SecretToken & { contractAddr: string }) => {
    setSelectedToken(token)
    setShowAddToken(true)
  }

  useEffect(() => {
    if (contractAddress && secretTokens[contractAddress]) {
      selectToken({ ...secretTokens[contractAddress], contractAddr: contractAddress })
      setShowAddToken(true)
    }
  }, [contractAddress, secretTokens])

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

  const clearState = useCallback(() => {
    setReviewTx(false)
    setShowUpdateViewingKey(false)
    setImportKey(false)
    setShowAddToken(false)
    setSelectedToken(null)
  }, [])

  const handleImportClose = useCallback(() => {
    setImportKey(false)
    setShowUpdateViewingKey(false)
  }, [])

  const handleImportSuccess = useCallback(() => clearState(), [clearState])
  const handleCreateKeyClose = useCallback(() => setReviewTx(false), [])

  return (
    <Snip20ManageTokensProvider>
      <div className='relative w-full overflow-clip panel-height'>
        <PopupLayout
          header={
            <Header
              action={{
                onClick: () => navigate(-1),
                type: HeaderActionType.BACK,
              }}
              title='Manage Tokens'
            />
          }
        >
          <div className='w-full flex flex-col pt-6 pb-2 px-7 sticky top-[72px] bg-gray-50 dark:bg-black-100'>
            <div className='w-[344px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px]  mb-4 py-2 pl-5 pr-[10px]'>
              <input
                placeholder='search tokens'
                className='flex flex-grow text-base text-gray-600 dark:text-gray-200  outline-none bg-white-0'
                onChange={handleFilterChange}
              />
              <img src={Images.Misc.Search} />
            </div>

            <div className='overflow-y-auto pb-20'>
              {tokensList.length === 0 ? (
                <EmptyCard
                  isRounded
                  subHeading={searchText ? 'Please try again with something else' : ''}
                  heading={
                    searchText
                      ? 'No results for “' + sliceSearchWord(searchText) + '”'
                      : 'No Tokens'
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
                        className={classNames({
                          'rounded-t-2xl': isFirst,
                          'rounded-b-2xl': isLast,
                        })}
                        title={tokenData.symbol}
                        subtitle={tokenData.name}
                        icon={<Plus size={16} className='text-gray-400' />}
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
        </PopupLayout>

        <AddTokenSheet
          isVisible={showAddToken}
          onClose={() => setShowAddToken(false)}
          onCreateViewingKey={() => setReviewTx(true)}
          onUpdateViewingKey={() => setShowUpdateViewingKey(true)}
          onImportViewingKey={() => setImportKey(true)}
          token={selectedToken ?? undefined}
        />

        <CreateKeySheet
          isVisible={reviewTx}
          onClose={handleCreateKeyClose}
          token={selectedToken ?? undefined}
          onSuccess={handleImportSuccess}
        />

        <ImportKeySheet
          isVisible={importKey || showUpdateViewingKey}
          onClose={handleImportClose}
          type={importKey ? 'import' : 'update'}
          token={selectedToken ?? undefined}
          onSuccess={handleImportSuccess}
        />
      </div>
    </Snip20ManageTokensProvider>
  )
}
